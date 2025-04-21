import * as d3 from "d3";

export class BaseCausesComponent {
    constructor(selector, causalView, api, undoRedoManager, causesChangeManager) {
        this.component = d3.select(selector);
        this.causalView = causalView;
        this.undoRedoManager = undoRedoManager;
        this.causesChangeManager = causesChangeManager;

        api.onReset(
            function (event, data) {
                this.reset(null);
            }.bind(this)
        );
    }

    // Actions that are relevant to CausesComponent regardless of causalModelFact structure.
    // init() must be called only once
    init() {
        this.component.classed("component", true);

        // Todo: add event listeners for components in external code?
        this.#addSelectionEventListeners();
    }

    shouldHandleReset(nodeData) {
        throw new Error("Method 'shouldHandleReset' must be implemented in subclasses.");
    }

    render(nodeData) {
        throw new Error("Method 'render' must be implemented in subclasses.");
    }

    clearContent() {
        if (this.content) {
            this.content.remove();
        }
    }

    reset(nodeData) {

        this.clearContent();
        if (nodeData && !this.shouldHandleReset(nodeData)) {
            return;
        }

        this.content = this.component.append("div").attr("class", "input-item");

        if (!nodeData) {
            return;
        }

        this.render(nodeData);
    }

    #addSelectionEventListeners() {
        // Todo: add event listeners for components in external code?
        this.causalView.selectionManager.addEventListener(
            "singleNodeSelected",
            (event) => this.reset(event.nodeData)
        );

        this.causalView.selectionManager.addEventListener(
            "singleNodeNotSelected",
            (event) => this.reset(null)
        );
    }
}
