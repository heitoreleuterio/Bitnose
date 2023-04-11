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
import http from "http";
import fileSystem from "fs";

dotenv.config();
const domain = `localhost:${process.env.PORT}`;
EventEmitter.defaultMaxListeners = 30;


const app = express();

app.use("/", express.static(path.resolve("./src/public")));

app.use("*", (req, res, next) => {
    if (req.secure) {
        next();
        return;
    }
    res.redirect("https://" + domain + req.url);
});

const httpApp = express();
httpApp.use("*", (req, res, next) => {
    res.redirect("https://" + domain + req.url);
});

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

    const httpserver = http.createServer(httpApp);

    httpserver.listen(process.env.HTTP_PORT, () => {
    });

}
else {
    const httpserver = http.createServer(app);

    httpserver.listen(process.env.PORT, () => {
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