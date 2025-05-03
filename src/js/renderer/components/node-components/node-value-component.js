import { BaseNodeComponent } from "./base-node-component"
import { FactDataProvider } from "../providers/fact-data-provider";

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
    this.titleInput = this.appendTextInputItem({
      name: "Title",
      propName: "title",
      inputId: "node-title-input",
      dontShowLabel: true,
      isInnerProp: false,
      shouldRenderCausalView: true
    });
    this.valueInput = this.appendTextInputItem({
      name: "Fact Value",
      propName: "factValue",
      inputId: "node-id-input",
      isReadonly: false,
      useTextArea: true,
      isInnerProp: true,
      shouldRenderCausalView: true
    });
    this.idInput = this.appendTextInputItem({
      name: "Id",
      propName: "id",
      inputId: "node-id-input",
      isReadonly: true,
      isInnerProp: true,
    });
  }
}
