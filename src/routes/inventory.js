import { success } from "../utils/response.js";
import { adminOnly } from "../middleware/adminOnly.js";



export async function inventoryRouter(request, env){


const url = new URL(request.url);



/*
نمایش موجودی (فقط ادمین)
GET /api/v1/inventory
*/

if(
request.method === "GET" &&
url.pathname === "/api/v1/inventory"
){

const auth = await adminOnly(request, env);
if (auth instanceof Response) return auth;


const data = await env.DB.prepare(`

SELECT 
inventory.*,
products.name AS product_name,
warehouses.name AS warehouse_name

FROM inventory

JOIN products
ON products.id = inventory.product_id

JOIN warehouses
ON warehouses.id = inventory.warehouse_id

ORDER BY products.name

`).all();



return success(data.results);

}





/*
کالاهای کم موجود (فقط ادمین)
*/

if(
request.method === "GET" &&
url.pathname === "/api/v1/inventory/low-stock"
){

const auth = await adminOnly(request, env);
if (auth instanceof Response) return auth;


const data = await env.DB.prepare(`

SELECT

inventory.*,
products.name AS product_name

FROM inventory

JOIN products

ON products.id = inventory.product_id


WHERE 

inventory.alert_enabled = 1

AND inventory.quantity <= inventory.minimum_stock


`).all();



return success(data.results);

}





return null;

}
