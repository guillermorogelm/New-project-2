import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ControlPanel } from "./ControlPanel";
import type { RealtimeStatus } from "../hooks/useRealtimeTranslation";

describe("ControlPanel", () => {
  it.each<RealtimeStatus>(["connecting", "listening"])(
    "disables Start Listening while %s",
    (status) => {
      renderControlPanel(status);

      expect(screen.getByRole("button", { name: /start listening/i })).toBeDisabled();
    }
  );
});

function renderControlPanel(status: RealtimeStatus) {
  return render(
    <ControlPanel
      status={status}
      targetLanguage="es"
      hasTranscript={false}
      playTranslatedAudio={false}
      highlightMedicalTerms
      onTargetLanguageChange={vi.fn()}
      onStart={vi.fn()}
      onStop={vi.fn()}
      onClear={vi.fn()}
      onCopy={vi.fn()}
      onSave={vi.fn()}
      onPlayTranslatedAudioChange={vi.fn()}
      onHighlightMedicalTermsChange={vi.fn()}
      onHideEnglish={vi.fn()}
      onHideSpanish={vi.fn()}
      onShowBoth={vi.fn()}
      onToggleLowerRegisterHelper={vi.fn()}
    />
  );
}
