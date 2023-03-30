import mongoose from "mongoose"

export const storeSessionStateSchema = new mongoose.Schema({
    storeIdentifier: { type: mongoose.SchemaTypes.ObjectId, required: true },
    currentPage: { type: Number, default: 1 },
    finished: { type: Boolean, default: false }
});

export const StoreSessionState = mongoose.model("StoreSessionState", storeSessionStateSchema);