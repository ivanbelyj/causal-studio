import * as d3 from 'd3';
const eventBus = require("js-event-bus")();

export class AppThemeManager {
    init() {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        mediaQuery.addEventListener("change", (e) => {
            this.updateTheme(e.matches);
        });

        // Main process loads user's theme preference from config
        // and sends an event. We should update js-tree theme.
        // Without this fix js-tree theme won't be updated
        window.api.onThemeSet((event) => {
            this.updateTheme(mediaQuery.matches);
        });

        this.initTheme();
        this.updateTheme(mediaQuery.matches);
    }

    initTheme() {
        d3.select("head")
            .append("link")
            .attr("rel", "stylesheet")
            .attr("id", "goldenlayout-theme-link");
        d3.select("head")
            .append("link")
            .attr("rel", "stylesheet")
            .attr("id", "theme-link");
    }

    updateTheme(isDarkTheme) {
        d3.select("#goldenlayout-theme-link").attr(
            "href",
            `../goldenlayout${isDarkTheme ? "Dark" : "Light"}.css`
        );
        d3.select("#theme-link").attr(
            "href",
            `../${isDarkTheme ? "dark" : "light"}.css`
        );
        eventBus.emit("themeChanged", null, { isDarkTheme });
    }
}
