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
      translationMode="en_to_es"
      activeTargetLanguage="es"
      detectedSourceLanguage="unknown"
      hasTranscript={false}
      playTranslatedAudio={false}
      highlightMedicalTerms
      onTranslationModeChange={vi.fn()}
      onSwitchDirection={vi.fn()}
      onStart={vi.fn()}
      onStop={vi.fn()}
      onClear={vi.fn()}
      onCopy={vi.fn()}
      onSave={vi.fn()}
      onPlayTranslatedAudioChange={vi.fn()}
      onHighlightMedicalTermsChange={vi.fn()}
      onHideSource={vi.fn()}
      onHideTarget={vi.fn()}
      onShowBoth={vi.fn()}
      onToggleLowerRegisterHelper={vi.fn()}
    />
  );
}
