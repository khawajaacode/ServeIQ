import mongoose, { type HydratedDocument } from "mongoose";

const CustomerSchema = new mongoose.Schema<TCustomer>(
	{
		fname: { type: String, trim: true, required: true },
		lname: { type: String, trim: true, required: true },
		phone: { type: String, trim: true, unique: true, required: true, sparse: true, index: { unique: true } },
		email: { type: String, trim: true, unique: true, sparse: true, index: { unique: true } },
	},
	{ timestamps: true }
);

export const Customers = mongoose.models?.customers ?? mongoose.model<TCustomer>("customers", CustomerSchema);
export type TCustomer = HydratedDocument<{
	fname: string;
	lname: string;
	phone: string;
	email: string;
}>;
