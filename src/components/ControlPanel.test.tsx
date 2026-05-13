import { fireEvent, render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";
import { ControlPanel } from "./ControlPanel";
import type { RealtimeStatus } from "../hooks/useRealtimeTranslation";

describe("ControlPanel", () => {
  it("renders the direction selector options", () => {
    renderControlPanel("idle");

    expect(screen.getAllByRole("radio", { name: "English → Spanish" }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("radio", { name: "Spanish → English" }).length).toBeGreaterThan(0);
  });

  it.each<RealtimeStatus>(["connecting", "listening"])("shows Stop while %s", (status) => {
      renderControlPanel(status);

      expect(screen.getAllByRole("button", { name: /stop/i }).length).toBeGreaterThan(0);
    }
  );

  it("starts on pointerdown and stops on pointerup in Hold to Listen mode", () => {
    const onHoldStart = vi.fn();
    const onHoldEnd = vi.fn();
    renderControlPanel("idle", { listeningMode: "hold", onHoldStart, onHoldEnd });

    const holdButton = screen.getAllByRole("button", { name: /hold to listen/i })[0];
    fireEvent.pointerDown(holdButton);
    fireEvent.pointerUp(holdButton);

    expect(onHoldStart).toHaveBeenCalledTimes(1);
    expect(onHoldEnd).toHaveBeenCalledTimes(1);
  });
});

function renderControlPanel(
  status: RealtimeStatus,
  overrides: Partial<ComponentProps<typeof ControlPanel>> = {}
) {
  return render(
    <ControlPanel
      status={status}
      translationMode="en_to_es"
      activeTargetLanguage="es"
      detectedSourceLanguage="unknown"
      listeningMode="continuous"
      isHolding={false}
      isVoiceDetected={false}
      autoStopCountdownSeconds={180}
      durationSeconds={0}
      estimatedCost={0}
      hasTranscript={false}
      playTranslatedAudio={false}
      highlightMedicalTerms
      onTranslationModeChange={vi.fn()}
      onSwitchDirection={vi.fn()}
      onListeningModeChange={vi.fn()}
      onHoldStart={vi.fn()}
      onHoldEnd={vi.fn()}
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
      {...overrides}
    />
  );
}
