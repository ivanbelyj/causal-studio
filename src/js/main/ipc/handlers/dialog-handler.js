import { dialog, ipcMain } from 'electron';
import { DIALOG } from '../channels';

export class DialogHandler {
    constructor() {
        this.#registerHandlers();
    }

    #registerHandlers() {
        ipcMain.on(DIALOG.SHOW, (event, { type, options }) => {
            switch (type) {
                case 'message':
                    return dialog.showMessageBox(options);
                case 'error':
                    dialog.showErrorBox(
                        options.title || 'Error',
                        options.message || 'Something went wrong'
                    );
                    return null;
                case 'open':
                    return dialog.showOpenDialog(options);
                case 'save':
                    return dialog.showSaveDialog(options);
                default:
                    throw new Error(`Unknown dialog type: ${type}`);
            }
        });
    }
}
