import mongoose from "mongoose";

import { Accounts, requireAccount } from "./account";

const TableSchema = new mongoose.Schema<TTable>(
	{
		name: { type: String, trim: true, required: true },
		username: { type: String, trim: true, required: true },
		restaurantID: { type: String, trim: true, lowercase: true, required: true },
	},
	{ timestamps: true }
);

TableSchema.index({ username: 1, restaurantID: 1 }, { unique: true });

TableSchema.pre("save", async function () {
	await requireAccount(this.restaurantID);
});
TableSchema.post("save", async function () {
	await Accounts.updateOne({ username: this.restaurantID }, { $addToSet: { tables: this._id } });
});

export const Tables = mongoose.models?.tables ?? mongoose.model<TTable>("tables", TableSchema);
export interface TTable {
	_id?: mongoose.Types.ObjectId;
	name: string;
	restaurantID: string;
	username: string;
}
