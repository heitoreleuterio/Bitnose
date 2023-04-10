import mongoose from "mongoose";
import { BecomeAdminProcess, NewStoreProcess, UpdateStoreSearchFunctionProcess } from "../functions/request-functions.js";

export const RequestTypes = {
    "BecomeAdmin": "becomeadmin",
    "NewStore": "newstore",
    "UpdateStoreSearchFunction": "updatestoresearchfunction"
};

const requestSchema = new mongoose.Schema({
    user: { type: mongoose.Types.ObjectId, required: true },
    type: { type: String, required: true },
    content: { type: mongoose.SchemaTypes.Mixed, default: null }
});

requestSchema.methods.processRequest = async function processRequest(accepted) {
    let requestError = null;
    if (accepted) {
        try {
            switch (this.type) {
                case RequestTypes.BecomeAdmin:
                    await BecomeAdminProcess(this);
                    break;
                case RequestTypes.NewStore:
                    await NewStoreProcess(this);
                    break;
                case RequestTypes.UpdateStoreSearchFunction:
                    await UpdateStoreSearchFunctionProcess(this);
                    break;
                default:
                    throw { name: "InvalidType", msg: `The request '${this._id}' type isn't valid` };
            }
        }
        catch (error) {
            requestError = error;
        }
    }
    await mongoose.model("Request").findByIdAndRemove(this._id);
    if (requestError != null)
        throw requestError;
}

export const Request = mongoose.model("Request", requestSchema);
