import Store from "../models/store.js"
import mongoose from "mongoose";

export async function AddNewStore(req, res) {
    const { name, description, url } = req.body;
    try {
        const store = new Store({ name, description, url });
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
    const { identifier, searchFunction } = req.body;
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