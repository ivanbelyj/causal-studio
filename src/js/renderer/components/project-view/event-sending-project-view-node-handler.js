import {
  causalModelNodeType,
  blockCausesConventionNodeType,
  blockConventionNodeType,
  blockResolvingMapNodeType
} from "./js-tree-data-utils";

const eventBus = require("js-event-bus")();

/**
 * Causal model node in the Project view.
 * Project view contains nodes. Each one can react differently to user's interactions
 */
export class EventSendingProjectViewNodeHandler {
  handleSelected(instance, node) {
    this.#handleCausalModelSelected(instance, node);
    this.#handleConventionNodeSelected(instance, node);
  }

  #handleCausalModelSelected(instance, node) {
    if (this.#hasParentWithId(instance, node.id, causalModelNodeType)) {
      eventBus.emit("causalModelSelected", null, { causalModelName: node.data.name });
    }
  }

  #hasParentWithId(instance, nodeId, parentId) {
    return this.#getParentId(instance, nodeId) === parentId;
  }

  #getParentId(instance, nodeId) {
    return instance.get_parent($(`#${nodeId}`))
  }

  // Todo: use node.data.type instead of getting parent
  #handleConventionNodeSelected(instance, node) {
    const parentId = this.#getParentId(instance, node.id);
    if ([
      blockCausesConventionNodeType,
      blockConventionNodeType,
      blockResolvingMapNodeType].includes(parentId)) {
      eventBus.emit("projectViewNodeSelected", null, { node });
    }
  }
}
