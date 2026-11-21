"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { useOrder, useRestaurant } from "#components/context/useContext";
import Modal from "#components/layout/Modal";

import ContactTab from "./ContactTab";
import ExploreTab, { type CustomerProfile } from "./ExploreTab";
import OrderPage from "./Menu/OrderPage";
import UserLogin from "./Menu/UserLogin";
import ReviewsTab, { type CustomerReview } from "./ReviewsTab";
import "./customerTabs.scss";

export default function PageContainer() {
	const searchParams = useSearchParams();
	const { restaurant } = useParams<{ restaurant: string }>();
	const tab = searchParams.get("tab");
	const { loginOpen, setLoginOpen } = useOrder();
	const { restaurant: account, loading: profileLoading } = useRestaurant();
	const profile = account?.profile as CustomerProfile | undefined;
	const [reviews, setReviews] = useState<CustomerReview[]>([]);
	const [reviewsLoading, setReviewsLoading] = useState(true);

	useEffect(() => {
		setReviewsLoading(true);
		fetch(`/api/${restaurant}/reviews`)
			.then((response) => response.json())
			.then(setReviews)
			.finally(() => setReviewsLoading(false));
	}, [restaurant]);

	const refreshReviews = async () => {
		setReviewsLoading(true);
		try {
			const response = await fetch(`/api/${restaurant}/reviews`);
			setReviews(await response.json());
		} finally {
			setReviewsLoading(false);
		}
	};

	return (
		<div className="pageContainer">
			{tab === "explore" && <ExploreTab loading={profileLoading} profile={profile} />}
			{tab === "menu" && <OrderPage />}
			{tab === "reviews" && <ReviewsTab loading={reviewsLoading} onReviewSaved={refreshReviews} restaurant={restaurant} reviews={reviews} />}
			{tab === "contact" && <ContactTab loading={profileLoading} profile={profile} />}
			<Modal open={loginOpen} setOpen={setLoginOpen}>
				<UserLogin setOpen={setLoginOpen} />
			</Modal>
		</div>
	);
}
