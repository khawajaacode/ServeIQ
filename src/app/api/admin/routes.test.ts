import { beforeEach, describe, expect, it, vi } from "vitest";

const requireAdminSession = vi.fn();
const requireStaffSession = vi.fn();
const tableFind = vi.fn();
const tableSave = vi.fn();
const Tables = vi.fn().mockImplementation(() => ({ save: tableSave }));
const orderFind = vi.fn();

vi.mock("#utils/helper/authHelper", () => ({ requireAdminSession, requireStaffSession }));
vi.mock("#utils/database/connect", () => ({ default: vi.fn() }));
vi.mock("#utils/helper/common", () => ({
	CatchNextResponse: (error: { message?: string; status?: number }) => Response.json({ message: error.message }, { status: error.status ?? 500 }),
}));
vi.mock("#utils/database/models/table", () => ({ Tables }));
vi.mock("#utils/database/models/account", () => ({ Accounts: { updateOne: vi.fn() } }));
vi.mock("#utils/database/models/order", () => ({
	ORDER_ACTIONS: ["accept", "complete"],
	Orders: { find: orderFind, findById: vi.fn() },
}));
vi.mock("#utils/database/helper/order", () => ({ flattenOrderProducts: (order: unknown) => order }));

describe("admin table and kitchen route scoping", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		requireAdminSession.mockResolvedValue({ role: "admin", username: "restaurant-a" });
		requireStaffSession.mockResolvedValue({ role: "kitchen", username: "restaurant-a" });
		tableFind.mockReturnValue({ sort: () => ({ lean: async () => [] }) });
		tableSave.mockResolvedValue({ name: "Table 1", username: "one", restaurantID: "restaurant-a" });
		orderFind.mockReturnValue({ populate: () => ({ populate: () => ({ lean: async () => [] }) }) });
	});

	it("requires an admin session for table reads", async () => {
		const { GET } = await import("./table/route");
		requireAdminSession.mockRejectedValue({ status: 401, message: "Authentication Required" });
		const response = await GET();
		expect(response.status).toBe(401);
	});

	it("scopes table creation to the authenticated restaurant", async () => {
		const { POST } = await import("./table/route");
		await POST(new Request("http://localhost/api/admin/table", { method: "POST", body: JSON.stringify({ name: "Table 1", username: "ONE" }) }));
		expect(Tables).toHaveBeenCalledWith({ name: "Table 1", username: "one", restaurantID: "restaurant-a" });
	});

	it("scopes kitchen order reads and only permits completion", async () => {
		const { GET } = await import("./order/route");
		await GET();
		expect(orderFind).toHaveBeenCalledWith({ restaurantID: "restaurant-a", state: "active" });

		const { POST } = await import("./order/action/route");
		const response = await POST(
			new Request("http://localhost/api/admin/order/action", {
				method: "POST",
				body: JSON.stringify({ action: "accept", orderID: "order-1" }),
			})
		);
		expect(response.status).toBe(403);
	});
});
