import cors from "cors";
import dotenv from "dotenv";
import express, { type Request, type Response } from "express";

dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 3001);

const OPENAI_TRANSLATION_SECRET_URL =
  "https://api.openai.com/v1/realtime/translations/client_secrets";

app.use(cors({ origin: true }));
app.use(express.json());

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ ok: true, service: "cmit-live-interpreter-trainer" });
});

app.post("/api/realtime/session", async (req: Request, res: Response) => {
  if (!process.env.OPENAI_API_KEY) {
    res.status(500).json({
      error: "OPENAI_API_KEY is required on the server to create a Realtime session."
    });
    return;
  }

  const requestedTargetLanguage =
    typeof req.body?.targetLanguage === "string" ? req.body.targetLanguage.trim() : "es";
  const targetLanguage = requestedTargetLanguage === "en" ? "en" : "es";

  try {
    const response = await fetch(OPENAI_TRANSLATION_SECRET_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        session: {
          model: "gpt-realtime-translate",
          audio: {
            input: {
              transcription: { model: "gpt-realtime-whisper" },
              noise_reduction: { type: "near_field" }
            },
            output: {
              language: targetLanguage || "es"
            }
          }
        }
      })
    });

    const text = await response.text();
    let data: unknown = text;

    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { message: text };
    }

    if (!response.ok) {
      console.error("OpenAI Realtime Translation session error", {
        status: response.status,
        statusText: response.statusText,
        body: data
      });

      const readableMessage =
        extractOpenAIErrorMessage(data) ||
        `OpenAI returned ${response.status} ${response.statusText}`;

      res.status(response.status).json({
        error: readableMessage,
        status: response.status
      });
      return;
    }

    res.status(response.status).json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown server error";
    res.status(500).json({
      error: `Unable to create Realtime translation session: ${message}`
    });
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(`CMIT backend listening on http://localhost:${port}`);
});

function extractOpenAIErrorMessage(data: unknown): string | null {
  if (!data || typeof data !== "object") {
    return null;
  }

  const maybeError = "error" in data ? data.error : undefined;
  if (typeof maybeError === "string") {
    return maybeError;
  }

  if (maybeError && typeof maybeError === "object" && "message" in maybeError) {
    const message = maybeError.message;
    return typeof message === "string" ? message : null;
  }

  if ("message" in data) {
    const message = data.message;
    return typeof message === "string" ? message : null;
  }

  return null;
}
