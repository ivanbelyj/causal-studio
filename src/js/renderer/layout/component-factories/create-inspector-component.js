import { CausalModelSettingsComponent } from "../../components/causal-model-settings/causal-model-settings-component";
import { CausesConventionsComponent } from "../../components/convention-components/causes-conventions-component";
import { ConventionsComponent } from "../../components/convention-components/conventions-component";

export function createInspectorComponent(args, container) {
    Object.assign(this, args);

    const causesConventionsComponent = new CausesConventionsComponent(
        container.element,
        this.api,
        this.undoRedoManager
    );
    causesConventionsComponent.init();

    const conventionsComponent = new ConventionsComponent(
        container.element,
        this.api,
        this.undoRedoManager
    );
    conventionsComponent.init();

    const causalModelSettingsComponent = new CausalModelSettingsComponent(
        container.element,
        this.api,
        this.undoRedoManager);
    causalModelSettingsComponent.init();
}