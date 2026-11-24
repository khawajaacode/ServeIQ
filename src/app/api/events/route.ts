import { getServerSession } from "next-auth";

import { authOptions } from "#utils/helper/authHelper";
import { subscribe } from "#utils/realtime/bus";

export async function GET() {
	const session = await getServerSession(authOptions);
	const restaurantID = session?.role === "customer" ? session.restaurant?.username : session?.username;
	if (!restaurantID) return new Response("Authentication required", { status: 401 });

	const encoder = new TextEncoder();
	let close: () => void = () => undefined;
	const stream = new ReadableStream({
		cancel() {
			close();
		},
		start(controller) {
			const send = (event: string, payload: unknown) => {
				controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`));
			};
			send("connected", { restaurantID });
			close = subscribe(restaurantID, send);
		},
	});

	return new Response(stream, {
		headers: { "Cache-Control": "no-cache, no-transform", Connection: "keep-alive", "Content-Type": "text/event-stream" },
	});
}

export const dynamic = "force-dynamic";
