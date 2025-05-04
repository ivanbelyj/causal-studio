const contextMenu = require("electron-context-menu");
const { ipcMain, dialog } = require("electron");

class ContextMenuManager {
  isNodeEntered = false;
  isCausalViewEntered = false;
  window;
  constructor(window) {
    this.window = window;

    ipcMain.on("node-enter", () => {
      this.isNodeEntered = true;
    });
    ipcMain.on("node-leave", () => {
      this.isNodeEntered = false;
    });

    ipcMain.on("causal-view-enter", () => {
      this.isCausalViewEntered = true;
    });
    ipcMain.on("causal-view-leave", () => {
      this.isCausalViewEntered = false;
    });
  }

  setContextMenu() {
    contextMenu({
      showSearchWithGoogle: false,
      showLearnSpelling: true,
      showSelectAll: false,
      showCopyImage: false,
      prepend: (defaultActions, parameters, browserWindow) => [
        {
          label: "Create Fact",
          visible: this.isCausalViewEntered,
          click: (event) => {
            this.window.webContents.send("create-node", {
              x: parameters.x,
              y: parameters.y,
            });
          },
        },
        {
          label: "Create Fact With Name",
          visible: this.isCausalViewEntered,
          click: (event) => {
            this.window.webContents.send("create-fact-with-name", {
              x: parameters.x,
              y: parameters.y,
            });
          },
        },
        {
          label: "Declare Block",
          visible: this.isCausalViewEntered,
          click: (event) => {
            this.window.webContents.send("declare-block", {
              x: parameters.x,
              y: parameters.y,
            });
          },
        },
        {
          label: "Remove Node",
          visible: this.isNodeEntered,
          click: () => {
            this.isNodeEntered = false; // entered node is removed
            this.window.webContents.send("remove-node", {
              x: parameters.x,
              y: parameters.y,
            });
          },
        },
        {
          label: "Select All",
          visible: this.isCausalViewEntered,
          click: (event) => {
            this.window.webContents.send("select-all");
          },
        },
      ],
    });
  }
}

module.exports = {
  ContextMenuManager,
};
