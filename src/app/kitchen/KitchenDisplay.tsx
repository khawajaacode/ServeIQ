"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "xtreme-ui";

import "./kitchenDisplay.scss";

interface KitchenOrder {
	_id: string;
	createdAt: string;
	customer?: { fname: string; lname: string };
	orderTotal: number;
	products: Array<{ name: string; quantity: number; adminApproved: boolean }>;
	state: string;
	table: string;
}

const getActiveOrders = async () => {
	const response = await fetch("/api/admin/order");
	if (!response.ok) throw new Error("Unable to load kitchen orders");

	const orders = (await response.json()) as KitchenOrder[];
	return orders.filter((order) => order.state === "active" && order.products.some((product) => product.adminApproved));
};

const elapsed = (createdAt: string, now: number) => {
	const minutes = Math.max(0, Math.floor((now - new Date(createdAt).getTime()) / 60_000));
	return minutes ? `${minutes} min ago` : "Just now";
};

export default function KitchenDisplay() {
	const session = useSession();
	const router = useRouter();
	const openDashboard = useCallback(() => router.push("/dashboard"), [router]);
	const [orders, setOrders] = useState<KitchenOrder[]>([]);
	const [now, setNow] = useState(Date.now());
	const [loading, setLoading] = useState(true);
	const [busy, setBusy] = useState<string>();
	const [error, setError] = useState("");

	const loadOrders = useCallback(async () => {
		try {
			setError("");
			setOrders(await getActiveOrders());
		} catch (err) {
			setError(err instanceof Error ? err.message : "Unable to load kitchen orders");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		if (session.data?.role !== "admin") return;
		loadOrders();
		const refresh = window.setInterval(loadOrders, 10_000);
		const clock = window.setInterval(() => setNow(Date.now()), 10_000);
		return () => {
			window.clearInterval(refresh);
			window.clearInterval(clock);
		};
	}, [loadOrders, session.data?.role]);

	const complete = async (orderID: string) => {
		setBusy(orderID);
		try {
			const response = await fetch("/api/admin/order/action", {
				body: JSON.stringify({ action: "complete", orderID }),
				headers: { "Content-Type": "application/json" },
				method: "POST",
			});
			if (!response.ok) throw new Error("Unable to complete order");
			await loadOrders();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Unable to complete order");
		} finally {
			setBusy(undefined);
		}
	};

	if (session.status === "loading") return <main className="kitchenDisplay">Loading kitchen...</main>;
	if (session.status !== "authenticated" || session.data.role !== "admin") return <main className="kitchenDisplay">Admin login required.</main>;
	if (loading) return <main className="kitchenDisplay">Loading kitchen orders...</main>;

	return (
		<main className="kitchenDisplay">
			<header>
				<h1>Kitchen</h1>
				<div className="headerActions">
					<p>
						{orders.length} active {orders.length === 1 ? "ticket" : "tickets"}
					</p>
					<Button icon="e09f" iconType="solid" label="Dashboard" onClick={openDashboard} />
				</div>
			</header>
			{error ? <p className="error">{error}</p> : null}
			{orders.length === 0 ? (
				<p className="empty">No active orders.</p>
			) : (
				<div className="tickets">
					{orders.map((order) => (
						<article className="ticket" key={order._id}>
							<div className="ticketHeader">
								<div>
									<h2>Table {order.table}</h2>
									<p>
										{order.customer?.fname} {order.customer?.lname}
									</p>
								</div>
								<strong>{elapsed(order.createdAt, now)}</strong>
							</div>
							<ul>
								{order.products.filter((product) => product.adminApproved).map((product, index) => (
									<li key={`${order._id}-${index}`}>
										<span>{product.quantity} × {product.name}</span>
									</li>
								))}
							</ul>
							<button disabled={busy === order._id} onClick={() => complete(order._id)} type="button">
								{busy === order._id ? "Completing..." : "Complete"}
							</button>
						</article>
					))}
				</div>
			)}
		</main>
	);
}
