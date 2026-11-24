"use client";

import { useRef } from "react";
import { Button } from "xtreme-ui";

import type { TOrder } from "#utils/database/models/order";
import type { TProfile } from "#utils/database/models/profile";

import "./orderDetails.scss";

const OrderDetails = ({ order, profile }: TOrderDetailsProps) => {
	const root = useRef<HTMLDivElement>(null);

	const handlePrint = () => {
		const node = root.current;
		if (!node) return;
		node.classList.add("printTarget");
		window.addEventListener("afterprint", () => node.classList.remove("printTarget"), { once: true });
		window.print();
	};

	return (
		<div className="orderDetailsPreview" ref={root}>
			<div className="header">
				<div className="title">
					<h2>Order Details</h2>
					<div className="orderId">
						Invoice <span>#{order._id.toString().slice(-6).toUpperCase()}</span>
					</div>
				</div>
				<div className="actions">
					<Button className="actionBtn" icon="f02f" onClick={handlePrint} type="secondary" />
				</div>
			</div>

			<div className="contentScroll">
				<div className="section customerInfo">
					<div className="infoBlock">
						<span className="label">Restaurant</span>
						<span>{profile?.name ?? "—"}</span>
					</div>
					{profile?.address && (
						<div className="infoBlock">
							<span className="label">Address</span>
							<span>{profile.address}</span>
						</div>
					)}
					<div className="infoBlock">
						<span className="label">Date</span>
						<span>{new Date(order.createdAt || Date.now()).toLocaleDateString()}</span>
					</div>
					<div className="infoBlock">
						<span className="label">Table</span>
						<span>{order.table}</span>
					</div>
					{order.customer && (
						<>
							<div className="infoBlock">
								<span className="label">Customer</span>
								<span>
									{order.customer.fname} {order.customer.lname}
								</span>
							</div>
							<div className="infoBlock">
								<span className="label">Contact</span>
								<span>{order.customer.phone}</span>
							</div>
						</>
					)}
				</div>

				<div className="section itemsList">
					<h3>Items</h3>
					<div className="table">
						<div className="row headerRow">
							<span className="col name">Item</span>
							<span className="col qty">Qty</span>
							<span className="col price">Price</span>
							<span className="col total">Total</span>
						</div>
						{order.products?.map((item, index) => (
							<div className="row" key={index}>
								<span className="col name">{item.name}</span>
								<span className="col qty">x{item.quantity}</span>
								<span className="col price">{item.price?.toFixed(2)}</span>
								<span className="col total">{(item.price * item.quantity).toFixed(2)}</span>
							</div>
						))}
					</div>
				</div>

				<div className="section summary">
					<div className="summaryRow">
						<span>Subtotal</span>
						<span>{order.orderTotal?.toFixed(2)}</span>
					</div>
					<div className="summaryRow">
						<span>Tax</span>
						<span>{order.taxTotal?.toFixed(2)}</span>
					</div>
					<div className="summaryRow grandTotal">
						<span>Grand Total</span>
						<span>{((order.orderTotal || 0) + (order.taxTotal || 0)).toFixed(2)}</span>
					</div>
				</div>
			</div>
		</div>
	);
};

export default OrderDetails;

interface TOrderDetailsProps {
	order: TOrder & { _id: string; createdAt: string | Date };
	profile?: TProfile;
}
