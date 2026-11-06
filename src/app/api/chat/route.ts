import { getServerSession } from "next-auth";
import { getSystemPrompt } from "#utils/ai/prompt";
import { smartGenerateText } from "#utils/ai/switcher";
import { getRestaurantData } from "#utils/database/helper/account";
import type { TMenu } from "#utils/database/models/menu";
import { authOptions } from "#utils/helper/authHelper";

export async function POST(req: Request) {
	let payload: unknown;
	try {
		payload = await req.json();
	} catch {
		return Response.json({ error: "Invalid JSON request.", toolResults: [] }, { status: 400 });
	}

	try {
		if (!payload || typeof payload !== "object") return Response.json({ error: "Invalid request body.", toolResults: [] }, { status: 400 });
		const { messages, restaurantId } = payload as { messages?: unknown; restaurantId?: unknown };
		if (typeof restaurantId !== "string" || !restaurantId.trim()) return Response.json({ error: "Restaurant ID is required.", toolResults: [] }, { status: 400 });
		if (!Array.isArray(messages) || !messages.every((message) => message && typeof message === "object" && ["user", "assistant"].includes((message as { role?: unknown }).role as string) && typeof (message as { content?: unknown }).content === "string")) {
			return Response.json({ error: "Messages must be an array of valid chat messages.", toolResults: [] }, { status: 400 });
		}

		const session = await getServerSession(authOptions);
		if (!session) return Response.json({ error: "Please login to chat with Jarvis.", toolResults: [] }, { status: 401 });

		const name = restaurantId.replace(/\b\w/g, (c: string) => c.toUpperCase()).replace(/[-_]/g, " ");
		const account = await getRestaurantData(restaurantId).catch(() => null);

		if (!account) return Response.json({ error: `Restaurant '${name}' not found.`, toolResults: [] }, { status: 404 });

		const items: TMenu[] = account?.menus || [];
		const menuMap = new Map(items.map((i) => [i.name.toLowerCase(), i]));

		const result = await smartGenerateText({
			system: getSystemPrompt(name, items, session?.customer?.fname),
			messages,
		});

		let text = result.text;
		const toolResults: TMenu[][] = [];
		const match = text.match(/<<<REC:?(.*?)>>>/);

		if (match) {
			text = text.replace(match[0], "").trim();
			try {
				const names = JSON.parse(match[1]);
				if (Array.isArray(names)) {
					const found = names.map((n: string) => menuMap.get(n.toLowerCase())).filter((i): i is TMenu => !!i);
					if (found.length) toolResults.push(found);
				}
			} catch {}
		}

		return Response.json({ text, toolResults });
	} catch (error) {
		const details = error as { message?: string; statusCode?: number; isProviderError?: boolean };
		const status = details.isProviderError ? 502 : 500;
		console.error(`[AI] Chat request failed (${details.statusCode ?? status}): ${details.message || "Unknown error"}`);
		return Response.json({ error: "The AI assistant is temporarily unavailable. Please try again.", toolResults: [] }, { status });
	}
}
