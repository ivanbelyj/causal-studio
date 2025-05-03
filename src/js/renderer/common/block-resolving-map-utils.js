export default class BlockResolvingMapUtils {
    static getBlockResolvingOptionValuesAndTexts(causalBundleProvider) {
        const causalModelNames = causalBundleProvider.causalModels.map(x => x.name);
        return {
            // Seems like browser handles 'null' for select option in some specific
            // way, so we use empty string as a marker
            optionValues: ["", ...causalModelNames],
            optionTexts: [
                BlockResolvingMapUtils.#getDynamicOptionText(causalBundleProvider),
                ...causalModelNames],
        }
    }
    static #getDynamicOptionText(causalBundleProvider) {
        if (causalBundleProvider.causalModels.length === 0) {
            return "[Not specified]";
        }

        const defaultMainModelName = causalBundleProvider.defaultMainModel;
        if (defaultMainModelName === defaultMainModelName.toUpperCase()) {
            return "[NOT SPECIFIED]";
        } else if (defaultMainModelName === defaultMainModelName.toLowerCase()) {
            return "[not specified]";
        }
        return "[Not specified]";
    }
}