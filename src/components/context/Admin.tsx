import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { createContext, type ReactNode, useEffect, useState } from "react";
import { toast } from "react-toastify";
import useSWR from "swr";

import type { TMenu } from "#utils/database/models/menu";
import type { TOrder, TOrderAction } from "#utils/database/models/order";
import type { TProfile } from "#utils/database/models/profile";
import type { TTable } from "#utils/database/models/table";
import { fetcher } from "#utils/helper/common";

const AdminDefault: TAdminInitialType = {
	menus: [],
	orderAction: () => new Promise<void>(() => undefined),
	orderActionLoading: false,
	orderActive: [],
	orderHistory: [],
	orderLoading: false,
	orderRequest: [],
	profile: undefined,
	profileLoading: false,
	profileMutate: () => new Promise<void>(() => undefined),
	tables: [],
};

const sortByDate = (a: { updatedAt: string | number | Date }, b: { updatedAt: string | number | Date }) =>
	new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();

export const AdminContext = createContext(AdminDefault);
export const AdminProvider = ({ children }: TAdminProviderProps) => {
	const session = useSession();
	const isAdmin = session.status === "authenticated" && session.data.role === "admin";
	const params = useSearchParams();
	const _tab = params.get("tab");
	const _subTab = params.get("subTab");
	const { data: { profile, menus = [], tables = [] } = {}, isLoading: profileLoading, mutate: profileMutate } = useSWR(isAdmin ? "/api/admin" : null, fetcher);
	const { data: orderData = [], isLoading: orderLoading, mutate } = useSWR(isAdmin ? "/api/admin/order" : null, fetcher);
	const [orderActionLoading, setOrderActionLoading] = useState(false);

	const { orderRequest, orderActive, orderHistory } =
		orderData?.reduce?.(
			(acc: { orderRequest: TOrder[]; orderActive: TOrder[]; orderHistory: TOrder[] }, order: TOrder) => {
				if (order.state === "active") {
					if (order.products.some(({ adminApproved }) => adminApproved)) acc.orderActive.push(order);
					if (order.products.some(({ adminApproved }) => !adminApproved)) acc.orderRequest.push(order);
				} else acc.orderHistory.push(order);
				return acc;
			},
			{ orderActive: [], orderHistory: [], orderRequest: [] }
		) ?? {};

	[orderRequest, orderActive, orderHistory].forEach((arr) => arr?.sort?.(sortByDate));

	const orderAction = async (orderID: string, action: TOrderAction) => {
		if (orderActionLoading) return;
		setOrderActionLoading(true);
		try {
			const req = await fetch("/api/admin/order/action", {
				body: JSON.stringify({ action, orderID }),
				headers: { "Content-Type": "application/json" },
				method: "POST",
			});
			const res = await req.json().catch(() => null);

			if (!req.ok) {
				toast.error(res?.message || "Unable to update order");
				return;
			}

			await mutate();
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Unable to update order");
		} finally {
			setOrderActionLoading(false);
		}
	};

	useEffect(() => {
		if (!isAdmin) return;
		mutate();
		const events = new EventSource("/api/events");
		const refresh = window.setInterval(() => mutate(), 15_000);
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
	}, [isAdmin, mutate]);

	return (
		<AdminContext.Provider
			value={{
				menus,
				orderAction,
				orderActionLoading,
				orderActive,
				orderHistory,
				orderLoading,
				orderRequest,
				profile,
				profileLoading,
				profileMutate,
				tables,
			}}
		>
			{children}
		</AdminContext.Provider>
	);
};

export interface TAdminProviderProps {
	children?: ReactNode;
}

export interface TAdminInitialType {
	menus: TMenu[];
	orderAction: (orderID: string, action: TOrderAction) => Promise<void>;
	orderActionLoading: boolean;
	orderActive: TOrder[];
	orderHistory: TOrder[];
	orderLoading: boolean;
	orderRequest: TOrder[];
	profile?: TProfile;
	profileLoading: boolean;
	profileMutate: () => Promise<void>;
	tables: TTable[];
}
