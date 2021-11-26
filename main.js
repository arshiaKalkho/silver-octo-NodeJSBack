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




const DBqueryGenerator = (isFilterOn, searchFor,  isOnSale, department, minPrice, MaxPrice, orderBy, perPage = 32)=>{
    
    baseQuary = 'SELECT * FROM products '; 
    andCounter = 0;//doing some math to see if we should put AND before conditions below, every additiong will add 1
    if(isFilterOn === true){
        if(searchFor || isOnSale || department || minPrice || MaxPrice){// only one "where" clause is needed, and its only needed if at least one of the following is ture
            baseQuary = baseQuary + "WHERE ";
            if(searchFor){
                baseQuary = baseQuary + `PRODUCT_NAME = '${searchFor}' `;
                andCounter++;
            }
            if(isOnSale){
                if(andCounter > 0){
                    baseQuary = baseQuary+ "AND "
                }
                baseQuary = baseQuary+ `PRODUCT_SALE_PRICE IS NOT NULL `;
                andCounter++;
                
            }
            if(department){
                if(andCounter > 0){
                    baseQuary = baseQuary + "AND "
                }
                baseQuary = baseQuary + `DEPARTMENT = '${department}' `;
                andCounter++;
            }
            if(minPrice){
                if(andCounter > 0){
                    baseQuary = baseQuary + "AND "
                }
                baseQuary = baseQuary + `PRODUCT_PRICE >= '${minPrice}' `;
                andCounter++;
            }
            if(MaxPrice){
                if(andCounter > 0){
                    baseQuary = baseQuary + "AND "
                }
                baseQuary = baseQuary + `PRODUCT_PRICE =< '${MaxPrice}' `;
                andCounter++;
            }
        
        }


        if(orderBy){
            if(orderBy === "HL" || orderBy === "LH"){//price high low and low high
                if( orderBy === "LH"){
                    baseQuary= baseQuary + `ORDER BY PRODUCT_PRICE ASC `;
                }else{
                    baseQuary= baseQuary + `ORDER BY PRODUCT_PRICE DESC `;
                }
            }
            if(orderBy === "AZ" || orderBy === "ZA"){//name a-z and z-a
                if(orderBy === "AZ"){
                    baseQuary= baseQuary + `ORDER BY PRODUCT_NAME  ASC `;
                }else{
                    baseQuary= baseQuary + `ORDER BY PRODUCT_NAME  DESC `;
                }
            }
        }
        
        baseQuary= baseQuary + `LIMIT  ${perPage} ;`;
        
        
    }
    return baseQuary;
    
}

//query builder instructions
//isFilterOn, searchFor,  isOnSale, department, minPrice, MaxPrice, orderBy, perPage = 32
//the correct format in this context with json url params, DON'T PUT SPACES in the json object
//{"isFilterOn":true,"searchFor":false,"isOnSale":false,"department":"Toys","minPrice":3,"MaxPrice":34,"orderBy":false}


app.get("/:filter", (req, res)=>{
    
    
    let filter = JSON.parse(req.params.filter)
    
    
    
    

    
    dbConnection.query(DBqueryGenerator(filter.isFilterOn, filter.searchFor, filter.isOnSale, filter.department, filter.minPrice, filter.MaxPrice, filter.orderBy), (error, rows)=>{
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

