import { NextResponse } from "next/server";

import connectDB from "#utils/database/connect";
import { getStockRequirements, releaseStock } from "#utils/database/helper/inventory";
import { ORDER_ACTIONS, Orders, type TOrder } from "#utils/database/models/order";
import { requireStaffSession } from "#utils/helper/authHelper";
import { CatchNextResponse } from "#utils/helper/common";
import { publish } from "#utils/realtime/bus";

export async function POST(req: Request) {
	try {
		const session = await requireStaffSession();
		const body = await req.json();

		if (!body?.orderID) throw { message: "Order id is required to perform an action", status: 400 };
		if (!ORDER_ACTIONS.includes(body?.action)) throw { message: "Invalid action provided", status: 400 };
		if (session.role === "kitchen" && !["preparing", "ready", "complete"].includes(body.action))
			throw { message: "Kitchen staff can only update preparation state", status: 403 };

		await connectDB();

		const order = await Orders.findById<TOrder>(body?.orderID);

		if (!order) throw { message: `Order with id: ${body?.orderID} not found`, status: 400 };
		if (order.restaurantID !== session.username) throw { message: "Access denied: order belongs to another restaurant", status: 403 };
		if (session.role === "kitchen" && !["active", "preparing", "ready"].includes(order.state))
			throw { message: "Only active kitchen orders can be updated", status: 403 };
		const originalProducts = [...order.products];

		if (body.action === "accept")
			order.products.forEach((product) => {
				product.adminApproved = true;
			});

		if (body.action === "reject") {
			if (order.products.some(({ adminApproved }) => adminApproved)) order.products = order.products.filter(({ adminApproved }) => adminApproved);
			else order.state = "reject";
		}

		if (body.action === "rejectOnActive") order.state = "reject";

		if (body.action === "complete") order.state = "complete";
		if (body.action === "preparing") order.state = "preparing";
		if (body.action === "ready") order.state = "ready";

		if (["reject", "rejectOnActive"].includes(body.action) && order.stockReserved) {
			const releasedProducts =
				body.action === "reject" && originalProducts.some(({ adminApproved }) => adminApproved)
					? originalProducts.filter(({ adminApproved }) => !adminApproved)
					: originalProducts;
			const requirements = await getStockRequirements(order.restaurantID, releasedProducts);
			await releaseStock(order.restaurantID, requirements);
			order.stockReserved = body.action === "reject" && originalProducts.some(({ adminApproved }) => adminApproved);
		}

		await order.save();
		publish(order.restaurantID, `order.${body.action === "accept" ? "accepted" : body.action}`, { orderID: order._id.toString() });

		return NextResponse.json({ message: "Order placed successfully", status: 200 });
	} catch (err) {
		console.log(err);
		return CatchNextResponse(err);
	}
}

export const dynamic = "force-dynamic";
