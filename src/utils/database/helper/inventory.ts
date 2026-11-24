import mongoose from "mongoose";

import { Ingredients } from "#utils/database/models/ingredient";
import { Recipes } from "#utils/database/models/recipe";

export type StockRequirement = { ingredientID: mongoose.Types.ObjectId; quantity: number };

export const getStockRequirements = async (
	restaurantID: string,
	products: Array<{ product: mongoose.Types.ObjectId | { _id: mongoose.Types.ObjectId }; quantity: number }>,
	session?: mongoose.ClientSession
) => {
	const menuItemIDs = products.map(({ product }) => (product instanceof mongoose.Types.ObjectId ? product : product._id));
	const recipes = await Recipes.find({ menuItemID: { $in: menuItemIDs }, restaurantID })
		.lean()
		.session(session ?? null);
	const quantities = new Map<string, StockRequirement>();

	for (const product of products) {
		const menuItemID = product.product instanceof mongoose.Types.ObjectId ? product.product : product.product._id;
		for (const recipe of recipes.filter(({ menuItemID: recipeMenuItemID }) => recipeMenuItemID.toString() === menuItemID.toString())) {
			const key = recipe.ingredientID.toString();
			const existing = quantities.get(key);
			quantities.set(key, {
				ingredientID: recipe.ingredientID,
				quantity: (existing?.quantity ?? 0) + recipe.quantityRequired * product.quantity,
			});
		}
	}

	return [...quantities.values()];
};

export const reserveStock = async (restaurantID: string, requirements: StockRequirement[], session?: mongoose.ClientSession) => {
	const reserved: StockRequirement[] = [];
	for (const requirement of requirements) {
		const result = await Ingredients.updateOne(
			{ _id: requirement.ingredientID, restaurantID, stock: { $gte: requirement.quantity } },
			{ $inc: { stock: -requirement.quantity } },
			{ session }
		);
		if (result.modifiedCount !== 1) {
			await releaseStock(restaurantID, reserved);
			const unavailable = await Ingredients.findOne({ _id: requirement.ingredientID, restaurantID }).lean();
			throw { message: `Insufficient stock for ${unavailable?.name ?? "one or more ingredients"}`, status: 409 };
		}
		reserved.push(requirement);
	}
	return reserved;
};

export const releaseStock = async (restaurantID: string, requirements: StockRequirement[], session?: mongoose.ClientSession) => {
	for (const requirement of requirements) {
		await Ingredients.updateOne({ _id: requirement.ingredientID, restaurantID }, { $inc: { stock: requirement.quantity } }, { session });
	}
};
