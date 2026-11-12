import { NextResponse } from "next/server";

import connectDB from "#utils/database/connect";
import { ORDER_ACTIONS, Orders, type TOrder } from "#utils/database/models/order";
import { requireAdminSession } from "#utils/helper/authHelper";
import { CatchNextResponse } from "#utils/helper/common";

export async function POST(req: Request) {
	try {
		const session = await requireAdminSession();
		const body = await req.json();

		if (!body?.orderID) throw { status: 400, message: "Order id is required to perform an action" };
		if (!ORDER_ACTIONS.includes(body?.action)) throw { status: 400, message: "Invalid action provided" };

		await connectDB();

		const order = await Orders.findById<TOrder>(body?.orderID);

		if (!order) throw { status: 400, message: `Order with id: ${body?.orderID} not found` };
		if (order.restaurantID !== session.username) throw { status: 403, message: "Access denied: order belongs to another restaurant" };

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

		await order.save();

		return NextResponse.json({ status: 200, message: "Order placed successfully" });
	} catch (err) {
		console.log(err);
		return CatchNextResponse(err);
	}
}

export const dynamic = "force-dynamic";
