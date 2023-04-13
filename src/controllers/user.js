import { User } from "../models/user.js";
import { Request, RequestTypes } from "../models/request.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { getUserFromToken, getUsernameAndPasswordFromHeader } from "../functions/auth-functions.js";
import { SearchResult } from "../models/search-result.js";
import { Types } from "mongoose";

export async function CreateNewUser(req, res) {
    const { email, password } = req.body;

    if (typeof email == "string") {

        const users = await User.find({ email });

        if (users.length == 0) {
            if (typeof password == "string" && password.length >= 8) {
                const encriptedPassword = await bcrypt.hash(password, Number(process.env.BCRYPT_SALTS));
                const token = jwt.sign({ email }, process.env.TOKEN_SECRET, { expiresIn: "7d" });
                const user = new User({ email, password: encriptedPassword });
                user.tokens.push(token);
                await user.save();
                res.header("Set-Cookie", `bitnose_access_token=${token};HttpOnly;Max-Age=${60 * 60 * 24 * 7};Path=/;Secure`);
                res.status(201).send("User successfully created");
            }
            else
                res.status(400).send("Invalid password. Every password need to have at least 8 alphanumeric digits");
        }
        else
            res.status(409).send("Already registered email");
    }
    else
        res.status(400).send("Invalid email");
}

export async function GetUser(req, res) {
    try {
        const user = await getUserFromToken(req);
        const { __v, tokens, password, _id, ...userObj } = user._doc;
        res.json(userObj);
    }
    catch (error) {
        res.status(error.code).send(error.msg);
    }
}

export async function Login(req, res) {
    try {
        const { username, password } = getUsernameAndPasswordFromHeader(req);

        const user = await User.findOne({ email: username });
        if (user != null) {
            await user.removeInvalidTokens();
            if (await bcrypt.compare(password, user.password)) {
                const token = jwt.sign({ email: username }, process.env.TOKEN_SECRET, { expiresIn: "7d" });
                user.tokens.push(token);
                await user.save();
                res.header("Set-Cookie", `bitnose_access_token=${token};HttpOnly;Max-Age=${60 * 60 * 24 * 7};Path=/;Secure`);
                res.send("Logged in");
            }
            else
                throw { code: 401, msg: "Your email/password is wrong. Try again" };
        }
        else
            throw { code: 401, msg: "Your email/password is wrong. Try again" };
    }
    catch (error) {
        res.status(error.code).send(error.msg);
    }
}

export async function AdminRequest(req, res) {
    try {
        const user = await getUserFromToken(req);
        const request = new Request({
            user: user._id,
            type: RequestTypes.BecomeAdmin
        });
        await request.save();
        res.status(201).send("Your request was created and sended. Wait until one of our admins accept it");
    }
    catch (error) {
        res.status(error.code).send(error.msg);
    }
}

export async function RedirectToUserPanelOrRegister(req, res) {
    try {
        await getUserFromToken(req);
        res.redirect("/user-panel/");
    }
    catch (error) {
        res.redirect("/login-page/");
    }
}

export async function AddProductToList(req, res) {
    try {
        const product = req.body;

        const user = await getUserFromToken(req);

        const searchResult = new SearchResult(product);

        await searchResult.validate();

        user.productsList.push(searchResult);

        await user.save();

        res.json({ productId: searchResult._id });

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

export async function RemoveProductFromList(req, res) {
    try {
        const { productId } = req.body;

        if (Types.ObjectId.isValid(productId)) {
            const user = await getUserFromToken(req);

            const product = user.productsList.find(product => product._id.equals(productId));
            if (product != null) {
                const productIndex = user.productsList.indexOf(product);
                user.productsList.splice(productIndex, 1);

                await user.save();

                res.send("The product was successfully removed");
            }
            else
                throw { code: 404, msg: "There are no products with this id" }
        }
        else
            throw { code: 400, msg: "Invalid product id" };
    }
    catch (error) {
        res.status(error.code).send(error.msg);
    }
}