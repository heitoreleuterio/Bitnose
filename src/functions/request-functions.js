import { Types } from "mongoose";
import { User } from "../models/user.js";
import Store from "../models/store.js";
import JSONfn from "json-fn"

export async function BecomeAdminProcess(request) {
    const user = await getUserFromMongoRequest(request);
    user.isAdministrator = true;
    await user.save();
}

export async function NewStoreProcess(request) {
    try {
        await getUserFromMongoRequest(request);
        if (
            request.content != null &&
            "name" in request.content &&
            "description" in request.content &&
            "url" in request.content &&
            "countries" in request.content &&
            "categories" in request.content) {

            const store = new Store({
                name: request.content.name,
                description: request.content.description,
                url: request.content.url,
                countries: request.content.countries,
                categories: request.content.categories
            });

            await store.save();
        }
        else
            throw { name: "InvalidRequest", msg: `The content of the request '${this._id}' isn't valid` };
    }
    catch (error) {
        if (error.name == "ValidationError")
            throw { name: "InvalidRequest", msg: `The content of the request '${this._id}' isn't valid` };
        else
            throw error;
    }
}

export async function UpdateStoreSearchFunctionProcess(request) {
    await getUserFromMongoRequest(request);
    if (
        request.content != null &&
        "storeId" in request.content &&
        Types.ObjectId.isValid(request.content.storeId),
        "searchFunction" in request.content &&
        typeof request.content.searchFunction == "string") {

        const store = await Store.findById(request.content.storeId);
        if (store != null) {
            try {
                JSONfn.parse(request.content.searchFunction);

                store.searchFunction = request.content.searchFunction;
                await store.save();
            }
            catch (error) {
                throw { name: "InvalidRequest", msg: `The content of the request '${this._id}' isn't valid` }
            }
        }
        else
            throw { name: "InvalidRequest", msg: `The request '${this._id}' don't exist` };
    }
    else
        throw { name: "InvalidRequest", msg: `The content of the request '${this._id}' isn't valid` };
}

async function getUserFromMongoRequest(request) {
    const user = await User.findById(new Types.ObjectId(request.user));
    if (user != null)
        return user;
    else
        throw { name: "InvalidRequest", msg: `The request '${this._id}' don't exist` };
}