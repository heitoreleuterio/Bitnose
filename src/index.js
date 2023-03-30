import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv"
import path from "path"
import storeRouter from "./routes/store.js"
import searchRouter from "./routes/search.js"

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

app.listen(process.env.PORT, () => {
    console.log("Server running on port: " + process.env.PORT);
});

app.use("/store", storeRouter);
app.use("/search", searchRouter);

function WriteDatabaseInfo(database) {
    const nativeConnection = database.connections[0];
    console.log("\nBanco de dados acessado com sucesso");
    console.log(`Database: ${nativeConnection.name}`);
    console.log(`Host: ${nativeConnection.host}`);
    console.log(`Port: ${nativeConnection.port}`);
}