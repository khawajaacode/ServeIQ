import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { getRestaurantData } from "#utils/database/helper/account";
import type { TMenu } from "#utils/database/models/menu";
import type { TTable } from "#utils/database/models/table";
import { authOptions } from "#utils/helper/authHelper";
import { CatchNextResponse } from "#utils/helper/common";

export async function GET(req: Request) {
	try {
		let username = new URL(req.url).searchParams.get("id");

		if (!username) {
			const session = await getServerSession(authOptions);
			username = session?.username ?? null;
		}
		if (!username) throw { status: 400, message: "Restaurant id is required to fetch menu" };

		const account = await getRestaurantData(username);
		if (!account) throw { status: 404, message: `Account with restaurant id: ${username} is not found` };

		const { __v, _id, kitchens, password, profile, menus, tables, ...accountData } = account;
		const { __v: profileVersion, _id: profileId, ...profileData } = profile ?? {};

		return NextResponse.json({
			...accountData,
			profile: profileData,
			menus: menus?.filter((v: TMenu) => !v.hidden).map((v: TMenu) => {
				const { __v: menuVersion, ...menu } = v;
				return menu;
			}),
			tables: tables?.map((v: TTable) => {
				const { __v: tableVersion, _id: tableId, ...table } = v as TTable & { __v?: number; _id?: unknown };
				return table;
			}),
		});
	} catch (err) {
		console.log(err);
		return CatchNextResponse(err);
	}
}

export const dynamic = "force-dynamic";
