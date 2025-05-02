import { Command } from "../undo-redo/commands/command";

export default class BlockUtils {
    static getBlockCauseNames(blockCausesConventions, causesConventionName) {
        const blockCauses = blockCausesConventions
            .find(x => x.name === causesConventionName)
            ?.causes;
        return blockCauses ?? [];
    }

    static getBlockConsequenceNames(blockConventions, conventionName) {
        const blockConsequences = blockConventions
            .find(x => x.name === conventionName)
            ?.consequences;
        return blockConsequences ?? [];
    }

    /**
     * Removes block consequence mapping if causeId is a falsy value,
     * or sets it to causeId otherwise.
     */
    static setOrRemoveBlockConsequenceMapping(block, blockConsequenceName, causeId) {
        if (causeId) {
            block.blockConsequencesMap[blockConsequenceName] = causeId;
        } else {
            delete block.blockConsequencesMap[blockConsequenceName];
        }
    }

    static createCauseIdByBlockConsequence(causalModelBlockId, selectedConsequence) {
        return `${selectedConsequence}_${causalModelBlockId}`;
    }

    static hasCauseIdMappedAsConsequence(declaredBlock, causeId) {
        return !!(BlockUtils.getCauseIdsMappedAsConsequences(declaredBlock).find(x => x === causeId));
    }

    static getCauseIdsMappedAsConsequences(declaredBlock) {
        return Object.values(declaredBlock.blockConsequencesMap);
    }

    // For Undo-redo
    static createChangeBlockConsequenceMappingCommand(declaredBlock, blockConsequenceName) {
        const {
            executeCallback,
            undoCallback,
            causeId
        } = BlockUtils.getChangeBlockConsequenceMappingCallbacks(declaredBlock, blockConsequenceName);
        return new Command(executeCallback, undoCallback);
    }

    // For Undo-redo
    static getChangeBlockConsequenceMappingCallbacks(declaredBlock, blockConsequenceName) {
        const setOrRemoveBlockConsequenceMapping = (causeId) => {
            BlockUtils.setOrRemoveBlockConsequenceMapping(
                declaredBlock,
                blockConsequenceName,
                causeId);
        }

        const causeId = BlockUtils.createCauseIdByBlockConsequence(
            declaredBlock.id,
            blockConsequenceName);

        // Undefined -> mapping will be removed on undo
        // Actual cause id -> previous actual cause id will be restored
        const previousCauseId = declaredBlock.blockConsequencesMap[blockConsequenceName];

        return {
            executeCallback: () => setOrRemoveBlockConsequenceMapping(causeId),
            undoCallback: () => setOrRemoveBlockConsequenceMapping(previousCauseId),
            causeId
        };
    }
}