import * as d3 from "d3";
import { CausalModelUtils } from "./causal-model-utils.js";
import { ScreenUtils } from "./screen-utils.js";
import { Command } from "../undo-redo/commands/command.js";
import { CausalViewNodeUtils } from "./render/causal-view-node-utils.js";

/**
 * Class that allows to create or remove nodes in causal view
 */
export class NodesCreateRemoveManager {
  constructor(causalView, causesChangeManager, getNewFactValue) {
    this.causalView = causalView;
    this.causesChangeManager = causesChangeManager;
    this.getNewFactValue = getNewFactValue;
  }

  getCreateNodeCommand(x, y, nodeData) {
    nodeData = nodeData ?? this.createNodeData();
    return new Command(
      () =>
        this.createNodeByMousePos(
          nodeData,
          x,
          y
          // this.structure.nodeWidth,
          // this.structure.nodeHeight
        ),
      () => this.#removeNodeById(CausalViewNodeUtils.getNodeId(nodeData))
    );
  }

  #removeNodeById(id) {
    this.causalView.removeNode(id);
    this.causalView.render();
  }

  getRemoveNodeCommand(x, y, factId) {
    factId = factId ?? this.getNodeIdByPos(x, y);
    const nodeData = this.causalView.getNodeDataById(factId);
    return new Command(
      () => this.#removeNodeById(factId),
      () =>
        this.createNodeWithNodeData(
          nodeData
          // { x: node.ux, y: node.uy }
          // this.structure.nodeWidth,
          // this.structure.nodeHeight
        )
    );
  }

  createNodeData(factId) {
    const newFact = CausalModelUtils.createNewFactWithFactor(this.getNewFactValue());
    newFact.id = factId ?? crypto.randomUUID();
    return { fact: newFact };
  }

  createNodeWithNodeData(nodeData) {
    this.causalView.addNodeWithData(nodeData);

    this.causesChangeManager.onCausesAdd(
      nodeData,
      CausalModelUtils.getCausesIdsUnique(nodeData)
    );

    this.causalView.render();

    // Todo: handle causes changing after remove
    // this.structure.reset();
  }

  // Todo: fix node creating in incorrect position after redo
  createNodeByMousePos(nodeData, x, y) {
    const causalViewElement = ScreenUtils.elementWithClassFrom(
      { x, y },
      "causal-view"
    );
    if (!causalViewElement) {
      console.error("trying to create a node outside the causal-view");
      return;
    }

    const posInCausalView = ScreenUtils.screenPointToSvg({
      x: x,
      y: y,
    });
    nodeData.x = posInCausalView.x;
    nodeData.y = posInCausalView.y;

    this.createNodeWithNodeData(nodeData);
  }

  getNodeIdByPos(x, y) {
    const nodeElement = ScreenUtils.nodeElementFromPoint({ x, y }, "node");
    const nodeData = d3.select(nodeElement).data()[0];
    return CausalViewNodeUtils.getNodeId(nodeData.data);
  }
}
