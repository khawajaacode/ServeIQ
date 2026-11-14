import { NextResponse } from "next/server";

import connectDB from "#utils/database/connect";
import { Accounts } from "#utils/database/models/account";
import { Tables } from "#utils/database/models/table";
import { requireAdminSession } from "#utils/helper/authHelper";
import { CatchNextResponse } from "#utils/helper/common";

export async function GET() {
	try {
		const session = await requireAdminSession();
		await connectDB();
		return NextResponse.json(await Tables.find({ restaurantID: session.username }).sort({ name: 1 }).lean());
	} catch (err) {
		return CatchNextResponse(err);
	}
}

export async function POST(req: Request) {
	try {
		const session = await requireAdminSession();
		const { name, username } = await req.json();
		if (!name?.trim() || !username?.trim()) throw { status: 400, message: "Table name and username are required" };
		await connectDB();
		const table = await new Tables({ name: name.trim(), username: username.trim().toLowerCase(), restaurantID: session.username }).save();
		return NextResponse.json(table, { status: 201 });
	} catch (err) {
		return CatchNextResponse(err);
	}
}

export async function PATCH(req: Request) {
	try {
		const session = await requireAdminSession();
		const { id, name, username } = await req.json();
		if (!id || !name?.trim() || !username?.trim()) throw { status: 400, message: "Table id, name, and username are required" };
		await connectDB();
		const table = await Tables.findOneAndUpdate(
			{ _id: id, restaurantID: session.username },
			{ name: name.trim(), username: username.trim().toLowerCase() },
			{ new: true, runValidators: true }
		).lean();
		if (!table) throw { status: 404, message: "Table not found" };
		return NextResponse.json(table);
	} catch (err) {
		return CatchNextResponse(err);
	}
}

export async function DELETE(req: Request) {
	try {
		const session = await requireAdminSession();
		const id = new URL(req.url).searchParams.get("id");
		if (!id) throw { status: 400, message: "Table id is required" };
		await connectDB();
		const table = await Tables.findOneAndDelete({ _id: id, restaurantID: session.username });
		if (!table) throw { status: 404, message: "Table not found" };
		await Accounts.updateOne({ username: session.username }, { $pull: { tables: table._id } });
		return NextResponse.json({ status: 200 });
	} catch (err) {
		return CatchNextResponse(err);
	}
}

export const dynamic = "force-dynamic";
