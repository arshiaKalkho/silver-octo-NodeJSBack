if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}
const bodyParser = require("body-parser")
const express = require("express");
const app = express();
const mysql = require("mysql")
//parsing the connection string
const {ConnectionString} = require('connection-string'); 
const dbConnectionSring = new ConnectionString(process.env.CLEARDB_DATABASE_URL)
const port = process.env.PORT || 8080;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}))


const dbConnection = mysql.createConnection({
    host: dbConnectionSring.hosts[0].name,
    user: dbConnectionSring.user,
    password: dbConnectionSring.password,
    database: dbConnectionSring.path[0]
})

const SQLquarryBuilder=(filterObj)=>{
    const filterBool = filterObj.filterBool;
    const search = filterObj.search;
    const saleBool = filterObj.saleBool;
    const order = filterObj.order;
    const department = filterObj.department;
    const minPrice = filterObj.minPrice;
    const maxPrice = filterObj.maxPrice;
    
    var baseQuary = ' SELECT * FROM products '

    if(!filterBool) return baseQuary;



}




app.get("/:filter", (req, res)=>{
    
    console.log(JSON.parse(req.params.filter).name)
    dbConnection.query(' SELECT * FROM products ', (error, rows)=>{
        if(error){
            res.status(500) 
            res.send(error)      
        }else{
            res.status(200)
            res.send(rows)
        }
    })
})









app.listen(port,()=>{
    console.log(`listening on port ${port}`)
})

