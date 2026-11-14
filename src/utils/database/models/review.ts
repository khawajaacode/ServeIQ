import mongoose, { type HydratedDocument } from "mongoose";

const ReviewSchema = new mongoose.Schema<TReview>(
	{
		restaurantID: { type: String, trim: true, lowercase: true, required: true, index: true },
		customer: { type: mongoose.Schema.Types.ObjectId, ref: "customers", required: true },
		rating: { type: Number, min: 1, max: 5, required: true },
		comment: { type: String, trim: true, required: true, maxlength: 1000 },
	},
	{ timestamps: true }
);

ReviewSchema.index({ restaurantID: 1, customer: 1 }, { unique: true });

export const Reviews = mongoose.models?.reviews ?? mongoose.model<TReview>("reviews", ReviewSchema);
export type TReview = HydratedDocument<{
	restaurantID: string;
	customer: mongoose.Types.ObjectId;
	rating: number;
	comment: string;
}>;
