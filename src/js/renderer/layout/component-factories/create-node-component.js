import { DeclaredBlockComponent } from "../../components/node-components/declared-block-component";
import { NodeValueComponent } from "../../components/node-components/node-value-component";

export function createNodeComponent(container) {
  const nodeValueComponent = new NodeValueComponent(
    container.element,
    this.causalView,
    this.api,
    this.undoRedoManager
  );
  nodeValueComponent.init();

  const declaredBlockComponent = new DeclaredBlockComponent(
    container.element,
    this.causalView,
    this.api,
    this.undoRedoManager,
    this.dataManager
  );
  declaredBlockComponent.init();
}
