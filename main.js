if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}
const express = require("express");
const app = express();
const mysql = require("mysql")
//parsing the connection string
const {ConnectionString} = require('connection-string'); 
const dbConnectionSring = new ConnectionString(process.env.CLEARDB_DATABASE_URL)
const port = process.env.PORT || 8080;
app.use(express.json());

const dbConnection = mysql.createConnection({
    host: dbConnectionSring.hosts[0].name,
    user: dbConnectionSring.user,
    password: dbConnectionSring.password,
    database: dbConnectionSring.path[0]
})






app.get("/", (req, res)=>{
    
    dbConnection.query('SELECT * FROM product', (error, rows)=>{
        if(error){
        res.status(500) 
        res.send(error)
        }else{
            res.send(rows)
    
        }
    })
   
})









app.listen(port,()=>{
    console.log(`listening on port ${port}`)
})

