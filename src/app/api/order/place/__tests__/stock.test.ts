import mongoose from "mongoose";
import { describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ stock: 1 }));
const updateOne = vi.hoisted(() =>
	vi.fn(async (_filter: unknown, update: { $inc: { stock: number } }) => {
		if (update.$inc.stock > 0) {
			state.stock += update.$inc.stock;
			return { modifiedCount: 1 };
		}
		if (state.stock < Math.abs(update.$inc.stock)) return { modifiedCount: 0 };
		state.stock += update.$inc.stock;
		return { modifiedCount: 1 };
	})
);

vi.mock("#utils/database/models/ingredient", () => ({
	Ingredients: { updateOne, findOne: vi.fn().mockResolvedValue({ name: "Bun" }) },
}));
vi.mock("#utils/database/models/recipe", () => ({ Recipes: { find: vi.fn() } }));

describe("stock reservation", () => {
	it("allows only one concurrent reservation for one unit", async () => {
		state.stock = 1;
		const { reserveStock } = await import("../../../../../utils/database/helper/inventory");
		const requirement = { ingredientID: new mongoose.Types.ObjectId(), quantity: 1 };
		const results = await Promise.allSettled([reserveStock("restaurant-a", [requirement]), reserveStock("restaurant-a", [requirement])]);

		expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(1);
		expect(results.filter((result) => result.status === "rejected")).toHaveLength(1);
		expect(state.stock).toBe(0);
	});

	it("restores reserved stock when an order is rejected", async () => {
		state.stock = 0;
		const { releaseStock } = await import("../../../../../utils/database/helper/inventory");
		await releaseStock("restaurant-a", [{ ingredientID: new mongoose.Types.ObjectId(), quantity: 1 }]);
		expect(state.stock).toBe(1);
	});
});
