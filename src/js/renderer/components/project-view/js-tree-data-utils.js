export const causalModelNodeType = "causalModel";
export const blockConventionNodeType = "blockConvention";
export const blockCausesConventionNodeType = "blockCausesConvention";
export const blockResolvingMapNodeType = "blockResolvingMap";

export class JsTreeDataUtils {
  static projectDataToJsTreeData(projectData) {
    return [
      {
        id: causalModelNodeType,
        text: "Causal Models",
        data: {
          type: causalModelNodeType,
          isRoot: true
        },
        state: {
          opened: true,
        },
        children: JsTreeDataUtils.#toChildren(projectData.causalModels, causalModelNodeType),
      },
      {
        id: blockConventionNodeType,
        text: "Conventions",
        data: {
          type: blockConventionNodeType,
          isRoot: true
        },
        state: {
          opened: true,
        },
        children: JsTreeDataUtils.#toChildren(projectData.blockConventions, blockConventionNodeType),
      },
      {
        id: blockCausesConventionNodeType,
        text: "Causes Conventions",
        data: {
          type: blockCausesConventionNodeType,
          isRoot: true
        },
        state: {
          opened: true,
        },
        children: JsTreeDataUtils.#toChildren(
          projectData.blockCausesConventions,
          blockCausesConventionNodeType),
      },
      {
        id: blockResolvingMapNodeType,
        text: "Resolving Map",
        data: {
          type: blockResolvingMapNodeType,
          isRoot: true
        },
        children: JsTreeDataUtils.#toChildren(projectData.resolvingMap),
      },
    ];
  }

  static #toChildren(array, type) {
    return (
      array?.map((data) => ({
        text: data.name,
        id: `${type}-${data.name}`,
        data: {
          type,
          name: data.name,
          isRoot: false
        }
      })) ?? []
    );
  }
}
