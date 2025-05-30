import { ThemeManager } from "../theme-manager.js";
import MenuTemplateUtils from "./menu-template-utils.js";

const isMac = process.platform === "darwin";

export default class MenuTemplateBuilder {
  static createMenuTemplate(
    registeredComponentTypes,
    activeComponentTypes,
    menuActionHelper
  ) {
    const componentMenuItems = MenuTemplateUtils.createComponentMenuItems({
      menuActionHelper,
      activeComponentTypes,
      registeredComponentTypes,
    });
    const currentTheme = ThemeManager.getTheme();

    return [
      // { role: 'appMenu' }
      ...(isMac
        ? [
          {
            label: app.name,
            submenu: [
              { role: "about" },
              { type: "separator" },
              { role: "services" },
              { type: "separator" },
              { role: "hide" },
              { role: "hideOthers" },
              { role: "unhide" },
              { type: "separator" },
              { role: "quit" },
            ],
          },
        ]
        : []),
      // { role: 'fileMenu' }
      {
        label: "File",
        submenu: [
          {
            label: "New",
            accelerator: "CmdOrCtrl+N",
            click: async () => await menuActionHelper.createNewProject(),
          },
          {
            label: "Open",
            accelerator: "CmdOrCtrl+O",
            click: async () => await menuActionHelper.openProject(),
          },
          {
            label: "Save",
            accelerator: "CmdOrCtrl+S",
            click: async () => await menuActionHelper.saveProject(),
          },
          {
            label: "Save As...",
            accelerator: "CmdOrCtrl+Shift+S",
            click: async () => await menuActionHelper.saveProjectAs(),
          },

          isMac ? { role: "close" } : { role: "quit" },
        ],
      },
      // { role: 'editMenu' }
      {
        label: "Edit",
        submenu: [
          {
            label: "Undo",
            accelerator: "CmdOrCtrl+Z",
            click: () => menuActionHelper.undoHandler(),
          },
          {
            label: "Redo",
            accelerator: "CmdOrCtrl+Y",
            click: () => menuActionHelper.redoHandler(),
          },
          { type: "separator" },
          { role: "cut" },
          { role: "copy" },
          { role: "paste" },
          ...(isMac
            ? [
              { role: "pasteAndMatchStyle" },
              { role: "delete" },
              { role: "selectAll" },
              { type: "separator" },
              {
                label: "Speech",
                submenu: [
                  { role: "startSpeaking" },
                  { role: "stopSpeaking" },
                ],
              },
            ]
            : [
              { role: "delete" },
              { type: "separator" },
              {
                label: "Select All",
                accelerator: "CmdOrCtrl+A",
                click: () => menuActionHelper.selectAllHandler(),
              },
            ]),
        ],
      },
      // { role: 'viewMenu' }
      {
        label: "View",
        submenu: [
          { role: "reload" },
          { role: "forceReload" },
          { role: "toggleDevTools" },
          { type: "separator" },
          { role: "resetZoom" },
          { role: "zoomIn", accelerator: "CmdOrCtrl+=" },
          { role: "zoomOut" },
          { type: "separator" },
          { role: "togglefullscreen" },
        ],
      },
      // { role: 'windowMenu' }
      {
        label: "Window",
        submenu: [
          { role: "minimize" },
          // { role: "zoom" },
          ...(isMac
            ? [
              { type: "separator" },
              { role: "front" },
              { type: "separator" },
              { role: "window" },
            ]
            : [{ role: "close" }]),
          { type: "separator" },
          //   ...["Causal View", "Node", "Causes", "Weights"].map(
          //     createComponentToggleItem
          //   ),
          ...(componentMenuItems ?? []),
        ],
      },
      {
        label: "Model",
        submenu: [
          {
            label: "Run",
            accelerator: "CmdOrCtrl+Space",
            click: () => menuActionHelper.runCausalBundle(),
          },
          {
            label: "Run Probability Estimation",
            accelerator: "CmdOrCtrl+Shift+Space",
            click: () => menuActionHelper.runProbabilityEstimation(),
          },
          // {
          //   label: "Run Specified Model",
          //   click: () => menuActionHelper.runCausalBundleWithSpecifiedModel(),
          // },
          {
            label: "Run (File)",
            accelerator: "CmdOrCtrl+Alt+R",
            click: () => menuActionHelper.runCausalBundleWithFilePicker(),
          },
          {
            label: "Run Probability Estimation (File)",
            accelerator: "CmdOrCtrl+Alt+Shift+R",
            click: () => menuActionHelper.runProbabilityEstimationWithFilePicker(),
          },
        ],
      },
      {
        label: "Tools",
        submenu: [
          {
            label: "Transform model",
            click: () => menuActionHelper.openModelTransformTool(),
          },
        ],
      },
      {
        label: "Theme",
        submenu: [
          {
            label: "System",
            type: "radio",
            checked: currentTheme === "system",
            click: () => menuActionHelper.switchTheme("system"),
          },
          {
            label: "Light",
            type: "radio",
            checked: currentTheme === "light",
            click: () => menuActionHelper.switchTheme("light"),
          },
          {
            label: "Dark",
            type: "radio",
            checked: currentTheme === "dark",
            click: () => menuActionHelper.switchTheme("dark"),
          },
        ],
      },
      {
        role: "help",
        submenu: [
          {
            label: "Learn More About Causal Models",
            click: () => menuActionHelper.learnMore(),
          },
          {
            label: "See Repository On GitHub",
            click: () => menuActionHelper.openGitHub(),
          },
        ],
      },
    ];
  }
}
