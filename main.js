if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require("express");
const app = express();
const mysql = require("mysql")


const port = process.env.PORT || 8080;

app.get("/", (req, res)=>{
    res.send("OK")
})


app.listen(port)
console.log(`listening on port ${port}`)