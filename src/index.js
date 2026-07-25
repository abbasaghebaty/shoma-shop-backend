import { productsRouter } from "./routes/products.js";
import { pricesRouter } from "./routes/prices.js";
import { inventoryRouter } from "./routes/inventory.js";
import { adminProductsRouter } from "./routes/admin-products.js";
import { customersRouter } from "./routes/customers.js";

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




// Admin Products API

const adminProductResponse =
await adminProductsRouter(request, env);


if(adminProductResponse){
    return adminProductResponse;
}




// Customers API

const customersResponse =
await customersRouter(request, env);


if(customersResponse){
    return customersResponse;
}




// اگر هیچ Route پیدا نشد

return error(
"Route not found",
404
);


}

};
