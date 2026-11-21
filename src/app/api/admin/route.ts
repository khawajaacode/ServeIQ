import { NextResponse } from "next/server";

import { getRestaurantData } from "#utils/database/helper/account";
import { requireAdminSession } from "#utils/helper/authHelper";
import { CatchNextResponse } from "#utils/helper/common";

export async function GET() {
	try {
		const session = await requireAdminSession();
		const account = await getRestaurantData(session.username);

		if (!account) throw { status: 500, message: "Unable to fetch data" };

		return NextResponse.json({
			profile: account.profile,
			menus: account.menus,
			tables: account.tables,
		});
	} catch (err) {
		console.log(err);
		return CatchNextResponse(err);
	}
}

export const dynamic = "force-dynamic";
