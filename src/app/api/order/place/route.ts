import mongoose from "mongoose";
import { NextResponse } from "next/server";

import connectDB from "#utils/database/connect";
import { getStockRequirements, reserveStock } from "#utils/database/helper/inventory";
import { Menus, type TMenu } from "#utils/database/models/menu";
import { Orders, type TOrder, type TProduct } from "#utils/database/models/order";
import { requireCustomerSession } from "#utils/helper/authHelper";
import { CatchNextResponse } from "#utils/helper/common";
import { publish } from "#utils/realtime/bus";

export async function POST(req: Request) {
	try {
		const session = await requireCustomerSession();
		const body = await req.json();

		if (!Array.isArray(body?.products) || body.products.length === 0) throw { message: "Can't place order on empty cart", status: 400 };

		await connectDB();
		const products: TProduct[] = await Promise.all(
			body.products.map(async (product: unknown) => {
				if (!product || typeof product !== "object") throw { message: "Invalid product in order", status: 400 };
				const { _id, quantity } = product as { _id?: unknown; quantity?: unknown };
				if (typeof _id !== "string" || !mongoose.isValidObjectId(_id)) throw { message: "Invalid menu item id", status: 400 };
				if (typeof quantity !== "number" || !Number.isSafeInteger(quantity) || quantity <= 0) {
					throw { message: "Product quantity must be a positive whole number", status: 400 };
				}

				const menuItem = await Menus.findOne<TMenu>({ _id, hidden: false, restaurantID: session.restaurant.username }).lean();

				if (!menuItem) throw { message: "Ordered product(s) not found.", status: 404 };
				return {
					price: menuItem?.price,
					product: menuItem._id,
					quantity,
					tax: ((menuItem?.price * menuItem?.taxPercent) / 100).toFixed(2),
				};
			})
		);

		const restaurantID = session.restaurant.username;
		const requirements = await getStockRequirements(restaurantID, products);
		const dbSession = await mongoose.startSession();
		let response: NextResponse = NextResponse.json({ message: "Unable to place order", status: 500 }, { status: 500 });
		try {
			const place = async (transactionSession?: mongoose.ClientSession) => {
				await reserveStock(restaurantID, requirements, transactionSession);
				const order = await Orders.findOne<TOrder>({ customer: session.customer._id, restaurantID, state: "active" }).session(transactionSession ?? null);
				if (order) {
					order.products = [...order.products, ...products];
					order.stockReserved = true;
					await order.save({ session: transactionSession });
					return NextResponse.json({ message: "Additional items ordered successfully", status: 200 });
				}
				const newOrder = await new Orders({
					customer: session.customer._id,
					products,
					restaurantID,
					stockReserved: requirements.length > 0,
					table: session.restaurant.table,
				}).save({ session: transactionSession });
				publish(restaurantID, "order.created", { orderID: newOrder._id.toString() });
				return NextResponse.json({ message: "Order placed successfully", status: 201 });
			};
			try {
				await dbSession.withTransaction(async () => {
					response = await place(dbSession);
				});
			} catch (transactionError) {
				if (!/transaction|replica set|mongos|not supported/i.test(transactionError instanceof Error ? transactionError.message : "")) throw transactionError;
				response = await place();
			}
			return response;
		} finally {
			await dbSession.endSession();
		}
	} catch (err) {
		console.log(err);
		return CatchNextResponse(err);
	}
}

export const dynamic = "force-dynamic";
