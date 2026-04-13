import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { appConfig } from "../config.js";

const client = new BedrockRuntimeClient({
    region: appConfig.AWS_REGION,
    credentials: {
        accessKeyId: appConfig.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: appConfig.AWS_SECRET_ACCESS_KEY || "",
    },
});

export async function handleBedrockGenerate(prompt: string, modelId: string = "anthropic.claude-3-haiku-20240307-v1:0") {
    if (!appConfig.AWS_ACCESS_KEY_ID) {
        throw new Error("AWS credentials not configured");
    }

    const payload = {
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 1024,
        messages: [
            {
                role: "user",
                content: [{ type: "text", text: prompt }],
            },
        ],
    };

    const command = new InvokeModelCommand({
        modelId,
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify(payload),
    });

    const response = await client.send(command);
    const result = JSON.parse(new TextDecoder().decode(response.body));
    return result;
}
