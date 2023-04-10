import express from "express";
import { ListAllRequests, AcceptOrDenyRequest } from "../controllers/request.js";

const router = express.Router();

router.use("/", express.json());

router.get("/", ListAllRequests);
router.put("/accept", AcceptOrDenyRequest);

export default router;
