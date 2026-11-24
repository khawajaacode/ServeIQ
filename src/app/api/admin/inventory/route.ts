import mongoose from "mongoose";
import { NextResponse } from "next/server";

import connectDB from "#utils/database/connect";
import { Ingredients } from "#utils/database/models/ingredient";
import { Recipes } from "#utils/database/models/recipe";
import { requireAdminSession } from "#utils/helper/authHelper";
import { CatchNextResponse } from "#utils/helper/common";
import { publish } from "#utils/realtime/bus";

export async function GET() {
	try {
		const session = await requireAdminSession();
		await connectDB();
		const [ingredients, recipes] = await Promise.all([
			Ingredients.find({ restaurantID: session.username }).sort({ name: 1 }).lean(),
			Recipes.find({ restaurantID: session.username }).lean(),
		]);
		return NextResponse.json({ ingredients, recipes });
	} catch (err) {
		return CatchNextResponse(err);
	}
}

export async function POST(req: Request) {
	try {
		const session = await requireAdminSession();
		const body = await req.json();
		await connectDB();
		if (body.menuItemID && body.ingredientID && body.quantityRequired !== undefined) {
			if (!mongoose.isValidObjectId(body.menuItemID) || !mongoose.isValidObjectId(body.ingredientID)) throw { status: 400, message: "Invalid recipe ids" };
			const quantityRequired = Number(body.quantityRequired);
			const ingredient = await Ingredients.findOne({ _id: body.ingredientID, restaurantID: session.username });
			if (!ingredient) throw { status: 404, message: "Ingredient not found" };
			if (!Number.isFinite(quantityRequired) || quantityRequired < 0) throw { status: 400, message: "Recipe quantity must be non-negative" };
			const recipe = await Recipes.findOneAndUpdate(
				{ restaurantID: session.username, menuItemID: body.menuItemID, ingredientID: body.ingredientID },
				{ restaurantID: session.username, menuItemID: body.menuItemID, ingredientID: body.ingredientID, quantityRequired },
				{ upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
			);
			return NextResponse.json(recipe);
		}
		if (!(body?.name?.trim() && body?.unit?.trim())) throw { message: "Ingredient name and unit are required", status: 400 };
		const stock = Number(body.stock);
		const lowStockThreshold = Number(body.lowStockThreshold);
		if (!Number.isFinite(stock) || stock < 0 || !Number.isFinite(lowStockThreshold) || lowStockThreshold < 0)
			throw { message: "Stock and low-stock threshold must be non-negative numbers", status: 400 };

		const previous = body.id ? await Ingredients.findOne({ _id: body.id, restaurantID: session.username }).lean() : null;
		const ingredient = await Ingredients.findOneAndUpdate(
			{ ...(body.id ? { _id: body.id } : {}), name: body.name.trim().toLowerCase(), restaurantID: session.username },
			{ lowStockThreshold, name: body.name.trim().toLowerCase(), stock, unit: body.unit.trim() },
			{ new: true, runValidators: true, setDefaultsOnInsert: true, upsert: true }
		).lean();
		if (!ingredient) throw { message: "Unable to save ingredient", status: 500 };

		if (body.menuItemID && body.quantityRequired !== undefined) {
			if (!mongoose.isValidObjectId(body.menuItemID)) throw { message: "Invalid menu item id", status: 400 };
			const quantityRequired = Number(body.quantityRequired);
			if (!Number.isFinite(quantityRequired) || quantityRequired < 0) throw { message: "Recipe quantity must be non-negative", status: 400 };
			await Recipes.findOneAndUpdate(
				{ ingredientID: ingredient._id, menuItemID: body.menuItemID, restaurantID: session.username },
				{ ingredientID: ingredient._id, menuItemID: body.menuItemID, quantityRequired, restaurantID: session.username },
				{ new: true, runValidators: true, setDefaultsOnInsert: true, upsert: true }
			);
		}

		if ((!previous || previous.stock > previous.lowStockThreshold) && ingredient.stock <= ingredient.lowStockThreshold)
			publish(session.username, "inventory.low", {
				ingredientID: ingredient._id.toString(),
				name: ingredient.name,
				stock: ingredient.stock,
				unit: ingredient.unit,
			});
		return NextResponse.json(ingredient, { status: previous ? 200 : 201 });
	} catch (err) {
		return CatchNextResponse(err);
	}
}

export const dynamic = "force-dynamic";
