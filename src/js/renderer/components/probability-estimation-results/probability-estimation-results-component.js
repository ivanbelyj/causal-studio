import * as d3 from "d3";

// Warning: AI-generated component
export class ProbabilityEstimationResultsComponent {
    constructor(selector, api) {
        this.selector = selector;
        this.component = d3.select(selector).classed("component", true);
        this.api = api;
        this.notification = null;
        this.resizeObserver = null;
        this.currentComponentWidth = 0;
        this.resizeRequestId = null;
        this.showThreeColumns = true; // Track current layout state

        this.initializeEventListeners();
        this.displayResults(null);
    }

    initializeEventListeners() {
        this.api.onProbabilityEstimationCompleted((event, data) => this.displayResults(data));
    }

    displayResults(data) {
        this.clearComponent();

        if (!data) {
            this.showEmptyState();
            return;
        }

        // Store current width before re-rendering
        const currentWidth = this.currentComponentWidth;
        this.showThreeColumns = currentWidth >= 400;

        this.initResizeObserver();
        this.renderInfoSection(data);
        this.renderProbabilitiesSection(data.factsInfoByModelName);

        // Apply current layout immediately
        this.adjustLayout(this.showThreeColumns);
    }

    clearComponent() {
        this.component.html("");
    }

    showEmptyState() {
        this.component.append("div")
            .text("No probability estimation results available. Run estimation to see results.")
            .style("color", "var(--disabled-text)");
    }

    initResizeObserver() {
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }

        this.resizeObserver = new ResizeObserver(entries => {
            this.handleResize(entries[0].contentRect.width);
        });

        this.resizeObserver.observe(this.component.node());
    }

    handleResize(width) {
        if (this.resizeRequestId) {
            cancelAnimationFrame(this.resizeRequestId);
        }

        this.resizeRequestId = requestAnimationFrame(() => {
            if (Math.abs(width - this.currentComponentWidth) > 1) {
                this.currentComponentWidth = width;
                this.showThreeColumns = width >= 400;
                this.updateResponsiveLayout(this.showThreeColumns);
            }
            this.resizeRequestId = null;
        });
    }

    updateResponsiveLayout(showThreeColumns) {
        this.adjustLayout(showThreeColumns);
    }

    adjustLayout(showThreeColumns) {
        this.component.selectAll(".probabilities-content")
            .each(function () {
                const content = d3.select(this);
                const displayStyle = showThreeColumns ? "block" : "none";

                content.style("grid-template-columns",
                    showThreeColumns
                        ? "minmax(120px, auto) minmax(150px, 1fr) minmax(50px, auto)"
                        : "1fr minmax(50px, auto)");

                content.selectAll(".fact-id, .fact-id-header").style("display", displayStyle);
                content.selectAll(".fact-value, .fact-value-header, .probability-value, .probability-header")
                    .style("display", "block");
            });
    }

    renderInfoSection(data) {
        const infoSection = this.component.append("div")
            .attr("class", "component__inner-item");

        infoSection.append("h3")
            .text("Probability Estimation Results")
            .style("margin", "0 0 0.5em 0");

        this.addInfoRow(infoSection, "Simulations Count", data.simulationsCount.toLocaleString());
        this.addInfoRow(infoSection, "Total Time", `${data.totalMilliseconds} ms`);
        this.addInfoRow(infoSection, "Average Time", `${data.averageTimeMilliseconds.toFixed(4)} ms`);
    }

    addInfoRow(container, label, value) {
        container.append("p")
            .style("margin", "0.25em 0")
            .html(`<strong>${label}:</strong> ${value}`);
    }

    renderProbabilitiesSection(probabilitiesData) {
        const section = this.component.append("div")
            .attr("class", "component__inner-item")
            .style("margin-bottom", "1em"); // Добавлен отступ между секциями

        section.append("h3")
            .text("Fact Probabilities by Model")
            .style("margin", "0 0 0.5em 0");

        Object.entries(probabilitiesData).forEach(([modelName, factsData]) => {
            this.renderModelSection(section, modelName, factsData);
        });
    }

    renderModelSection(container, modelName, factsData) {
        const accordion = container.append("details")
            .attr("class", "model-accordion")
            .property("open", true);

        this.renderAccordionHeader(accordion, modelName);
        this.renderFactsTable(accordion, factsData);
    }

    renderAccordionHeader(accordion, modelName) {
        accordion.append("summary")
            .style("cursor", "pointer")
            .style("padding", "0.5em 1em")
            .style("margin", "0 0 0.5em 0")
            .style("background", "var(--pale-background)")
            .style("border-radius", "3px")
            .style("border", "1px solid #949494")
            .style("font-weight", "bold")
            .style("outline", "none")
            .append("span")
            .text(modelName);
    }

    renderFactsTable(accordion, factsData) {
        const content = accordion.append("div")
            .attr("class", "probabilities-content")
            .style("margin-left", "1.5em")
            .style("margin-top", "0.5em")
            .style("display", "grid")
            .style("gap", "0.5em 1em")
            .style("align-items", "center")
            .style("margin-bottom", "1em");

        this.renderTableHeaders(content);
        this.renderTableRows(content, factsData);
    }

    renderTableHeaders(content) {
        content.append("div").attr("class", "fact-id-header")
            .style("font-weight", "bold").style("padding", "0.25em 0").text("ID");
        content.append("div").attr("class", "fact-value-header")
            .style("font-weight", "bold").style("padding", "0.25em 0").text("Value");
        content.append("div").attr("class", "probability-header")
            .style("font-weight", "bold").style("padding", "0.25em 0").text("Probability");
    }

    renderTableRows(content, factsData) {
        Object.values(factsData)
            .sort((a, b) => b.estimatedProbability - a.estimatedProbability)
            .forEach(factInfo => this.renderFactRow(content, factInfo));
    }

    renderFactRow(content, factInfo) {
        const { factLocalId: id, factValue: value, estimatedProbability: probability } = factInfo;
        const percentage = (probability * 100).toFixed(2) + '%';

        this.renderCell(content, "fact-id", id, this.truncateId(id), id);
        this.renderCell(content, "fact-value", value, value, value);
        this.renderProbabilityCell(content, probability, percentage);
    }

    renderCell(content, className, fullText, displayText, copyValue) {
        content.append("div")
            .attr("class", className)
            .style("padding", "0.25em 0")
            .style("cursor", "pointer")
            .style("overflow", "hidden")
            .style("text-overflow", "ellipsis")
            .style("white-space", "nowrap")
            .attr("title", fullText)
            .on("click", (event) => {
                event.stopPropagation();
                this.copyToClipboard(copyValue, event.target);
            })
            .text(displayText);
    }

    renderProbabilityCell(content, probability, percentage) {
        content.append("div")
            .attr("class", "probability-value")
            .style("padding", "0.25em 0")
            .style("color", "var(--color)")
            .append("span")
            .style("background", this.getProbabilityColor(probability))
            .style("padding", "0.25em 0.5em")
            .style("border-radius", "3px")
            .text(percentage);
    }

    truncateId(id) {
        if (id.length <= 16) return id;
        return `${id.substring(0, 8)}...${id.substring(id.length - 8)}`;
    }

    getProbabilityColor(probability) {
        const hue = Math.round(probability * 120);
        return `hsla(${hue}, 85%, 50%, 0.3)`;
    }

    copyToClipboard(text, targetElement) {
        navigator.clipboard.writeText(text)
            .then(() => this.showCopyNotification(targetElement))
            .catch(err => console.error("Failed to copy:", err));
    }

    showCopyNotification(targetElement) {
        if (this.notification) {
            this.notification.remove();
        }

        const position = d3.select(targetElement).node().getBoundingClientRect();

        this.notification = d3.select("body")
            .append("div")
            .style("position", "fixed")
            .style("left", `${position.left}px`)
            .style("top", `${position.top}px`)
            .style("transform", "translateY(-100%)")
            .style("background", "var(--pale-background)")
            .style("border", "1px solid #949494")
            .style("padding", "0.25em 0.5em")
            .style("border-radius", "3px")
            .style("font-size", "0.8em")
            .style("z-index", "1000")
            .style("box-shadow", "0 2px 5px rgba(0,0,0,0.2)")
            .text("Copied!");

        setTimeout(() => {
            this.notification?.remove();
            this.notification = null;
        }, 1500);
    }

    destroy() {
        this.resizeObserver?.disconnect();
        if (this.resizeRequestId) {
            cancelAnimationFrame(this.resizeRequestId);
        }
        this.notification?.remove();
    }
}