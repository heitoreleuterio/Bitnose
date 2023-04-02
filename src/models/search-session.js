import mongoose from "mongoose"
import { searchResultSchema } from "./search-result.js"
import { storeSessionStateSchema } from "./store-session-state.js"

export const searchSessionSchema = new mongoose.Schema({
    search: { type: String, required: true },
    resultsPerPage: { type: [[searchResultSchema]], default: new Array() },
    finished: { type: Boolean, default: false },
    startDate: { type: Date, default: new Date() },
    StoresSessionState: { type: [storeSessionStateSchema], default: new Array() },
    acceptedCountries: { type: [String], default: new Array() },
    acceptedCategories: { type: [String], default: new Array() }
});

export const SearchSession = mongoose.model("SearchSession", searchSessionSchema);

