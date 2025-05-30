const { ipcMain, Menu, globalShortcut } = require("electron");
const path = require("path");
import { DataManager } from "../data-management/data-manager.js";
import { DataStore } from "../data-management/data-store.js";
import MenuActionHelper from "./menu-action-helper.js";
import MenuTemplateBuilder from "./menu-template-builder.js";

export class MenuManager {
  /**
   * 
   * @param {DataManager} dataManager 
   * @param {*} window 
   * @param {DataStore} dataStore 
   */
  constructor(dataManager, window) {
    this.activeComponentTypes = new Set();
    this.menuActionHelper = new MenuActionHelper(
      window,
      dataManager,
      this.activeComponentTypes);

    ipcMain.on("send-component-active", this.onSendComponentActive.bind(this));

    window.webContents.on("before-input-event", (event, input) => {
      // For some reason, Ctrl+A accelerator is not working
      // if (input.control && input.code === "keyA") {
      //   this.menuActionHelper.selectAllHandler();
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
  onSendComponentActive(event, { componentType, isActive, componentData }) {
    if (!this.registeredComponentTypes) {
      this.registeredComponentTypes = new Map();
    }
    if (!this.registeredComponentTypes.has(componentType)
      && componentData.isCloseable
      && componentData) {
      this.registeredComponentTypes.set(componentType, componentData);
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
