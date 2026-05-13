import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { sendOutputLanguageUpdate, useRealtimeTranslation } from "./useRealtimeTranslation";

describe("sendOutputLanguageUpdate", () => {
  it("sends a valid session.update event with audio.output.language", () => {
    const dataChannel = {
      readyState: "open",
      send: vi.fn()
    } as Pick<RTCDataChannel, "readyState" | "send">;

    expect(sendOutputLanguageUpdate(dataChannel, "en")).toBe(true);

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
  });
});

describe("useRealtimeTranslation safety controls", () => {
  it("allows stop to be called multiple times without throwing", async () => {
    const { dataChannel } = setupRealtimeMocks();

    render(<RealtimeHarness />);
    await userEvent.click(screen.getByRole("button", { name: "Start" }));

    await waitFor(() => {
      expect(screen.getByText("listening")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole("button", { name: "Stop twice" }));

    await waitFor(() => {
      expect(screen.getByText("idle")).toBeInTheDocument();
    });
    expect(dataChannel.close).toHaveBeenCalled();
  });

  it("switching to Hold to Listen mode stops a continuous session", async () => {
    const { dataChannel } = setupRealtimeMocks();

    render(<RealtimeHarness />);
    await userEvent.click(screen.getByRole("button", { name: "Start" }));

    await waitFor(() => {
      expect(screen.getByText("listening")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole("button", { name: "Hold mode" }));

    await waitFor(() => {
      expect(screen.getByText("idle")).toBeInTheDocument();
    });
    expect(dataChannel.close).toHaveBeenCalled();
  });
});

function RealtimeHarness() {
  const realtime = useRealtimeTranslation({ playTranslatedAudio: false });

  return (
    <div>
      <p>{realtime.status}</p>
      <button type="button" onClick={() => void realtime.start()}>
        Start
      </button>
      <button
        type="button"
        onClick={() => {
          realtime.stop();
          realtime.stop();
        }}
      >
        Stop twice
      </button>
      <button type="button" onClick={() => realtime.setListeningMode("hold")}>
        Hold mode
      </button>
    </div>
  );
}

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

  return { dataChannel };
}
