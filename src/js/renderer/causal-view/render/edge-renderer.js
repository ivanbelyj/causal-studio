import * as d3 from "d3";
import { CausalModelUtils } from "../causal-model-utils.js";
import { CausalViewNodeUtils } from "./causal-view-node-utils.js";

const showDebugMessages = false;

/**
 * Class responsible for rendering edges in the causal view structure.
 */
export class EdgeRenderer {
  edgesParent;
  edgesDefs;
  svgChild;
  graphManager;

  nodeWidth;
  nodeHeight;

  line; // A line for rendering edges

  constructor(
    edgesParent,
    edgesDefs,
    svgChild,
    graphManager,
    nodeWidth,
    nodeHeight
  ) {
    this.edgesParent = edgesParent;
    this.edgesDefs = edgesDefs;
    this.svgChild = svgChild;
    this.graphManager = graphManager;

    this.nodeWidth = nodeWidth;
    this.nodeHeight = nodeHeight;

    this.#setLine();
  }

  #setLine() {
    this.line = d3
      .line()
      .curve(d3.curveCatmullRom)
      .x((d) => d.x)
      .y((d) => d.y);
  }

  #edgeDataToString(d) {
    return `edge (${d.source.data.fact.factValue}, ${d.target.data.fact.factValue})`;
  }

  #printEdge(d) {
    console.log(this.#edgeDataToString(d));
  }

  // Todo: show probabilities
  renderEdges() {
    if (showDebugMessages)
      console.log(
        "render edges. links",
        [...this.graphManager.mutGraph.links()].map(
          (d) => this.#edgeDataToString(d),
          this
        )
      );

    const edgePathsSelection = d3
      .select(".edges-parent")
      .selectAll("path")
      .data(this.graphManager.mutGraph.links(), ({ source, target }) => {
        return CausalModelUtils.sourceAndTargetIdsToEdgeId(
          CausalViewNodeUtils.getNodeId(source.data),
          CausalViewNodeUtils.getNodeId(target.data),
        );
      });

    // For edges gradients
    const edgesDefs = this.edgesDefs;

    const edgeDataToString = this.#edgeDataToString;

    const showLog = showDebugMessages;
    if (showLog) console.log("edges");
    edgePathsSelection.join(
      function (enter) {
        if (showLog) console.log("enter", Array.from(enter));
        enter
          .append("path")
          .attr("class", "edge")
          .attr("fill", "none")
          .attr("stroke-width", 3)
          .attr("stroke", ({ source, target }) => {
            // Edges gradients
            const gradId = CausalModelUtils.sourceAndTargetIdsToEdgeId(
              CausalViewNodeUtils.getNodeId(source.data),
              CausalViewNodeUtils.getNodeId(target.data),
            );

            const grad = edgesDefs
              .append("linearGradient")
              .attr("id", gradId)
              .attr("gradientUnits", "userSpaceOnUse");
            grad
              .append("stop")
              .attr("offset", "0%")
              .attr("stop-color", source.data.color);
            grad
              .append("stop")
              .attr("offset", "100%")
              .attr("stop-color", target.data.color);
            return `url(#${gradId})`;
          })
          .attr("marker-end", "url(#arrowId)");

        // Add arrows
        this.svgChild
          .selectAll("marker")
          .data(["end"]) // Different link / path types can be defined here
          .enter()
          .append("svg:marker") // This section adds in the arrows
          .attr("id", "arrowId")
          .attr("viewBox", "0 -5 10 10")
          .attr("refX", 25)
          .attr("refY", 0)
          .attr("markerWidth", 4)
          .attr("markerHeight", 4)
          .attr("orient", "auto")
          .append("svg:path")
          .attr("d", "M0,-5L10,0L0,5")
          .attr("fill", "var(--color)");
      }.bind(this),
      function (update) {
        if (showLog) console.log("update", Array.from(update));
      }.bind(this),
      function (exit) {
        if (showLog) console.log("exit", Array.from(exit));
        exit.remove();
      }
    );
    this.updateEdges();
  }

  updateEdges() {
    const nodeWidth = this.nodeWidth;
    const nodeHeight = this.nodeHeight;

    const edgePathsSelection = d3.selectAll(".edge");
    edgePathsSelection.attr("stroke-dasharray", ({ source, target }) => {
      const srcNodeData = source.data;
      const targetFact = target.data.fact;

      return targetFact?.abstractFactId &&
        CausalViewNodeUtils.canBeReferencedInViewBy(srcNodeData, targetFact.abstractFactId)
        // factTarget.abstractFactId == factSrc.id
        ? ""
        : "5,5";
    });
    // d3.select(".edges-parent").selectAll("path");
    edgePathsSelection.attr("d", (d) => {
      return this.line([
        { x: d.source.x + nodeWidth / 2, y: d.source.y + nodeHeight / 2 },
        { x: d.target.x + nodeWidth / 2, y: d.target.y + nodeHeight / 2 },
      ]);
    });

    // Gradients
    edgePathsSelection.attr("stroke", ({ source, target }) => {
      // this.printEdge({ source, target });
      const gradId = CausalModelUtils.sourceAndTargetIdsToEdgeId(
        CausalViewNodeUtils.getNodeId(source.data),
        CausalViewNodeUtils.getNodeId(target.data),
      );
      d3.select(`#${gradId}`)
        .attr("x1", source.x)
        .attr("x2", target.x)
        .attr("y1", source.y)
        .attr("y2", target.y);
      return `url(#${gradId})`;
    });
  }
}
