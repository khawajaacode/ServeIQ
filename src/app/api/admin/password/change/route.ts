import { NextResponse } from "next/server";

import { findAccountByUsername } from "#utils/database/helper/account";
import { requireAdminSession } from "#utils/helper/authHelper";
import { CatchNextResponse } from "#utils/helper/common";
import { verifyPassword } from "#utils/helper/passwordHelper";

export async function POST(req: Request) {
	try {
		const session = await requireAdminSession();
		const { password, newPassword } = await req.json();

		if (typeof password !== "string" || !password) throw { status: 400, message: "Password Required" };
		if (typeof newPassword !== "string" || newPassword.length < 6) throw { status: 400, message: "New password must be at least 6 characters long" };

		const account = await findAccountByUsername(session.username);

		if (await verifyPassword(password, account.password)) {
			account.password = newPassword;
			await account.save();
			return NextResponse.json({ status: 200, message: "Password successfully changed" });
		}

		return NextResponse.json({ status: 403, message: "Password incorrect" }, { status: 403 });
	} catch (err) {
		console.log(err);
		return CatchNextResponse(err);
	}
}

export const dynamic = "force-dynamic";
