import { useSession } from "next-auth/react";
import { createContext, type ReactNode, useEffect, useState } from "react";
import { toast } from "react-toastify";
import useSWR from "swr";

import type { TMenuCustom } from "#utils/database/models/menu";
import type { TOrder } from "#utils/database/models/order";
import { fetcher } from "#utils/helper/common";

const OrderDefault: TOrderInitialType = {
	cancelingOrder: false,
	cancelOrder: async () => false,
	loading: false,
	loginOpen: false,
	order: undefined,
	placeOrder: async () => false,
	placingOrder: false,
	setLoginOpen: () => undefined,
};

export const OrderContext = createContext(OrderDefault);
export const OrderProvider = ({ children }: TOrderProviderProps) => {
	const session = useSession();
	const isCustomer = session.status === "authenticated" && session.data?.role === "customer";
	const { data: order, isLoading: loading, mutate } = useSWR(isCustomer ? "/api/order" : null, fetcher);

	const [placingOrder, setPlacingOrder] = useState(false);
	const [cancelingOrder, setCancelingOrder] = useState(false);
	const [loginOpen, setLoginOpen] = useState(false);

	const placeOrder = async (products: TMenuCustom[]) => {
		setPlacingOrder(true);
		try {
			const req = await fetch("/api/order/place", {
				body: JSON.stringify({
					products: products.map(({ _id, quantity }) => ({ _id, quantity })),
				}),
				headers: { "Content-Type": "application/json" },
				method: "POST",
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
		if (!isCustomer) return;
		mutate();
		const events = new EventSource("/api/events");
		const refresh = window.setInterval(() => mutate(), 10_000);
		const update = () => mutate();
		events.addEventListener("order.created", update);
		events.addEventListener("order.accepted", update);
		events.addEventListener("order.preparing", update);
		events.addEventListener("order.ready", update);
		events.addEventListener("order.completed", update);
		return () => {
			events.close();
			window.clearInterval(refresh);
		};
	}, [isCustomer, mutate]);

	return (
		<OrderContext.Provider value={{ cancelingOrder, cancelOrder, loading, loginOpen, order, placeOrder, placingOrder, setLoginOpen }}>
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
