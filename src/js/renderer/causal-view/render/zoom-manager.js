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

  setScaleExtent() {
    this.zoom.scaleExtent([0.035, 2]);
  }

  #calculateBoundsFromNodesData(nodesData) {
    if (!nodesData || nodesData.length === 0) return null;

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

    nodesData.forEach(nodeData => {
      if (nodeData.x === undefined || nodeData.y === undefined) {
        console.error(
          "Node data doesn't contain coordinates to calculate bounds for initial zoom",
          nodeData);
      }
      const x = nodeData.x;
      const y = nodeData.y;

      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x + nodeWidth);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y + nodeHeight);
    });

    return {
      width: maxX - minX,
      height: maxY - minY,
      minX,
      minY
    };
  }

  #getInitialTransform(width, height, minX = 0, minY = 0) {
    const isNotEmpty = width > 0 && height > 0;

    if (!isNotEmpty) return d3.zoomIdentity;

    const scaleFactor = Math.min(
      this.svg.node().clientWidth / width,
      this.svg.node().clientHeight / height
    );

    const translateX = (this.svg.node().clientWidth - width * scaleFactor) / 2 - minX * scaleFactor;
    const translateY = (this.svg.node().clientHeight - height * scaleFactor) / 2 - minY * scaleFactor;

    return d3.zoomIdentity.translate(translateX, translateY).scale(scaleFactor);
  }

  #applyInitialTransform(transform) {
    this.svg
      .transition()
      .duration(750)
      .call(this.zoom.transform, transform);

    this.setScaleExtent();
  }

  setInitialZoomFromDagSize(dagWidth, dagHeight) {
    const transform = this.#getInitialTransform(dagWidth, dagHeight);
    this.#applyInitialTransform(transform);
  }

  setInitialZoomFromNodesData(nodesData) {
    const bounds = this.#calculateBoundsFromNodesData(nodesData);
    const transform = bounds
      ? this.#getInitialTransform(bounds.width, bounds.height, bounds.minX, bounds.minY)
      : d3.zoomIdentity;

    this.#applyInitialTransform(transform);
  }
}