import * as d3 from "d3";
import { SelectionRenderer } from "../causal-view/selection/selection-renderer";
import BlockUtils from "../common/block-utils";

const highlightColor = "var(--node-highlight)";

/**
 * Component for selecting nodes in a causal view with support for different node types
 */
export class SelectNodeElement {
  #selectionRenderer;
  #selectedNodeId;
  #blockConventionsProvider;

  constructor(selector, causalViewManager, blockConventionsProvider, onNodeIdSelected, onBlockConsequenceSelected) {
    this.component = d3.select(selector);
    this.causalViewManager = causalViewManager;
    this.onNodeIdSelected = onNodeIdSelected;
    this.onBlockConsequenceSelected = onBlockConsequenceSelected;

    this.#selectionRenderer = new SelectionRenderer(causalViewManager.structure);
    this.#blockConventionsProvider = blockConventionsProvider;
  }

  init(initialId) {
    this.onNodeClicked = this.onNodeClicked.bind(this);

    this.component.attr("class", "input-item select-node-element");
    this.#selectedNodeId = initialId;

    this.#createUIElements(initialId);
    this.#setInitialStateVisibility();
  }

  //#region Common
  #createUIElements(initialId) {
    this.idInput = this.#createIdInput(initialId);

    // For block consequence selection
    this.blockConsequenceDropdown = this.#createDropdown();
    this.blockConsequenceConfirmButton = this.#createButton(
      "Ok",
      this.#onBlockConsequenceConfirmButtonClick.bind(this),
      "select-node-element__input");

    // For common selection
    this.selectNodeButton = this.#createButton("Select", this.#onSelectButtonClick.bind(this));
    this.clearButton = this.#createButton(
      "Clear",
      this.#onClearButtonClick.bind(this),
      "select-node-element__input");
    this.cancelSelectButton = this.#createButton("Cancel", this.#onCancelButtonClick.bind(this));
  }

  #onSelectButtonClick() {
    this.causalViewManager.selectionManager.isSelectByClick = false;
    this.causalViewManager.structure.addEventListener("nodeClicked", this.onNodeClicked);
    this.#setSelectionStateVisibility();
  }

  #onCancelButtonClick() {
    this.#cancelSelectionMode();
  }

  #onClearButtonClick() {
    this.#updateSelectionFactOrNone(null);
  }

  onNodeClicked(event) {
    const { fact, block, isExternal, id } = event.nodeSelection.data;

    if (fact) {
      this.#updateSelectionFactOrNone(fact.id);
    }
    else if (block) {
      this.#updateBlockSelection(block);
    } else if (isExternal) {
      this.#updateSelectionFactOrNone(id);
    }
  }

  #cancelSelectionMode() {
    this.causalViewManager.structure.removeEventListener("nodeClicked", this.onNodeClicked);
    this.causalViewManager.selectionManager.isSelectByClick = true;
    this.#setInitialStateVisibility();
  }

  /**
   * 
   * @param {*} factId Id of a selected fact or 'null' (no matter whether it a fact or a block)
   */
  #updateSelectionFactOrNone(factId) {
    this.#selectedNodeId = factId;
    this.idInput.property("value", factId ?? "");
    this.#cancelSelectionMode();
    this.onNodeIdSelected?.(factId);
  }
  //#endregion

  //#region Block selection
  #currentBlockToSelect;
  #onBlockConsequenceConfirmButtonClick() {
    // That's supposed that the selected value is always set correctly
    const selectedValue = this.blockConsequenceDropdown.property("value");

    // Finally choose this block as a selected node
    this.#selectedNodeId = this.#currentBlockToSelect.id;

    this.#cancelSelectionMode();
    this.onBlockConsequenceSelected?.({
      blockId: this.#currentBlockToSelect.id,
      blockConsequenceName: selectedValue,
      block: this.#currentBlockToSelect
    });
  }

  #updateBlockSelection(block) {
    this.#currentBlockToSelect = block;

    // Set actual block consequences for the dropdown
    this.#setBlockConsequenceDropdownOptions(this.#getBlockConsequences(this.#currentBlockToSelect));

    this.#setBlockConsequenceSelectionStateVisibility();
  }

  #setBlockConsequenceDropdownOptions(optionValues) {
    this.blockConsequenceDropdown.selectAll("option").remove();

    optionValues.forEach(value => {
      this.blockConsequenceDropdown
        .append("option")
        .attr("value", value)
        .text(value);
    });
  }

  #getBlockConsequences(declaredBlock) {
    return BlockUtils.getBlockConsequenceNames(
      this.#blockConventionsProvider.blockConventions,
      declaredBlock.convention);
  }
  //#endregion

  //#region Visibility Management
  /**
   * Initial state (the user has not started selecting yet)
   */
  #setInitialStateVisibility() {
    this.#setVisibility(
      [this.idInput, this.selectNodeButton],
      [this.blockConsequenceDropdown, this.blockConsequenceConfirmButton, this.clearButton, this.cancelSelectButton]);
  }

  /**
   * Selection mode (the user is going to select a fact or a block)
   */
  #setSelectionStateVisibility() {
    this.#setVisibility(
      [this.idInput, this.clearButton, this.cancelSelectButton],
      [this.blockConsequenceDropdown, this.blockConsequenceConfirmButton, this.selectNodeButton]);
  }

  /**
   * Block consequence selection mode
   */
  #setBlockConsequenceSelectionStateVisibility() {
    this.#setVisibility(
      [this.blockConsequenceDropdown, this.blockConsequenceConfirmButton, this.cancelSelectButton],
      [this.idInput, this.clearButton, this.selectNodeButton]);
  }

  #setVisibility(visible, notVisible) {
    for (const element of visible) {
      this.#setVisible(element, true);
    }
    for (const element of notVisible) {
      this.#setVisible(element, false);
    }
  }

  #setVisible(element, isVisible) {
    element.style("display", isVisible ? "inline-block" : "none");
  }
  //#endregion

  //#region UI creation
  #createIdInput(initialId) {
    return this.component
      .append("input")
      .attr("type", "text")
      .attr("class", "text-input input-item__input select-node-element__input")
      .attr("placeholder", "CauseId")
      .attr("readonly", true)
      .property("value", initialId ?? "")
      .on("mouseenter", (event) => this.#handleIdInputHover(event.target, true))
      .on("mouseleave", (event) => this.#handleIdInputHover(event.target, false));
  }

  #createButton(text, onClick, additionalClass = "") {
    const classes = `button ${additionalClass}`.trim();
    return this.component
      .append("button")
      .attr("class", classes)
      .text(text)
      .on("click", onClick);
  }

  #createDropdown() {
    const dropdown = this.component
      .append("select")
      .attr("class", "text-input input-item__input select-node-element__input");

    return dropdown;
  }
  //#endregion

  //#region Hover
  #handleIdInputHover(element, isHovering) {
    d3.select(element).style(
      "outline",
      isHovering && this.#selectedNodeId
        ? `2px solid ${highlightColor}`
        : "inherit"
    );

    if (!this.#selectedNodeId) return;

    const appearanceMethod = isHovering
      ? this.#selectionRenderer.setSelectedAppearance
      : this.#selectionRenderer.setNotSelectedAppearance;

    appearanceMethod.call(
      this.#selectionRenderer,
      this.causalViewManager.structure.graphManager.getParentIdInGraph(this.#selectedNodeId),
      highlightColor
    );
  }
  //#endregion
}
