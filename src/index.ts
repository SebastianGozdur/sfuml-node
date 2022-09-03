#!/usr/bin/env node
import {SUmlRunner} from './runner/SUmlRunner';

var argv = require('yargs/yargs')(process.argv.slice(2))
    .example(
        "For uml generation: sfuml --sfdir 'C:XXXXXXX\\sf_sample\\force-app\\main\\default'",
    )
    .option('target', {
        describe: 'Directory containing result file',
        type: 'string',
        demandOption: true
    })
    .option('bearer', {
        describe: 'Bearer key for returned by salesforce auth',
        type: 'string',
        demandOption: true
    })
    .option('instanceurl', {
        describe: 'Salesforce instance url',
        type: 'string',
        demandOption: true
    })
    .option('configpath', {
        describe: 'Config json path',
        type: 'string',
        demandOption: true
    })
    .argv;

new SUmlRunner().generateUml(argv.target, argv.bearer, argv.instanceurl, argv.configpath);