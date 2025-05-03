import BlockResolvingMapUtils from "../../common/block-resolving-map-utils";
import { ProjectDataComponent } from "../convention-components/project-data-component";
import { blockResolvingMapNodeType } from "../project-view/js-tree-data-utils";
import { BlockResolvingMapDataProvider } from "../providers/block-resolving-map-data-provider";

export class BlockResolvingMapComponent extends ProjectDataComponent {
    constructor(selector, api, undoRedoManager, causalBundleProvider) {
        super(selector, api, undoRedoManager);
        this.causalBundleProvider = causalBundleProvider;
    }

    shouldRenderOnProjectViewNodeSelected(arg) {
        return arg.nodeData.type === blockResolvingMapNodeType
            && arg.nodeData.isRoot;
    }

    render(data) {
        for (const convention of this.projectData.blockConventions) {
            this.appendSelectItem({
                name: convention.name,
                inputId: `model-by-convention-input-${convention.name}`,
                isReadonly: false,
                propName: convention.name,
                isInnerProp: true,
                // Set to 'undefined' to make this property not serialized
                // when it was not set
                processValueBeforeSet: (newValue) => newValue || undefined,
                ...BlockResolvingMapUtils.getBlockResolvingOptionValuesAndTexts(this.causalBundleProvider),
            });
        }
    }

    getDataForProvider({ projectData, name }) {
        return projectData;
    }

    // 1. 
    // resolvingMap is a part of project data.
    // resolvingMap contains:
    // modelNamesByConventionName, modelNamesByDeclaredBlockId

    createDataProvider() {
        return new BlockResolvingMapDataProvider(this.undoRedoManager);
    }
}
