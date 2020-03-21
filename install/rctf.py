#!/usr/bin/env python3
# a script to manage rCTF installations

import sys, os, io, subprocess, selectors
import argparse, functools
import logging, traceback, re
import collections, json

# REQUIREMENTS:
# * requests
# * envparse


# custom color logging


colors = {
    'lightgray' : '\033[37m',
    'darkgray' : '\033[90m',
    'gray' : '\033[2m',
    'blue' : '\033[34m',
    'green' : '\033[32m',
    'cyan' : '\033[36m',
    'darkorange' : '\033[33m',
    'darkred' : '\033[31m',
    'lightred' : '\033[91m',
    'red' : '\033[91m',
    'bold_white' : '\033[1;37m',

    'bg_red' : '\033[41m',

    'italics' : '\033[3m',
    'bold' : '\033[01m',
    'underline' : '\033[04m',

    'reset' : '\033[0m'
}

colored = lambda message, attrs = [] : colors['reset'] + ''.join([colors[x] for x in attrs]) + message + colors['reset']

colormap = {
    'debug' : ['italics', 'gray'],
    'info' : ['blue'],
    'warning' : ['bold', 'darkorange'],
    'error' : ['bold', 'lightred'],
    'critical' : ['bg_red', 'bold_white'],

    'exception' : ['italics', 'darkred']
}

prompts = {
    'debug' : ' * ',
    'info' : '[*]',
    'warn' : '[!]',
    'warning' : '[!]',
    'error' : '[-]',
    'critical' : '[-]',
    'fatal' : '[-]'
}

class ColorLog(object):
    def __init__(self, logger):
        self._log = logger


    def _log_msg(self, name, *args, **kwargs):
        return getattr(self._log, name)(self._format_msg(name, *args, **kwargs))
    
    def _format_msg(self, name, *args, **kwargs):
        exc_info = kwargs.get('exc_info', False)

        if name == 'exception':
            name = 'fatal'
            exc_info = True
        elif name == 'warn':
            name = 'warning'
        elif name == 'fatal':
            name = 'critical'

        _colored = colored if kwargs.get('use_ansi', True) else lambda s, x : s

        prompt = prompts[name] + ' ' if not kwargs.get('prompt') else kwargs.get('prompt')
        message = prompt + ''.join([_colored(x, colormap[name]) for x in args])

        if exc_info:
            exception = traceback.format_exc().strip()

            prompt = '... ' if not kwargs.get('prompt') else kwargs.get('prompt')
            message += '\n' + '\n'.join([
                prompt + _colored(x, colormap['exception']) for x in exception.split('\n')
            ])

        return message

    def __getattr__(self, name):
        if name in ['debug', 'info', 'warn', 'warning', 'error', 'critical', 'fatal', 'exception']:
            return lambda *args, **kwargs : self._log_msg(name, *args, **kwargs)

        return getattr(self._log, name)


LOG_LEVEL = logging.DEBUG


log = ColorLog(logging.getLogger(__name__))
log.setLevel(LOG_LEVEL)
stdout = logging.StreamHandler()
log.addHandler(stdout)
stdout.setLevel(LOG_LEVEL)
logging = log # XXX: find a cleaner solution plz


# custom pip3 dependencies


try:
    import requests # requests
    import envparse # envparse
except ModuleNotFoundError:
    logging.fatal('You must install the required modules')
    logging.error('    pip3 install --upgrade requests envparse\n', exc_info = True)
    exit(1)


# define useful functions


# XXX: they do be makin it hard for us
def read_env(fname):
    # i have envparse so much, you have no idea
    # same goes for python-dotenv, environs, etc

    env_backup = envparse.os.environ
    envparse.os.environ = dict()
    envparse.env.read_envfile(fname)
    contents = envparse.os.environ
    envparse.os.environ = env_backup

    return contents


def verify_privileges(euid = 0):
    return os.geteuid() == euid


def check_file(fn):
    # verifies a file exists
    return os.path.isfile(fn)


def get_editor():
    editor = os.environ.get('EDITOR')
    try_editors = ['/usr/bin/vim', '/usr/bin/nano']

    for test_editor in try_editors:
        if editor:
            break

        if check_file(test_editor):
            editor = test_editor

    if not editor:
        raise RuntimeError('No $EDITOR configured and no editors discovered.')
    
    return editor


def execute(command, environ = None):
    logging.debug('Executing ', colored(command, ['bold']), '...')

    if not environ:
        environ = os.environ.copy()
    
    # shell=False if list, shell=True if str
    logging.debug('-'*80)

    if isinstance(command, str):
        command = ['/bin/sh', '-c', command]

    p = subprocess.Popen(command, shell = False, stdin = subprocess.PIPE, stdout = subprocess.PIPE, stderr = subprocess.PIPE, env = environ)

    sel = selectors.DefaultSelector()
    sel.register(p.stdout, selectors.EVENT_READ)
    sel.register(p.stderr, selectors.EVENT_READ)

    should_exit = False

    while True:
        if should_exit:
            break

        for key, _ in sel.select():
            data = key.fileobj.read1().decode()

            if not data:
                should_exit = True
                break
            
            data = strip_ansi(data.strip())

            prompt = ' .. '
            data = data.replace('\n', '\n' + prompt)

            if key.fileobj is p.stdout:
                logging.debug(colored(data, ['italics', 'gray']), prompt = prompt)
            else:
                logging.debug(colored(data, ['italics', 'red']), prompt = prompt)

    p.communicate()
    status_code = p.returncode

    logging.debug('-'*80)

    if status_code:
        logging.error('Command failed to execute; exited with status code %d.' % status_code)

    # XXX: check to make sure this status code isn't just docker?
    if status_code == 1 and not verify_privileges(): # permission denied
        logging.warning('Possible permission denied error? Try running as root.\n\n    %s\n' % ' '.join(sys.argv))
        raise PermissionError('Permission denied. Try running as root.')


    return status_code == 0


# from: https://stackoverflow.com/a/38662876
def strip_ansi(line):
    ansi_escape = re.compile(r'(?:\x1B[@-_]|[\x80-\x9F])[0-?]*[ -/]*[@-~]')
    return ansi_escape.sub('', line)


# create simple model of rCTF


class rCTF:
    config_keys = {
        'RCTF_NAME' : 'ctf.name',
        'RCTF_ORIGIN' : 'ctf.origin',
        'RCTF_RCTF_CPU_LIMIT' : 'ctf.cpuLimit',
        'RCTF_RCTF_MEM_LIMIT' : 'ctf.memLimit',

        'RCTF_DATABASE_URL' : 'db.url',
        'RCTF_POSTGRES_CPU_LIMIT' : 'db.cpuLimit',
        'RCTF_POSTGRES_MEM_LIMIT' : 'db.memLimit',

        'RCTF_REDIS_URL' : 'redis.url',
        'RCTF_REDIS_CPU_LIMIT' : 'redit.cpuLimit',
        'RCTF_REDIS_MEM_LIMIT' : 'redit.memLimit',

        'RCTF_SMTP_URL' : 'smtp.url',
        'RCTF_EMAIL_FROM' : 'smtp.from'
    }


    def __init__(self, install_path = '/opt/rctf/'):
        if not install_path.endswith('/'):
            install_path += '/'

        self.install_path = install_path

        self.config_path = install_path + '.config.json'
        self.dotenv_path = install_path + '.env'


    # `update_config` tells it to replace config entries with dotenv entries
    def read_config(self, update_config = False):
        if update_config or not check_file(self.config_path):
            config = collections.OrderedDict()

            if update_config:
                config = self.read_config(update_config = False)

            dotenv_config = read_env(self.dotenv_path)

            # copy only certain keys from dotenv
            for key in sorted(dotenv_config.keys()):
                value = dotenv_config[key]

                if key in rCTF.config_keys:
                    config[rCTF.config_keys[key]] = str(value)

            self.write_config(config)
            os.chmod(self.config_path, 0o600)

        with open(self.config_path, 'r') as f:
            # TODO: auto identify bad permissions on config and warn
            config = json.loads(f.read(), object_pairs_hook = collections.OrderedDict)

        return config


    def write_config(self, config):
        config = json.dumps(config, indent = 2)

        with open(self.config_path, 'w') as f:
            return f.write(config)


    def up(self):
        os.chdir(self.install_path)
        
        if not execute('docker-compose --no-ansi up -d --build', environ = self.get_env()):
            logging.fatal('Failed to start rCTF instance')
            return False

        return True

    
    def down(self):
        os.chdir(self.install_path)
        
        if not execute('docker-compose --no-ansi down', environ = self.get_env()):
            logging.fatal('Failed to stop rCTF instance')
            return False
        
        return True
    
    
    def upgrade(self):
        os.chdir(self.install_path)
        
        # XXX: is there a way to make this not error if it fails?
        self.down()
        
        if not execute('git pull'):
            logging.fatal('Failed to pull latest from repository')
            return False

        if not execute('docker-compose --no-ansi build --no-cache', environ = self.get_env()):
            logging.fatal('Failed to rebuild docker image')
            return False
        
        return True


    # gets config environ
    def _get_config_as_environ(self):
        config = self.read_config()
        envvars = dict()

        reverse_config_keys = {value : key for key, value in rCTF.config_keys.items()}

        for key, value in config.items():
            if key in reverse_config_keys:
                envvars[reverse_config_keys[key]] = str(value)
            else:
                envvars[key] = str(value)

        return envvars
    
    # merges os.environ and configuration environ
    def get_env(self):
        environ = self._get_config_as_environ()
        environ.update(os.environ.copy())

        return environ

# main


if __name__ == '__main__':
    # parse arguments

    parser = argparse.ArgumentParser(description = 'Manage rCTF installations from the CLI')
    parser.add_argument('--install-path', '--path', '-d', type = str, default = os.environ.get('RCTF_INSTALL_PATH', os.environ.get('INSTALL_PATH', '/opt/rctf/')), help = 'The path to the rCTF installation to manage')

    subparsers = parser.add_subparsers(help = 'The sub-command to execute')

    parser_up = subparsers.add_parser('up', aliases = ['start'], help = 'Start rCTF in background')
    parser_up.set_defaults(subcommand = 'up')
    
    parser_down = subparsers.add_parser('down', aliases = ['stop'], help = 'Stop rCTF if running')
    parser_down.set_defaults(subcommand = 'down')

    parser_update = subparsers.add_parser('update', aliases = ['upgrade'], help = 'Update the rCTF installation')
    parser_update.set_defaults(subcommand = 'update')

    parser_config = subparsers.add_parser('config', aliases = ['configure'], help = 'Configure the rCTF installation')
    parser_config.set_defaults(subcommand = 'config')
    parser_config.add_argument('--editor', '--edit', '-e', default = False, action = 'store_true', help = 'Open a text editor of the configuration (from $EDITOR)')
    parser_config.add_argument('--unset', '-u', default = False, action = 'store_true', help = 'Leave the key unset but do not delete it from the config')
    parser_config.add_argument('--delete', '-d', default = False, action = 'store_true', help = 'Remove the key from the config')
    parser_config.add_argument('key', nargs = '?', default = None, help = 'The config key to read/write')
    parser_config.add_argument('value', nargs = '?', default = None, help = 'The value to write to the key')

    args = parser.parse_args()

    if not 'subcommand' in vars(args):
        logging.info('This is an rCTF management script. For usage, run:\n\n    %s --help\n' % sys.argv[0])
        exit(0)
    
    # create instance

    install_path = args.install_path
    subcommand = args.subcommand


    rctf = rCTF(install_path = install_path)

    os.chdir(install_path)

    if subcommand in ['start', 'up']:
        logging.info('Starting rCTF...')

        try:
            rctf.up()
            logging.info('Started rCTF.')
        except:
            logging.fatal('Failed to start rCTF', exc_info = True)
            exit(1)
    elif subcommand in ['stop', 'down']:
        logging.info('Stopping rCTF...')

        try:
            rctf.down()
            logging.info('Stopped rCTF.')
        except:
            logging.fatal('Failed to stop rCTF', exc_info = True)
            exit(1)
    elif subcommand in ['update', 'upgrade']:
        logging.info('Upgrading rCTF instance...')

        try:
            rctf.upgrade()
    
            logging.info('Successfully updated instance.')
            logging.info('Upgrading %s CLI tool...' % sys.argv[0])
            
            # XXX: possible argument injection probably not worth fixing
            execute(['cp', 'install/rctf.py', sys.argv[0]])
            execute(['chmod', '+x', sys.argv[0]])

            logging.info('Finished. Run `%s up` to start the rCTF instance again.' % sys.argv[0])
        except:
            logging.fatal('Failed to upgrade rCTF', exc_info = True)
            exit(1)
    elif subcommand in ['config', 'configure']:
        config_file = install_path + '/.config.yml'
        dotenv_file = install_path + '/.env'

        if args.editor:
            editor = get_editor()

            if not verify_privileges():
                logging.warning('You may not have proper permissions to access the rCTF installation.')

            execute([editor, config_file])

            logging.info('Note: You may have to restart rCTF for the changes to take effect.')
        else:
            unset = args.unset
            delete = args.delete
            _key = args.key
            _value = args.value
            
            if unset and not _key:
                logging.error('The argument --unset must be used with a key.')
                exit(1)

            config = rctf.read_config()

            format_config = lambda key, value : (
                colored(str(key), ['bold', 'red']) + colored(' => ', ['bold_white']) + (
                    colored('(unset)', ['gray', 'italics']) if value == None else colored(str(value), ['red'])
                )
            )

            if not _key:
                # print out whole config
                for key, value in config.items():
                    logging.info(format_config(key, value))
            else:
                if delete:
                    del config[_key]
                    rctf.write_config(config)
                elif _value or unset:
                    # write to config
                    if unset:
                        _value = None

                    config[_key] = _value

                    rctf.write_config(config)
                else:
                    _value = config.get(_key)

                logging.info(format_config(_key, _value))
