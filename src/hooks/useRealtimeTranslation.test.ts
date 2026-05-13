import { describe, expect, it, vi } from "vitest";
import { sendOutputLanguageUpdate } from "./useRealtimeTranslation";

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
