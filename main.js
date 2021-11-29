if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}
const bcrypt = require("bcrypt")
const bodyParser = require("body-parser")
const express = require("express");
const app = express();
const mysql = require("mysql")
const {ConnectionString} = require('connection-string'); 
const dbConnectionSring = new ConnectionString(process.env.CLEARDB_DATABASE_URL)
const DBqueryGenerator = require("./dataServices")

const dbConnectionString = {
    host: dbConnectionSring.hosts[0].name,
    user: dbConnectionSring.user,
    password: dbConnectionSring.password,
    database: dbConnectionSring.path[0]
}


const port = process.env.PORT || 8080;




//query builder instructions
//isFilterOn, searchFor,  isOnSale, department, minPrice, MaxPrice, orderBy, perPage = 32
//the correct format in this context with json url params, DON'T PUT SPACES in the json object at the url
//{"isFilterOn":true,"searchFor":false,"isOnSale":false,"department":"Toys","minPrice":3,"MaxPrice":34,"orderBy":false,"perPage":12}



app.get("/" , (req, res)=>{
    res.redirect('/products/{"key":null}')
})
app.get("/products/:filter" , (req, res)=>{
    
    const key = JSON.parse(req.params.filter).key;
    
    if(key == null)
    res.sendStatus(401)
    else(!bcrypt.compare( key , process.env.localPass,(err,result)=>{
        
        if(!result){
            res.sendStatus(401)
        }else{
            const dbConnection = mysql.createConnection(dbConnectionString)//connect
            dbConnection.query(DBqueryGenerator(JSON.parse(req.params.filter)), (error, rows)=>{//get data
                if(error){
                    res.status(500) 
                    res.send(error)      
                }else{
                    res.status(200)
                    res.send(rows)
                    
                }
            })    
            dbConnection.end()//close
        }
    })) 
})


app.get("*" , (req, res)=>{
    res.redirect('/products/{"key":null}')
})
app.listen(port,()=>{
    console.log(`listening on port ${port}`)
})
