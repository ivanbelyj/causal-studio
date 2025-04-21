import { DataValidator } from "../data/validation/data-validator";

export class ProjectData {
  constructor({
    causalModels,
    version,
    defaultMainModel,
    blockConventions,
    blockCausesConventions,
    blockResolvingMap
  }) {
    this.causalModels = causalModels;
    this.version = version;
    this.defaultMainModel = defaultMainModel;
    this.blockConventions = blockConventions;
    this.blockCausesConventions = blockCausesConventions;
    this.blockResolvingMap = blockResolvingMap;
  }

  static createProjectData(args) {
    console.log("create project data from", args);

    let {
      causalModels,
      version,
      defaultMainModel
    } = args ?? {};
    causalModels ??= [this.createEmptyCausalModel()];
    defaultMainModel ??= causalModels.length > 0 ? causalModels[0].name : null;
    version ??= DataValidator.getLatestVersion();
    return new ProjectData({
      ...args,
      causalModels,
      version,
      defaultMainModel
    });
  }

  static fromJson(json) {
    return new ProjectData(JSON.parse(json));
  }

  //#region Causal Models
  static createEmptyCausalModel(name) {
    return {
      name: name ?? "main",
      facts: [],
      declaredBlocks: []
    }
  }

  getCausalModel(name) {
    return this.#findObjectWithName(this.causalModels, name);
  }

  isCausalModelNameAlreadyUsed(name) {
    return this.#containsObjectWithName(this.causalModels, name);
  }

  addNewCausalModel(name) {
    this.#addObject(this.causalModels, ProjectData.createEmptyCausalModel(name));
  }

  removeCausalModel(name) {
    this.#removeObject(this.causalModels, name);
  }

  renameCausalModel(oldName, newName) {
    this.#renameObject(this.causalModels, oldName, newName);

    if (this.isDefaultMainModel(oldName)) {
      this.#setAsDefaultMainModelCore(newName);
    }
  }

  setAsDefaultMainModel(name) {
    if (!this.isCausalModelNameAlreadyUsed(name)) {
      throw new Error(`Cannot set default main model: CM doesn't exist (name: "${name}")`);
    }
    this.#setAsDefaultMainModelCore(name);
  }

  isDefaultMainModel(name) {
    return this.defaultMainModel === name;
  }
  //#endregion

  //#region Block Conventions
  static createEmptyBlockConvention(name) {
    return {
      name: name ?? "new-block-convention",
      consequences: []
    }
  }

  getBlockConvention(name) {
    return this.#getObjectWithName(this.blockConventions, name);
  }

  isBlockConventionNameAlreadyUsed(name) {
    return this.#containsObjectWithName(this.blockConventions, name);
  }

  addNewBlockConvention(name) {
    this.#addObject(this.blockConventions, ProjectData.createEmptyBlockConvention(name));
  }

  removeBlockConvention(name) {
    this.#removeObject(this.blockConventions, name);
  }

  renameBlockConvention(oldName, newName) {
    this.#renameObject(this.blockConventions, oldName, newName);
  }
  //#endregion

  //#region Block Cause Conventions
  static createEmptyBlockCausesConvention(name) {
    return {
      name: name ?? "new-block-cause-convention",
      causes: []
    }
  }

  getBlockCausesConvention(name) {
    return this.#getObjectWithName(this.blockCausesConventions, name);
  }

  isBlockCausesConventionNameAlreadyUsed(name) {
    return this.#containsObjectWithName(this.blockCausesConventions, name);
  }

  addNewBlockCausesConvention(name) {
    this.#addObject(this.blockCausesConventions, ProjectData.createEmptyBlockCausesConvention(name));
  }

  removeBlockCausesConvention(name) {
    this.#removeObject(this.blockCausesConventions, name);
  }

  renameBlockCausesConvention(oldName, newName) {
    this.#renameObject(this.blockCausesConventions, oldName, newName);
  }
  //#endregion

  #setAsDefaultMainModelCore(name) {
    this.defaultMainModel = name;
  }

  //#region Core
  #findObjectWithName(objects, name) {
    return objects.find((x) => x.name === name);
  }

  #getObjectWithName(objects, name) {
    return objects.find((x) => x.name === name);
  }

  #containsObjectWithName(objects, name) {
    return objects.some((obj) => obj.name === name);
  }

  #addObject(objects, obj) {
    if (this.#containsObjectWithName(objects, obj.name)) {
      throw new Error(`Object with name "${obj.name}" already exists.`);
    }
    objects.push(obj);
  }

  #removeObject(objects, name) {
    const index = objects.findIndex((obj) => obj.name === name);
    if (index === -1) {
      throw new Error(`Cannot remove object: not found (name: "${name}").`);
    }
    objects.splice(index, 1);
  }

  #renameObject(objects, oldName, newName) {
    const object = this.#findObjectWithName(objects, oldName);
    if (!object) {
      throw new Error(`Cannot rename object: not found (name: "${oldName}").`);
    }
    if (this.#containsObjectWithName(objects, newName)) {
      throw new Error(`Object with name "${newName}" already exists.`);
    }
    object.name = newName;
  }
  //#endregion
}
