import { CausalBundleDataManager } from "../data/causal-bundle-data-manager";
import { UndoRedoManager } from "../undo-redo/undo-redo-manager";
import { AppContextMenuManager } from "./app-context-menu-manager";
import { AppEventManager } from "./app-event-manager";
import { AppLayoutManager } from "./app-layout-manager";
import { AppThemeManager } from "./app-theme-manager";
import MicroModal from "micromodal";

export class Application {
    init() {
        const contextMenuManager = new AppContextMenuManager();
        contextMenuManager.init();

        const causalBundleDataManager = new CausalBundleDataManager({ api: window.api });

        const undoRedoManager = new UndoRedoManager(window.api);

        const themeManager = new AppThemeManager();
        themeManager.init();

        const layoutManager = new AppLayoutManager();
        layoutManager.init(causalBundleDataManager, undoRedoManager, themeManager);

        const eventManager = new AppEventManager();
        eventManager.init();

        MicroModal.init();
    }
}
