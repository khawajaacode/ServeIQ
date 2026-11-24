import { NextResponse } from "next/server";

import connectDB from "#utils/database/connect";
import { getStockRequirements, releaseStock } from "#utils/database/helper/inventory";
import { Orders, type TOrder } from "#utils/database/models/order";
import { requireCustomerSession } from "#utils/helper/authHelper";
import { CatchNextResponse } from "#utils/helper/common";

export async function POST() {
	try {
		const session = await requireCustomerSession();

		await connectDB();

		const restaurantID = session.restaurant.username;
		const customer = session.customer._id;
		const order = await Orders.findOne<TOrder>({ customer, restaurantID, state: "active" });

		if (!order) throw { message: "No active orders found", status: 400 };

		order.state = "cancel";
		if (order.stockReserved) {
			const requirements = await getStockRequirements(restaurantID, order.products);
			await releaseStock(restaurantID, requirements);
			order.stockReserved = false;
		}

		await order.save();

		return NextResponse.json({ message: "Order canceled.", status: 200 });
	} catch (err) {
		console.log(err);
		return CatchNextResponse(err);
	}
}

export const dynamic = "force-dynamic";
