import express from "express"
import { AddNewStore, UpdateStoreSearchFunction, GetStore } from "../controllers/store.js"

const router = express.Router();

router.use("/", express.json());

router.get("/:identifier", GetStore);
router.post("/new", AddNewStore);
router.post("/update/search/function", UpdateStoreSearchFunction);

export default router;