import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

export const configs = [
	{
		platform: "groq",
		url: "https://api.groq.com/openai/v1",
		model: "meta-llama/llama-4-scout-17b-16e-instruct",
	},
	{
		platform: "cerebras",
		url: "https://api.cerebras.ai/v1",
		model: "llama-3.3-70b",
	},
	{
		platform: "google",
		url: "https://generativelanguage.googleapis.com/v1beta/openai",
		model: "gemini-3-flash-preview",
	},
	{
		platform: "siliconflow",
		url: "https://api.siliconflow.com/v1",
		model: "deepseek-ai/DeepSeek-V3.2-Exp",
	},
] as const;

type AIProvider = ReturnType<ReturnType<typeof createOpenAICompatible>>;
export type AIPlatform = (typeof configs)[number]["platform"];

export const configuredProviders = configs.filter(({ platform }) => Boolean(process.env[`AI_${platform.toUpperCase()}_KEY`])).map(({ platform }) => platform) as AIPlatform[];

export const getModel = (platform: AIPlatform): AIProvider => {
	const config = configs.find((entry) => entry.platform === platform);
	if (!config) throw new Error(`Unknown AI platform: ${platform}`);

	return createOpenAICompatible({
		baseURL: config.url,
		apiKey: process.env[`AI_${platform.toUpperCase()}_KEY`],
		name: platform,
	})(config.model);
};
