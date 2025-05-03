import { ChangePropertyCommand } from "../../undo-redo/commands/change-property-command";

// Todo: rename
export class DataProvider extends EventTarget {
  #data;
  constructor(undoRedoManager) {
    super();
    this.undoRedoManager = undoRedoManager;
  }
  get _data() {
    return this.#data;
  }

  set _data(value) {
    this.#data = value;
    // console.log("reset data provider with ", value);
  }

  _getFrozenOrNull(obj) {
    return obj ? Object.freeze({ ...obj }) : null;
  }

  getInner() {
    throw new Error("Method 'getInner' must be implemented in subclasses.");
  }

  getInnerToMutate() {
    throw new Error("Method 'getInnerToMutate' must be implemented in subclasses.");
  }

  get() {
    return this._getFrozenOrNull(this._data);
  }

  set(newData) {
    this._data = newData;
    this._dispatchReset();
  }

  _dispatchReset() {
    this.dispatchEvent(new Event("reset"));
  }
  _dispatchMutated() {
    this.dispatchEvent(new Event("mutated"));
  }

  // Todo: property changed and fact property changed
  _dispatchPropertyChanged(propertyName, newValue) {
    const event = new Event("property-changed");
    event.propertyName = propertyName;
    event.newValue = newValue;
    this.dispatchEvent(event);
  }

  changeProperty(
    propertyName,
    isInnerProp,
    propertyValue,
    causalViewToRender
  ) {
    // this.getInnerToMutate() result can change after selecting another node
    const objToMutate = isInnerProp ? this.getInnerToMutate() : this._data;
    const oldValue = objToMutate[propertyName];
    this.undoRedoManager.execute(
      new ChangePropertyCommand(
        (newVal) => {
          objToMutate[propertyName] = newVal;
          this._dispatchPropertyChanged(propertyName, propertyValue);
          if (causalViewToRender) {
            causalViewToRender.render();
          }
        },
        propertyValue,
        oldValue,
        propertyName
      )
    );
  }

  // changeProperty(propertyName, propertyValue) {
  //   const oldValue = this._data[propertyName];
  //   const cmd = new Command(
  //     () => {
  //       this._data[propertyName] = propertyValue;
  //       this._dispatchPropertyChanged(propertyName, propertyValue);
  //     },
  //     () => {
  //       this._data[propertyName] = oldValue;
  //       this._dispatchPropertyChanged(propertyName, oldValue);
  //     }
  //   );
  //   this.undoRedoManager.execute(cmd);
  // }
}
