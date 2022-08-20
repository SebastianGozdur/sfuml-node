"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandExecutorService = void 0;
const { exec } = require("child_process");
class CommandExecutorService {
    executeCommand(command, callback) {
        exec(command, callback);
    }
}
exports.CommandExecutorService = CommandExecutorService;
