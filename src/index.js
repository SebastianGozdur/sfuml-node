"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SUmlRunner_1 = require("./runner/SUmlRunner");
var argv = require('yargs/yargs')(process.argv.slice(2))
    .example("For uml generation: sfuml --sfdir 'C:XXXXXXX\\sf_sample\\force-app\\main\\default'")
    .option('target', {
    describe: 'Directory containing result file',
    type: 'string'
})
    .option('bearer', {
    describe: 'Bearer key for returned by salesforce auth',
    type: 'string'
})
    .option('instanceurl', {
    describe: 'Salesforce instance url',
    type: 'string'
})
    .argv;
new SUmlRunner_1.SUmlRunner().generateUml(argv.target, argv.bearer, argv.instanceurl);
