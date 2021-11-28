



module.exports = (filter)=>{
    
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
