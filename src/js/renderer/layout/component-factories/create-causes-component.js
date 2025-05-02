import { CausesComponent } from "../../components/causes-components/causes-component.js";
import { BlockCausesComponent } from "../../components/causes-components/block-causes-component.js";

export function createCausesComponent(args, container) {
  Object.assign(this, args);
  const causalView = args.componentsContext.causalView;
  const causesChangeManager = args.componentsContext.causesChangeManager;

  const causesComponent = new CausesComponent(
    container.element,
    causalView,
    this.api,
    this.undoRedoManager,
    causesChangeManager,
    args.dataManager
  );
  causesComponent.init();

  const blockCausesComponent = new BlockCausesComponent(
    container.element,
    causalView,
    this.api,
    this.undoRedoManager,
    causesChangeManager,
    this.dataManager
  );
  blockCausesComponent.init();
}
