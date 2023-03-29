import mongoose from "mongoose"

export const searchResultSchema = new mongoose.Schema({
    title: { type: String, required: true },
    price: { type: Number, required: true },
    imageSrc: { type: String, required: true },
    url: { type: String, required: true },
    currency: { type: String, required: true }
});

export const SearchResult = mongoose.model("SearchResult", searchResultSchema);