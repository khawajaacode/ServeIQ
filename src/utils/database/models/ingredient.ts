import mongoose, { type HydratedDocument } from "mongoose";

const IngredientSchema = new mongoose.Schema<TIngredient>(
	{
		lowStockThreshold: { default: 0, min: 0, required: true, type: Number },
		name: { required: true, trim: true, type: String },
		restaurantID: { lowercase: true, required: true, trim: true, type: String },
		stock: { default: 0, min: 0, required: true, type: Number },
		unit: { required: true, trim: true, type: String },
	},
	{ timestamps: true }
);

IngredientSchema.index({ name: 1, restaurantID: 1 }, { unique: true });

export const Ingredients = mongoose.models?.ingredients ?? mongoose.model<TIngredient>("ingredients", IngredientSchema);
export type TIngredient = HydratedDocument<{
	restaurantID: string;
	name: string;
	stock: number;
	unit: string;
	lowStockThreshold: number;
}>;
