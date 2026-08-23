import { FactDataProvider } from "../../data/providers/fact-data-provider";
import { BaseNodeComponent } from "./base-node-component"

export class NodeValueComponent extends BaseNodeComponent {
  render(nodeData) {
    if (nodeData.fact) {
      this.#renderFactNode();
    } else {
      console.warn("Unsupported node type for NodeValueComponent.");
    }
  }

  shouldHandleReset(nodeData) {
    return !!(nodeData?.fact);
  }

  createDataProvider() {
    return new FactDataProvider(this.undoRedoManager, null);
  }

  #renderFactNode() {
    this.#appendColorAndTitleInputRow();
    this.valueInput = this.appendTextInputItem({
      name: "Fact Value",
      propName: "factValue",
      inputId: "node-id-input",
      isReadonly: false,
      useTextArea: true,
      isInnerProp: true,
      shouldRenderCausalView: true,
      autoResizeTextArea: true
    });
    this.idInput = this.appendTextInputItem({
      name: "Id",
      propName: "id",
      inputId: "node-id-input",
      isReadonly: true,
      isInnerProp: true,
    });
  }

  #appendColorAndTitleInputRow()
  {
    const row = this.component
      .append("div")
      .attr("class", "input-item input-item-title-row");

    const colorInput = row.append("input")
      .attr("type", "color")
      .attr("id", "node-color-input")
      .attr("class", "input-item__input input-item-title-row__color-input");

    this.titleInput = row.append("input")
      .attr("type", "text")
      .attr("id", "node-title-input")
      .attr("class", "input-item__input input-item-title-row__text-input text-input")
      .attr("placeholder", "Title");

    const inputProps = { isInnerProp: false, shouldRenderCausalView: true };
    this.propNameToData.set("color", { input: colorInput, ...inputProps });
    this.propNameToData.set("title", { input: this.titleInput, ...inputProps });
  }
}
