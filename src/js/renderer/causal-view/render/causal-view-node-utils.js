const maxNodeTextLength = 22;

export class CausalViewNodeUtils {
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
