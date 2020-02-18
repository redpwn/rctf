#!/usr/bin/env python3
# a script to manage rCTF installations

import sys, os, io, subprocess
import argparse
import logging


logging.basicConfig(format = '%(message)s', level = logging.DEBUG)


# define useful functions


def verify_privileges(euid = 0):
    if os.geteuid() != euid:
        logging.fatal('This command must be run as root')
        return False

    return True


def check_file(fn):
    # verifies a file exists
    return os.path.isfile(fn)


def execute(command):
    logging.debug('Executing `%s`...' % command)
    
    # shell=False if list, shell=True if str
    status_code = subprocess.call(command, shell = isinstance(command, str))

    if status_code:
        logging.warning('Command failed to execute; exited with status code %d.' % status_code)

    return status_code == 0


# create simple model of rCTF


class rCTF:
    def __init__(self, install_path = '/opt/rctf/'):
        if not install_path.endswith('/'):
            install_path += '/'

        self.install_path = install_path


    def up(self):
        os.chdir(self.install_path)
        
        if not verify_privileges():
            return False

        if not execute('docker-compose up -d'):
            logging.fatal('Failed to start rCTF instance')
            return False

        return True

    
    def down(self):
        os.chdir(self.install_path)
        
        if not verify_privileges():
            return False

        if not execute('docker-compose down'):
            logging.fatal('Failed to stop rCTF instance')
            return False
        
        return True
    
    
    def upgrade(self):
        os.chdir(self.install_path)
        
        if not verify_privileges():
            return False
    
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
        logging.info('This is an rCTF management script. For usage, run:\n    %s --help' % sys.argv[0])
        exit(0)
    

    # create instance


    install_path = args.install_path
    subcommand = args.subcommand


    rctf = rCTF(install_path = install_path)

    os.chdir(install_path)


    if subcommand in ['start', 'up']:
        if not rctf.up():
            exit(1)
    elif subcommand in ['stop', 'down']:
        if not rctf.down():
            exit(1)
    elif subcommand in ['update', 'upgrade']:
        if not rctf.upgrade():
            exit(1)

        logging.info('Successfully updated instance. Run `%s up` to start instance' % sys.argv[0])
        logging.info('Upgrading %s CLI tool...' % sys.argv[0])
        
        # XXX: possible argument injection probably not worth fixing
        if not (execute(['cp', 'install/rctf.py', sys.argv[0]]) and execute(['chmod', '+x', sys.argv[0]])):
            logging.fatal('Failed to upgrade rCTF CLI tool')
            exit(1)
