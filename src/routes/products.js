import { success, error } from "../utils/response.js";

import {
getProducts,
getProduct,
createProduct,
updateProduct,
deleteProduct

} from "../services/productService.js";



export async function productsRouter(request, env){


const url = new URL(request.url);



/*
GET ALL
*/

if(
request.method==="GET" &&
url.pathname==="/api/v1/products"
){

const products =
await getProducts(env.DB);


return success(products);

}




/*
GET ONE
*/

if(
request.method==="GET" &&
url.pathname.match(/^\/api\/v1\/products\/\d+$/)
){


const id =
url.pathname.split("/").pop();


const product =
await getProduct(env.DB,id);



if(!product)
return error("Product not found",404);



return success(product);

}





/*
CREATE
*/

if(
request.method==="POST" &&
url.pathname==="/api/v1/products"
){


const body =
await request.json();



const id =
await createProduct(env.DB,body);



return success({
id
},201);

}




/*
UPDATE
*/

if(
request.method==="PUT" &&
url.pathname.match(/^\/api\/v1\/products\/\d+$/)
){


const id =
url.pathname.split("/").pop();


const body =
await request.json();



await updateProduct(env.DB,id,body);


return success({
message:"updated"
});


}




/*
DELETE
*/

if(
request.method==="DELETE" &&
url.pathname.match(/^\/api\/v1\/products\/\d+$/)
){


const id =
url.pathname.split("/").pop();


await deleteProduct(env.DB,id);


return success({
message:"deleted"
});


}


return null;


}
