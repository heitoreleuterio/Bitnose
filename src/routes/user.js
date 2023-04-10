import express from "express";
import { CreateNewUser, GetUser, Login, AdminRequest } from "../controllers/user.js";

const router = express.Router();

router.use("/", express.json());

router.get("/", GetUser);
router.post("/new", CreateNewUser);
router.post("/become/admin", AdminRequest);
router.put("/login", Login);

export default router;