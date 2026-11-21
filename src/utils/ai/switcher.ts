import { generateText } from "ai";
import { configuredProviders, configs, getModel } from "./config";

const getProviderConfig = (provider: (typeof configuredProviders)[number]) => configs.find((config) => config.platform === provider);
const getErrorDetails = (error: unknown) => {
	const candidate = error as { message?: string; statusCode?: number; responseBody?: string };
	return {
		message: candidate.message || "Unknown provider error",
		status: candidate.statusCode,
	};
};

export const smartGenerateText = async (params: Omit<Parameters<typeof generateText>[0], "model">) => {
	if (!configuredProviders.length) throw Object.assign(new Error("No AI providers are configured"), { isProviderError: true });

	let lastError: { message: string; status?: number } | undefined;

	for (const provider of configuredProviders) {
		try {
			const providerConfig = getProviderConfig(provider);
			console.log(`[AI] Trying provider: ${provider}/${providerConfig?.model}`);
			return await generateText({
				...params,
				model: getModel(provider),
			} as Parameters<typeof generateText>[0]);
		} catch (error) {
			const details = getErrorDetails(error);
			lastError = details;
			const providerConfig = getProviderConfig(provider);
			console.error(`[AI] Provider ${provider}/${providerConfig?.model} failed (${details.status ?? "unknown"}): ${details.message}`);
		}
	}

	const message = lastError
		? `AI provider request failed${lastError.status ? ` (${lastError.status})` : ""}: ${lastError.message}`
		: "All configured AI providers are exhausted";
	throw Object.assign(new Error(message), { statusCode: lastError?.status, isProviderError: true });
};
