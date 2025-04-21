import * as d3 from "d3";
import MicroModal from "micromodal";
import "../../../css/elements/dialog.css";

export class Dialog {
  constructor(
    modalId,
    {
      title,
      mainContent,
      continueButtonContent,
      closeButtonContent,
      focusOnContinue = false
    }
  ) {
    this.modalId = modalId;
    this.mainContent = mainContent;
    this.continueButtonId = `${modalId}-continue-button-id`;
    this.focusOnContinue = focusOnContinue;
    this.modalContentTemplate = `
        <div class="modal__overlay" tabindex="-1" data-micromodal-close>
            <div class="component modal__container" role="dialog" aria-modal="true" aria-labelledby="modal-1-title">
                <header class="modal__header">
                  <h2 class="modal__title" id="modal-1-title">
                      ${title ?? "Dialog"}
                  </h2>
                  <button class="button modal__close" aria-label="Close modal" data-micromodal-close></button>
                </header>
                <main class="modal__content" id="${this.#getDialogElementContent()}">
                
                </main>
                <footer class="modal__footer">
                  <button
                    id="${this.continueButtonId}"
                    class="button modal__btn modal__btn-primary">${continueButtonContent ?? "Continue"
      }</button>
                  <button class="button modal__btn" data-micromodal-close aria-label="Close this dialog window">
                    ${closeButtonContent ?? "Close"}
                  </button>
                </footer>
            </div>
        </div>`;
  }

  init() {
    const wrapper = d3
      .select(document.body)
      .append("div")
      .attr("class", "modal micromodal-slide")
      .attr("id", this.modalId)
      .attr("aria-hidden", "true");

    wrapper.html(this.modalContentTemplate);

    d3.select(`#${this.#getDialogElementContent()}`)
      .node()
      .appendChild(this.mainContent.node());
  }

  show() {
    MicroModal.show(this.modalId, {
      awaitCloseAnimation: true,
    });

    if (this.focusOnContinue) {
      this.#focusContinueButton();
    }
  }

  close() {
    MicroModal.close(this.modalId);
  }

  #getDialogElementContent() {
    return `${this.modalId}-content`;
  }

  #focusContinueButton() {
    const continueButton = d3.select(`#${this.continueButtonId}`).node();
    if (continueButton) {
      continueButton.focus();
    }
  }
}
