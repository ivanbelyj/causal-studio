// In the context of causal-view causal-view-data is called "nodes data",
// but "nodes data" can also mean some data about nodes (color, size, etc.)
// that is separated from the causal model fact
export class CausalViewDataUtils {
  static factsAndNodesDataToCausalViewData(causalModel) {
    const facts = causalModel.facts;
    const nodesData = causalModel.nodesData;
    const declaredBlocks = causalModel.declaredBlocks;

    const findNodeData = (nodeId) => nodesData?.find(
      (nodeData) => nodeData.nodeId === nodeId
    );

    return facts.map((fact) => {
      const nodeData = findNodeData(fact.id);
      return { fact, ...(nodeData ?? {}) };
    }).concat(declaredBlocks.map((block) => {
      const nodeData = findNodeData(block.id);
      return { block, ...(nodeData ?? {}) };
    }));
  }

  static causalViewDataToModelNodesData(causalViewData) {
    const facts = [];
    const blocks = [];
    const nodesData = [];
    for (const datum of causalViewData) {
      let nodeId;
      if (datum.fact) {
        facts.push(datum.fact);
        nodeId = datum.fact.id;
      } else if (datum.block) {
        blocks.push(datum.block)
        nodeId = datum.block.id;
      }

      const nodeData = { nodeId, ...datum };
      delete nodeData.fact;
      delete nodeData.block;
      nodesData.push(nodeData);
    }
    return { facts, blocks, nodesData };
  }
}
