import { NextResponse } from "next/server";

import connectDB from "#utils/database/connect";
import { Menus, type TMenu } from "#utils/database/models/menu";
import { requireAdminSession } from "#utils/helper/authHelper";
import { CatchNextResponse } from "#utils/helper/common";

export async function POST(req: Request) {
	try {
		await connectDB();
		const session = await requireAdminSession();
		const { itemId, hidden } = await req.json();

		if (!itemId) throw { status: 400, message: "Menu item id is required" };
		if (typeof hidden !== "boolean") throw { status: 400, message: "Hidden value must be a boolean" };

		const menuItem = await Menus.findById<TMenu>(itemId);

		if (!menuItem) throw { status: 404, message: `Menu item with id: ${itemId}, not found` };
		if (menuItem.restaurantID !== session.username) throw { status: 403, message: "Access denied: menu item belongs to another restaurant" };

		menuItem.hidden = hidden;

		await menuItem.save();

		return NextResponse.json({ status: 200, message: hidden ? "Menu item is now hidden" : "Menu item is now visible to customers" });
	} catch (err) {
		console.log(err);
		return CatchNextResponse(err);
	}
}

export const dynamic = "force-dynamic";
