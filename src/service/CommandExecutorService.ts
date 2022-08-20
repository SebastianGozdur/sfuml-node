const {exec} = require("child_process");

export class CommandExecutorService {

    public executeCommand(command: string, callback: any) {
        exec(command, callback);
    }
}