"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useState } from "react";
import { Button, Select, Textfield } from "xtreme-ui";

import NoContent from "#components/layout/NoContent";

import "./customerTabs.scss";

export interface CustomerReview {
	_id: string;
	comment: string;
	createdAt?: string;
	customer?: { fname: string; lname: string };
	rating: number;
}

export default function ReviewsTab({ restaurant, reviews, loading, onReviewSaved }: ReviewsTabProps) {
	const [rating, setRating] = useState("5");
	const [comment, setComment] = useState("");
	const [saving, setSaving] = useState(false);
	const average = reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0;
	const handleRatingChange = (value?: string) => setRating(value ?? "5");
	const handleCommentChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setComment(event.target.value);

	const submitReview = async (event: FormEvent) => {
		event.preventDefault();
		setSaving(true);
		try {
			const response = await fetch(`/api/${restaurant}/reviews`, {
				body: JSON.stringify({ comment, rating: Number(rating) }),
				headers: { "Content-Type": "application/json" },
				method: "POST",
			});
			if (response.ok) {
				setComment("");
				await onReviewSaved();
			}
		} finally {
			setSaving(false);
		}
	};

	return (
		<section className="customerTab reviewsTab">
			<div className="customerTabHeader">
				<p className="eyebrow">Guest voices</p>
				<h1>Reviews</h1>
			</div>
			<div className="reviewSummary">
				<strong>{average ? average.toFixed(1) : "—"}</strong>
				<div>
					<span className="stars" title={`${average.toFixed(1)} out of 5 stars`}>
						{"★".repeat(Math.round(average))}
					</span>
					<p>
						{reviews.length} {reviews.length === 1 ? "review" : "reviews"}
					</p>
				</div>
			</div>
			{loading && <div className="reviewLoading">Loading reviews...</div>}
			{!loading && !reviews.length && <NoContent animationName="GhostNoContent" label="No reviews yet" />}
			{!loading && reviews.length > 0 && (
				<div className="reviewList">
					{reviews.map((review) => {
						const name = `${review.customer?.fname ?? ""} ${review.customer?.lname ?? ""}`.trim() || "Guest";
						return (
							<article className="reviewCard" key={review._id}>
								<div className="reviewAvatar">{name.slice(0, 1).toUpperCase()}</div>
								<div className="reviewContent">
									<div className="reviewMeta">
										<div>
											<strong>{name}</strong>
											<span className="stars" title={`${review.rating} out of 5 stars`}>
												{"★".repeat(review.rating)}
											</span>
										</div>
										<time dateTime={review.createdAt}>{review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ""}</time>
									</div>
									<p>{review.comment}</p>
								</div>
							</article>
						);
					})}
				</div>
			)}
			<form className="reviewForm" onSubmit={submitReview}>
				<h2>Share your experience</h2>
				<Select
					className="reviewField"
					onChange={handleRatingChange}
					options={[1, 2, 3, 4, 5].map((value) => ({ label: `${value} stars`, value: String(value) }))}
					placeholder="Rating"
					value={rating}
				/>
				<Textfield className="reviewField" onChange={handleCommentChange} placeholder="Write a review" required textarea value={comment} />
				<Button disabled={saving} label="Post review" loading={saving} type="submit" />
			</form>
		</section>
	);
}

interface ReviewsTabProps {
	loading: boolean;
	onReviewSaved: () => Promise<void>;
	restaurant: string;
	reviews: CustomerReview[];
}
