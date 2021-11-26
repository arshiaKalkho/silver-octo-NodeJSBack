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




const DBqueryGenerator = (filter)=>{
    
    const isFilterOn = filter.isFilterOn
    const searchFor = filter.searchFor
    const isOnSale = filter.isOnSale
    const department = filter.department
    const minPrice = filter.minPrice
    const MaxPrice = filter.MaxPrice 
    const orderBy = filter.orderBy
    const perPage = filter.perPage || 32;
    
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
                baseQuary = baseQuary + `PRODUCT_PRICE <= '${MaxPrice}' `;
                andCounter++;
            }
        
        }


        if(orderBy){
            if(orderBy === "LH"){//price high low and low high
                baseQuary= baseQuary + `ORDER BY PRODUCT_PRICE ASC `;
            }
            if(orderBy === "HL"){//price high low and low high
                baseQuary= baseQuary + `ORDER BY PRODUCT_PRICE DESC `;
            }            
            if(orderBy === "AZ"){//name a-z and z-a
                baseQuary= baseQuary + `ORDER BY PRODUCT_NAME  ASC `;
            }
            if(orderBy === "ZA"){//name a-z and z-a
                baseQuary= baseQuary + `ORDER BY PRODUCT_NAME  DESC `;
            }
        }
        
        
        baseQuary= baseQuary + `LIMIT  ${perPage} ;`;
        
        
    }
    return baseQuary;
    
}

//query builder instructions
//isFilterOn, searchFor,  isOnSale, department, minPrice, MaxPrice, orderBy, perPage = 32
//the correct format in this context with json url params, DON'T PUT SPACES in the json object at the url
//{"isFilterOn":true,"searchFor":false,"isOnSale":false,"department":"Toys","minPrice":3,"MaxPrice":34,"orderBy":false,"perPage":12}


app.get("/:filter", (req, res)=>{
        
    let filter = JSON.parse(req.params.filter)

    dbConnection.query(DBqueryGenerator(filter), (error, rows)=>{
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

