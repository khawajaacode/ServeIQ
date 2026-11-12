import mongoose from "mongoose";

import { hashPassword } from "#utils/helper/passwordHelper";

import { Accounts, requireAccount } from "./account";

const KitchenSchema = new mongoose.Schema<TKitchen>(
	{
		username: { type: String, trim: true, unique: true, required: true, sparse: true, index: { unique: true } },
		password: { type: String, required: true },
		restaurantID: { type: String, trim: true, lowercase: true, required: true },
	},
	{ timestamps: true }
);

KitchenSchema.pre("save", async function () {
	await requireAccount(this.restaurantID);

	if (this.isModified("password")) this.password = await hashPassword(this.password);
});

KitchenSchema.post("save", async function () {
	await Accounts.updateOne({ username: this.restaurantID }, { $addToSet: { kitchens: this._id } });
});

export const Kitchens = mongoose.models?.kitchens ?? mongoose.model<TKitchen>("kitchens", KitchenSchema);
export interface TKitchen {
	password: string;
	restaurantID: string;
	username: string;
}
