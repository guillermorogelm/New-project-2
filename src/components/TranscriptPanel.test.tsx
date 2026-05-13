import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TranscriptPanel } from "./TranscriptPanel";

describe("TranscriptPanel", () => {
  it("filters direction markers from the visual transcript", () => {
    render(
      <TranscriptPanel
        title="English Transcript"
        label="Source"
        text={"Hello.\n\n--- Direction switched to Spanish → English ---\n\nContinue."}
        emptyText="Empty"
        directionLabel="English → Spanish"
        isListening={false}
        highlightMedicalTerms={false}
      />
    );

    expect(screen.queryByText("--- Direction switched to Spanish → English ---")).not.toBeInTheDocument();
    expect(screen.getByText(/Hello/)).toBeInTheDocument();
    expect(screen.getByText(/Continue/)).toBeInTheDocument();
  });
});
