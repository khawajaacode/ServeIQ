import mongoose, { type HydratedDocument } from "mongoose";

import type { TCustomer } from "./customer";
import type { TMenu } from "./menu";

const orderState = ["active", "preparing", "ready", "reject", "cancel", "complete"] as const;
export const ORDER_ACTIONS = ["accept", "preparing", "ready", "complete", "reject", "rejectOnActive"] as const;
export type TOrderAction = (typeof ORDER_ACTIONS)[number];
const OrderSchema = new mongoose.Schema<TOrder>(
	{
		customer: { ref: "customers", type: mongoose.Schema.Types.ObjectId },
		orderTotal: { type: Number },
		products: [
			{
				adminApproved: { default: false, type: Boolean },
				price: { required: true, type: Number },
				product: { ref: "menus", type: mongoose.Schema.Types.ObjectId },
				quantity: { default: 1, type: Number },
				tax: { required: true, type: Number },
			},
		],
		restaurantID: { lowercase: true, required: true, trim: true, type: String },
		state: { default: "active", enum: orderState, lowercase: true, trim: true, type: String },
		stockReserved: { default: false, type: Boolean },
		table: { lowercase: true, required: true, trim: true, type: String },
		taxTotal: { type: Number },
	},
	{ timestamps: true }
);

OrderSchema.pre("save", function () {
	this.orderTotal = 0;
	this.taxTotal = 0;
	this?.products?.forEach(({ quantity, price, tax }) => {
		this.orderTotal += price * quantity;
		this.taxTotal += tax * quantity;
	});
});

export const Orders = mongoose.models?.orders ?? mongoose.model<TOrder>("orders", OrderSchema);
export type TOrder = HydratedDocument<{
	restaurantID: string;
	table: string;
	customer: TCustomer;
	state: (typeof orderState)[number];
	stockReserved: boolean;
	orderTotal: number;
	taxTotal: number;
	products: TProduct[];
}>;

export type TProduct = TMenu & {
	_id: mongoose.Types.ObjectId;
	product: TMenu;
	quantity: number;
	price: number;
	tax: number;
	adminApproved: boolean;
};
