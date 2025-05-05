import * as d3 from "d3";
import * as d3dag from "d3-dag";
import { CausalModelUtils } from "../causal-model-utils.js";
import { CausalViewNodeUtils } from "./causal-view-node-utils.js";

const showDebugMessages = false;

const nodeWidthMultiplier = 1.1;
const nodeHeightMultiplier = 3;

/**
 * Class responsible for rendering nodes in the causal view structure.
 */
export class NodeRenderer {
  nodeWidth;
  nodeHeight;

  dragAndDropManager;
  layout;
  nodesParent;
  graphManager;

  dagWidth;
  dagHeight;

  onNodeClicked;
  onMouseEnter;
  onMouseLeave;

  onEnterNodesSelection;

  constructor(
    nodesParent,
    graphManager,
    nodeWidth,
    nodeHeight,
    onNodeClicked,
    onMouseEnter,
    onMouseLeave,
    onEnterNodesSelection
  ) {
    this.nodesParent = nodesParent;
    this.graphManager = graphManager;
    this.nodeWidth = nodeWidth;
    this.nodeHeight = nodeHeight;

    this.onNodeClicked = onNodeClicked;
    this.onMouseEnter = onMouseEnter;
    this.onMouseLeave = onMouseLeave;

    this.onEnterNodesSelection = onEnterNodesSelection;

    this.#setLayout();
  }

  #setLayout() {
    this.layout = d3dag
      .sugiyama() // base layout
      .decross(d3dag.decrossOpt()) // minimize number of crossings
      // set node size instead of constraining to fit
      .nodeSize((node) => {
        return [
          (node ? nodeWidthMultiplier : 0) * this.nodeWidth,
          nodeHeightMultiplier * this.nodeHeight,
        ];
      });
  }

  reset() {
    this.#setDagWidthAndHeight();
  }

  #setDagWidthAndHeight() {
    const { width: dagWidth, height: dagHeight } = this.layout(
      this.graphManager.mutGraph
    );
    this.dagWidth = dagWidth;
    this.dagHeight = dagHeight;
  }

  renderNodes() {
    const nodes = this.graphManager.getNodes();

    // Set missing color fields
    const interp = d3.interpolateRainbow;
    for (const node of nodes) {
      if (!node.data.color) {
        const rndStep = Math.random() * nodes.length;
        node.data.color = interp(rndStep);
      }
    }

    const showLog = showDebugMessages;
    if (showLog) console.log("nodes");
    d3.select(".nodes-parent")
      .selectAll("g")
      .data(nodes, (node) => CausalViewNodeUtils.getNodeId(node.data))
      .join(
        function (enter) {
          if (showLog) console.log("enter", Array.from(enter));
          const enterNodesSelection = enter
            .append("g")
            .attr("class", (d) => {
              return `node ${CausalModelUtils.getNodeIdClassNameByNodeId(
                CausalViewNodeUtils.getNodeId(d.data)
              )}`;
            })
            .attr("transform", (d) => `translate(${d.x}, ${d.y})`)
            .on("click", this.onNodeClicked)
            .on("mouseenter", this.onMouseEnter)
            .on("mouseleave", this.onMouseLeave);

          this.#applyNodeStyles(enterNodesSelection);

          // Main text
          enterNodesSelection
            .append("text")
            .attr("class", "node-main-text");

          enterNodesSelection
            .append("text")
            .attr("class", "node-caption-text")
            .attr("font-family", "sans-serif")
            .attr("font-weight", "bold")
            .attr("fill", "var(--color)")
            .attr("transform", `translate(0, -8)`);

          enterNodesSelection
            .append("title");

          this.onEnterNodesSelection(enterNodesSelection);
        }.bind(this),
        function (update) {
          if (showLog) console.log("update", Array.from(update));
        }.bind(this),
        function (exit) {
          if (showLog) console.log("exit", Array.from(exit));
          exit.remove();
        }.bind(this)
      );
    this.updateNodes();
  }

  #applyNodeStyles(enterNodesSelection) {
    enterNodesSelection
      .append("rect")
      .attr("width", this.nodeWidth)
      .attr("height", this.nodeHeight)
      .attr("rx", 5)
      .attr("ry", 5);
  }

  static applyNodeStrokeAndFill(n, nodeRect) {
    if (n.data.isExternal) {
      nodeRect
        .attr("fill", "transparent")
        .attr("stroke", "var(--color)")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "8, 8");
    } else if (n.data.fact) {
      nodeRect
        .attr("fill", (n) => n.data.color ?? "var(--color)")
        .attr("stroke", "none")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "none");
    } else if (n.data.block) {
      nodeRect
        .attr("fill", "transparent")
        .attr("stroke", (n) => n.data.color)
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "8, 8");
    } else {
      console.error("Node has invalid data", n.data);
    }
  }

  updateNodes() {
    const nodesSelection = d3.select(".nodes-parent").selectAll("g");

    this.#updateNodeText(
      nodesSelection.select("text"),
      (d) => CausalViewNodeUtils.getNodeDisplayingText(d.data)
    );

    this.#updateStrokeAndFill(nodesSelection);
    this.#updateNodeCaptions(nodesSelection);
    this.#updateTitle(nodesSelection);
  }

  #updateStrokeAndFill(nodesSelection) {
    nodesSelection
      .select("rect")
      .each(function (n) {
        var nodeRect = d3.select(this);
        NodeRenderer.applyNodeStrokeAndFill(n, nodeRect);
      });
  }

  #updateNodeCaptions(nodesSelection) {
    nodesSelection.select(".node-caption-text")
      .text(d => d.data.isExternal ? "External Fact" : "");
  }

  #updateTitle(nodesSelection) {
    nodesSelection
      .select("title")
      .text(d => d.data.isExternal
        ? `External fact: ${d.data.id}\nNot found in the current model`
        : (d.data.fact ? d.data.fact.factValue : CausalViewNodeUtils.getNodeId(d.data)));
  }

  #updateNodeText(textSelection, getText) {
    textSelection
      .text(getText)
      .attr("font-family", "sans-serif")
      .attr("font-weight", "bold")
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "middle")
      .attr(
        "transform",
        `translate(${this.nodeWidth / 2}, ${this.nodeHeight / 2})`
      )
      .attr("fill", "var(--color)");
  }
}
