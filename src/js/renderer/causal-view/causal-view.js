import * as d3 from "d3";
import { CausalModelUtils } from "./causal-model-utils.js";
import { EdgeRenderer } from "./render/edge-renderer.js";
import { GraphManager } from "./render/graph-manager.js";
import { NodeRenderer } from "./render/node-renderer.js";
import { ZoomManager } from "./render/zoom-manager.js";
import { ViewRenderer } from "./render/view-renderer.js";
import { DragAndDropManager } from "./drag-and-drop-manager.js";

export const nodeWidth = 140;
export const nodeHeight = 40;

/**
 * Displays interactive causal view elements and provides some of their common events
 * (node click, enter, etc.)
 */
export class CausalView extends EventTarget {
  edgeRenderer;
  eventManager;
  graphManager;
  nodeRenderer;
  zoomManager;

  undoRedoManager;
  selectionManager;

  constructor(undoRedoManager) {
    super();
    this.undoRedoManager = undoRedoManager;
  }

  init(svgParent, nodesData, selectionManager) {
    this.selectionManager = selectionManager;

    this.graphManager = new GraphManager();
    this.viewRenderer = new ViewRenderer(svgParent, this.onSvgClick.bind(this));

    this.edgeRenderer = new EdgeRenderer(
      this.viewRenderer.edgesParent,
      this.viewRenderer.edgesDefs,
      this.viewRenderer.svgChild,
      this.graphManager,
      nodeWidth,
      nodeHeight
    );

    this.nodeRenderer = new NodeRenderer(
      this.viewRenderer.nodesParent,
      this.graphManager,
      nodeWidth,
      nodeHeight,
      this.onNodeClicked.bind(this),
      this.onMouseEnter.bind(this),
      this.onMouseLeave.bind(this),
      this.onEnterNodesSelection.bind(this)
    );
    this.zoomManager = new ZoomManager(
      this.viewRenderer.svg,
      this.viewRenderer.svgChild,
      this.onZoom.bind(this)
    );

    if (nodesData) {
      this.reset(nodesData);
    }
  }

  onNodeClicked(event, nodeSelection) {
    const nodeClickedEvent = new Event("nodeClicked");
    nodeClickedEvent.nodeSelection = nodeSelection;
    nodeClickedEvent.clickEvent = event;
    this.dispatchEvent(nodeClickedEvent);
  }

  onMouseEnter(event, nodeSelection) {
    if (this.shouldIgnoreMouseEvent(event, nodeSelection)) return;

    const nodeEnterEvent = new Event("nodeEnter");
    nodeEnterEvent.enterEvent = event;
    nodeEnterEvent.nodeSelection = nodeSelection;
    this.dispatchEvent(nodeEnterEvent);
  }

  onMouseLeave(event, nodeSelection) {
    if (this.shouldIgnoreMouseEvent(event, nodeSelection)) return;

    const nodeLeaveEvent = new Event("nodeLeave");
    nodeLeaveEvent.enterEvent = event;
    nodeLeaveEvent.nodeSelection = nodeSelection;
    this.dispatchEvent(nodeLeaveEvent);
  }

  shouldIgnoreMouseEvent(event, nodeSelection) {
    // Ignore mouse events of external fact nodes
    // to avoid display "Remove node" in the main process
    return nodeSelection.data.isExternal;
  }

  onZoom() {
    this.viewRenderer.svgChild.attr("transform", () =>
      d3.zoomTransform(this.viewRenderer.svg.node())
    );
    this.dispatchEvent(new Event("zoomed"));
  }

  onEnterNodesSelection(enterNodesSelection) {
    this.dragAndDropManager = new DragAndDropManager(
      this,
      this.undoRedoManager,
      this.selectionManager
    );
    this.dragAndDropManager.addNodesDrag(enterNodesSelection);
  }

  onSvgClick(event, svgSelection) {
    const viewClickedEvent = new Event("viewClicked");
    viewClickedEvent.clickEvent = event;
    viewClickedEvent.svgSelection = svgSelection;
    this.dispatchEvent(viewClickedEvent);
  }

  render() {
    this.nodeRenderer.renderNodes();
    this.edgeRenderer.renderEdges();
    this.selectionManager.render();
  }

  updateEdges() {
    this.edgeRenderer.updateEdges();
  }

  reset(nodesData) {
    nodesData = this.#ensureNodesDataExist(nodesData);

    this.graphManager.resetGraph(nodesData);
    this.nodeRenderer.reset();

    this.viewRenderer.reset();

    this.render();

    // Positions are set for the nodes after render
    this.graphManager.ensureNodeDataPositionsSet(nodesData);
  }

  #ensureNodesDataExist(nodesData) {
    if (!nodesData) {
      nodesData = this.graphManager.getNodesData();
      if (!nodesData) {
        console.error(
          "Cannot reset empty causal view with",
          nodesData
        );
      }
    }
    return nodesData;
  }

  static getNodeSelectionById(nodeId) {
    return d3.select(`.${CausalModelUtils.getNodeIdClassNameByNodeId(nodeId)}`);
  }

  getNodes() {
    return this.graphManager.getNodes();
  }

  getNodesData() {
    return this.graphManager.getNodesData();
  }

  getNodeFacts() {
    return this.graphManager.getNodeFacts();
  }

  getNodeById(nodeId) {
    return this.graphManager.getNodeById(nodeId);
  }

  getNodeDataById(nodeId) {
    return this.graphManager.getNodeDataById(nodeId);
  }

  resetGraph(nodesData) {
    this.graphManager.resetGraph(nodesData);
  }

  setNodeWithData(nodeData) {
    return this.graphManager.setNodeWithData(nodeData);
  }

  removeNode(nodeId) {
    this.graphManager.removeNode(nodeId);
  }

  addLink(sourceId, targetId) {
    this.graphManager.addLink(sourceId, targetId);
  }

  getLinkBySourceAndTargetIds(sourceId, targetId) {
    return this.graphManager.getLinkBySourceAndTargetIds(sourceId, targetId);
  }

  removeLink(sourceId, targetId) {
    this.graphManager.removeLink(sourceId, targetId);
  }

  setInitialZoom() {
    this.zoomManager.setInitialZoom(
      this.nodeRenderer.dagWidth,
      this.nodeRenderer.dagHeight
    );
  }

  getViewNode() {
    return this.viewRenderer.svgChild.node();
  }

  // updateScaleExtent() {
  //   this.zoomManager.updateScaleExtent(
  //     this.nodeRenderer.dagWidth,
  //     this.nodeRenderer.dagHeight
  //   );
  // }
}
