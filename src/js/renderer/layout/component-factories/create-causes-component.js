import { CausesComponent } from "../../components/causes-components/causes-component.js";
import { BlockCausesComponent } from "../../components/causes-components/block-causes-component.js";

export function createCausesComponent(container) {
  const causesComponent = new CausesComponent(
    container.element,
    this.causalView,
    this.api,
    this.undoRedoManager,
    this.causesChangeManager
  );
  causesComponent.init();

  const blockCausesComponent = new BlockCausesComponent(
    container.element,
    this.causalView,
    this.api,
    this.undoRedoManager,
    this.causesChangeManager,
    this.dataManager
  );
  blockCausesComponent.init();
}
