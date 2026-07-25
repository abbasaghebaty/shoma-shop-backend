import { success, error } from "../utils/response.js";


export async function ordersRouter(request, env){

const url = new URL(request.url);



/*
ایجاد سفارش

POST
/api/v1/orders

*/


if(
request.method === "POST" &&
url.pathname === "/api/v1/orders"
){


try{


const body = await request.json();


// ساخت سفارش

const order =
await env.DB.prepare(`

INSERT INTO orders
(
customer_id,
total_amount,
paid_amount,
debt_amount,
total_profit,
note

)

VALUES
(?,?,?,?,?,?)

`)
.bind(

body.customer_id,

0,
0,
0,
0,

body.note ?? null

)
.run();



const orderId =
order.meta.last_row_id;



let totalAmount = 0;
let totalProfit = 0;



// ثبت محصولات

for(const item of body.items){



const product =
await env.DB.prepare(`

SELECT 
purchase_price

FROM product_prices

WHERE product_id=?

`)
.bind(item.product_id)
.first();



const purchasePrice =
product?.purchase_price ?? 0;



const profit =
(item.sale_price - purchasePrice)
*
item.quantity;



await env.DB.prepare(`

INSERT INTO order_items
(
order_id,
product_id,
quantity,
sale_price,
purchase_price,
profit

)

VALUES
(?,?,?,?,?,?)

`)
.bind(

orderId,
item.product_id,
item.quantity,
item.sale_price,
purchasePrice,
profit

)
.run();



totalAmount +=
item.sale_price * item.quantity;


totalProfit += profit;




// کم کردن موجودی


await env.DB.prepare(`

UPDATE inventory

SET quantity = quantity - ?

WHERE product_id=?

AND warehouse_id=?

`)
.bind(

item.quantity,
item.product_id,
body.warehouse_id

)
.run();




// ثبت تراکنش انبار

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

item.product_id,
body.warehouse_id,
"OUT",
item.quantity,
"فروش محصول",
orderId

)
.run();



}



// آپدیت مبلغ سفارش


await env.DB.prepare(`

UPDATE orders

SET

total_amount=?,
total_profit=?

WHERE id=?

`)
.bind(

totalAmount,
totalProfit,
orderId

)
.run();




return success({

message:"order created",
order_id:orderId,
total:totalAmount,
profit:totalProfit

});



}

catch(err){

return error(err.message,500);

}



}



return null;


}
