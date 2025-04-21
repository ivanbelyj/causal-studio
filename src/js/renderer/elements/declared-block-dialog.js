import * as d3 from "d3";
import { Dialog } from "./dialog";

export class DeclaredBlockDialog extends Dialog {
  constructor(modalId, onDeclareBlockClicked, blockConventionsProvider) {
    super(modalId, {
      title: "Declare Block",
      closeButtonContent: "Cancel",
      continueButtonContent: "Declare Block",
      focusOnContinue: true,
      mainContent: d3.create("div").html(`
          <div class="input-item">
            <label class="input-item__label">Declared Block Id</label>
            <input
              id="${modalId}-declared-block-input-id"
              class="input-item text-input input-item__input" type="text"
              placeholder="Declared Block Id"/>
          </div> 
      `),

      // Todo: add convention select on block declaration
      // <div class="input-item">
      //   <label class="input-item__label">Block Convention</label>
      //   <select id="${modalId}-block-convention-select" class="input-item__input">
      //     ${[].map(x => `<option value="${x}">${x}</option>`).join(" ")}
      //   </select>
      // </div>
      // 
      // <div class="input-item">
      //   <button class="button">Add Block Convention</button>
      // </div>
    });
    this.declaredBlockInputId = `${modalId}-declared-block-input-id`;
    this.blockConventionSelectId = `${modalId}-block-convention-select`;
    this.onDeclareBlockClicked = onDeclareBlockClicked;

    this.isCallbackSubscribed = false;
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
    const declaredBlockId = d3
      .select(`#${this.declaredBlockInputId}`)
      .property("value");
    // Todo:
    // const blockConvention = d3
    //   .select(`#${this.blockConventionSelectId}`)
    //   .property("value");

    const data = {
      declaredBlockId,
      blockConvention: "",
      // blockConvention,
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
