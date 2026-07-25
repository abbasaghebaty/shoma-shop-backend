import { success, error } from "../utils/response.js";


export async function paymentsRouter(request, env){


const url = new URL(request.url);



/*
ثبت پرداخت

POST
/api/v1/payments

*/

if(
request.method === "POST" &&
url.pathname === "/api/v1/payments"
){


try{


const body = await request.json();



// گرفتن سفارش

const order =
await env.DB.prepare(`

SELECT *

FROM orders

WHERE id=?

`)
.bind(body.order_id)
.first();



if(!order){

return error(
"Order not found",
404
);

}



// ثبت پرداخت

await env.DB.prepare(`

INSERT INTO payments
(
order_id,
customer_id,
amount,
method,
note

)

VALUES
(?,?,?,?,?)

`)
.bind(

body.order_id,
body.customer_id ?? order.customer_id,
body.amount,
body.method ?? "cash",
body.note ?? null

)
.run();




// محاسبه پرداخت جدید

const newPaid =
(order.paid_amount ?? 0)
+
body.amount;


const newDebt =
(order.total_amount ?? 0)
-
newPaid;




// آپدیت سفارش

await env.DB.prepare(`

UPDATE orders

SET

paid_amount=?,
debt_amount=?

WHERE id=?

`)
.bind(

newPaid,
newDebt > 0 ? newDebt : 0,
body.order_id

)
.run();





// ثبت گردش مشتری

if(order.customer_id){


await env.DB.prepare(`

INSERT INTO customer_transactions
(
customer_id,
type,
amount,
description,
reference_id

)

VALUES
(?,?,?,?,?)

`)
.bind(

order.customer_id,
"PAYMENT",
body.amount,
"پرداخت سفارش",
body.order_id

)
.run();


}




return success({

message:"payment registered",
paid:newPaid,
debt:newDebt > 0 ? newDebt : 0

});



}

catch(err){

return error(err.message,500);

}



}






/*
گردش حساب مشتری

GET
/api/v1/customers/:id/transactions

*/


if(
request.method === "GET" &&
url.pathname.match(/^\/api\/v1\/customers\/\d+\/transactions$/)
){


const id =
url.pathname.split("/")[4];



const transactions =
await env.DB.prepare(`

SELECT *

FROM customer_transactions

WHERE customer_id=?

ORDER BY id DESC

`)
.bind(id)
.all();



return success(transactions.results);

}



return null;


}
