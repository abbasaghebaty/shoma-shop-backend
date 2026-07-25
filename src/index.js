import { productsRouter } from "./routes/products.js";
import { pricesRouter } from "./routes/prices.js";
import { inventoryRouter } from "./routes/inventory.js";
import { adminProductsRouter } from "./routes/admin-products.js";
import { customersRouter } from "./routes/customers.js";
import { ordersRouter } from "./routes/orders.js";
import { paymentsRouter } from "./routes/payments.js";

import { error } from "./utils/response.js";


export default {

async fetch(request, env) {


const url = new URL(request.url);



// Health Check

if(
request.method === "GET" &&
url.pathname === "/"
){

return Response.json({

    success:true,
    message:"Shoma Shop API is running"

});

}




// Products

const productResponse =
await productsRouter(request, env);


if(productResponse){

    return productResponse;

}





// Prices

const priceResponse =
await pricesRouter(request, env);


if(priceResponse){

    return priceResponse;

}





// Inventory

const inventoryResponse =
await inventoryRouter(request, env);


if(inventoryResponse){

    return inventoryResponse;

}





// Admin Products

const adminProductResponse =
await adminProductsRouter(request, env);


if(adminProductResponse){

    return adminProductResponse;

}





// Customers

const customersResponse =
await customersRouter(request, env);


if(customersResponse){

    return customersResponse;

}





// Orders

const ordersResponse =
await ordersRouter(request, env);


if(ordersResponse){

    return ordersResponse;

}





// Payments

const paymentsResponse =
await paymentsRouter(request, env);


if(paymentsResponse){

    return paymentsResponse;

}





// Not Found

return error(
"Route not found",
404
);



}


};
