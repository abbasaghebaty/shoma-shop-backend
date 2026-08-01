import { success, error } from "../utils/response.js";
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





/*
موجودی یک محصول به تفکیک انبار (فقط ادمین)
این route قبلا وجود نداشت و به همین دلیل داشبورد راهی برای
نمایش/ویرایش موجودی هر محصول به‌صورت مجزا نداشت.
GET /api/v1/inventory/product/:productId
*/

if(
request.method === "GET" &&
url.pathname.match(/^\/api\/v1\/inventory\/product\/\d+$/)
){

const auth = await adminOnly(request, env);
if (auth instanceof Response) return auth;


const productId = url.pathname.split("/")[5];


const data = await env.DB.prepare(`

SELECT
inventory.*,
warehouses.name AS warehouse_name

FROM inventory

JOIN warehouses
ON warehouses.id = inventory.warehouse_id

WHERE inventory.product_id = ?

ORDER BY warehouses.name

`)
.bind(productId)
.all();


return success(data.results);

}





/*
ویرایش موجودی یک ردیف انبار مشخص (فقط ادمین)
این route هم قبلا وجود نداشت؛ در نتیجه هیچ راهی برای اصلاح
دستی موجودی از داشبورد وجود نداشت (فقط هنگام ثبت اولیه محصول
یا هنگام ثبت سفارش، موجودی تغییر می‌کرد).
PUT /api/v1/inventory/:id
Body: { quantity?, minimum_stock?, alert_enabled? }
*/

if(
request.method === "PUT" &&
url.pathname.match(/^\/api\/v1\/inventory\/\d+$/)
){

const auth = await adminOnly(request, env);
if (auth instanceof Response) return auth;


const id = url.pathname.split("/")[4];


const body = await request.json();


try {

const current = await env.DB.prepare(`
    SELECT * FROM inventory WHERE id = ?
`)
.bind(id)
.first();


if (!current) {
    return error("رکورد موجودی یافت نشد", 404);
}


const newQuantity =
    body.quantity !== undefined && body.quantity !== null
        ? Number(body.quantity)
        : current.quantity;

const newMinStock =
    body.minimum_stock !== undefined && body.minimum_stock !== null
        ? Number(body.minimum_stock)
        : current.minimum_stock;

const newAlertEnabled =
    body.alert_enabled !== undefined && body.alert_enabled !== null
        ? Number(body.alert_enabled)
        : current.alert_enabled;


await env.DB.prepare(`
    UPDATE inventory
    SET
        quantity = ?,
        minimum_stock = ?,
        alert_enabled = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
`)
.bind(
    newQuantity,
    newMinStock,
    newAlertEnabled,
    id
)
.run();



// ثبت تغییر در گردش موجودی، تا تاریخچه اصلاح دستی هم حفظ شود
const diff = newQuantity - current.quantity;

if (diff !== 0) {

    await env.DB.prepare(`
        INSERT INTO inventory_transactions
        (
            product_id,
            warehouse_id,
            type,
            quantity,
            reason,
            reference_id
        )
        VALUES
        (?, ?, ?, ?, ?, ?)
    `)
    .bind(
        current.product_id,
        current.warehouse_id,
        diff > 0 ? "IN" : "OUT",
        Math.abs(diff),
        "اصلاح دستی موجودی از پنل مدیریت",
        current.id
    )
    .run();

}



// لاگ فعالیت
await env.DB.prepare(`
    INSERT INTO activity_logs
    (
        user_name,
        action,
        table_name,
        record_id,
        description
    )
    VALUES
    (?, ?, ?, ?, ?)
`)
.bind(
    auth.username ?? "admin",
    "UPDATE",
    "inventory",
    id,
    "ویرایش موجودی"
)
.run();



return success({
    message: "موجودی با موفقیت بروزرسانی شد"
});


}
catch (err) {

return error(err.message, 500);

}

}


return null;

}
