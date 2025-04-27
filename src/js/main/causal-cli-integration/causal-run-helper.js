import { app, dialog } from "electron";
import { CausalCLI } from "./causal-cli";
import { FormatUtils } from "../data/format-utils";
const path = require('path');

const eventBus = require("js-event-bus")();

export class CausalRunHelper {
    #causalBundle;
    constructor(window, activeComponentTypes) {
        this.causalCLI = new CausalCLI(this.getCLIPath());
        this.window = window;
        this.activeComponentTypes = activeComponentTypes;

        eventBus.on("causalBundleOpened", this.onCausalBundleOpened.bind(this));
    }

    onCausalBundleOpened({ causalBundle }) {
        this.#causalBundle = causalBundle;
    }

    getCLIPath() {
        const exeName = process.platform === 'win32'
            ? 'CausalModel.CLI.exe'
            : 'CausalModel.CLI';

        // Development
        if (!app.isPackaged) {
            return path.join(
                __dirname,
                '../../resources/cli',
                exeName
            );
        }

        console.log("Resources path: ", process.resourcesPath);
        console.log("result: ", path.join(
            process.resourcesPath,
            'cli',
            exeName));

        // Production
        return path.join(
            process.resourcesPath,
            'cli',
            exeName
        );
    }

    /**
     * Serializes the object in JSON with escaping for the CLI
     * @param {object} data - Object for serialization
     * @returns {string} - A JSON string ready for transmission to the CLI
     */
    serializeForCLI(data) {
        // 1. Standard serialization in compact JSON
        const jsonString = JSON.stringify(data);

        // 2. Additional escaping for Windows
        if (process.platform === 'win32') {
            return `"${jsonString.replace(/"/g, '\\"')}"`;
        }

        // 3. For Unix systems, we simply return it as it is.
        return jsonString;
    }

    prepareForCLI(causalBundle) {
        FormatUtils.formatProjectData(causalBundle)
        return this.serializeForCLI(causalBundle);
    }

    async runCurrentCausalBundle() {
        return this.runCausalBundle(this.prepareForCLI(this.#causalBundle));
    }

    async runCurrentCausalBundleProbabilityEstimation() {
        return this.runProbabilityEstimation(this.prepareForCLI(this.#causalBundle));
    }

    async runCausalBundle(input) {
        console.log("INPUT ", input);
        try {
            const result = await this.causalCLI.fixate({
                input: input,
                fixatorType: 'Default',
                outputFormat: 'Json',
                indented: false
            });

            if (result.success) {
                const output = JSON.parse(result.output);

                this.ensureComponentActive("Fixation Results");
                this.window.webContents.send("fixation-completed", output);
                return output;
            } else {
                this.showError('Causal Bundle Run Error', result.error);
                return null;
            }
        } catch (err) {
            this.showError('Causal Bundle Run Error', err.message);
            return null;
        }
    }

    async runProbabilityEstimation(input) {
        try {
            const result = await this.causalCLI.monteCarlo({
                input: input,
                fixatorType: 'Default',
                outputFormat: 'Json',
                indented: false,
                iterations: 10000,
            });

            if (result.success) {
                const output = JSON.parse(result.output);

                this.ensureComponentActive("Probability Estimation Results");
                this.window.webContents.send("probability-estimation-completed", output);
                return output;
            } else {
                this.showError('Probability Estimation Error', result.error);
                return null;
            }
        } catch (err) {
            this.showError('Probability Estimation Error', err.message);
            return null;
        }
    }

    async runWithFilePicker(command) {
        const { filePaths } = await dialog.showOpenDialog({
            properties: ['openFile'],
            filters: [{ name: 'Causal Bundle Files', extensions: ['json', 'cmprj'] }]
        });

        if (filePaths.length === 0) {
            return null;
        }

        const input = filePaths[0];

        if (command === 'fixate') {
            return this.runCausalBundle(input);
        } else if (command === 'montecarlo') {
            return this.runProbabilityEstimation(input);
        }
    }

    ensureComponentActive(componentType) {
        if (!this.activeComponentTypes.has(componentType)) {
            this.window.webContents.send("set-component-active", {
                componentType: componentType,
                isActive: true,
            });
        }
    }

    showSuccess(title, data) {
        let message = "";

        if (typeof data === 'object') {
            message += JSON.stringify(data, null, 2);
        } else {
            message += data;
        }

        dialog.showMessageBox({
            type: 'info',
            title: title,
            message: title,
            detail: message,
            buttons: ['OK']
        });
    }

    showError(title, error) {
        dialog.showMessageBox({
            type: 'error',
            title: title,
            message: title,
            detail: error,
            buttons: ['OK']
        });
    }
}