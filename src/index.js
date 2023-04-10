import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import storeRouter from "./routes/store.js";
import searchRouter from "./routes/search.js";
import userRouter from "./routes/user.js";
import requestRouter from "./routes/request.js";
import EventEmitter from "events";
import https from "https";
import fileSystem from "fs";

EventEmitter.defaultMaxListeners = 30;

dotenv.config();

const app = express();

app.use("/", express.static(path.resolve("./src/public")));

mongoose.connect(process.env.MONGO_SERVER)
    .then(database => {
        WriteDatabaseInfo(database);
    })
    .catch(error => {
        console.log(error);
    });

mongoose.connection.on('close', () => {
    mongoose.connection.removeAllListeners();
});

if (
    fileSystem.existsSync(path.resolve(process.env.CERT_KEY_PATH)) &&
    fileSystem.existsSync(path.resolve(process.env.CERT_PATH))
) {
    const server = https.createServer({
        key: fileSystem.readFileSync(path.resolve(process.env.CERT_KEY_PATH)),
        cert: fileSystem.readFileSync(path.resolve(process.env.CERT_PATH))
    }, app);

    server.listen(process.env.PORT, () => {
        console.log("Https Server running on port: " + process.env.PORT);
    });
}
else {
    app.listen(process.env.PORT, () => {
        console.log("Http Server running on port: " + process.env.PORT);
    });
}

app.use("/store", storeRouter);
app.use("/search", searchRouter);
app.use("/user", userRouter);
app.use("/request", requestRouter);

function WriteDatabaseInfo(database) {
    const nativeConnection = database.connections[0];
    console.log("\nDatabase successfully accessed");
    console.log(`Database: ${nativeConnection.name}`);
    console.log(`Host: ${nativeConnection.host}`);
    console.log(`Port: ${nativeConnection.port}`);
}