import { NextResponse } from "next/server";

import connectDB from "#utils/database/connect";
import { Reviews } from "#utils/database/models/review";
import { requireCustomerSession } from "#utils/helper/authHelper";
import { CatchNextResponse } from "#utils/helper/common";

export async function GET(_: Request, { params }: { params: Promise<{ restaurant: string }> }) {
	try {
		await connectDB();
		const { restaurant } = await params;
		return NextResponse.json(await Reviews.find({ restaurantID: restaurant }).populate("customer", "fname lname").sort({ createdAt: -1 }).lean());
	} catch (err) {
		return CatchNextResponse(err);
	}
}

export async function POST(req: Request, { params }: { params: Promise<{ restaurant: string }> }) {
	try {
		const session = await requireCustomerSession();
		const { restaurant } = await params;
		if (session.restaurant.username !== restaurant) throw { status: 403, message: "Review belongs to another restaurant" };
		const { rating, comment } = await req.json();
		if (!Number.isInteger(rating) || rating < 1 || rating > 5 || !comment?.trim()) throw { status: 400, message: "Rating and comment are required" };
		await connectDB();
		const review = await Reviews.findOneAndUpdate(
			{ restaurantID: restaurant, customer: session.customer._id },
			{ rating, comment: comment.trim() },
			{ new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
		).lean();
		return NextResponse.json(review, { status: 201 });
	} catch (err) {
		return CatchNextResponse(err);
	}
}

export const dynamic = "force-dynamic";
