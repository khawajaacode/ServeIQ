import type { ChatMessage, MenuSuggestion } from "../../types/chat";

export const sendChatMessage = async (messages: ChatMessage[], restaurantId: string): Promise<{ text: string; toolResults: MenuSuggestion[][] }> => {
	const response = await fetch("/api/chat", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			restaurantId,
			messages: messages.map((m) => ({
				role: m.role,
				content: m.content,
			})),
		}),
	});

	const data = await response.json().catch(() => null);
	if (!response.ok) {
		throw new Error(data?.error || data?.text || `AI request failed (${response.status})`);
	}
	if (!data || typeof data.text !== "string" || !Array.isArray(data.toolResults)) {
		throw new Error("The AI assistant returned an invalid response.");
	}

	return data;
};

export const createMessage = (role: "user" | "assistant", content: string, toolResults?: MenuSuggestion[][], isError?: boolean): ChatMessage => ({
	id: Date.now().toString() + Math.random(),
	role,
	content,
	isError,
	toolResults,
	createdAt: Date.now(),
});
