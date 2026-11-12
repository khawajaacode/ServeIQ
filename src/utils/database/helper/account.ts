import connectDB from "#utils/database/connect";
import { Accounts, type TAccount } from "#utils/database/models/account";

export async function getRestaurantData(username: string) {
	await connectDB();
	return await Accounts.findOne<TAccount>({ username }).populate("profile").populate("tables").populate("menus").lean();
}

export async function findAccountByUsername(username: string) {
	await connectDB();
	const account = await Accounts.findOne<TAccount>({ username });
	if (!account) throw { status: 500, message: "Something went wrong" };
	return account;
}
