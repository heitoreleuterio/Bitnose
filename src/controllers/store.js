import { Types } from "mongoose";
import Store from "../models/store.js"
import { Request, RequestTypes } from "../models/request.js";
import JSONfn from "json-fn"
import { getUserFromToken } from "../functions/auth-functions.js";

export async function AddNewStore(req, res) {
    const { name, description, url, countries, categories } = req.body;
    try {
        const user = await getUserFromToken(req);
        const store = new Store({ name, description, url, countries, categories });
        if (user.isAdministrator) {
            await store.save();
            res.status(201).json({
                message: "New store added with success!",
                storeIdentifier: store.identifier
            });
        }
        else {
            await store.validate();
            const request = new Request({
                content: { name, description, url, countries, categories },
                type: RequestTypes.NewStore,
                user: user._id
            });
            await request.save();
            res.status(200).send("Request sended");
        }
    }
    catch (error) {
        if (error.name == "ValidationError")
            res.status(400).send(error.message);
        else if (error.code != null) {
            res.status(error.code).send(error.msg);
        }
        else {
            console.log(error);
            res.status(500).send("Unexpected error. Try again later");
        }
    }
}

export async function UpdateStoreSearchFunction(req, res) {
    let { identifier, searchFunction } = req.body;
    if (!Types.ObjectId.isValid(identifier)) {
        res.status(400).send("Invalid identifier");
        return;
    }
    if (typeof searchFunction != "string") {
        res.status(400).send("Search function should be sended as a string, parsed with JSONfn");
        return;
    }
    else {
        searchFunction = searchFunction
            .replace("_NuFrRa_async ()", "_NuFrRa_async (search_query,search_page,puppeteer,SearchResult,countries)");
        searchFunction = searchFunction
            .replace("{", "{'use strict';");
        try {
            JSONfn.parse(searchFunction);
        }
        catch (error) {
            res.status(400).send("Your function isn't valid: " + error);
            return;
        }
    }

    try {
        const user = await getUserFromToken(req);
        const store = await Store.findById(identifier);
        if (store != null) {
            if (user.isAdministrator) {
                store.searchFunction = searchFunction;
                await store.save();
                res.status(200).send("Search function updated with success!");
            }
            else {
                const request = new Request({
                    content: { storeId: store._id, searchFunction: searchFunction },
                    user: user._id,
                    type: RequestTypes.UpdateStoreSearchFunction
                });
                await request.save();
                res.send("Request sended");
            }
        }
        else
            throw { code: 404, error: "Invalid store identifier" };

    }
    catch (error) {
        const { code, ...errorInfo } = error;
        if (error.code != null)
            res.status(code).send(errorInfo);
        else {
            console.log(error);
            res.status(500).send("Unexpected error. Try again later");
        }

    }
}

export async function GetStore(req, res) {
    const { identifier } = req.params;
    if (Types.ObjectId.isValid(identifier)) {
        const store = await Store.findById(identifier);
        if (store != null) {
            res.json({
                name: store.name,
                url: store.url,
                description: store.description,
                identifier: store._id,
                searchFunction: store.searchFunction,
                review: store.review
            });
            return;
        }
    }
    res.status(404).json({ message: "Invalid store identifier" });
}