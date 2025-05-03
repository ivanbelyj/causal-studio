import * as d3 from "d3";
import { Dialog } from "./dialog";

export class DeclaredBlockDialog extends Dialog {
  constructor(modalId, onDeclareBlockClicked, blockConventionsProvider) {
    super(modalId, {
      title: "Declare Block",
      closeButtonContent: "Cancel",
      continueButtonContent: "Declare Block",
      focusOnContinue: true,
    });

    this.declaredBlockInputId = `${modalId}-declared-block-input-id`;
    this.blockConventionSelectId = `${modalId}-block-convention-select`;
    this.blockCausesConventionSelectId = `${modalId}-block-causes-convention-select`;
    this.onDeclareBlockClicked = onDeclareBlockClicked;
    this.blockConventionsProvider = blockConventionsProvider;

    this.isCallbackSubscribed = false;
  }

  createMainContent() {
    return d3.create("div").html(`
      <div class="input-item">
        <label class="input-item__label">Declared Block Id</label>
        <input
          id="${this.modalId}-declared-block-input-id"
          class="input-item text-input input-item__input" type="text"
          placeholder="Declared Block Id"/>
      </div>

      <div class="input-item">
        <label class="input-item__label">Block Convention</label>
        <select id="${this.modalId}-block-convention-select" class="input-item__input">
          ${this.blockConventionsProvider.blockConventions.map(x => `<option value="${x.name}">${x.name}</option>`).join(" ")}
        </select>
      </div>

      <div class="input-item">
        <label class="input-item__label">Block Causes Convention</label>
        <select id="${this.modalId}-block-causes-convention-select" class="input-item__input">
          ${this.blockConventionsProvider.blockCausesConventions.map(x => `<option value="${x.name}">${x.name}</option>`).join(" ")}
        </select>
      </div>
  `);
  }

  show({ blockNodePosX, blockNodePosY }) {
    super.show();
    this.#resetDeclaredBlockInput();

    this.blockNodePosX = blockNodePosX;
    this.blockNodePosY = blockNodePosY;

    if (!this.isCallbackSubscribed) {
      d3.select(`#${this.continueButtonId}`).on("click", () => {
        this.onDeclareButtonClick();
        this.close();
      });
      this.isCallbackSubscribed = true;
    }
  }

  onDeclareButtonClick() {
    if (!this.blockConventionsProvider.blockConventions.length) {
      window.api.sendShowDialog("error", {
        title: "Cannot declare block",
        message: "Cannot declare block without block convention set. " +
          "Please, create at least one block convention before declaring blocks"
      });
      return;
    }

    const declaredBlockId = d3
      .select(`#${this.declaredBlockInputId}`)
      .property("value");

    const blockConvention = d3
      .select(`#${this.blockConventionSelectId}`)
      .property("value");

    const blockCausesConvention = d3
      .select(`#${this.blockCausesConventionSelectId}`)
      .property("value");

    const data = {
      declaredBlockId,
      blockConvention,
      blockCausesConvention,
      blockNodePosY: this.blockNodePosY,
      blockNodePosX: this.blockNodePosX,
    };

    this.onDeclareBlockClicked(data);
  }

  #resetDeclaredBlockInput() {
    d3.select(`#${this.declaredBlockInputId}`).property(
      "value",
      crypto.randomUUID()
    );
  }
}
