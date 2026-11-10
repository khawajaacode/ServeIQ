import noop from "lodash/noop";
import pick from "lodash/pick";
import { useSession } from "next-auth/react";
import { createContext, type ReactNode, useEffect, useState } from "react";
import { toast } from "react-toastify";
import useSWR from "swr";

import type { TMenu } from "#utils/database/models/menu";
import type { TOrder } from "#utils/database/models/order";
import { fetcher } from "#utils/helper/common";

const OrderDefault: TOrderInitialType = {
	order: undefined,
	loading: false,
	placeOrder: async () => false,
	placingOrder: false,
	cancelOrder: async () => false,
	cancelingOrder: false,
	loginOpen: false,
	setLoginOpen: noop,
};

export const OrderContext = createContext(OrderDefault);
export const OrderProvider = ({ children }: TOrderProviderProps) => {
	const session = useSession();
	const isCustomer = session.status === "authenticated" && session.data?.role === "customer";
	const { data: order, isLoading: loading, mutate } = useSWR(isCustomer ? "/api/order" : null, fetcher, { refreshInterval: 5000 });

	const [placingOrder, setPlacingOrder] = useState(false);
	const [cancelingOrder, setCancelingOrder] = useState(false);
	const [loginOpen, setLoginOpen] = useState(false);

	const placeOrder = async (products: TMenuCustom[]) => {
		setPlacingOrder(true);
		try {
			const req = await fetch("/api/order/place", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					products: products.map((product) => pick(product, ["_id", "quantity"])),
				}),
			});
			const res = await req.json().catch(() => null);

			if (!req.ok) {
				toast.error(res?.message || "Unable to place order");
				return false;
			}

			await mutate().catch((error) => {
				console.error("Order placed, but the order status could not be refreshed:", error);
				toast.error("Order placed, but the latest order status could not be loaded.");
			});
			return true;
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Unable to place order");
			return false;
		} finally {
			setPlacingOrder(false);
		}
	};
	const cancelOrder = async () => {
		setCancelingOrder(true);
		try {
			const req = await fetch("/api/order/cancel", { method: "POST" });
			const res = await req.json().catch(() => null);

			if (!req.ok) {
				toast.error(res?.message || "Unable to cancel order");
				return false;
			}

			await mutate().catch((error) => {
				console.error("Order canceled, but the order status could not be refreshed:", error);
				toast.error("Order canceled, but the latest order status could not be loaded.");
			});
			return true;
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Unable to cancel order");
			return false;
		} finally {
			setCancelingOrder(false);
		}
	};

	useEffect(() => {
		if (isCustomer) mutate();
	}, [isCustomer, mutate]);

	return (
		<OrderContext.Provider value={{ order, loading, placeOrder, placingOrder, cancelOrder, cancelingOrder, loginOpen, setLoginOpen }}>
			{children}
		</OrderContext.Provider>
	);
};

export interface TOrderProviderProps {
	children?: ReactNode;
}

export interface TOrderInitialType {
	cancelingOrder: boolean;
	cancelOrder: () => Promise<boolean>;
	loading: boolean;
	loginOpen: boolean;
	order?: TOrder;
	placeOrder: (products: TMenuCustom[]) => Promise<boolean>;
	placingOrder: boolean;
	setLoginOpen: (open: boolean) => void;
}
type TMenuCustom = TMenu & { quantity: number };
