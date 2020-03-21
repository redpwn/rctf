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


USE_ANSI = True


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
    'yellow' : '\033[33m',
    'lightyellow' : '\033[93m',
    'lightgreen' : '\033[92m',
    'bold_white' : '\033[1;37m',

    'bg_red' : '\033[41m',

    'italics' : '\033[3m',
    'bold' : '\033[01m',
    'underline' : '\033[04m',

    'reset' : '\033[0m'
}

colored = lambda message, attrs = [] : colors['reset'] + ''.join([colors[x] for x in attrs]) + str(message) + colors['reset']
colored_command = lambda message : colors['bold'] + colors['underline'] + str(message) + colors['reset']

colormap = {
    'debug' : ['italics', 'gray'],
    'info' : ['blue'],
    'warning' : ['bold', 'darkorange'],
    'error' : ['bold', 'lightred'],
    'fatal' : ['bg_red', 'bold_white'],

    'exception' : ['italics', 'darkred']
}

prompts = {
    'debug' : ' * ',
    'info' : '[*]',
    'warn' : '[!]',
    'warning' : '[!]',
    'error' : '[-]',
    'fatal' : '[-]'
}


class ColorLog(object):
    def __init__(self, logger):
        self._log = logger


    def _log_msg(self, name, *args, **kwargs):
        return getattr(self._log, 'fatal' if name == 'exception' else name)(self._format_msg(name, *args, **kwargs))
    
    def _format_msg(self, name, *args, **kwargs):
        exc_info = kwargs.get('exc_info', False)

        if name == 'exception':
            name = 'fatal'
            exc_info = True
        elif name == 'warn':
            name = 'warning'
        elif name == 'critical':
            name = 'fatal'

        _colored = colored if kwargs.get('use_ansi', True) else lambda s, x : s

        prompt = prompts[name] + ' ' if not kwargs.get('prompt') else kwargs.get('prompt')
        message = _colored(prompt, colormap[name]) + ''.join([_colored(x, colormap[name]) for x in args])

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
    logging.debug('Executing ', colored_command(command), '...')

    if not environ:
        environ = os.environ.copy()
    
    # shell=False if list, shell=True if str
    if isinstance(command, str):
        command = ['/bin/sh', '-c', command]

    p = subprocess.Popen(command, shell = False, stdin = subprocess.PIPE, stdout = subprocess.PIPE, stderr = subprocess.PIPE, env = environ)

    sel = selectors.DefaultSelector()
    sel.register(p.stdout, selectors.EVENT_READ)
    sel.register(p.stderr, selectors.EVENT_READ)

    should_exit = False
    should_print_bars = False

    # use selectors to print stderr/stdout as we get them
    while True:
        if should_exit:
            break

        for key, _ in sel.select():
            data = key.fileobj.read1().decode()

            if not data:
                should_exit = True
                break
            
            data = strip_ansi(data.strip())

            prompt = ' *  '
            data = data.replace('\n', '\n' + prompt)

            if not should_print_bars:
                logging.debug('-'*80, prompt = ' *--')
                should_print_bars = True

            if key.fileobj is p.stdout:
                # stdout
                logging.debug(colored(data, ['italics']), prompt = prompt)
            else:
                # stderr
                logging.debug(colored(data, ['italics', 'bold']), prompt = prompt)

    p.communicate()
    status_code = p.returncode

    # only print bars if we read something
    if should_print_bars:
        logging.debug('-'*80, prompt = ' *--')

    if status_code:
        logging.error('Command failed to execute; exited with status code ', colored_command(status_code), '.')

    # XXX: check to make sure this status code isn't just docker?
    if status_code == 1 and not verify_privileges(): # permission denied
        logging.warning('Possible permission denied error? Try running as root.\n\n    %s\n' % colored_command(' '.join(sys.argv)))
        raise PermissionError('Permission denied. Try running as root.')


    return status_code == 0


# from: https://stackoverflow.com/a/38662876
def strip_ansi(line):
    ansi_escape = re.compile(r'\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])')
    return ansi_escape.sub('', line)


# create simple classes


class Config(collections.OrderedDict):
    # for mapping to headers
    config_keys = {
        'RCTF_NAME' : 'ctf.name',
        'RCTF_ORIGIN' : 'ctf.origin',

        'RCTF_DATABASE_URL' : 'db.url',

        'RCTF_REDIS_URL' : 'redis.url',

        'RCTF_SMTP_URL' : 'smtp.url',
        'RCTF_EMAIL_FROM' : 'smtp.from'
    }


    # this is what the actual config is by default
    default_config = collections.OrderedDict({
        'cli.ansi' : True
    })
    
    
    def __init__(self, config_path, *args, **kwargs):
        retval = super().__init__(*args, **kwargs)
        
        self.config_path = config_path
        
        #self._get = self.get
        #self._set = self.set
        
        self.get = self.__get
        self.set = self.__set
        
        return retval
    
    
    def __get(self, key, default = None):
        return str(self[key]) if key in self else default
    
    
    def get_bool(self, *args, **kwargs):
        return str(self.get(*args, **kwargs).strip().lower()) in ['true', '1', 'enable', 'true']
    
    
    def get_int(self, *args, **kwargs):
        return int(str(self.get(*args, **kwargs).strip()))
    
    
    def __set(self, key, value):
        self[key] = str(value)
        return key
    
    # `update_config` tells it to replace config entries with dotenv entries
    def read(self, update_config = False):
        if self.config_path == '':
            raise RuntimeError('Attempted to read dummy config path')
    
        if update_config or not check_file(self.config_path):
            config = default_config.copy()

            if update_config:
                config = self.read(update_config = False)

            dotenv_config = read_env(self.dotenv_path)

            # copy only certain keys from dotenv
            for key in sorted(dotenv_config.keys()):
                value = dotenv_config[key]

                if key in Config.config_keys:
                    config[Config.config_keys[key]] = str(value)

            config.write()
            os.chmod(self.config_path, 0o600)

        with open(self.config_path, 'r') as f:
            # TODO: auto identify bad permissions on config and warn
            config = json.loads(f.read(), object_pairs_hook = collections.OrderedDict)
        
        self.clear()
        self.update(config)
        
        return self


    def write(self):
        if self.config_path == '':
            raise RuntimeError('Attempted to write dummy config path')
        
        config = json.dumps(self, indent = 2)

        with open(self.config_path, 'w') as f:
            return f.write(config)


    # gets config environ
    def _get_as_environ(self):
        envvars = dict()

        reverse_config_keys = {value : key for key, value in Config.config_keys.items()}

        for key, value in self.items():
            if key in reverse_config_keys:
                envvars[reverse_config_keys[key]] = str(value)
            elif not key.startswith('cli.'):
                envvars[key] = str(value)

        return envvars


class rCTF:
    def __init__(self, install_path = '/opt/rctf/'):
        if not install_path.endswith('/'):
            install_path += '/'

        self.install_path = install_path

        self.config_path = install_path + '.config.json'
        self.dotenv_path = install_path + '.env'


    def up(self):
        os.chdir(self.install_path)
        
        if not execute('docker-compose --no-ansi up -d --build', environ = self.get_env()):
            logging.fatal('Failed to start rCTF instance.')
            return False

        return True

    
    def down(self):
        os.chdir(self.install_path)
        
        if not execute('docker-compose --no-ansi down', environ = self.get_env()):
            logging.fatal('Failed to stop rCTF instance.')
            return False
        
        return True
    
    
    def upgrade(self):
        os.chdir(self.install_path)
        
        # XXX: is there a way to make this not error if it fails?
        self.down()
        
        if not execute('git pull'):
            logging.fatal('Failed to pull latest from repository.')
            return False

        if not execute('docker-compose --no-ansi build --no-cache', environ = self.get_env()):
            logging.fatal('Failed to rebuild docker image.')
            return False
        
        return True


    def get_config(self, update_config = False):
        return Config(self.config_path).read(update_config = update_config)

    
    # merges os.environ and configuration environ
    def get_env(self):
        environ = self.get_config()._get_as_environ()
        environ.update(os.environ.copy())

        return environ

# main


if __name__ == '__main__':
    # parse arguments

    parser = argparse.ArgumentParser(description = 'Manage rCTF installations from the CLI')
    parser.add_argument('--install-path', '--path', '-d', type = str, default = os.environ.get('RCTF_INSTALL_PATH', os.environ.get('INSTALL_PATH', '/opt/rctf/')), help = 'The path to the rCTF installation to manage')
    parser.add_argument('--no-ansi', '-c', default = False, action = 'store_true', help = 'Disable ANSI coloring on all output')

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

    install_path = args.install_path
    os.chdir(install_path)

    rctf = rCTF(install_path = install_path)

    # parse cli config

    read_config = False
    
    try:
        config = rctf.get_config()

        read_config = True
    except PermissionError:
        # XXX: this is a dummy path. find a better way to handle
        config = Config(Config.default_config)

    # disable ansi color codes if necessary

    if (not config.get_bool('cli.ansi')) or args.no_ansi:
        USE_ANSI = False

        # XXX: this is a bit hacky
        for key in colors.keys():
            colors[key] = ''

    # parse arguments
    
    if not 'subcommand' in vars(args):
        logging.info('This is the rCTF CLI management tool. For usage, run:\n\n    ', colored_command('%s --help' % sys.argv[0]), '\n')
        exit(0)
    
    subcommand = args.subcommand

    if subcommand in ['start', 'up']:
        logging.info('Starting rCTF...')

        try:
            rctf.up()
            logging.info('Started rCTF.')
        except:
            logging.fatal('Failed to start rCTF.', exc_info = True)
            exit(1)
    elif subcommand in ['stop', 'down']:
        logging.info('Stopping rCTF...')

        try:
            rctf.down()
            logging.info('Stopped rCTF.')
        except:
            logging.fatal('Failed to stop rCTF.', exc_info = True)
            exit(1)
    elif subcommand in ['update', 'upgrade']:
        logging.info('Upgrading rCTF instance...')

        try:
            rctf.upgrade()
    
            logging.info('Successfully updated instance.')
            logging.info('Upgrading %s CLI tool...' % colored_command(sys.argv[0]))
            
            # XXX: possible argument injection probably not worth fixing
            execute(['cp', 'install/rctf.py', sys.argv[0]])
            execute(['chmod', '+x', sys.argv[0]])

            logging.info('Finished. Run ', colored_command(sys.argv[0] + ' up'), ' to start the rCTF instance again.' % sys.argv[0])
        except:
            logging.fatal('Failed to upgrade rCTF.', exc_info = True)
            exit(1)
    elif subcommand in ['config', 'configure']:
        if args.editor:
            editor = get_editor()

            if not verify_privileges():
                logging.warning('You may not have proper permissions to access the rCTF installation.')

            if not read_config:
                logging.exception('You do not have proper permission to access the config file ', colored_command(rctf.config_path), '.')
                exit(1)

            execute([editor, rctf.config_path])

            logging.info('Note: You may have to restart rCTF for the changes to take effect.')
        else:
            unset = args.unset
            delete = args.delete
            _key = args.key
            _value = args.value
            
            if unset and not _key:
                logging.error('The argument ', colored_command('--unset'), ' must be used with a key.')
                exit(1)
            
            if not read_config:
                logging.exception('You do not have proper permission to access the config file ', colored_command(rctf.config_path), '.')
                exit(1)

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
                    config.write()
                elif _value or unset:
                    # write to config
                    if unset:
                        _value = None

                    config[_key] = _value
                    config.write()
                else:
                    _value = config.get(_key)

                logging.info(format_config(_key, _value))
