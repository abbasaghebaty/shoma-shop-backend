import { success, error } from "../utils/response.js";
import { adminOnly } from "../middleware/adminOnly.js";

import {
getProductPrice,
updateProductPrice,
addPriceCheck

} from "../services/priceService.js";



export async function pricesRouter(request, env){


const url = new URL(request.url);



/*
GET PRICE (فقط ادمین)
/api/v1/products/1/prices
*/

if(
request.method==="GET" &&
url.pathname.match(/^\/api\/v1\/products\/\d+\/prices$/)
){

const auth = await adminOnly(request, env);
if (auth instanceof Response) return auth;


const id =
url.pathname.split("/")[4];


try {

const price =
await getProductPrice(env.DB,id);


return success(price);

}
catch(err){
return error(err.message, 500);
}

}





/*
UPDATE PRICE (فقط ادمین)
*/

if(
request.method==="PUT" &&
url.pathname.match(/^\/api\/v1\/products\/\d+\/prices$/)
){

const auth = await adminOnly(request, env);
if (auth instanceof Response) return auth;


const id =
url.pathname.split("/")[4];


const body =
await request.json();


try {

await updateProductPrice(
env.DB,
id,
body
);


return success({
message:"price updated"
});

}
catch(err){
return error(err.message, 500);
}


}





/*
PRICE CHECK (فقط ادمین)
*/

if(
request.method==="POST" &&
url.pathname.match(/^\/api\/v1\/products\/\d+\/price-check$/)
){

const auth = await adminOnly(request, env);
if (auth instanceof Response) return auth;


const id =
url.pathname.split("/")[4];


try {

await addPriceCheck(
env.DB,
id,
false
);


return success({
message:"price checked"
});

}
catch(err){
return error(err.message, 500);
}

}


return null;

}
