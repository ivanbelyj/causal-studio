const { spawn } = require('child_process');

export class CausalCLI {
    constructor(cliPath) {
        this.cliPath = cliPath;
        console.log("Causal CLI path:", cliPath);
    }

    executeCommand(command, args) {
        return new Promise((resolve) => {
            if (!this.cliPath || !require('fs').existsSync(this.cliPath)) {
                resolve({
                    success: false,
                    error: 'Causal CLI application not found.',
                });
                return;
            }

            // Preparing command considering platform
            let finalCommand = [command, ...args];
            let shell = false;
            let options = {
                stdio: ['pipe', 'pipe', 'pipe'],
                windowsVerbatimArguments: true
            };

            if (process.platform === 'win32') {
                // Add chcp 65001 for Windows in the beginning of the command
                finalCommand = ['cmd', '/c', 'chcp', '65001>nul', '&&', this.cliPath, ...finalCommand];
                shell = true;
            } else {
                // For other platforms just run the command
                finalCommand = [this.cliPath, ...finalCommand];
            }

            const cliProcess = spawn(finalCommand[0], finalCommand.slice(1), {
                ...options,
                shell: shell
            });

            let output = '';
            let errorOutput = '';

            cliProcess.stdout.on('data', (data) => {
                output += data.toString();
            });

            cliProcess.stderr.on('data', (data) => {
                errorOutput += data.toString();
            });

            cliProcess.on('close', (code) => {
                if (code === 0) {
                    resolve({ success: true, output: output.trim() });
                } else {
                    resolve({
                        success: false,
                        error: errorOutput || `CLI process exited with code ${code}`
                    });
                }
            });

            cliProcess.on('error', (err) => {
                resolve({ success: false, error: err.message });
            });
        });
    }

    buildArgs(options) {
        const args = [];

        for (const [key, value] of Object.entries(options)) {
            if (value === undefined || value === null) continue;

            const argName = key.length === 1 ? `-${key}` : `--${key}`;

            if (typeof value === 'boolean') {
                if (value) args.push(argName);
            } else {
                args.push(argName);
                args.push(value.toString());
            }
        }

        return args;
    }

    async fixate(options) {
        const args = this.buildArgs({
            i: options.input,
            s: options.seed,
            'fixator-type': options.fixatorType,
            format: options.outputFormat,
            indented: options.indented
        });

        return this.executeCommand('fixate', args);
    }

    async monteCarlo(options) {
        const args = this.buildArgs({
            i: options.input,
            s: options.seed,
            iterations: options.iterations,
            'fixator-type': options.fixatorType,
            format: options.outputFormat
        });

        return this.executeCommand('montecarlo', args);
    }
}
