import * as d3 from "d3";

// Warning: AI-generated component
export class FixationResultsComponent {
    constructor(selector, api) {
        this.selector = selector;
        this.component = d3.select(selector).classed("component", true);
        this.api = api;
        this.notification = null;
        this.resizeObserver = null;
        this.currentComponentWidth = 0;
        this.currentResultsData = null;

        this.initializeEventListeners();
        this.displayEmptyState();
    }

    initializeEventListeners() {
        this.api.onFixationCompleted((event, data) => {
            this.currentResultsData = data;
            this.displayResults(data);
        });
    }

    displayResults(data) {
        this.clearComponent();

        if (!data) {
            this.displayEmptyState();
            return;
        }

        this.initResizeObserver();
        this.renderInfoSection(data);
        this.renderModelInstancesSection(data.modelInstanceInfoById);
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
            .attr("class", "model-accordion")
            .property("open", true);

        const summary = this.renderAccordionHeader(accordion, instanceData.modelInstance.modelName, instanceId);
        this.addCopyButtonToHeader(summary, instanceData);

        const content = accordion.append("div")
            .style("margin-left", "1.5em")
            .style("margin-top", "0.5em");

        this.renderFactsSection(content, "Occurred Facts", instanceData.occurredFacts, true);
        this.renderFactsSection(content, "Not Occurred Facts", instanceData.notOccurredFacts, false);
    }

    renderAccordionHeader(accordion, modelName, instanceId) {
        const summary = accordion.append("summary")
            .style("cursor", "pointer")
            .style("padding", "0.25em 1em")
            .style("margin", "0 0 0.5em 0")
            .style("background", "var(--pale-background)")
            .style("border-radius", "3px")
            .style("border", "1px solid #949494")
            .style("font-weight", "bold")
            .style("outline", "none")
            .style("display", "flex")
            .style("align-items", "center");

        // Add arrow indicator
        summary.append("span")
            .attr("class", "accordion-arrow")
            .style("margin-right", "0.5em")
            // .style("transition", "transform 0.2s")
            .text("▼");

        const titleContainer = summary.append("div")
            .style("flex", "1");

        titleContainer.append("span")
            .text(`${modelName} `);

        titleContainer.append("span")
            .attr("class", "instance-id")
            .style("font-weight", "normal")
            .style("opacity", "0.7")
            .text(instanceId);

        // Update arrow rotation when accordion is toggled
        accordion.on("toggle", function () {
            const isOpen = this.open;
            d3.select(this).select(".accordion-arrow")
                .style("transform", isOpen ? "rotate(0deg)" : "rotate(-90deg)");
        });

        return summary;
    }

    addCopyButtonToHeader(header, instanceData) {
        header.append("button")
            .attr("class", "button")
            .style("margin-left", "1em")
            .style("padding", "0.25em 0.5em")
            .style("font-size", "0.7rem")
            .style("min-width", "5em")
            .text("Copy")
            .on("click", (event) => {
                event.stopPropagation();
                this.copyInstanceFactValues(instanceData, header.node());
            });
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

        // Add arrow indicator with consistent styling
        header.append("span")
            .style("margin-right", "0.5em")
            // .style("transition", "transform 0.2s")
            .style("width", "1em")
            .style("text-align", "center")
            .style("transform", isExpanded ? "rotate(0deg)" : "rotate(-90deg)")
            .text("▼");

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
        header.select("span")
            .style("transform", isHidden ? "rotate(0deg)" : "rotate(-90deg)");
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

    copyInstanceFactValues(instanceData, targetElement) {
        const occurredFacts = instanceData.occurredFacts || [];
        const factValues = occurredFacts.map(fact => {
            try {
                return typeof fact.factValue === 'string'
                    ? JSON.parse(fact.factValue)
                    : fact.factValue;
            } catch {
                return fact.factValue;
            }
        });

        const jsonString = JSON.stringify(factValues, null, 2);

        navigator.clipboard.writeText(jsonString)
            .then(() => this.showCopyNotification(targetElement, "Occurred facts copied!"))
            .catch(err => console.error("Failed to copy:", err));
    }

    truncateId(id) {
        if (id.length <= 16) return id;
        return `${id.substring(0, 8)}...${id.substring(id.length - 8)}`;
    }

    copyToClipboard(text, targetElement) {
        navigator.clipboard.writeText(text)
            .then(() => this.showCopyNotification(targetElement, "Copied!"))
            .catch(err => console.error("Failed to copy:", err));
    }

    showCopyNotification(targetElement, message) {
        if (this.notification) {
            this.notification.remove();
        }

        const position = targetElement.getBoundingClientRect();

        this.notification = d3.select("body")
            .append("div")
            .style("position", "fixed")
            .style("left", `${position.left}px`)
            .style("top", `${position.bottom + window.scrollY + 5}px`)
            .style("background", "var(--pale-background)")
            .style("border", "1px solid #949494")
            .style("padding", "0.25em 0.5em")
            .style("border-radius", "3px")
            .style("font-size", "0.8em")
            .style("z-index", "1000")
            .style("box-shadow", "0 2px 5px rgba(0,0,0,0.2)")
            .text(message);

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