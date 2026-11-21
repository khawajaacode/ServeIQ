import { useSearchParams } from "next/navigation";
import type { UIEvent } from "react";
import { Spinner } from "xtreme-ui";

import { useAdmin } from "#components/context/useContext";

import OrderHistory from "./OrderHistory";
import OrderList from "./OrderList";
import "./orders.scss";

const Orders = (props: TOrdersProps) => {
	const { onScroll } = props;
	const { orderLoading } = useAdmin();
	const queryParams = useSearchParams();
	const subTab = queryParams.get("subTab") ?? "";

	if (orderLoading) return <Spinner fullpage label="Fetching orders..." />;

	if (subTab === "requests") {
		return <OrderList mode="requests" onScroll={onScroll} />;
	}

	if (subTab === "active") {
		return <OrderList mode="active" onScroll={onScroll} />;
	}

	if (subTab === "history") {
		return <OrderHistory onScroll={onScroll} />;
	}
};

export default Orders;

export interface TOrdersProps {
	onScroll: (event: UIEvent<HTMLDivElement>) => void;
}
