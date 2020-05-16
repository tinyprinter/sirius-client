#!/usr/bin/env ts-node-script

import CommandLine from '../src/cli/daemon';

const cli = new CommandLine();
cli.execute();
