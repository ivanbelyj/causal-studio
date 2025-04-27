/**
 * Utils for causal model formatting.
 * Responsible for saving data, not upgrading causal model versions
 */
export class FormatUtils {
  static formatProjectData(projectData) {
    for (const causalModel of projectData.causalModels) {
      causalModel.facts.forEach((fact) => {
        FormatUtils.moveUpTypePropertiesRecursively(fact);
      });
    }
  }

  static moveUpTypePropertiesRecursively(parentObj) {
    FormatUtils.#moveUpTypeProperty(parentObj);
    FormatUtils.#traverseObject(
      parentObj,
      FormatUtils.#moveUpTypeProperty
    );
  }

  static #moveUpTypeProperty(obj) {
    if (obj && typeof obj === "object" && !Array.isArray(obj) && obj.hasOwnProperty("$type")) {
      const { $type, ...objWithoutType } = obj;

      for (const prop in obj) {
        if (prop != "$type") delete obj[prop];
      }
      Object.assign(obj, objWithoutType);
    }
  }

  static #traverseObject(obj, func) {
    for (let prop in obj) {
      func(obj[prop]);

      if (typeof obj[prop] === "object") {
        FormatUtils.#traverseObject(obj[prop], func);
      }
    }
  }
}
