import * as d3 from "d3";
import { Dialog } from "./dialog.js";

export class PromptDialog extends Dialog {
    constructor(
        modalId,
        {
            title = "Prompt",
            continueButtonContent = "Continue",
            closeButtonContent = "Close",
            inputPlaceholder = "Enter value",
            onContinueClicked,
            validatePrompt,
        }
    ) {
        const mainContent = d3.create("div").classed("input-item", true);

        mainContent
            .append("input")
            .attr("id", `${modalId}-input-id`)
            .classed("input-item text-input input-item__input", true)
            .attr("type", "text")
            .attr("placeholder", inputPlaceholder);

        super(modalId, {
            title,
            mainContent,
            continueButtonContent,
            closeButtonContent,
        });

        this.modalId = modalId;
        this.onContinueClicked = onContinueClicked;
        this.validatePrompt = validatePrompt;
        this.continueButtonId = `${modalId}-continue-button-id`;
        this.inputId = `${modalId}-input-id`;

        this.isCallbackSubscribed = false;
    }

    init() {
        super.init();

        d3.select(`#${this.continueButtonId}`).on("click", () => {
            const inputValue = d3.select(`#${this.inputId}`).property("value").trim();
            const validationResult = this.validatePrompt?.(inputValue);
            const isInputValid = validationResult?.isValid ?? true;
            if (inputValue && isInputValid) {
                this.onContinueClicked(inputValue.trim());
                this.close();
            } else {
                window.api.sendShowDialog("error", {
                    title: "Invalid input",
                    message: validationResult?.message
                        ?? "Please enter a valid value."
                });
            }
        });
    }

    show(initialValue = "") {
        d3.select(`#${this.inputId}`).property("value", initialValue);

        super.show();

        this.#focusInput();
    }

    #focusInput() {
        const inputElement = d3.select(`#${this.inputId}`).node();
        if (inputElement) {
            inputElement.focus();
            inputElement.select();
        }
    }
}