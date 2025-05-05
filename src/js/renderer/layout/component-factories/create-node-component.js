import { DeclaredBlockComponent } from "../../components/node-components/declared-block-component";
import { ExternalFactComponent } from "../../components/node-components/external-fact-component";
import { NodeValueComponent } from "../../components/node-components/node-value-component";

export function createNodeComponent(args, container) {
  Object.assign(this, args);
  const causalView = args.componentsContext.causalView;
  const causesChangeManager = args.componentsContext.causesChangeManager;

  const nodeValueComponent = new NodeValueComponent(
    container.element,
    causalView,
    this.api,
    this.undoRedoManager
  );
  nodeValueComponent.init();

  const declaredBlockComponent = new DeclaredBlockComponent(
    container.element,
    causalView,
    this.api,
    this.undoRedoManager,
    this.dataManager,
    causesChangeManager
  );
  declaredBlockComponent.init();

  const externalFactComponent = new ExternalFactComponent(
    container.element,
    causalView,
    this.api,
    this.undoRedoManager)
  externalFactComponent.init();
}
