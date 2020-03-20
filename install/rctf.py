#!/usr/bin/env python3
# a script to manage rCTF installations

import sys, os, io, subprocess
import argparse
import logging, traceback


# custom color logging


colored = lambda s, attrs = [] : ''.join([{
    'lightgray' : '\033[37m',
    'darkgray' : '\033[90m',
    'gray' : '\033[2m',
    'blue' : '\033[34m',
    'cyan' : '\033[36m',
    'darkorange' : '\033[33m',
    'darkred' : '\033[31m',
    'lightred' : '\033[91m',
    'bold_white' : '\033[1;37m',

    'bg_red' : '\033[41m',

    'italics' : '\033[3m',
    'bold' : '\033[01m',
    'underline' : '\033[04m',
}[x] for x in attrs]) + s + '\033[0m'


class ColorLog(object):

    colormap = {
        'debug' : ['italics', 'gray'],
        'info' : ['blue'],
        'warn' : ['bold', 'darkorange'],
        'warning' : ['bold', 'darkorange'],
        'error' : ['bold', 'lightred'],
        'critical' : ['bg_red', 'bold_white'],
        'fatal' : ['bg_red', 'bold_white']
    }

    prompt = {
        'debug' : ' *  {msg}',
        'info' : '[*] {msg}',
        'warn' : '[!] {msg}',
        'warning' : '[!] {msg}',
        'error' : '[-] {msg}',
        'critical' : '[-] {msg}',
        'fatal' : '[-] {msg}'
    }


    def __init__(self, logger):
        self._log = logger


    def __getattr__(self, name):
        if name in ['debug', 'info', 'warn', 'warning', 'error', 'critical', 'fatal']:
            return lambda s, *args, **kwargs: getattr(self._log, name)(
                colored(ColorLog.prompt[name].format(msg = s), attrs = ColorLog.colormap[name])
                + ('\n' + colored(traceback.format_exc().strip(), ['italics', 'darkred']) if kwargs.get('exc_info') else '')
            )

        return getattr(self._log, name)


LOG_LEVEL = logging.DEBUG


log = ColorLog(logging.getLogger(__name__))
log.setLevel(LOG_LEVEL)
stdout = logging.StreamHandler()
log.addHandler(stdout)
stdout.setLevel(LOG_LEVEL)
logging = log # XXX: find a cleaner solution plz


# define useful functions


def verify_privileges(euid = 0):
    return os.geteuid() == euid


def check_file(fn):
    # verifies a file exists
    return os.path.isfile(fn)


def execute(command):
    logging.debug('Executing `%s`...' % command)
    
    # shell=False if list, shell=True if str
    logging.debug('-'*80)
    status_code = subprocess.call(command, shell = isinstance(command, str))
    logging.debug('-'*80)

    if status_code:
        logging.error('Command failed to execute; exited with status code %d.' % status_code)

    # XXX: check to make sure this status code isn't just docker?
    if status_code == 1 and not verify_privileges(): # permission denied
        logging.warning('Possible permission denied error? Try running as root.\n\n    %s\n' % ' '.join(sys.argv))
        raise PermissionError('Permission denied. Try running as root.')


    return status_code == 0


# create simple model of rCTF


class rCTF:
    def __init__(self, install_path = '/opt/rctf/'):
        if not install_path.endswith('/'):
            install_path += '/'

        self.install_path = install_path


    def up(self):
        os.chdir(self.install_path)
        
        if not execute('docker-compose up -d --build'):
            logging.fatal('Failed to start rCTF instance')
            return False

        return True

    
    def down(self):
        os.chdir(self.install_path)
        
        if not execute('docker-compose down'):
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

        if not execute('docker-compose build --no-cache'):
            logging.fatal('Failed to rebuild docker image')
            return False
        
        return True



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
