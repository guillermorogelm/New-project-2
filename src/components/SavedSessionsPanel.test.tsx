import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SavedSessionsPanel } from "./SavedSessionsPanel";

describe("SavedSessionsPanel", () => {
  it("is collapsed by default", () => {
    render(
      <SavedSessionsPanel
        onDelete={vi.fn()}
        sessions={[
          {
            id: "1",
            timestamp: new Date("2026-05-12T10:00:00Z").toISOString(),
            direction: "English → Spanish",
            sourceTranscript: "The patient has pain.",
            translatedTranscript: "El paciente tiene dolor.",
            detectedTerms: []
          }
        ]}
      />
    );

    expect(screen.getByRole("button", { name: /saved sessions/i })).toHaveAttribute(
      "aria-expanded",
      "false"
    );
    expect(screen.queryByText("The patient has pain.")).not.toBeInTheDocument();
  });
});
