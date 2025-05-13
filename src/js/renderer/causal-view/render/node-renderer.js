import * as d3 from "d3";
import * as d3dag from "d3-dag";
import { CausalModelUtils } from "../causal-model-utils.js";
import { CausalViewNodeUtils } from "./causal-view-node-utils.js";
import ColorUtils from "../../common/color-utils.js";

const showDebugMessages = false;

const nodeWidthMultiplier = 1.1;
const nodeHeightMultiplier = 3;

/**
 * Class responsible for rendering nodes in the causal view structure.
 */
export class NodeRenderer {
  #probabilityEstimationResultsProvider;

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
    onEnterNodesSelection,
    probabilityEstimationResultsProvider
  ) {
    this.nodesParent = nodesParent;
    this.graphManager = graphManager;
    this.nodeWidth = nodeWidth;
    this.nodeHeight = nodeHeight;

    this.onNodeClicked = onNodeClicked;
    this.onMouseEnter = onMouseEnter;
    this.onMouseLeave = onMouseLeave;

    this.onEnterNodesSelection = onEnterNodesSelection;

    this.#probabilityEstimationResultsProvider = probabilityEstimationResultsProvider;

    this.#setLayout();
  }

  get #showProbabilityEstimationResults() {
    return this.#probabilityEstimationResultsProvider.showProbabilityEstimationResults;
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

  reset() {
    this.#setDagWidthAndHeight();
  }

  #setLayout() {
    this.layout = d3dag
      .sugiyama() // base layout
      // The next option freezes arrangement of causal models
      // with a large number of crossing edges, so it's disabled
      // .decross(d3dag.decrossOpt()) // minimize number of crossings
      // set node size instead of constraining to fit
      .nodeSize((node) => {
        return [
          (node ? nodeWidthMultiplier : 0) * this.nodeWidth,
          nodeHeightMultiplier * this.nodeHeight,
        ];
      });
  }

  #setDagWidthAndHeight() {
    const { width: dagWidth, height: dagHeight } = this.layout(
      this.graphManager.mutGraph
    );
    this.dagWidth = dagWidth;
    this.dagHeight = dagHeight;
  }

  #applyNodeStyles(enterNodesSelection) {
    enterNodesSelection
      .append("rect")
      .attr("width", this.nodeWidth)
      .attr("height", this.nodeHeight)
      .attr("rx", 5)
      .attr("ry", 5);
  }

  applyNodeStrokeAndFill(n, nodeRect) {
    if (n.data.isExternal) {
      nodeRect
        .attr("fill", "transparent")
        .attr("stroke", "var(--color)")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "8, 8");
    } else if (n.data.fact) {
      nodeRect
        .attr("fill", (n) => {
          const factId = n.data.fact?.id;
          if (this.#showProbabilityEstimationResults && factId) {
            const probabilityData = this.#getProbabilityDataByFactId(factId);
            if (probabilityData) {
              return this.#getProbabilityColor(probabilityData.estimatedProbability);
            }
          }
          return n.data.color ?? "var(--color)";
        })
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

  #getProbabilityColor(probability) {
    return this.#probabilityEstimationResultsProvider.getProbabilityColor(probability);
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
    const self = this;
    nodesSelection
      .select("rect")
      .each(function (n) {
        var nodeRect = d3.select(this);
        self.applyNodeStrokeAndFill(n, nodeRect);
      });
  }

  static getPercentageString(probability) {
    return (probability * 100).toFixed(2) + '%';
  }

  #updateNodeCaptions(nodesSelection) {
    const getText = (d) => {
      if (d.data.isExternal) {
        return "External Fact";
      }
      if (this.#showProbabilityEstimationResults) {
        if (!this.#probabilityEstimationResultsProvider.probabilityEstimationResultsByFactKey) {
          console.error(
            "showProbabilityEstimationResults is", this.#showProbabilityEstimationResults,
            ", but probability estimation results were not set");
        }
        const factId = d.data.fact?.id;
        const probabilityData = factId ? this.#getProbabilityDataByFactId(factId) : null;
        if (!probabilityData) {
          return "";
        }
        return probabilityData.estimatedProbability !== undefined
          && probabilityData.estimatedProbability !== null
          ? NodeRenderer.getPercentageString(probabilityData.estimatedProbability)
          : "";
      }
      return "";
    }
    nodesSelection
      .select(".node-caption-text")
      .text(getText);
  }

  #getProbabilityDataByFactId(factId) {
    return this.#probabilityEstimationResultsProvider.getProbabilityDataByFactId(factId);
  }

  #updateTitle(nodesSelection) {
    nodesSelection
      .select("title")
      .text(d => {
        if (d.data.isExternal) {
          return `External fact: ${d.data.id}\nNot found in the current model`;
        }
        const fact = d.data.fact;
        let text = (fact ? fact.factValue : CausalViewNodeUtils.getNodeId(d.data));
        if (this.#showProbabilityEstimationResults && fact) {
          const factProbabilityData = this.#getProbabilityDataByFactId(fact.id);
          if (factProbabilityData?.estimatedProbability) {
            const percentage = NodeRenderer.getPercentageString(factProbabilityData.estimatedProbability);
            if (text.includes("\n")) {
              text = `${text}\nEstimated probability: ${percentage}`
            } else {
              text = `${text} (${percentage})`;
            }
          }
        }
        return text;
      });
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
      .attr("fill", this.#showProbabilityEstimationResults ? "#ddd" : "var(--color)");
  }
}
