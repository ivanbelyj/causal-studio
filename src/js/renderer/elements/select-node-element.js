import * as d3 from "d3";
import { SelectionRenderer } from "../causal-view/selection/selection-renderer";

const highlightingColor = "#fde910";

export class SelectNodeElement {
  #selectionRenderer;
  #causalModelNodeId;
  constructor(selector, causalView, onNodeIdSelected) {
    this.component = d3.select(selector);
    this.causalView = causalView;
    this.onNodeIdSelected = onNodeIdSelected;

    this.#selectionRenderer = new SelectionRenderer(causalView.structure);
  }

  init(initialId) {
    this.onNodeClicked = this.onNodeClicked.bind(this);

    this.component.attr("class", "input-item select-node-element");

    this.#causalModelNodeId = initialId;
    this.#createElements(initialId);

    this.#setButtonsVisible(true);
  }

  #createElements(initialId) {
    this.idInput = this.#createIdInput(initialId);
    this.selectNodeButton = this.#createSelectNodeButton();
    this.clearButton = this.#createClearButton();
    this.cancelSelectButton = this.#createCancelSelectButton();
  }

  #createIdInput(initialId) {
    return this.component
      .append("input")
      .attr("type", "text")
      .attr("class", "text-input input-item__input select-node-element__input")
      .attr("placeholder", "CauseId")
      .attr("readonly", true)
      .property("value", initialId ?? "")
      .on("mouseenter", this.#handleIdInputMouseEvent.bind(this, true))
      .on("mouseleave", this.#handleIdInputMouseEvent.bind(this, false));
  }

  #handleIdInputMouseEvent(isMouseEnter, event) {
    this.#setIdInputAndNodeAppearance(isMouseEnter, event.target);
  }

  #setIdInputAndNodeAppearance(isMouseEnter, element) {
    d3.select(element).style(
      "outline",
      isMouseEnter && this.#causalModelNodeId
        ? `2px solid ${highlightingColor}`
        : "inherit"
    );

    if (!this.#causalModelNodeId) return;

    const func = isMouseEnter
      ? this.#selectionRenderer.setSelectedAppearance
      : this.#selectionRenderer.setNotSelectedAppearance;

    func.call(
      this.#selectionRenderer,
      this.#causalModelNodeId,
      highlightingColor
    );
  }

  #createSelectNodeButton() {
    return this.component
      .append("button")
      .attr("class", "button")
      .text("Select")
      .on("click", this.#onSelectButtonClick.bind(this));
  }

  #createClearButton() {
    return this.component
      .append("button")
      .attr("class", "button select-node-element__input")
      .text("Clear")
      .on("click", this.#onClearButtonClick.bind(this));
  }

  #createCancelSelectButton() {
    return this.component
      .append("button")
      .attr("class", "button")
      .text("Cancel")
      .on("click", this.#onCancelButtonClick.bind(this));
  }

  #setButtonsVisible(showSelectButtonOnly) {
    this.selectNodeButton.style(
      "display",
      showSelectButtonOnly ? "inline-block" : "none"
    );
    this.clearButton.style(
      "display",
      !showSelectButtonOnly ? "inline-block" : "none"
    );
    this.cancelSelectButton.style(
      "display",
      !showSelectButtonOnly ? "inline-block" : "none"
    );
  }

  #onCancelButtonClick(event) {
    this.#cancelSelect();
  }

  #onClearButtonClick(event) {
    this.#setIdInputAndCancelSelectionButton(null);
  }

  onNodeClicked(event) {
    const causalModelFact = event.nodeSelection.data.fact;
    if (causalModelFact) {
      this.#causalModelNodeId = causalModelFact.id;
      this.#setIdInputAndCancelSelectionButton(causalModelFact.id);
    }
  }

  #setIdInputAndCancelSelectionButton(causalModelFactId) {
    this.idInput.property("value", causalModelFactId);

    this.#cancelSelect();

    this.onNodeIdSelected?.(causalModelFactId);
  }

  #onSelectButtonClick(event) {
    // The last click is to select the cause id, not to select the node to edit
    this.causalView.selectionManager.isSelectByClick = false;

    this.causalView.structure.addEventListener(
      "nodeClicked",
      this.onNodeClicked // already bound to this
    );

    this.#setButtonsVisible(false);
  }

  #cancelSelect() {
    this.causalView.structure.removeEventListener(
      "nodeClicked",
      this.onNodeClicked // the same function as in addEventListener
    );
    this.causalView.selectionManager.isSelectByClick = true;
    this.#setButtonsVisible(true);
  }
}
