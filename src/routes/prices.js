import { success, error } from "../utils/response.js";

import {
getProductPrice,
updateProductPrice,
addPriceCheck

} from "../services/priceService.js";



export async function pricesRouter(request, env){


const url = new URL(request.url);



/*
GET PRICE
/api/v1/products/1/prices
*/

if(
request.method==="GET" &&
url.pathname.match(/^\/api\/v1\/products\/\d+\/prices$/)
){


const id =
url.pathname.split("/")[4];


const price =
await getProductPrice(env.DB,id);



return success(price);

}





/*
UPDATE PRICE
*/

if(
request.method==="PUT" &&
url.pathname.match(/^\/api\/v1\/products\/\d+\/prices$/)
){

const id =
url.pathname.split("/")[4];


const body =
await request.json();


await updateProductPrice(
env.DB,
id,
body
);


return success({
message:"price updated"
});


}





/*
PRICE CHECK
*/

if(
request.method==="POST" &&
url.pathname.match(/^\/api\/v1\/products\/\d+\/price-check$/)
){

const id =
url.pathname.split("/")[4];


await addPriceCheck(
env.DB,
id,
false
);



return success({
message:"price checked"
});

}


return null;

}
