import mongoose from "mongoose"

export const reviewSchema = new mongoose.Schema({
    stars: { type: Number, Range: { min: 0, max: 5 }, default: 0 },
    text: { type: String, default: null }
});

export const Review = mongoose.model("Review", reviewSchema);

