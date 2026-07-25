import { productsRouter } from "./routes/products.js";
import { pricesRouter } from "./routes/prices.js";
import { inventoryRouter } from "./routes/inventory.js";
import { authRouter } from "./routes/auth.js";

import { error } from "./utils/response.js";


export default {

async fetch(request, env) {


const url = new URL(request.url);


// تست سلامت Worker

if(
request.method === "GET" &&
url.pathname === "/"
){

return Response.json({

    success:true,
    message:"Shoma Shop API is running"

});

}



// Auth API

const authResponse =
await authRouter(request, env);


if(authResponse){

    return authResponse;

}




// Products API

const productResponse =
await productsRouter(request, env);


if(productResponse){

    return productResponse;

}




// Prices API

const priceResponse =
await pricesRouter(request, env);


if(priceResponse){

    return priceResponse;

}




// Inventory API

const inventoryResponse =
await inventoryRouter(request, env);


if(inventoryResponse){

    return inventoryResponse;

}




// Route پیدا نشد

return error(
"Route not found",
404
);


}

};
