"use client";

import { useSearchParams } from "next/navigation";

import { useOrder } from "#components/context/useContext";
import Modal from "#components/layout/Modal";
import UnderConstruction from "#components/layout/UnderConstruction";

import OrderPage from "./Menu/OrderPage";
import UserLogin from "./Menu/UserLogin";

export default function PageContainer() {
	const searchParams = useSearchParams();
	const tab = searchParams.get("tab");
	const { loginOpen, setLoginOpen } = useOrder();

	return (
		<div className="pageContainer">
			{tab === "explore" && <UnderConstruction />}
			{tab === "menu" && <OrderPage />}
			{tab === "reviews" && <UnderConstruction />}
			{tab === "contact" && <UnderConstruction />}
			<Modal open={loginOpen} setOpen={setLoginOpen}>
				<UserLogin setOpen={setLoginOpen} />
			</Modal>
		</div>
	);
}
