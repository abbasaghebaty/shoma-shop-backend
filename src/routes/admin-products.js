import { success, error } from "../utils/response.js";
import { adminOnly } from "../middleware/adminOnly.js";


export async function productsRouter(request, env){

const url = new URL(request.url);


/*
GET ALL PRODUCTS (عمومی - نیازی به لاگین نیست)
*/

if(
request.method === "GET" &&
url.pathname === "/api/v1/products"
){

const products =
await env.DB.prepare(`

SELECT 
products.*,
categories.name AS category_name,
brands.name AS brand_name,
(SELECT image_url FROM product_images WHERE product_images.product_id = products.id ORDER BY sort_order ASC, id ASC LIMIT 1) AS image_url

FROM products

LEFT JOIN categories
ON categories.id = products.category_id

LEFT JOIN brands
ON brands.id = products.brand_id

ORDER BY products.id DESC

`).all();


return success(products.results);

}



/*
GET SINGLE PRODUCT (عمومی)
*/

if(
request.method === "GET" &&
url.pathname.match(/^\/api\/v1\/products\/\d+$/)
){

const id =
url.pathname.split("/")[4];


const product =
await env.DB.prepare(`

SELECT
products.*,
(SELECT image_url FROM product_images WHERE product_images.product_id = products.id ORDER BY sort_order ASC, id ASC LIMIT 1) AS image_url

FROM products

WHERE id = ?

`)
.bind(id)
.first();



if(!product)
return error("Product not found",404);



return success(product);

}




/*
CREATE PRODUCT (فقط ادمین)
*/

if(
request.method === "POST" &&
url.pathname === "/api/v1/products"
){

const auth = await adminOnly(request, env);
if (auth instanceof Response) return auth;


const body =
await request.json();



const result =
await env.DB.prepare(`

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



return success({

id: result.meta.last_row_id,
message:"product created"

});

}




/*
UPDATE PRODUCT (فقط ادمین)
*/

if(
request.method === "PUT" &&
url.pathname.match(/^\/api\/v1\/products\/\d+$/)
){

const auth = await adminOnly(request, env);
if (auth instanceof Response) return auth;


const id =
url.pathname.split("/")[4];


const body =
await request.json();



await env.DB.prepare(`

UPDATE products

SET

name=?,
barcode=?,
category_id=?,
brand_id=?,
variant=?,
description=?,
unit=?,
updated_at=CURRENT_TIMESTAMP

WHERE id=?

`)
.bind(

body.name,
body.barcode ?? null,
body.category_id ?? null,
body.brand_id ?? null,
body.variant ?? null,
body.description ?? null,
body.unit ?? "عدد",
id

)
.run();



// بروزرسانی تصویر محصول (اگر لینک جدید ارسال شده باشد)
if (body.image_url !== undefined) {

    await env.DB.prepare(`
        DELETE FROM product_images WHERE product_id = ?
    `)
    .bind(id)
    .run();


    if (body.image_url) {

        await env.DB.prepare(`
            INSERT INTO product_images (product_id, image_url)
            VALUES (?, ?)
        `)
        .bind(id, body.image_url)
        .run();

    }

}



return success({
message:"product updated"
});


}





/*
DELETE PRODUCT (فقط ادمین)
*/

if(
request.method === "DELETE" &&
url.pathname.match(/^\/api\/v1\/products\/\d+$/)
){

const auth = await adminOnly(request, env);
if (auth instanceof Response) return auth;


const id =
url.pathname.split("/")[4];



await env.DB.prepare(`

DELETE FROM products

WHERE id=?

`)
.bind(id)
.run();



return success({
message:"product deleted"
});


}



return null;

}


// ثبت تصویر محصول (در صورت وجود لینک)

if (body.image_url) {

await env.DB.prepare(`

INSERT INTO product_images
(
product_id,
image_url
)

VALUES
(?,?)

`)

.bind(

productId,
body.image_url

)

.run();

}
