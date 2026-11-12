import { generateText } from "ai";
import AIConfig from "#utils/database/models/aiConfig";
import { configuredProviders, configs, getModel, type AIPlatform } from "./config";

const PROVIDER_ORDER = configuredProviders;

const getProviderConfig = (provider: AIPlatform) => configs.find((config) => config.platform === provider);
const getErrorDetails = (error: unknown) => {
	const candidate = error as { message?: string; statusCode?: number; responseBody?: string };
	return {
		message: candidate.message || "Unknown provider error",
		status: candidate.statusCode,
	};
};

const getProviderState = async () => {
	let config = await AIConfig.findOne();
	if (!config) config = await AIConfig.create({ exhaustedProviders: [] });
	return config;
};

const getAvailableProvider = async () => {
	const config = await getProviderState();
	const exhausted = new Set(config.exhaustedProviders);
	return PROVIDER_ORDER.find((p) => !exhausted.has(p)) || null;
};

const markProviderExhausted = async (provider: string) => await AIConfig.updateOne({}, { $addToSet: { exhaustedProviders: provider } }, { upsert: true });
const resetProviders = async () => await AIConfig.updateOne({}, { $set: { exhaustedProviders: [] } }, { upsert: true });

export const smartGenerateText = async (params: Omit<Parameters<typeof generateText>[0], "model">) => {
	if (!PROVIDER_ORDER.length) throw Object.assign(new Error("No AI providers are configured"), { isProviderError: true });

	let currentProvider = await getAvailableProvider();
	let lastError: { message: string; status?: number } | undefined;

	if (!currentProvider) {
		await resetProviders();
		currentProvider = PROVIDER_ORDER[0];
	}

	while (currentProvider) {
		try {
			const providerConfig = getProviderConfig(currentProvider);
			console.log(`[AI] Trying provider: ${currentProvider}/${providerConfig?.model}`);
			const result = await generateText({
				...params,
				model: getModel(currentProvider),
			} as Parameters<typeof generateText>[0]);
			return result;
		} catch (error) {
			const details = getErrorDetails(error);
			lastError = details;
			const providerConfig = getProviderConfig(currentProvider);
			console.error(`[AI] Provider ${currentProvider}/${providerConfig?.model} failed (${details.status ?? "unknown"}): ${details.message}`);
			await markProviderExhausted(currentProvider);
			currentProvider = await getAvailableProvider();
		}
	}
	await resetProviders();
	const message = lastError
		? `AI provider request failed${lastError.status ? ` (${lastError.status})` : ""}: ${lastError.message}`
		: "All configured AI providers are exhausted";
	throw Object.assign(new Error(message), { statusCode: lastError?.status, isProviderError: true });
};
