import * as d3 from "d3";
import { Dialog } from "./dialog.js";

export class ConfirmationDialog extends Dialog {
    constructor(
        modalId,
        {
            title = "Confirmation",
            message = "Are you sure?",
            yesButtonContent = "Yes",
            noButtonContent = "No",
            onYesClicked,
            onNoClicked,
        }
    ) {
        // Создаем содержимое для модального окна
        const mainContent = d3.create("div").classed("input-item", true).text(message);

        // Вызываем конструктор базового класса
        super(modalId, {
            title,
            mainContent,
            continueButtonContent: yesButtonContent,
            closeButtonContent: noButtonContent,
            focusOnContinue: true
        });

        this.modalId = modalId;
        this.onYesClicked = onYesClicked;
        this.onNoClicked = onNoClicked;
        this.yesButtonId = `${modalId}-continue-button-id`;
        this.noButtonId = `${modalId}-close-button-id`;

        this.isYesCallbackSubscribed = false;
        this.isNoCallbackSubscribed = false;
    }

    init() {
        super.init();

        if (!this.isYesCallbackSubscribed) {
            d3.select(`#${this.yesButtonId}`).on("click", () => {
                if (this.onYesClicked) {
                    this.onYesClicked();
                }
                this.close();
            });
            this.isYesCallbackSubscribed = true;
        }

        if (!this.isNoCallbackSubscribed) {
            d3.select(`#${this.noButtonId}`).on("click", () => {
                if (this.onNoClicked) {
                    this.onNoClicked();
                }
                this.close();
            });
            this.isNoCallbackSubscribed = true;
        }
    }

    show() {
        super.show();
    }
}