import mongoose from "mongoose";
import { storeSchema } from "./store.js";
import { searchResultSchema } from "./search-result.js";
import jwt from "jsonwebtoken"

export const userSchema = new mongoose.Schema({
    email: { type: String, required: true },
    password: { type: String, required: true },
    favoriteStores: { type: [storeSchema], default: new Array() },
    productsList: { type: [searchResultSchema], default: new Array() },
    tokens: { type: [String], defaut: new Array() },
    isAdministrator: { type: Boolean, default: false }
});

userSchema.methods.removeInvalidTokens = async function removeInvalidTokens() {
    this.tokens = this.tokens.map(token => {
        try {
            jwt.verify(token, process.env.TOKEN_SECRET);
            return token;
        }
        catch (error) {
            return null;
        }
    }).filter(value => value != null);
    await this.save();
};

export const User = mongoose.model("User", userSchema);

