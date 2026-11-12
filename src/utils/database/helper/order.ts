import type { TMenu } from "#utils/database/models/menu";
import type { TOrder, TProduct } from "#utils/database/models/order";

export const flattenOrderProducts = (order: TOrder | null): TOrder | null => {
	if (!order?.products) return order;

	return {
		...order,
		products: order.products.map((p) => {
			const product = p as unknown as TProduct;
			const menu = product.product as unknown as TMenu;
			return { ...product, ...menu, product: menu?._id };
		}) as unknown as TProduct[],
	} as unknown as TOrder;
};
