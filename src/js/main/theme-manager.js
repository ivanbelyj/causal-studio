const { nativeTheme } = require("electron");
import Store from "electron-store";

const store = new Store();

const defaultTheme = "dark";

export class ThemeManager {
    static init() {
        const savedTheme = store.get("theme");
        const theme = savedTheme || defaultTheme;
        this.#setThemeCore(theme);
        return theme;
    }

    static setTheme(theme) {
        this.#setThemeCore(theme);
        store.set("theme", theme);
    }

    static #setThemeCore(theme) {
        nativeTheme.themeSource = theme;
    }

    static getTheme() {
        return nativeTheme.themeSource;
    }
}