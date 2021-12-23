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
const cors = require('cors')
const DataServices = require("./dataServices")
const jwt = require('jsonwebtoken')
app.use(bodyParser.json());





app.use(cors())//enable corse policy

const dbConnectionString = {//connection object created
    connectionLimit : 8,
    host: dbConnectionSring.hosts[0].name,
    user: dbConnectionSring.user,
    password: dbConnectionSring.password,
    database: dbConnectionSring.path[0]
}


const port = process.env.PORT || 8080;

const verifyJWT = (req,res,next)=>{
    const token = req.header["x-access-token"];
    if(!token){
        res.false({auth:false})
    }else{
        jwt.verify(token, process.env.jwtSecret, (err, decoded)=>{
            if(err){
                res.json({auth:false})
            }else{
                req.userId = decoded.Id
            }
        })
    }
    next()
}


//query builder instructions
//isFilterOn, searchFor,  isOnSale, department, minPrice, MaxPrice, orderBy, perPage = 32
//the correct format in this context with json url params, DON'T PUT SPACES in the json object at the url
//{"isFilterOn":true,"searchFor":false,"isOnSale":false,"department":"Toys","minPrice":3,"MaxPrice":34,"orderBy":false,"perPage":12}



app.get("/" , (req, res)=>{
    res.redirect('/products/{"key":null}')
})
app.get("/products/:filter" , (req, res)=>{
    
    const key = JSON.parse(req.params.filter).key;
    
    if(key === null)
    res.sendStatus(401)
    else{bcrypt.compare( key , process.env.localPass,(err,result)=>{
        
        if(!result){
            res.sendStatus(401)
        }else{
            const dbConnection = mysql.createConnection(dbConnectionString)//connect
            dbConnection.query(DataServices.requestProducts(JSON.parse(req.params.filter)), (error, rows)=>{//get data
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
    })}
})
app.get("/product/:product", (req,res)=>{
    const product = JSON.parse(req.params.product)
    const id = product.id;
    const key = product.key;
    if(key === null){
    
    res.sendStatus(401)
    }else{bcrypt.compare( key , process.env.localPass,(err,result)=>{
        
        if(!result){
            
            res.sendStatus(401)
        }else{
            const dbConnection = mysql.createConnection(dbConnectionString)//connect
            dbConnection.query(`SELECT * FROM products WHERE PRODUCT_ID = ${id}`, (error, rows)=>{//get data
                
                
                if(error){
                    res.status(500) 
                    res.send(error)      
                }else{
                    res.status(200)
                    res.send(rows)   
                }
            }    
            )
            dbConnection.end()//close
        }
    })}
})
app.post('/login', (req,res)=>{
    if(req.body.username && req.body.password && req.body.key){
        
        bcrypt.compare( req.body.key , process.env.localPass,(err,result)=>{
            
            if(!result || err){
                
                res.sendStatus(401)
            }else{
                const dbConnection = mysql.createConnection(dbConnectionString)//connect
                dbConnection.query(`SELECT * FROM customers WHERE username = '${req.body.username}'`, (error, row)=>{//get data
                    if(error){//internal error
                        res.status(500).json({message:error}) 
                        
                    }else if(!row[0]){//if user doesn't exist
                        res.status(200).json({message:"User not found"})
                        
                    }else{//check if the password is correct
                        bcrypt.compare(req.body.password, row[0].password,(err,result)=>{
                            if(err){
                                res.status(500)
                                res.send(err)
                            }else if(!result){
                                res.status(200).json({message:"Password Incorrect"})
                            }else{
                                res.status(200).json({message:"Correct Password"})
                            }
                        })
                    }
                }    
                )
                dbConnection.end()//close
            }
        })
    }else{
        res.send(403).json({message:"Missing parameters"})
    }
})
app.post('/register', (req,res)=>{
    
    if( req.body.email && req.body.username && req.body.password && req.body.key){
        
        bcrypt.compare( req.body.key , process.env.localPass,(err,result)=>{
            
            if(!result || err){
                res.sendStatus(403)//api key incorrect
            }else{
                const dbConnection = mysql.createConnection(dbConnectionString)//connect
                
                dbConnection.query(`SELECT * FROM customers WHERE username = '${req.body.username}'`,(error, row)=>{
                    
                    if(error){
                        res.status(500).json({message:"internal server error : DB-ERR"})
                    }else if(!row[0]){//username not in use already
                        
                        const dbConnection = mysql.createConnection(dbConnectionString)//connect again for some reason, last query ends the connection somehow
                        
                        dbConnection.query(`SELECT * FROM customers WHERE email = '${req.body.email}'`,(error, row)=>{
                            
                            if(error){
                                res.status(500).json({message:"internal server error : DB-ERR"})
                            }else if(!row[0]){//email not in use already
                                
                                bcrypt.hash(req.body.password, 10,(err,hashedPass)=>{
                                    if(!err){//error hashing pass
                                        const dbConnection = mysql.createConnection(dbConnectionString)
                                        dbConnection.query(`INSERT INTO customers VALUES('${req.body.username}','${req.body.email}','${hashedPass}')`,(error)=>{
                                            
                                            
                                            if(error){//error while writing to db
                                                res.status(500).json({message:'internal server error : DB-ERR'})
                                            }else{
                                                res.status(201).json({message:"User created"})//(created)success
                                                
                                            }
                                        })
                                        dbConnection.end()//close
                                    }else{
                                        res.status(500).json({message:'internal server error : DB-ERR'})
                                    }
                                })                                
                                
                            }else{
                                res.status(409).json({message:"Email already in use"})
                            }
                        })
                        
                        dbConnection.end()//close
                    }else{
                        res.status(409).json({message:"Username already in use"})
                        
                    }
                })
                
                dbConnection.end()//close
            }
        })
    }else{
        res.status(403).json({message:"api key missing"})//(forbidden)api key missing
    }
    
})
app.get("*" , (req, res)=>{
    res.redirect('/products/{"key":null}')
})
app.listen(port,()=>{
    console.log(`listening on port ${port}`)
})
