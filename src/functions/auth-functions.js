import jwt from "jsonwebtoken";
import { User } from "../models/user.js";

export const BITNOSE_ACCESS_TOKEN_IDENTIFIER = "bitnose_access_token";

export function getUsernameAndPasswordFromHeader(req) {
    const authScheme = "Basic";
    const header = req.headers.authorization;
    if (typeof header == "string") {
        const basicScheme = header.trim().indexOf(authScheme) == 0;
        if (basicScheme) {
            const data = header.substring(authScheme.length + 1, header.length).trim();
            const buffer = Buffer.from(data, "base64");
            const finalText = buffer.toString("utf-8");

            const colonIndex = finalText.indexOf(':');

            const username = finalText.substring(0, colonIndex);
            const password = finalText.substring(colonIndex + 1, finalText.length);

            return { username, password };
        }
        throw { code: 401, msg: "Unathorized, invalid auth scheme" };
    }
    throw { code: 401, msg: "Unathorized, invalid header" };
}

export async function getUserFromToken(req) {
    const token = getTokenFromHeader(req);
    const tokenContent = getTokenContentWhileVerifyItAndHandleErrors(token);
    const user = (await User.find({ email: tokenContent.email }))[0];
    if (user != null && user.tokens.some(userToken => userToken == token))
        return user;
    else
        throw { code: 401, msg: "Invalid Token" };
}

export function getTokenFromHeader(req) {
    const header = req.header("Cookie");
    if (typeof header == "string") {
        const identifierIndex = header.indexOf(BITNOSE_ACCESS_TOKEN_IDENTIFIER);
        const identifierLength = BITNOSE_ACCESS_TOKEN_IDENTIFIER.length + 1;
        const contentStartIndex = identifierIndex + identifierLength;
        const nextCookieIndex = header.indexOf("=", contentStartIndex);
        const content = header.substring(contentStartIndex, nextCookieIndex != -1 ? nextCookieIndex : undefined);
        return content;
    }
    throw { code: 401, msg: "Invalid token" };
}

export function getTokenContentWhileVerifyItAndHandleErrors(token) {
    try {
        return jwt.verify(token, process.env.TOKEN_SECRET)
    }
    catch (error) {
        throw handleJwtErrors(error);
    }
}

export function handleJwtErrors(error) {
    switch (error.name) {
        case "TokenExpiredError":
            return { code: 401, msg: "Token has expired" };
        default:
            return { code: 401, msg: "Invalid Token" };
    }
}

