import { NextResponse } from "next/server";

import { findAccountByUsername } from "#utils/database/helper/account";
import { requireAdminSession } from "#utils/helper/authHelper";
import { CatchNextResponse } from "#utils/helper/common";
import { verifyPassword } from "#utils/helper/passwordHelper";

export async function POST(req: Request) {
	try {
		const session = await requireAdminSession();
		const { password } = await req.json();

		if (typeof password !== "string" || !password) throw { status: 400, message: "Password Required" };

		const account = await findAccountByUsername(session.username);

		if (await verifyPassword(password, account.password)) return NextResponse.json({ status: 200, message: "Authentication Successful" });

		return NextResponse.json({ status: 403, message: "Password incorrect" }, { status: 403 });
	} catch (err) {
		console.log(err);
		return CatchNextResponse(err);
	}
}

export const dynamic = "force-dynamic";
