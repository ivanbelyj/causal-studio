import BlockUtils from "../../common/block-utils";

const maxNodeTextLength = 22;

export class CausalViewNodeUtils {
  static canBeReferencedInViewBy(nodeData, id) {
    return CausalViewNodeUtils.getNodeId(nodeData) === id
      // Declared blocks are referenced in the view by block consequences
      || nodeData.block && BlockUtils.hasCauseIdMappedAsConsequence(nodeData.block, id);
  }

  static getNodeId(nodeData) {
    return nodeData.fact?.id ?? nodeData.block.id;
  }

  static getNodeDisplayingText(nodeData) {
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
