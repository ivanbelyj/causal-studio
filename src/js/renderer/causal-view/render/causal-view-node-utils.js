import BlockUtils from "../../common/block-utils";
import { CausalModelUtils } from "../causal-model-utils";

const maxNodeTextLength = 22;

export class CausalViewNodeUtils {
  static tryGetNodeDataById(nodesData, nodeId) {
    return nodesData.find(
      (nodeData) => CausalViewNodeUtils.canBeReferencedInViewBy(nodeData, nodeId)
    );
  }

  /**
   * Searching facts that are referenced by cause ids in the graph,
   * but not found as existing facts or blocks
   */
  static getExternalCauseNodes(allNodesData) {
    const externalFacts = new Map();

    for (const nodeData of allNodesData) {
      const causesIds = CausalModelUtils.getCausesIdsUnique(nodeData);
      for (const causeId of causesIds) {
        if (!CausalViewNodeUtils.tryGetNodeDataById(allNodesData, causeId)
          && !externalFacts.has(causeId)) {
          externalFacts.set(causeId, {
            id: causeId,
            isExternal: true
          });
        }
      }
    }

    return Array.from(externalFacts.values());
  }

  static isReferencedBySomeNode(nodesData, targetNodeId) {
    // Todo: optimize
    for (const nodeData of nodesData) {
      if (CausalModelUtils
        .getCausesIdsUnique(nodeData)
        .some(causeId => {
          const causeNode = nodesData.find(
            nodeData => CausalViewNodeUtils.canBeReferencedInViewBy(nodeData, causeId));
          return CausalViewNodeUtils.canBeReferencedInViewBy(causeNode, targetNodeId);
        })) {
        return true;
      }
    }
    return false;
  }

  static canBeReferencedInViewBy(nodeData, id) {
    return CausalViewNodeUtils.getNodeId(nodeData) === id
      // Declared blocks are referenced in the view by block consequences
      || nodeData.block && BlockUtils.hasCauseIdMappedAsConsequence(nodeData.block, id);
  }

  static getNodeId(nodeData) {
    return nodeData.fact?.id
      ?? nodeData.block?.id
      ?? nodeData.id;
  }

  static getNodeDisplayingText(nodeData) {
    if (nodeData.isExternal) {
      return this.truncateTextWithEllipsis(nodeData.id);
    }
    return CausalViewNodeUtils.truncateTextWithEllipsis(
      nodeData.title ||
      nodeData.fact?.factValue ||
      nodeData.fact?.id ||
      nodeData.block?.id ||
      nodeData.block.convention
    );
  }

  // Todo: text truncating by width
  static truncateTextWithEllipsis(str) {
    return str.length > maxNodeTextLength
      ? str.slice(0, maxNodeTextLength - 3) + "..."
      : str;
  }
}
