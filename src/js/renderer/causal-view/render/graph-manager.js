import * as d3 from "d3";
import * as d3dag from "d3-dag";
import { CausalModelUtils } from "../causal-model-utils.js";
import { CausalViewNodeUtils } from "./causal-view-node-utils.js";
import BlockUtils from "../../common/block-utils.js";

export class GraphManager {
  /**
   * Block ids by cause ids that were mapped as a consequences of the declared block
   * (in blockConsequencesMap)
   */
  #blockIdsByMappedCauseIds = new Map();

  mutGraph;
  stratify;

  constructor() {
    this.#setStratify();
  }

  getParentIdInGraph(causeId) {
    return this.#blockIdsByMappedCauseIds.has(causeId)
      // Block consequence -> Block id
      ? this.#blockIdsByMappedCauseIds.get(causeId)
      // Not block consequence (no mapping needed)
      : causeId
  }

  #setStratify() {
    this.stratify = d3dag
      .graphStratify()
      .id((nodeData) => CausalViewNodeUtils.getNodeId(nodeData))
      .parentIds(
        (nodeData) => {
          const causeIds = CausalModelUtils.getCausesIdsUnique(nodeData);
          const parentIdsInGraph = this.#toParentIdsInGraph(causeIds);
          return parentIdsInGraph;
        }
      );
  }

  #toParentIdsInGraph(causeIds) {
    return causeIds.map(causeId => this.getParentIdInGraph(causeId));
  }

  // Sets directed acyclic graph by causal model facts
  resetGraph(nodesData) {
    this.#resetRelatedData(nodesData);
    this.mutGraph = this.stratify(nodesData);
  }

  #resetRelatedData(nodesData) {
    this.#blockIdsByMappedCauseIds = new Map();
    for (const nodeData of nodesData) {
      if (nodeData.block) {
        for (const mappedCauseId of BlockUtils.getCauseIdsMappedAsConsequences(
          nodeData.block)) {
          this.#blockIdsByMappedCauseIds.set(mappedCauseId, nodeData.block.id);
        }
      }
    }
  }

  addNodeWithData(nodeData) {
    const newNode = this.mutGraph.node(nodeData);

    newNode.ux = nodeData.x;
    newNode.uy = nodeData.y;
    return newNode;
  }

  removeNode(nodeId) {
    const nodeToRemove = this.getNodeById(nodeId);
    if (!nodeToRemove) {
      console.error("Node to remove is not found. ", nodeToRemove);
      return;
    }
    nodeToRemove.delete();
  }

  addLink(sourceId, targetId) {
    const [source, target] = [sourceId, targetId].map(this.getNodeById, this);

    this.mutGraph.link(source, target);
  }

  getLinkBySourceAndTargetIds(sourceId, targetId) {
    const result = Array.from(this.mutGraph.links()).find(
      (link) =>
        // Source can be a declared block that has block consequences
        // (and target can reference the block by one of them)
        CausalViewNodeUtils.canBeReferencedInViewBy(link.source.data, sourceId) &&
        // Old implementation that doesn't support blocks:
        // CausalViewNodeUtils.getNodeId(link.source.data) === sourceId &&
        CausalViewNodeUtils.getNodeId(link.target.data) === targetId
    );
    return result;
  }

  removeLink(sourceId, targetId) {
    const link = this.getLinkBySourceAndTargetIds(sourceId, targetId);
    if (link) {
      link.delete();
    }
  }

  getNodes() {
    return Array.from(this.mutGraph.nodes());
  }

  getNodesData() {
    return this.getNodes().map((node) => node.data);
  }

  getNodeFacts() {
    return this.getNodes().map((node) => node.data.fact);
  }

  getNodeById(nodeId) {
    const node = this.getNodes().find(
      (node) => CausalViewNodeUtils.canBeReferencedInViewBy(node.data, nodeId)
    );
    if (!node) {
      console.error("Node not found by id: ", nodeId);
    }
    return node;
  }

  getNodeDataById(nodeId) {
    return this.getNodeById(nodeId).data;
  }
}
