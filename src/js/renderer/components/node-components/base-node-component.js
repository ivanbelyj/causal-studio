import * as d3 from "d3";
import { BaseComponent } from "../base/base-component";

export class BaseNodeComponent extends BaseComponent {
    constructor(selector, causalView, api, undoRedoManager) {
        super(selector, api, undoRedoManager, causalView);

        api.onReset(() => this.resetProvider(null));
    }

    init() {
        super.init();

        this.#addSelectionEventListeners();
    }

    setupResetByDataProviderEvents(dataProvider) {
        super.setupResetByDataProviderEvents(dataProvider);
        dataProvider.addEventListener("mutated", () => {
            this.reset(dataProvider.get());
        });
    }

    #addSelectionEventListeners() {
        this.causalView.selectionManager.addEventListener(
            "singleNodeSelected",
            (event) => this.resetProvider(event.nodeData)
        );

        this.causalView.selectionManager.addEventListener(
            "singleNodeNotSelected",
            () => this.resetProvider(null)
        );
    }
}
