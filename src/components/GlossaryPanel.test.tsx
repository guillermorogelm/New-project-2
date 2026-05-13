import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GlossaryPanel } from "./GlossaryPanel";

describe("GlossaryPanel", () => {
  it("shows detected terms before the built-in glossary", () => {
    render(
      <GlossaryPanel
        showLowerRegisterHelper={false}
        detectedTerms={[
          {
            term: "COPD",
            english: "chronic obstructive pulmonary disease",
            spanish: "EPOC"
          }
        ]}
      />
    );

    const detectedHeading = screen.getByText("Detected terms");
    const glossarySummary = screen.getByText("Built-in glossary");

    expect(detectedHeading.compareDocumentPosition(glossarySummary)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
    expect(screen.getAllByText("COPD").length).toBeGreaterThan(0);
  });
});
