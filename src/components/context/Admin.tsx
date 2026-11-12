import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { createContext, type ReactNode, useEffect, useState } from "react";
import { toast } from "react-toastify";
import useSWR from "swr";

import type { TMenu } from "#utils/database/models/menu";
import type { TOrder, TOrderAction } from "#utils/database/models/order";
import type { TProfile } from "#utils/database/models/profile";
import type { TTable } from "#utils/database/models/table";
import { fetcher } from "#utils/helper/common";

const AdminDefault: TAdminInitialType = {
	profile: undefined,
	menus: [],
	tables: [],
	profileLoading: false,
	profileMutate: () => new Promise<void>(() => undefined),
	orderRequest: [],
	orderActive: [],
	orderHistory: [],
	orderAction: () => new Promise<void>(() => undefined),
	orderActionLoading: false,
	orderLoading: false,
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
	const { data: orderData = [], isLoading: orderLoading, mutate } = useSWR(isAdmin ? "/api/admin/order" : null, fetcher, { refreshInterval: 5000 });
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
			{ orderRequest: [], orderActive: [], orderHistory: [] }
		) ?? {};

	[orderRequest, orderActive, orderHistory].forEach((arr) => arr?.sort?.(sortByDate));

	const orderAction = async (orderID: string, action: TOrderAction) => {
		if (orderActionLoading) return;
		setOrderActionLoading(true);
		try {
			const req = await fetch("/api/admin/order/action", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ orderID, action }),
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
		if (isAdmin) mutate();
	}, [isAdmin, mutate]);

	return (
		<AdminContext.Provider
			value={{
				profile,
				menus,
				tables,
				profileLoading,
				profileMutate,
				orderRequest,
				orderActive,
				orderHistory,
				orderAction,
				orderActionLoading,
				orderLoading,
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
