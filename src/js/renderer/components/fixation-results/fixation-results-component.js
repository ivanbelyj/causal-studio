import * as d3 from "d3";

export class FixationResultsComponent {
    constructor(selector, api) {
        this.selector = selector;
        this.component = d3.select(selector).classed("component", true);
        this.api = api;
        this.notification = null;
        this.resizeObserver = null;
        this.currentComponentWidth = 0;

        this.initializeEventListeners();
        this.displayEmptyState();
    }

    initializeEventListeners() {
        this.api.onFixationCompleted((event, data) => this.displayResults(data));
    }

    displayResults(data) {
        this.clearComponent();

        if (!data) {
            this.displayEmptyState();
            return;
        }

        this.initResizeObserver();
        this.renderInfoSection(data);
        this.renderModelInstancesSection(data.modelInstanceElementsByModelInstanceId);
    }

    clearComponent() {
        this.component.html("");
    }

    displayEmptyState() {
        this.component.append("div")
            .text("No fixation results available. Run fixation to see results.")
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
        if (width !== this.currentComponentWidth) {
            this.currentComponentWidth = width;
            this.updateResponsiveLayout(width);
        }
    }

    updateResponsiveLayout(width) {
        const isCompactMode = width < 400;

        this.component.selectAll(".instance-id")
            .style("display", isCompactMode ? "none" : "inline");

        this.component.selectAll(".facts-content")
            .each(function () {
                const content = d3.select(this);
                if (content.style("display") !== "none") {
                    content.selectAll(".fact-id, .fact-id-header")
                        .style("display", isCompactMode ? "none" : "block");
                    content.selectAll(".fact-value")
                        .style("grid-column", isCompactMode ? "1 / -1" : "");
                }
            });
    }

    renderInfoSection(data) {
        const infoSection = this.component.append("div")
            .attr("class", "component__inner-item");

        infoSection.append("h3")
            .text("Fixation Results")
            .style("margin", "0 0 0.5em 0");

        this.addInfoRow(infoSection, "Seed", data.seed);
        this.addInfoRow(infoSection, "Elapsed Time", `${data.elapsedMilliseconds} ms`);
    }

    addInfoRow(container, label, value) {
        container.append("p")
            .style("margin", "0.25em 0")
            .html(`<strong>${label}:</strong> ${value}`);
    }

    renderModelInstancesSection(instancesData) {
        const instancesSection = this.component.append("div")
            .attr("class", "component__inner-item");

        instancesSection.append("h3")
            .text("Model Instances")
            .style("margin", "0 0 0.5em 0");

        Object.entries(instancesData).forEach(([instanceId, instanceData]) => {
            this.renderModelInstance(instancesSection, instanceId, instanceData);
        });
    }

    renderModelInstance(container, instanceId, instanceData) {
        const accordion = container.append("details")
            .attr("class", "instance-accordion")
            .property("open", true);

        this.renderAccordionHeader(accordion, instanceData.modelInstance.modelName, instanceId);

        const content = accordion.append("div")
            .style("margin-left", "1.5em")
            .style("margin-top", "0.5em");

        this.renderFactsSection(content, "Occurred Facts", instanceData.occurredFacts, true);
        this.renderFactsSection(content, "Not Occurred Facts", instanceData.notOccurredFacts, false);
    }

    renderAccordionHeader(accordion, modelName, instanceId) {
        const summary = accordion.append("summary")
            .style("cursor", "pointer")
            .style("padding", "0.5em 1em")
            .style("margin", "0 0 0.5em 0")
            .style("background", "var(--pale-background)")
            .style("border-radius", "3px")
            .style("border", "1px solid #949494")
            .style("font-weight", "bold")
            .style("outline", "none");

        summary.append("span")
            .text(`${modelName} `);

        summary.append("span")
            .attr("class", "instance-id")
            .style("font-weight", "normal")
            .style("opacity", "0.7")
            .text(instanceId);
    }

    renderFactsSection(container, title, facts, isExpanded) {
        const section = container.append("div")
            .style("margin-bottom", "1em");

        const { header, content } = this.createCollapsibleSection(section, title, isExpanded);

        if (!facts || facts.length === 0) {
            this.renderEmptyState(content, title);
            return;
        }

        this.renderFactsTable(content, facts);
    }

    createCollapsibleSection(container, title, isExpanded) {
        const header = container.append("div")
            .style("display", "flex")
            .style("align-items", "center")
            .style("cursor", "pointer")
            .style("margin-bottom", "0.5em")
            .on("click", () => this.toggleSectionVisibility(header, content));

        const arrow = header.append("span")
            .style("margin-right", "0.5em")
            .style("font-family", "monospace")
            .style("width", "1em")
            .style("text-align", "center")
            .text(isExpanded ? "▼" : "▶");

        header.append("h4")
            .text(title)
            .style("margin", "0")
            .style("font-size", "0.9em")
            .style("color", "var(--disabled-text)");

        const content = container.append("div")
            .attr("class", "facts-content")
            .style("display", isExpanded ? "grid" : "none")
            .style("grid-template-columns", "minmax(min-content, max-content) 1fr")
            .style("gap", "0.25em 0.5em")
            .style("margin-left", "1em")
            .style("align-items", "center");

        return { header, content };
    }

    toggleSectionVisibility(header, content) {
        const isHidden = content.style("display") === "none";
        content.style("display", isHidden ? "grid" : "none");
        header.select("span").text(isHidden ? "▼" : "▶");
        this.updateResponsiveLayout(this.currentComponentWidth);
    }

    renderEmptyState(container, title) {
        container.append("p")
            .style("grid-column", "1 / -1")
            .text(`No ${title.toLowerCase()}.`)
            .style("color", "var(--disabled-text)")
            .style("margin", "0");
    }

    renderFactsTable(container, facts) {
        this.renderTableHeaders(container);
        facts.forEach(fact => this.renderFactRow(container, fact));
        this.updateResponsiveLayout(this.currentComponentWidth);
    }

    renderTableHeaders(container) {
        container.append("div")
            .attr("class", "fact-id-header")
            .style("font-weight", "bold")
            .style("padding", "0.25em 0")
            .text("ID");

        container.append("div")
            .attr("class", "fact-value-header")
            .style("font-weight", "bold")
            .style("padding", "0.25em 0")
            .text("Value");
    }

    renderFactRow(container, fact) {
        const factId = fact.instanceFactId.factId;
        const factValue = fact.factValue;

        this.renderClickableCell(container, "fact-id", factId, this.truncateId(factId));
        this.renderClickableCell(container, "fact-value", factValue, factValue);
    }

    renderClickableCell(container, className, fullText, displayText) {
        container.append("div")
            .attr("class", className)
            .style("padding", "0.25em 0")
            .style("cursor", "pointer")
            .style("overflow", "hidden")
            .style("text-overflow", "ellipsis")
            .style("white-space", "nowrap")
            .attr("title", fullText)
            .on("click", (event) => {
                event.stopPropagation();
                this.copyToClipboard(fullText, event.target);
            })
            .text(displayText);
    }

    truncateId(id) {
        if (id.length <= 16) return id;
        return `${id.substring(0, 8)}...${id.substring(id.length - 8)}`;
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
        this.notification?.remove();
    }
}