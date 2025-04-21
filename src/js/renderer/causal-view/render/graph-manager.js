import * as d3 from "d3";
import * as d3dag from "d3-dag";
import { CausalModelUtils } from "../causal-model-utils.js";
import { CausalViewNodeUtils } from "./causal-view-node-utils.js";

export class GraphManager {
  mutGraph;
  stratify;

  constructor() {
    this.#setStratify();
  }

  #setStratify() {
    this.stratify = d3dag
      .graphStratify()
      .id((nodeData) => CausalViewNodeUtils.getNodeId(nodeData))
      .parentIds(
        function (nodeData) {
          return CausalModelUtils.getCausesIdsUnique(nodeData);
        }.bind(this)
      );
  }

  // Sets directed acyclic graph by causal model facts
  resetGraph(nodesData) {
    this.mutGraph = this.stratify(nodesData);
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
    return Array.from(this.mutGraph.links()).find(
      (link) =>
        CausalViewNodeUtils.getNodeId(link.source.data) === sourceId &&
        CausalViewNodeUtils.getNodeId(link.target.data) === targetId
    );
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
    return this.getNodes().find(
      (node) => CausalViewNodeUtils.getNodeId(node.data) === nodeId
    );
  }

  getNodeDataById(nodeId) {
    return this.getNodeById(nodeId).data;
  }
}
