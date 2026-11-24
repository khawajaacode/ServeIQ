import mongoose, { type HydratedDocument } from "mongoose";

const RecipeSchema = new mongoose.Schema<TRecipe>(
	{
		ingredientID: { ref: "ingredients", required: true, type: mongoose.Schema.Types.ObjectId },
		menuItemID: { ref: "menus", required: true, type: mongoose.Schema.Types.ObjectId },
		quantityRequired: { min: 0, required: true, type: Number },
		restaurantID: { lowercase: true, required: true, trim: true, type: String },
	},
	{ timestamps: true }
);

RecipeSchema.index({ ingredientID: 1, menuItemID: 1 }, { unique: true });

export const Recipes = mongoose.models?.recipes ?? mongoose.model<TRecipe>("recipes", RecipeSchema);
export type TRecipe = HydratedDocument<{
	restaurantID: string;
	menuItemID: mongoose.Types.ObjectId;
	ingredientID: mongoose.Types.ObjectId;
	quantityRequired: number;
}>;
