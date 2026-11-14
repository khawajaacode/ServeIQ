import { NextResponse } from "next/server";

import connectDB from "#utils/database/connect";
import { flattenOrderProducts } from "#utils/database/helper/order";
import type { TCustomer } from "#utils/database/models/customer";
import type { TMenu } from "#utils/database/models/menu";
import { Orders, type TOrder } from "#utils/database/models/order";
import { requireStaffSession } from "#utils/helper/authHelper";
import { CatchNextResponse } from "#utils/helper/common";

export async function GET() {
	try {
		await connectDB();
		const session = await requireStaffSession();

		const restaurantID = session.username;
		const orders =
			((await Orders.find({ restaurantID, ...(session.role === "kitchen" ? { state: "active" } : {}) })
				.populate<{ customer: TCustomer }>("customer")
				.populate<{ products: { product: TMenu }[] }>("products.product")
				.lean()) as unknown as TOrder[]) ?? [];

		return NextResponse.json(orders.map((order) => flattenOrderProducts(order)));
	} catch (err) {
		console.log(err);
		return CatchNextResponse(err);
	}
}

export const dynamic = "force-dynamic";
