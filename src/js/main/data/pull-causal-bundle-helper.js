const { ipcMain } = require("electron");

export class PullCausalBundleHelper {
    constructor(window) {
        this.window = window;
    }

    async pullCausalBundle() {
        return new Promise((resolve, reject) => {
            // Generate a unique Id for this request
            const dataToSaveId = Math.random().toString();

            // Listen for the response just once
            ipcMain.once(
                `pull-causal-bundle-result-${dataToSaveId}`,
                (event, { dataToSave }) => {
                    resolve({
                        dataToSave,
                    });
                }
            );

            // Initiate pulling causal bundle from the renderer process
            this.window.webContents.send("pull-causal-bundle", {
                dataToSaveId,
            });
        });
    }
}