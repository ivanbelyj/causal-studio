import { ConfirmationDialog } from "../../elements/confirmation-dialog";
import { PromptDialog } from "../../elements/prompt-dialog";

/**
 * Manages dialogs for Add / Remove / Rename in project view
 */
export class ProjectViewContextMenuDialogHelper {
    constructor({
        dialogIdInfix,
        entityDisplayName,
        handleAdd,
        handleRemove,
        handleRename,
    }) {
        this.renameDialog = new PromptDialog(`rename-${dialogIdInfix}-dialog`, {
            title: `Rename ${entityDisplayName}`,
            continueButtonContent: "Rename",
            closeButtonContent: "Cancel",
            inputPlaceholder: "Enter new name",
            onContinueClicked: (newName) => {
                handleRename(this.entityNameToRename, newName);
            },
        });
        this.renameDialog.init();

        this.createDialog = new PromptDialog(`create-${dialogIdInfix}-dialog`, {
            title: `Create ${entityDisplayName}`,
            continueButtonContent: "Create",
            closeButtonContent: "Cancel",
            inputPlaceholder: `Enter ${entityDisplayName} name`,
            onContinueClicked: (modelName) => handleAdd(modelName),
        });
        this.createDialog.init();

        this.removeDialog = new ConfirmationDialog(`remove-${dialogIdInfix}-dialog`, {
            title: `Remove ${entityDisplayName}`,
            message: `Are you sure you want to delete this ${entityDisplayName}?`,
            yesButtonContent: "Remove",
            noButtonContent: "Cancel",
            onYesClicked: () => {
                handleRemove(this.entityNameToRemove);
            },
            onNoClicked: () => {
                console.log("Entity deletion canceled.");
            },
        });
        this.removeDialog.init();
    }

    add() {
        this.createDialog.show()
    }

    rename(name) {
        // Todo: It's bad solution, but it works for now...
        this.entityNameToRename = name;
        this.renameDialog.show(name)
    }

    remove(name) {
        this.entityNameToRemove = name;
        this.removeDialog.show();
    }
}
