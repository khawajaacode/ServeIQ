import { NextResponse } from "next/server";

import connectDB from "#utils/database/connect";
import { flattenOrderProducts } from "#utils/database/helper/order";
import type { TCustomer } from "#utils/database/models/customer";
import type { TMenu } from "#utils/database/models/menu";
import { Orders, type TOrder } from "#utils/database/models/order";
import { requireCustomerSession } from "#utils/helper/authHelper";
import { CatchNextResponse } from "#utils/helper/common";

export async function GET() {
	try {
		await connectDB();
		const session = await requireCustomerSession();

		const restaurantID = session.restaurant.username;
		const customer = session.customer._id;
		const order = (await Orders.findOne({ restaurantID, customer, state: "active" })
			.populate<{ customer: TCustomer }>("customer")
			.populate<{ products: { product: TMenu }[] }>("products.product")
			.lean()) as unknown as TOrder | null;

		return NextResponse.json(flattenOrderProducts(order));
	} catch (err) {
		console.log(err);
		return CatchNextResponse(err);
	}
}

export const dynamic = "force-dynamic";
