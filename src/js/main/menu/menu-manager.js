const { nativeTheme, shell, ipcMain, Menu, dialog } = require("electron");
const path = require("path");
import MenuActionHelper from "./menu-action-helper.js";
import MenuTemplateBuilder from "./menu-template-builder.js";

export class MenuManager {
  constructor(projectManager, window) {
    this.activeComponentTypes = new Set();
    this.menuActionHelper = new MenuActionHelper(
      window,
      projectManager,
      this.activeComponentTypes);

    ipcMain.on("send-component-active", this.onSendComponentActive.bind(this));

    window.webContents.on("before-input-event", (event, input) => {
      // accelerator not working
      // if (input.control && input.code === "keyA") {
      //   this.selectAllHandler();
      // }
      if (input.control && input.code === "KeyZ") {
        this.menuActionHelper.undoHandler();
        event.preventDefault();
      }
      if (input.control && input.code === "KeyY") {
        this.menuActionHelper.redoHandler();
        event.preventDefault();
      }
    });
  }

  // Receive layout components data from the renderer process and render the menu
  onSendComponentActive(event, { componentType, isActive }) {
    if (!this.registeredComponentTypes) {
      this.registeredComponentTypes = new Set();
    }
    if (!this.registeredComponentTypes.has(componentType)) {
      this.registeredComponentTypes.add(componentType);
    }
    if (isActive) {
      this.activeComponentTypes.add(componentType);
    } else {
      this.activeComponentTypes.delete(componentType);
    }

    this.render();
  }

  render() {
    const menu = (this.menu = Menu.buildFromTemplate(
      MenuTemplateBuilder.createMenuTemplate(
        this.registeredComponentTypes,
        this.activeComponentTypes,
        this.menuActionHelper
      )
    ));
    Menu.setApplicationMenu(menu);
  }
}
