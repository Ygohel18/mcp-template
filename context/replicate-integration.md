# Integrating Replicate API for Multimedia Generation

This guide explains how to connect your MCP server to the **Replicate API** to generate images, videos, audio, and run LLM predictions.

---

## 1. Prerequisites
- **Replicate API Token**: Get it from [replicate.com/account](https://replicate.com/account).
- **Library**: `npm install replicate`

---

## 2. Setting Up the Client
Add your token to `.env`:
```bash
REPLICATE_API_TOKEN=r8_*************************************
```

Initialize the client in your tool logic:
```typescript
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});
```

---

## 3. Multimedia Generation Examples

### A. Image Generation (Flux or SDXL)
```typescript
const output = await replicate.run(
  "black-forest-labs/flux-schnell",
  {
    input: {
      prompt: "A futuristic cyberpunk city at night with neon signs",
    }
  }
);
// output is an array of strings (URLs)
```

### B. Video Generation (Luma Dream Machine or Kling)
```typescript
const output = await replicate.run(
  "lucataco/luma-dream-machine",
  {
    input: {
      prompt: "A dragon soaring over a snowy mountain range",
    }
  }
);
// output is a URL to the generated video
```

### C. Audio/Music Generation (MusicGen)
```typescript
const output = await replicate.run(
  "meta/musicgen:671ac64518d6702f3967266a3a0e663a",
  {
    input: {
      prompt: "Lo-fi hip hop beats with a chill rainy atmosphere",
      duration: 10
    }
  }
);
// output is a URL to the audio file
```

### D. LLM Prediction (Llama 3.1)
```typescript
const output = await replicate.run(
  "meta/meta-llama-3.1-405b-instruct",
  {
    input: {
      prompt: "Explain quantum entanglement like I'm five.",
      max_new_tokens: 512
    }
  }
);
// output is a stream or array of strings (text)
```

---

## 4. Polling vs. Webhooks
For long-running tasks like Video generation, you can either:
1.  **Wait**: `replicate.run` waits for the prediction to finish (limited by your server's timeout).
2.  **Poll**: Use `replicate.predictions.create` and check the status periodically.
3.  **Webhooks**: Provide a `webhook` URL in the request options to get a `POST` request when the generation is done.

---

## 5. Best Practices for MCP
- **Response Format**: MCP tools should return the URL of the generated asset or a summary of the result.
- **Complexity**: For image/video tools, always enable the user to specify `aspect_ratio` and `negative_prompt` as tool arguments.
- **Budgeting**: Log the cost or usage if possible, as high-end models can be expensive.
