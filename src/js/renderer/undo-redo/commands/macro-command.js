export class MacroCommand {
  constructor(executeCallbacks, undoCallbacks) {
    this.executeCallbacks = executeCallbacks;
    this.undoCallbacks = undoCallbacks;
  }

  #callAll(functions) {
    console.log(this.executeCallbacks, this.undoCallbacks);
    functions.forEach((func) => func());
  }

  execute() {
    this.#callAll(this.executeCallbacks);
  }

  undo() {
    this.#callAll(this.undoCallbacks);
  }

  static fromCommands(...commands) {
    return new MacroCommand(
      commands.map((cmd) => {
        return cmd.executeCallback;
      }),
      commands.map((cmd) => cmd.undoCallback)
    );
  }
}
