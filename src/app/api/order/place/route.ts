import { NextResponse } from "next/server";
import mongoose from "mongoose";

import connectDB from "#utils/database/connect";
import { Menus, type TMenu } from "#utils/database/models/menu";
import { Orders, type TOrder, type TProduct } from "#utils/database/models/order";
import { requireCustomerSession } from "#utils/helper/authHelper";
import { CatchNextResponse } from "#utils/helper/common";

export async function POST(req: Request) {
	try {
		const session = await requireCustomerSession();
		const body = await req.json();

		if (!Array.isArray(body?.products) || body.products.length === 0) throw { status: 400, message: "Can't place order on empty cart" };

		await connectDB();
		const products: TProduct[] = await Promise.all(
			body.products.map(async (product: unknown) => {
				if (!product || typeof product !== "object") throw { status: 400, message: "Invalid product in order" };
				const { _id, quantity } = product as { _id?: unknown; quantity?: unknown };
				if (typeof _id !== "string" || !mongoose.isValidObjectId(_id)) throw { status: 400, message: "Invalid menu item id" };
				if (typeof quantity !== "number" || !Number.isSafeInteger(quantity) || quantity <= 0) {
					throw { status: 400, message: "Product quantity must be a positive whole number" };
				}

				const menuItem = await Menus.findOne<TMenu>({ _id, restaurantID: session.restaurant.username, hidden: false }).lean();

				if (!menuItem) throw { status: 404, message: "Ordered product(s) not found." };
				return {
					product: menuItem._id,
					quantity,
					price: menuItem?.price,
					tax: ((menuItem?.price * menuItem?.taxPercent) / 100).toFixed(2),
				};
			})
		);

		const restaurantID = session.restaurant.username;
		const table = session.restaurant.table;
		const customer = session.customer._id;
		const order = await Orders.findOne<TOrder>({ restaurantID, customer, state: "active" });

		if (order) {
			order.products = [...order.products, ...products];
			await order.save();

			return NextResponse.json({ status: 200, message: "Additional items ordered successfully" });
		}

		const newOrder = new Orders({ restaurantID, table, customer, products });
		await newOrder.save();

		return NextResponse.json({ status: 200, message: "Order placed successfully" });
	} catch (err) {
		console.log(err);
		return CatchNextResponse(err);
	}
}

export const dynamic = "force-dynamic";
