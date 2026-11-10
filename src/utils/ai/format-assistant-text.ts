export const formatAssistantText = (content: string) =>
	content
		.replace(/<br\s*\/?>/gi, "\n")
		.replace(/<\/li\s*>/gi, "\n")
		.replace(/<li(?:\s[^>]*)?>/gi, "• ")
		.replace(/<\/?(?:ul|b)\s*>/gi, "");
