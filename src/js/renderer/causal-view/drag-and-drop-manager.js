import * as d3 from "d3";
import { CausalModelUtils } from "./causal-model-utils.js";
import { DragNodesCommand } from "../undo-redo/commands/drag-nodes-command";
import { CausalView } from "./causal-view.js";
import { CausalViewNodeUtils } from "./render/causal-view-node-utils.js";

// Distances less than this value will not be considered as a node move
// and won't execute a Command
const dragDistanceThreshold = 1e-3;

// CausalView's drag and drop manager
export class DragAndDropManager {
  constructor(causalView, undoRedoManager, selectionManager) {
    this.causalView = causalView;
    this.undoRedoManager = undoRedoManager;
    this.selectionManager = selectionManager;
  }

  addNodesDrag(nodesSelection) {
    nodesSelection
      .attr("cursor", "grab")
      .call(
        d3
          .drag()
          .on("start", dragStarted)
          .on("drag", dragged)
          .on("end", dragEnded)
      );

    const structure = this.causalView;
    const undoRedoManager = this.undoRedoManager;
    const dragAndDropManager = this;

    let posDataBeforeDrag;
    function dragStarted(event, d) {
      posDataBeforeDrag = dragAndDropManager.getNodesToDragPosData(
        CausalViewNodeUtils.getNodeId(d.data)
      );
      // d3.select(this).attr("cursor", "grabbing");
    }

    function dragged(event, d) {
      const posDataToDrag = dragAndDropManager.getNodesToDragPosData(
        CausalViewNodeUtils.getNodeId(d.data)
      );

      // Change positions of nodes that should be dragged
      posDataToDrag.forEach(({ nodeId }) => {
        CausalView.getNodeSelectionById(nodeId)
          .attr("transform", (d) => {
            return `translate(${(d.x += event.dx)}, ${(d.y += event.dy)})`;
          })
          .raise();
      });

      structure.updateEdges();
    }

    function dragEnded(event, d) {
      const draggedNodeId = CausalViewNodeUtils.getNodeId(d.data);
      const posDataAfterDrag =
        dragAndDropManager.getNodesToDragPosData(draggedNodeId);

      // console.log(
      //   "drag and drop. from ",
      //   posDataBeforeDrag,
      //   "to",
      //   posDataAfterDrag
      // );
      // d3.select(this).attr("cursor", "grab");

      const getPointOfDraggedNode = (posData) =>
        posData.find((x) => x.nodeId == draggedNodeId);

      const dragDistance = DragAndDropManager.distance(
        getPointOfDraggedNode(posDataBeforeDrag),
        getPointOfDraggedNode(posDataAfterDrag)
      );

      if (dragDistance >= dragDistanceThreshold)
        undoRedoManager.execute(
          dragAndDropManager.getDragCommand(posDataAfterDrag, posDataBeforeDrag)
        );
    }
  }

  // Pos data contains node id and position of the node
  getNodesToDragData(draggedNodeId) {
    const idsToDrag = this.selectionManager.getNodeIdsToDrag(draggedNodeId);
    return idsToDrag.map(this.causalView.getNodeById, this.causalView);
  }

  // Todo: refactor?

  getNodesToDragPosData(draggedNodeId) {
    return this.getNodesToDragData(draggedNodeId).map((nodeData) => ({
      nodeId: CausalViewNodeUtils.getNodeId(nodeData.data),
      x: nodeData.ux,
      y: nodeData.uy,
    }));
  }

  static distance(point1, point2) {
    return Math.sqrt(
      Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2)
    );
  }

  getDragCommand(nodesDataAfterDrag, nodesDataBeforeDrag) {
    return new DragNodesCommand(this, nodesDataAfterDrag, nodesDataBeforeDrag);
  }

  setPosByPosData(posData) {
    posData.forEach(({ nodeId, x, y }) => {
      const nodeSelection = d3.select(
        `.${CausalModelUtils.getNodeIdClassNameByNodeId(nodeId)}`
      );
      const nodeDatum = nodeSelection.datum();

      // Update saved data
      nodeDatum.data.x = x;
      nodeDatum.data.y = y;

      // Update rendered position
      nodeDatum.ux = x;
      nodeDatum.uy = y;

      nodeSelection.attr("transform", (d) => {
        return `translate(${x}, ${y})`;
      });

      this.causalView.updateEdges();
    });
  }
}
