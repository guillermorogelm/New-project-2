import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import App from "./App";

describe("App translation modes", () => {
  it("starts English to Spanish mode with targetLanguage es", async () => {
    const { fetchMock } = setupRealtimeMocks();

    render(<App />);
    await userEvent.click(screen.getAllByRole("button", { name: /start listening/i })[0]);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/realtime/session",
        expect.objectContaining({
          body: JSON.stringify({ targetLanguage: "es" })
        })
      );
    });
  });

  it("starts Spanish to English mode with targetLanguage en", async () => {
    const { fetchMock } = setupRealtimeMocks();

    render(<App />);
    await userEvent.click(screen.getAllByRole("radio", { name: "Spanish → English" })[0]);
    await userEvent.click(screen.getAllByRole("button", { name: /start listening/i })[0]);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/realtime/session",
        expect.objectContaining({
          body: JSON.stringify({ targetLanguage: "en" })
        })
      );
    });
  });

  it("switches direction while listening and sends session.update", async () => {
    const { dataChannel } = setupRealtimeMocks();

    render(<App />);
    await userEvent.click(screen.getAllByRole("button", { name: /start listening/i })[0]);

    await waitFor(() => {
      expect(screen.getByText("Listening")).toBeInTheDocument();
    });

    await userEvent.click(screen.getAllByRole("button", { name: /switch direction/i })[0]);

    expect(screen.getAllByRole("heading", { name: "Spanish Transcript" }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("heading", { name: "English Translation" }).length).toBeGreaterThan(0);
    expect(dataChannel.send).toHaveBeenCalledWith(
      JSON.stringify({
        type: "session.update",
        session: {
          audio: {
            output: {
              language: "en"
            }
          }
        }
      })
    );
    expect(screen.queryByText("--- Direction switched to Spanish → English ---")).not.toBeInTheDocument();
    expect(screen.getByText("Direction switched to Spanish → English.")).toBeInTheDocument();
  });

  it("copies a formatted transcript with source and translation", async () => {
    const { emitEvent } = setupRealtimeMocks();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText }
    });

    render(<App />);
    await userEvent.click(screen.getAllByRole("button", { name: /start listening/i })[0]);

    await waitFor(() => {
      expect(screen.getByText("Listening")).toBeInTheDocument();
    });

    await act(async () => {
      emitEvent({ type: "session.input_transcript.delta", delta: "The patient has pain." });
      emitEvent({ type: "session.output_transcript.delta", delta: "El paciente tiene dolor." });
    });

    await waitFor(() => {
      expect(screen.getAllByRole("button", { name: /^copy$/i })[0]).not.toBeDisabled();
    });

    await userEvent.click(screen.getAllByRole("button", { name: /^copy$/i })[0]);

    expect(writeText).toHaveBeenCalledWith(expect.stringContaining("Source transcript"));
    expect(writeText.mock.calls[0][0]).toContain("The patient has pain.");
    expect(writeText.mock.calls[0][0]).toContain("El paciente tiene dolor.");
  });
});

function setupRealtimeMocks() {
  let messageHandler: ((message: { data: string }) => void) | null = null;
  const dataChannel = {
    readyState: "open",
    send: vi.fn(),
    close: vi.fn(),
    addEventListener: vi.fn((event: string, handler: (message: { data: string }) => void) => {
      if (event === "message") {
        messageHandler = handler;
      }
    })
  };

  const track = { stop: vi.fn() };
  const mediaStream = {
    getAudioTracks: vi.fn(() => [track]),
    getTracks: vi.fn(() => [track])
  };

  Object.defineProperty(navigator, "mediaDevices", {
    configurable: true,
    value: {
      getUserMedia: vi.fn().mockResolvedValue(mediaStream)
    }
  });

  class MockRTCPeerConnection {
    connectionState = "connected";
    onconnectionstatechange: (() => void) | null = null;
    ontrack: ((event: RTCTrackEvent) => void) | null = null;
    addTrack = vi.fn();
    close = vi.fn();
    createDataChannel = vi.fn(() => dataChannel);
    createOffer = vi.fn(async () => ({ type: "offer", sdp: "offer-sdp" }));
    getSenders = vi.fn(() => [{ track }]);
    setLocalDescription = vi.fn(async () => undefined);
    setRemoteDescription = vi.fn(async () => undefined);
  }

  vi.stubGlobal("RTCPeerConnection", MockRTCPeerConnection);

  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const url = typeof input === "string" ? input : input.toString();

    if (url === "/api/realtime/session") {
      return new Response(JSON.stringify({ client_secret: "ek_test" }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    if (url === "https://api.openai.com/v1/realtime/translations/calls") {
      return new Response("answer-sdp", { status: 200 });
    }

    return new Response("Not found", { status: 404 });
  });
  vi.stubGlobal("fetch", fetchMock);

  return {
    dataChannel,
    fetchMock,
    emitEvent: (event: unknown) => {
      messageHandler?.({ data: JSON.stringify(event) });
    }
  };
}
