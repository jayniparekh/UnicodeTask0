import express from "express";
import db from './db.js';
import routes from "./controllers/routes.js";
import userroutes from './routes/routes.js';
import { StatusCodes, getReasonPhrase } from "http-status-codes";

const app= express();

app.use(express.json());
import morgan from "morgan";
app.use(morgan("tiny"));
app.use('/', routes);
app.use('/', userroutes);

app.get("/", (req, res) => {
    res.status(StatusCodes.OK).json({ msg: "Welcome to Unicode"});

});

app.get("/server", (req,res) => {
    res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({msg: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR)});   
});

const PORT = 3000;
await db();
app.listen(3000, ()=>{
    console.log("listening on port 3000");
});