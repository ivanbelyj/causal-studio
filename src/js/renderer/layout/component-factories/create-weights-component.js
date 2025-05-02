import { WeightsComponent } from "../../components/weights-component/weights-component.js";

export function createWeightsComponent(args, container) {
  Object.assign(this, args);
  const causalView = args.componentsContext.causalView;
  const causesChangeManager = args.componentsContext.causesChangeManager;

  const weightsComponent = new WeightsComponent(
    container.element,
    causalView,
    this.api,
    this.undoRedoManager,
    causesChangeManager,
    args.dataManager,
  );
  weightsComponent.init();
}
