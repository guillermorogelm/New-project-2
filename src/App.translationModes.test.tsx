import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import App from "./App";

describe("App translation modes", () => {
  it("starts English to Spanish mode with targetLanguage es", async () => {
    const { fetchMock } = setupRealtimeMocks();

    render(<App />);
    await userEvent.click(screen.getByRole("button", { name: /start listening/i }));

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
    await userEvent.selectOptions(screen.getByLabelText("Direction"), "es_to_en");
    await userEvent.click(screen.getByRole("button", { name: /start listening/i }));

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
    await userEvent.click(screen.getByRole("button", { name: /start listening/i }));

    await waitFor(() => {
      expect(screen.getByText("Listening")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole("button", { name: /switch direction/i }));

    expect(screen.getByRole("heading", { name: "Spanish Transcript" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "English Translation" })).toBeInTheDocument();
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
    expect(screen.getAllByText("--- Direction switched to Spanish → English ---")).toHaveLength(2);
  });
});

function setupRealtimeMocks() {
  const dataChannel = {
    readyState: "open",
    send: vi.fn(),
    close: vi.fn(),
    addEventListener: vi.fn()
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

  return { dataChannel, fetchMock };
}
