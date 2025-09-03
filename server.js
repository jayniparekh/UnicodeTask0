const express = require("express");
const { StatusCodes, getReasonPhrase } = require("http-status-codes");
const app= express();
const morgan = require("morgan");

app.use(morgan("tiny"));

app.get("/", (req, res) => {
    res.status(StatusCodes.OK).json({ msg: "Welcome to Unicode"});

});

app.get("/server", (req,res) => {
    res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({msg: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR)});   
});

const PORT = 3000;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`server is running at PORT: ${PORT}`);
    })
});