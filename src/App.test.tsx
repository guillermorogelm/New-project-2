import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import App from "./App";

describe("App microphone errors", () => {
  it("shows an error when microphone permission fails", async () => {
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: {
        getUserMedia: vi
          .fn()
          .mockRejectedValue(new DOMException("Permission denied", "NotAllowedError"))
      }
    });

    render(<App />);

    await userEvent.click(screen.getAllByRole("button", { name: /start listening/i })[0]);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(/microphone permission was denied/i);
    });
    expect(screen.getByText("Error")).toBeInTheDocument();
  });
});
