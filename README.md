# CMIT Live Interpreter Trainer

A mobile-friendly medical interpreter training app for live English transcription and Spanish translation practice.

This MVP uses OpenAI Realtime Translation over WebRTC. It does not use normal Whisper file-upload transcription.

## Setup

1. Create a `.env` file in the project root:

   ```bash
   OPENAI_API_KEY=your_openai_api_key_here
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Run the frontend and backend:

   ```bash
   pnpm dev
   ```

4. Open the app:

   - On the same computer: [http://localhost:5173](http://localhost:5173)
   - On a phone on the same local network: open `http://YOUR_COMPUTER_LOCAL_IP:5173`

5. Allow microphone access when prompted.

6. Test with sample English or Spanish medical sentences:

   - "The patient should remain NPO after midnight."
   - "She has COPD with dyspnea and wheezing."
   - "Give the inhaler every 6 hours PRN."
   - "The CXR shows pneumonia."
   - "Usted tiene dolor y necesita tomar el medicamento con comida."

## How It Works

- The browser captures microphone audio with `navigator.mediaDevices.getUserMedia({ audio: true })`.
- The frontend creates a WebRTC `RTCPeerConnection` and an `oai-events` data channel.
- The backend creates a short-lived OpenAI Realtime Translation client secret with `OPENAI_API_KEY`.
- The backend creates the client secret with a top-level `session` object for `gpt-realtime-translate` and the selected output language.
- The frontend posts its SDP offer to the OpenAI Realtime Translation calls endpoint using only the short-lived client secret.
- The Direction selector supports English to Spanish, Spanish to English, and an experimental Auto Detect mode.
- While connected, direction changes send a `session.update` event over the `oai-events` data channel to change `audio.output.language`.
- The OpenAI API key never ships to the browser.

## Scripts

```bash
pnpm dev       # run Express backend and Vite frontend
pnpm test      # run Vitest suite
pnpm build     # type-check and build frontend
```

## Privacy Note

Training tool only. Do not use with real patient data or protected health information unless you have permission and are following privacy rules.
