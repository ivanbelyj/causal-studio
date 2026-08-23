import * as d3 from "d3";
import { Command } from "../../undo-redo/commands/command";

// TODO: Reuse logic with other color pickers.
// TODO: Support color change for external nodes.

// Todo: Review AI-generated
export class BulkNodeColorComponent {
  constructor(selector, causalView, api, undoRedoManager) {
    this.component = d3.select(selector);
    this.causalView = causalView;
    this.undoRedoManager = undoRedoManager;

    api.onReset(() => this.reset(null));
  }

  init() {
    this.component.classed("component", true);

    const selectionManager = this.causalView.selectionManager;
    selectionManager.addEventListener("multipleNodesSelected", (event) => {
      this.reset(event.nodeIds);
    });
    selectionManager.addEventListener("singleNodeSelected", () => {
      this.reset(null);
    });
    selectionManager.addEventListener("singleNodeNotSelected", () => {
      this.reset(null);
    });
  }

  reset(nodeIds) {
    if (!nodeIds?.length) {
      return;
    }

    this.component.html("");
    this.#render(nodeIds);
  }

  #render(nodeIds) {
    const structure = this.causalView.structure;
    const nodesData = nodeIds.map((id) => structure.getNodeDataById(id));

    const inputItem = this.component
      .append("div")
      .attr("class", "input-item");

    inputItem
      .append("label")
      .attr("class", "input-item__label")
      .text(`Color (${nodeIds.length} nodes)`);

    const colorInput = inputItem
      .append("input")
      .attr("type", "color")
      .attr("class", "color-input input-item__input");

    colorInput.property("value", this.#formatColorForInput(nodesData[0]?.color));

    colorInput.on("change", () => {
      const newColor = colorInput.property("value");
      this.#applyColor(nodeIds, newColor);
    });
  }

  #formatColorForInput(color) {
    return d3.color(color)?.formatHex() ?? "#ffffff";
  }

  #applyColor(nodeIds, newColor) {
    const structure = this.causalView.structure;
    const oldColors = new Map(
      nodeIds.map((id) => [id, structure.getNodeDataById(id).color])
    );

    this.undoRedoManager.execute(new Command(
      () => {
        nodeIds.forEach((id) => {
          structure.getNodeDataById(id).color = newColor;
        });
        structure.render();
      },
      () => {
        oldColors.forEach((color, id) => {
          structure.getNodeDataById(id).color = color;
        });
        structure.render();
      }
    ));
  }
}
