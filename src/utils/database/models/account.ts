import mongoose, { type HydratedDocument } from "mongoose";

import { hashPassword } from "#utils/helper/passwordHelper";

import type { TKitchen } from "./kitchen";
import type { TMenu } from "./menu";
import type { TProfile } from "./profile";
import type { TTable } from "./table";

const AccountSchema = new mongoose.Schema<TAccount>(
	{
		username: { type: String, trim: true, lowercase: true, unique: true, required: true, sparse: true, index: { unique: true } },
		email: { type: String, trim: true, lowercase: true, unique: true, required: true, sparse: true, index: { unique: true } },
		password: { type: String, required: true },
		verified: { type: Boolean, default: false },
		accountActive: { type: Boolean, default: true },
		subscriptionActive: { type: Boolean, default: true },
		profile: { type: mongoose.Schema.Types.ObjectId, ref: "profiles", unique: true },
		kitchens: [{ type: mongoose.Schema.Types.ObjectId, ref: "kitchens", unique: true }],
		tables: [{ type: mongoose.Schema.Types.ObjectId, ref: "tables", unique: true }],
		menus: [{ type: mongoose.Schema.Types.ObjectId, ref: "menus", unique: true }],
	},
	{ timestamps: true }
);

AccountSchema.pre("save", async function () {
	if (this.isModified("password")) this.password = await hashPassword(this?.password);
});

export const Accounts = mongoose.models?.accounts ?? mongoose.model<TAccount>("accounts", AccountSchema);

// ponytail: process-lifetime account cache, stale if a restaurant's profile changes. Drop the Map and re-query on every save if category validation ever misfires.
const accountCache = new Map<string, TAccount | null>();

export const requireAccount = async (restaurantID: string) => {
	let account = accountCache.get(restaurantID);
	if (account === undefined) {
		account = await Accounts.findOne<TAccount>({ username: restaurantID }).populate("profile");
		accountCache.set(restaurantID, account);
	}
	if (!account) throw new Error(`The associated account with username '${restaurantID}' does not exist.`);
	return account;
};

export type TAccount = HydratedDocument<{
	username: string;
	email: string;
	password: string;
	verified: boolean;
	accountActive: boolean;
	subscriptionActive: boolean;
	profile: TProfile;
	kitchens: TKitchen[];
	tables: TTable[];
	menus: TMenu[];
}>;
