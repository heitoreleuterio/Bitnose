import { getUserFromToken } from "../functions/auth-functions.js";
import { Request } from "../models/request.js";
import { Types } from "mongoose";

export async function ListAllRequests(req, res) {
    try {
        const user = await getUserFromToken(req);
        let requests;
        if (user.isAdministrator)
            requests = await Request.find();
        else
            requests = await Request.find({ user: user._id });
        res.json(requests.map(request => {
            const { __v, ...requestDoc } = request._doc;
            return { ...requestDoc }
        }));
    }
    catch (error) {
        res.status(error.code).send(error.msg);
    }
}

export async function AcceptOrDenyRequest(req, res) {
    const { requestId, accept = true } = req.body;
    try {
        const user = await getUserFromToken(req);
        if (user.isAdministrator) {
            if (Types.ObjectId.isValid(requestId)) {
                const request = await Request.findById(requestId);
                if (request != null) {
                    if (typeof accept == "boolean") {
                        await request.processRequest(accept);
                        res.send("Request " + accept ? "accepted" : "denied");
                    }
                    else
                        throw { code: 400, msg: "Accept should be a boolean" };
                }
                else
                    throw { code: 400, msg: "This request don't exist" }
            }
            else
                throw { code: 400, msg: "Invalid request id" };
        }
        else
            throw { code: 401, msg: "This user should be a admin to accept or deny a request" }
    }
    catch (error) {
        res.status(error.code).send(error.msg);
    }
}