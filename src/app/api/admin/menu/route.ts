import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import connectDB from "#utils/database/connect";
import { Menus, type TMenu } from "#utils/database/models/menu";
import { authOptions } from "#utils/helper/authHelper";
import { CatchNextResponse } from "#utils/helper/common";

export async function POST(req: Request) {
	try {
		await connectDB();
		const session = await getServerSession(authOptions);
		const body = await req.json();

		if (!session || !session.username) throw { status: 401, message: "Authentication Required" };

		const username = session.username;

		const { itemId, name, description, category, price, taxPercent, foodType, veg, image, hidden } = body;

		if (!name) throw { status: 400, message: "Menu item name is required" };
		if (!category) throw { status: 400, message: "Menu item category is required" };
		if (price === undefined || price === null || Number.isNaN(Number(price))) throw { status: 400, message: "Menu item price is required" };
		if (taxPercent === undefined || taxPercent === null || Number.isNaN(Number(taxPercent))) throw { status: 400, message: "Menu item tax percent is required" };
		if (!veg) throw { status: 400, message: "Menu item food type (veg/non-veg) is required" };

		const payload = {
			name: String(name).trim(),
			description: String(description ?? "").trim(),
			category: String(category).trim().toLowerCase(),
			price: Number(price),
			taxPercent: Number(taxPercent),
			foodType: foodType ? String(foodType) : undefined,
			veg: String(veg),
			image: String(image ?? "").trim(),
			hidden: Boolean(hidden ?? false),
		};

		if (itemId) {
			const menuItem = await Menus.findById<TMenu>(itemId);
			if (!menuItem) throw { status: 404, message: `Menu item with id: ${itemId}, not found` };
			if (menuItem.restaurantID !== username) throw { status: 403, message: "Access denied: menu item belongs to another restaurant" };

			menuItem.set(payload);
			await menuItem.save();

			return NextResponse.json({ status: 200, message: `Menu item '${menuItem.name}' updated successfully` });
		}

		const menuItem = new Menus({
			...payload,
			restaurantID: username.toLowerCase(),
		});
		await menuItem.save();

		return NextResponse.json({ status: 200, message: `Menu item '${menuItem.name}' added successfully` });
	} catch (err) {
		console.log(err);
		return CatchNextResponse(err);
	}
}

export const dynamic = "force-dynamic";
