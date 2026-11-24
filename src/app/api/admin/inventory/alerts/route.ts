import { NextResponse } from "next/server";

import connectDB from "#utils/database/connect";
import { Ingredients } from "#utils/database/models/ingredient";
import { requireAdminSession } from "#utils/helper/authHelper";
import { CatchNextResponse } from "#utils/helper/common";

export async function GET() {
	try {
		const session = await requireAdminSession();
		await connectDB();
		return NextResponse.json(
			await Ingredients.find({ $expr: { $lte: ["$stock", "$lowStockThreshold"] }, restaurantID: session.username })
				.sort({ stock: 1 })
				.lean()
		);
	} catch (err) {
		return CatchNextResponse(err);
	}
}

export const dynamic = "force-dynamic";
