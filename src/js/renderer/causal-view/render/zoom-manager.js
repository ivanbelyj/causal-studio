import * as d3 from "d3";

import { nodeWidth, nodeHeight } from "../causal-view";

export class ZoomManager {
  constructor(svg, svgChild, onZoom) {
    this.svg = svg;
    this.svgChild = svgChild;

    this.onZoom = onZoom;

    this.#setupZoom();
  }

  #setupZoom() {
    this.zoom = d3.zoom().on("zoom", this.onZoom);
    this.svg.call(this.zoom);
  }

  updateScaleExtent(dagWidth, dagHeight) {
    // const defaultMinScale = 0.5;
    // const k0 = dagWidth > 0
    //   ? Math.min(
    //     this.svg.node().clientWidth / dagWidth / 2,
    //     defaultMinScale) * 0.3
    //   : defaultMinScale;
    this.zoom.scaleExtent([
      0.035,
      2,
      // Math.max(
      //   this.svg.node().clientWidth / this.nodeWidth,
      //   this.svg.node().clientHeight / this.nodeHeight
      // ),
    ]); // Zoom limits
  }

  // static clamp(value, min, max) {
  //   return Math.min(Math.max(value, min), max);
  // }

  setInitialZoom(dagWidth, dagHeight) {
    // Calculate initial scale factor
    const isNotEmpty = dagWidth > 0;

    const scaleFactor = isNotEmpty
      ? Math.min(
        this.svg.node().clientWidth / dagWidth,
        this.svg.node().clientHeight / dagHeight
      )
      : null;

    // Calculate translation coordinates
    const translateX =
      (this.svg.node().clientWidth - (dagWidth + nodeWidth) * scaleFactor) / 2;
    const translateY =
      (this.svg.node().clientHeight - (dagHeight + nodeHeight) * scaleFactor) / 2;

    // Apply initial zoom and center the graph
    this.svg
      .transition()
      .duration(750)
      .call(
        this.zoom.transform,
        isNotEmpty
          ? d3.zoomIdentity.translate(translateX, translateY).scale(scaleFactor)
          : d3.zoomIdentity
      );

    this.updateScaleExtent(dagWidth, dagHeight);
  }
}
