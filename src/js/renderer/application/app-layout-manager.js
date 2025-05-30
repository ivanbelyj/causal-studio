import * as d3 from 'd3';
import { LayoutManager } from '../layout/layout-manager';
import { CausalBundleDataManager } from '../data/causal-bundle-data-manager';
import { UndoRedoManager } from '../undo-redo/undo-redo-manager';
import { AppThemeManager } from './app-theme-manager';

export class AppLayoutManager {
    /**
     * @param {CausalBundleDataManager} causalBundleDataManager 
     * @param {UndoRedoManager} undoRedoManager 
     * @param {AppThemeManager} themeManager
     */
    init(causalBundleDataManager, undoRedoManager, themeManager) {
        const layoutContainer = d3.select("body").append("div");
        const componentsManager = new LayoutManager(
            layoutContainer.node(),
            window.api,
            causalBundleDataManager,
            undoRedoManager,
            themeManager
        );
        componentsManager.initLayout();
    }
}
