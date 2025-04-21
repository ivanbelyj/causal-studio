/**
 * Utils for causal model formatting.
 * Responsible for saving data, not upgrading causal model versions
 */
export class FormattingUtils {
  static moveUpTypePropertiesRecursively(parentObj) {
    FormattingUtils.#moveUpTypeProperty(parentObj);
    FormattingUtils.#traverseObject(
      parentObj,
      FormattingUtils.#moveUpTypeProperty
    );
  }

  static #moveUpTypeProperty(obj) {
    console.log("move up type property", obj);
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
        FormattingUtils.#traverseObject(obj[prop], func);
      }
    }
  }
}
