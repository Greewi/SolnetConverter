export default class CommandHelper {

    private _commandString: string;
    private _description: string;
    private _namedParameters: {[key:string]: {name:string, description:string, value:string}};
    private _flags: {[key:string]: {name:string, description:string, value:boolean}};
    private _hasFlags: boolean;

    /**
     * @param command the command without its arguments
     * @param description the description of the command
     * @param namedParameters the name of parameters with their description
     * @param flags the name of the flags with their description
     */
    constructor(command: string, description: string, namedParameters: {[key: string]: string}, flags: {[key: string]: string}) {
        this._description = description;
        this._hasFlags = false;
        this._flags = {};
        this._namedParameters = {};

        const nonFlags:string[] = [];
        // Setting flags
        for(const flag in flags) {
            this._flags[flag] = {name:flag, description:flags[flag], value:false};
            this._hasFlags = true;
        }
        for(const argument of process.argv) {
            if(this._flags[argument] !== undefined)
                this._flags[argument].value = true;
            else
                nonFlags.push(argument);
        }

        // Filling command string (for the usage)
        this._commandString = command;
        if(this._hasFlags)
            this._commandString += " [OPTIONS]";

        // Setting namesParameters
        let namedParametersNumber = 0;
        for(const arg in namedParameters) {
            this._namedParameters[arg] = {name:arg, description:namedParameters[arg], value:""};
            this._commandString += ` ${arg}`;
            namedParametersNumber++;
        }
        nonFlags.shift();
        nonFlags.shift();
        if(namedParametersNumber != nonFlags.length) {
            this.usage("Invalid parameters");
        }
        for(const arg in namedParameters) {
            const value = nonFlags.shift();
            if(value !== undefined)
                this._namedParameters[arg].value = value;
        }
    }

    /**
     * Print the usage and exit the program
     * @param error the error message
     */
    usage(error: string|Error|undefined): never {
        if(error)
            console.error(error);
        console.error("USAGE :");
        console.error(`\t${this._commandString}`);
        console.error("\t");
        console.error(`\t${this._description}`);
        console.error("\t");
        for(const arg in this._namedParameters)
            console.error(`\t\t${arg}\t${this._namedParameters[arg].description}`);
        if(this._hasFlags) {
            console.error("\tOptional arguments");
            for(const arg in this._flags)
                console.error(`\t\t${arg}\t${this._flags[arg].description}`);
        }
        process.exit(error? 1 : 0);
    }

    /**
     * Check in a flag has been passed to the program
     * @param flag the flag name
     * @returns true if the flag has been passed to the program
     */
    has(flag: string): boolean {
        return this._flags[flag] && this._flags[flag].value;
    }

    /**
     * Get the value of an argument passed to the program
     * @param arg the argument name
     * @returns the value of the argument
     */
    get(arg: string): string {
        if(this._namedParameters[arg])
            return this._namedParameters[arg] && this._namedParameters[arg].value;
        this.usage(`ASSERTION ERROR : argument ${arg} not set`);
    }
}