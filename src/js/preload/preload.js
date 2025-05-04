/**
 * The preload script runs before. It has access to web APIs
 * as well as Electron's renderer process modules and some
 * polyfilled Node.js functions.
 *
 * https://www.electronjs.org/docs/latest/tutorial/sandbox
 */
const { ipcRenderer, contextBridge, ipcMain } = require("electron");
const { DIALOG } = require("../main/ipc/channels");

contextBridge.exposeInMainWorld("api", {
  sendNodeEnter: () => send("node-enter"),
  sendNodeLeave: () => send("node-leave"),
  sendCausalViewEnter: () => send("causal-view-enter"),
  sendCausalViewLeave: () => send("causal-view-leave"),

  // When components are checked from the renderer process
  sendComponentActive: (componentData) =>
    send("send-component-active", componentData),

  sendIsUnsavedChanges: (data) => send("send-is-unsaved-changes", data),

  sendShowDialog: (type, options) => send(DIALOG.SHOW, { type, options }),

  onCreateNode: (func) => on("create-node", func),
  onDeclareBlock: (func) => on("declare-block", func),
  onCreateFactWithName: (func) => on("create-fact-with-name", func),
  onRemoveNode: (func) => on("remove-node", func),
  onOpenData: (func) => on("open-data", func),
  onReset: (func) => on("reset", func),

  // When a component is checked in the menu
  onSetComponentActive: (func) => on("set-component-active", func),

  onUndo: (func) => on("undo", func),
  onRedo: (func) => on("redo", func),

  onSelectAll: (func) => on("select-all", func),

  // Called from the main process to pull actual current causal bundle
  // from the renderer process
  onPullCausalBundle: (func) => on("pull-causal-bundle", func),

  // Called to handle saving in undo-redo-manager
  onSavedToCurrentFile: (func) => on("on-saved-to-current-file", func),

  onFixationCompleted: (func) => on("fixation-completed", func),
  onProbabilityEstimationCompleted: (func) => on("probability-estimation-completed", func)
});

function invoke(channelName, data) {
  ipcRenderer.invoke(channelName, data);
}

function send(channelName, data) {
  ipcRenderer.send(channelName, data);
}

function on(channelName, func) {
  ipcRenderer.on(channelName, (event, ...args) => func(event, ...args));
}
