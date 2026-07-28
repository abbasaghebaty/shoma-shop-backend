import { success, error } from "../utils/response.js";
import { adminOnly } from "../middleware/adminOnly.js";


export async function adminProductsRouter(request, env){


const url = new URL(request.url);



/*
ثبت کامل محصول (فقط ادمین)
POST /api/v1/admin/products
*/


if(
request.method === "POST" &&
url.pathname === "/api/v1/admin/products"
){

const auth = await adminOnly(request, env);
if (auth instanceof Response) return auth;


const body = await request.json();



try {


const product = await env.DB.prepare(`

INSERT INTO products
(
product_code,
name,
barcode,
category_id,
brand_id,
variant,
description,
unit
)

VALUES
(?,?,?,?,?,?,?,?)

`)

.bind(

body.product_code,
body.name,
body.barcode ?? null,
body.category_id ?? null,
body.brand_id ?? null,
body.variant ?? null,
body.description ?? null,
body.unit ?? "عدد"

)

.run();



const productId =
product.meta.last_row_id;



// قیمت اولیه

await env.DB.prepare(`

INSERT INTO product_prices
(
product_id,
purchase_price,
consumer_price,
wholesale_price,
wholesale_min_quantity,
discount_percent,
profit_amount,
last_checked_at

)

VALUES
(?,?,?,?,?,?,?,CURRENT_TIMESTAMP)

`)

.bind(

productId,
body.purchase_price ?? null,
body.consumer_price ?? null,
body.wholesale_price ?? null,
body.wholesale_min_quantity ?? null,
body.discount_percent ?? 0,

(body.consumer_price ?? 0) -
(body.purchase_price ?? 0)

)

.run();




// موجودی اولیه

await env.DB.prepare(`

INSERT INTO inventory
(
product_id,
warehouse_id,
quantity,
minimum_stock,
alert_enabled

)

VALUES
(?,?,?,?,?)

`)

.bind(

productId,
body.warehouse_id,
body.quantity ?? 0,
body.minimum_stock ?? 0,
body.alert_enabled ?? 1

)

.run();





// ثبت تاریخچه موجودی

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
(?,?,?,?,?,?)

`)

.bind(

productId,
body.warehouse_id,
"IN",
body.quantity ?? 0,
"ثبت اولیه محصول",
productId

)

.run();






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
(?,?,?,?,?)

`)

.bind(

auth.username ?? "admin",
"CREATE",
"products",
productId,
"ایجاد محصول جدید"

)

.run();



return success({

message:"Product created successfully",
product_id:productId

});



}

catch(err){

return error(
err.message,
500
);

}


}



return null;

}
