import mongoose, { type HydratedDocument } from "mongoose";

import { Accounts, requireAccount } from "./account";

const Veg = ["veg", "non-veg", "contains-egg"] as const;

const MenuSchema = new mongoose.Schema<TMenu>(
	{
		name: { type: String, trim: true, unique: true, required: true, sparse: true, index: { unique: true } },
		restaurantID: { type: String, trim: true, lowercase: true, required: true },
		description: { type: String, trim: true },
		category: { type: String, trim: true, lowercase: true },
		price: { type: Number, required: true },
		taxPercent: { type: Number, trim: true, required: true },
		veg: { type: String, trim: true, lowercase: true, required: true, enum: Veg },
		image: { type: String, trim: true },
		hidden: { type: Boolean, default: true },
	},
	{ timestamps: true }
);

MenuSchema.pre("save", async function () {
	const account = await requireAccount(this.restaurantID);
	if (!account?.profile?.categories?.includes(this.category)) throw new Error("The menu item category does not exist.");
});
MenuSchema.post("save", async function () {
	await Accounts.updateOne({ username: this.restaurantID }, { $addToSet: { menus: this._id } });
});

export const Menus = mongoose.models?.menus ?? mongoose.model<TMenu>("menus", MenuSchema);
export type TMenu = HydratedDocument<{
	name: string;
	restaurantID: string;
	description: string;
	category: string;
	price: number;
	taxPercent: number;
	veg: TVeg;
	image: string;
	hidden: boolean;
}>;

export type TVeg = (typeof Veg)[number];
export type TMenuCustom = TMenu & { quantity: number };
