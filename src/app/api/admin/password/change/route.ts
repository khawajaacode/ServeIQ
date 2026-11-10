import { NextResponse } from "next/server";

import connectDB from "#utils/database/connect";
import { Accounts, type TAccount } from "#utils/database/models/account";
import { requireAdminSession } from "#utils/helper/authHelper";
import { CatchNextResponse } from "#utils/helper/common";
import { verifyPassword } from "#utils/helper/passwordHelper";

export async function POST(req: Request) {
	try {
		await connectDB();
		const session = await requireAdminSession();
		const { password, newPassword } = await req.json();

		if (typeof password !== "string" || !password) throw { status: 400, message: "Password Required" };
		if (typeof newPassword !== "string" || newPassword.length < 6) throw { status: 400, message: "New password must be at least 6 characters long" };

		const account = await Accounts.findOne<TAccount>({ username: session?.username });

		if (!account) throw { status: 500, message: "Something went wrong" };

		const valid = await verifyPassword(password, account.password);

		if (valid) {
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
