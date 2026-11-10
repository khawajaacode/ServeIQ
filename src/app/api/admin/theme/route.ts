import { NextResponse } from "next/server";
import { isValidThemeColor } from "xtreme-ui";

import connectDB from "#utils/database/connect";
import { Profiles, type TProfile } from "#utils/database/models/profile";
import { requireAdminSession } from "#utils/helper/authHelper";
import { CatchNextResponse } from "#utils/helper/common";

export async function POST(req: Request) {
	try {
		await connectDB();
		const session = await requireAdminSession();
		const { themeColor } = await req.json();

		if (!isValidThemeColor(themeColor)) throw { status: 400, message: "Valid theme color is required" };

		const profile = await Profiles.findOne<TProfile>({ restaurantID: session.username });

		if (!profile) throw { status: 500, message: "Something went wrong" };

		profile.themeColor = themeColor;
		await profile.save();

		return NextResponse.json({ status: 200, message: "Theme applied successfully" });
	} catch (err) {
		console.log(err);
		return CatchNextResponse(err);
	}
}

export const dynamic = "force-dynamic";
