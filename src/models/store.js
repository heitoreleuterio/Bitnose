import mongoose from "mongoose"
import { reviewSchema, Review } from "./review.js"

const storeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    url: { type: String, required: true },
    description: { type: String, default: "" },
    searchFunction: { type: mongoose.Schema.Types.Mixed, default: null },
    review: { type: reviewSchema, default: new Review() }
});

const Store = mongoose.model("Store", storeSchema);

export default Store;