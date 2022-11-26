import { spawn } from 'child_process';

export default class CLI {
    /**
     * Execute a command line interface command
     * @param command the command to execute
     * @param args the command arguments
     * @param dontRaiseException if true, donc raise any expection if the command returns a non zero code
     */
    static async executeCommand(command: string, args: string[], dontRaiseException: boolean = false) : Promise<void> {
        return new Promise((resolve, reject) => {

            let commandName: string|string[]|null = command.match(/[^\\\/]+$/);
            commandName = commandName==null ? command : commandName[0];

            const process = spawn(command, args);

            process.stdout.on("data", (data) => {
                console.log(`${commandName} - log : ${data}`);
            });

            process.stderr.on("data", (data) => {
                console.error(`${commandName} - err : ${data}`);
            });

            process.on("close", (code) => {
                console.log(`${commandName} - Command ends with code  : ${code}`);
                if (code != 0 && !dontRaiseException)
                    reject(`Command ${commandName} failed with code ${code}`);
                else
                    resolve();
            });
        });
    }
};