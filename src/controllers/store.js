import { Types } from "mongoose";
import Store from "../models/store.js"
import JSONfn from "json-fn"

export async function AddNewStore(req, res) {
    const { name, description, url, countries, categories } = req.body;
    try {
        const store = new Store({ name, description, url, countries, categories });
        await store.save();
        res.status(201).json({
            message: "New store added with success!",
            storeIdentifier: store.identifier
        });
    }
    catch (error) {
        if (error.name == "ValidationError")
            res.status(400).send(error);
        else {
            console.log(error);
            res.status(500).send("Ocorreu um erro interno no servidor, tente novamente mais tarde");
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
        const store = await Store.findById(identifier);
        if (store != null) {
            store.searchFunction = searchFunction;
            await store.save();
            res.status(200).send("Search function updated with success!");
        }
        else {
            throw { code: 404, error: "Invalid store identifier" };
        }
    }
    catch (error) {
        const { code, ...errorInfo } = error;
        if (error.code != null)
            res.status(code).send(errorInfo);
        else {
            console.log(error);
            res.status(500).send("Ocorreu um erro interno no servidor, tente novamente mais tarde");
        }

    }
}

export async function GetStore(req, res) {
    const { identifier } = req.params;
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
    }
    else
        res.status(404).json({ message: "Invalid store identifier" });
}