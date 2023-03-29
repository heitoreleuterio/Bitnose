import express from "express"
import { Search } from "../controllers/search.js"

const router = express.Router();

router.use("/", express.json());

router.get("/content", Search);

export default router;