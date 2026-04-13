import OpenAI from "openai";
import { appConfig } from "../config.js";

const openai = new OpenAI({
    apiKey: appConfig.OPENAI_API_KEY,
});

export async function handleOpenAIChat(prompt: string, model: string = "gpt-4o-mini") {
    if (!appConfig.OPENAI_API_KEY) {
        throw new Error("OpenAI API key not configured");
    }

    const response = await openai.chat.completions.create({
        model,
        messages: [{ role: "user", content: prompt }],
    });

    return response.choices[0].message;
}
