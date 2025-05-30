import { CausalModelUtils } from "../causal-model-utils";
import { CausalView } from "../causal-view";
import * as d3 from "d3";

const nodeSelectionStrokeWidth = 4;
const defaultSelectionColor = "var(--default-node-selection)";

export class SelectionRenderer {
  constructor(causalView, nodeAppearanceProvider) {
    this._causalView = causalView;
    this.nodeAppearanceProvider = nodeAppearanceProvider;
  }

  initCausalViewSelectionZoom() {
    this._causalView.addEventListener("zoomed", () => {
      d3.selectAll(".node__rect_selected").attr("stroke-width", () =>
        this.getSelectionStrokeWidthIgnoreZoom()
      );
    });
  }

  setSelectedAppearance(nodeId, selectionColor) {
    selectionColor ??= defaultSelectionColor;
    CausalView.getNodeSelectionById(nodeId)
      .raise()
      .select("rect")
      .attr("stroke", selectionColor)
      .attr("stroke-width", this.getSelectionStrokeWidthIgnoreZoom())
      .classed("node__rect_selected", true);
  }

  setNotSelectedAppearance(nodeId) {
    const self = this;
    d3.select(`.${CausalModelUtils.getNodeIdClassNameByNodeId(nodeId)}`)
      .select("rect")
      .classed("node__rect_selected", false)

      .each(function (n) {
        var nodeRect = d3.select(this);

        self._causalView.nodeRenderer.applyNodeStrokeAndFill(n, nodeRect)
      });
  }

  getSelectionStrokeWidthIgnoreZoom() {
    return (
      nodeSelectionStrokeWidth /
      d3.zoomTransform(this._causalView.getViewNode()).k
    );
  }
}
