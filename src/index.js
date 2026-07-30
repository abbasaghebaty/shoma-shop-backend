import { productsRouter } from "./routes/products.js";
import { pricesRouter } from "./routes/prices.js";
import { inventoryRouter } from "./routes/inventory.js";
import { authRouter } from "./routes/auth.js";
import { customersRouter } from "./routes/customers.js";
import { ordersRouter } from "./routes/orders.js";
import { paymentsRouter } from "./routes/payments.js";
import { dashboardRouter } from "./routes/dashboard.js";
import { adminProductsRouter } from "./routes/admin-products.js";
import { categoriesRouter } from "./routes/categories.js";
import { brandsRouter } from "./routes/brands.js";
import { error, corsHeaders } from "./utils/response.js";


export default {
async fetch(request, env) {

const url = new URL(request.url);


// جواب به preflight request های CORS (مرورگر قبل از PUT/DELETE/POST این را می‌فرستد)
if (request.method === "OPTIONS") {
    return new Response(null, {
        status: 204,
        headers: corsHeaders
    });
}


// تست سلامت Worker
if (
    request.method === "GET" &&
    url.pathname === "/"
) {
    return Response.json({
        success: true,
        message: "Shoma Shop API is running"
    }, {
        headers: corsHeaders
    });
}


// Auth API (لاگین)
const authResponse =
    await authRouter(request, env);
if (authResponse) {
    return authResponse;
}


// Dashboard API (نیاز به ادمین دارد، خودش داخل route چک می‌شود)
const dashboardResponse =
    await dashboardRouter(request, env);
if (dashboardResponse) {
    return dashboardResponse;
}


// Admin Products API (ثبت کامل محصول با قیمت و موجودی - نیاز به ادمین دارد)
const adminProductsResponse =
    await adminProductsRouter(request, env);
if (adminProductsResponse) {
    return adminProductsResponse;
}


// Categories API (دسته‌بندی‌ها)
const categoriesResponse =
    await categoriesRouter(request, env);
if (categoriesResponse) {
    return categoriesResponse;
}


// Brands API (برندها)
const brandsResponse =
    await brandsRouter(request, env);
if (brandsResponse) {
    return brandsResponse;
}


// Products API
const productResponse =
    await productsRouter(request, env);
if (productResponse) {
    return productResponse;
}


// Prices API
const priceResponse =
    await pricesRouter(request, env);
if (priceResponse) {
    return priceResponse;
}


// Inventory API
const inventoryResponse =
    await inventoryRouter(request, env);
if (inventoryResponse) {
    return inventoryResponse;
}


// Customers API
const customersResponse =
    await customersRouter(request, env);
if (customersResponse) {
    return customersResponse;
}


// Orders API
const ordersResponse =
    await ordersRouter(request, env);
if (ordersResponse) {
    return ordersResponse;
}


// Payments API
const paymentsResponse =
    await paymentsRouter(request, env);
if (paymentsResponse) {
    return paymentsResponse;
}


// Route پیدا نشد
return error(
    "Route not found",
    404
);

}
};
