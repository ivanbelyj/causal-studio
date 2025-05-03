import { BlockResolvingMapComponent } from "../../components/block-resolving-map/block-resolving-map-component";
import { CausalModelSettingsComponent } from "../../components/causal-model-settings/causal-model-settings-component";
import { CausesConventionsComponent } from "../../components/convention-components/causes-conventions-component";
import { ConventionsComponent } from "../../components/convention-components/conventions-component";

export function createInspectorComponent(args, container) {
    const { api, undoRedoManager, dataManager } = args;

    const causesConventionsComponent = new CausesConventionsComponent(
        container.element,
        api,
        undoRedoManager
    );
    causesConventionsComponent.init();

    const conventionsComponent = new ConventionsComponent(
        container.element,
        api,
        undoRedoManager
    );
    conventionsComponent.init();

    const causalModelSettingsComponent = new CausalModelSettingsComponent(
        container.element,
        api,
        undoRedoManager);
    causalModelSettingsComponent.init();

    const blockResolvingMapComponent = new BlockResolvingMapComponent(
        container.element,
        api,
        undoRedoManager,
        dataManager
    );
    blockResolvingMapComponent.init();
}