import { CausesConventionsComponent } from "../../components/convention-components/causes-conventions-component";
import { ConventionsComponent } from "../../components/convention-components/conventions-component";

export function createInspectorComponent(container) {
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
}