import express from "express";
import {
    CreateNewUser,
    GetUser,
    Login,
    AdminRequest,
    RedirectToUserPanelOrRegister,
    AddProductToList,
    RemoveProductFromList
} from "../controllers/user.js";

const router = express.Router();

router.use("/", express.json());

router.get("/", GetUser);
router.get("/panel", RedirectToUserPanelOrRegister);
router.post("/new", CreateNewUser);
router.post("/become/admin", AdminRequest);
router.put("/login", Login);
router.put("/add/product", AddProductToList);
router.delete("/delete/product", RemoveProductFromList);

export default router;