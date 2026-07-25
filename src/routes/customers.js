import { success, error } from "../utils/response.js";


export async function customersRouter(request, env){


const url = new URL(request.url);



/*
لیست مشتری ها

GET /api/v1/customers

*/

if(
request.method === "GET" &&
url.pathname === "/api/v1/customers"
){


const customers =
await env.DB.prepare(`

SELECT *

FROM customers

ORDER BY id DESC

`).all();



return success(customers.results);

}




/*
یک مشتری

GET /api/v1/customers/:id

*/


if(
request.method === "GET" &&
url.pathname.match(/^\/api\/v1\/customers\/\d+$/)
){


const id =
url.pathname.split("/")[4];


const customer =
await env.DB.prepare(`

SELECT *

FROM customers

WHERE id=?

`)
.bind(id)
.first();



if(!customer)
return error("Customer not found",404);



return success(customer);

}




/*
ثبت مشتری

POST /api/v1/customers

*/


if(
request.method === "POST" &&
url.pathname === "/api/v1/customers"
){


const body =
await request.json();



const result =
await env.DB.prepare(`

INSERT INTO customers
(
name,
phone,
address,
customer_type,
source

)

VALUES
(?,?,?,?,?)

`)
.bind(

body.name,
body.phone ?? null,
body.address ?? null,
body.customer_type ?? "normal",
body.source ?? "store"

)
.run();



return success({

message:"customer created",
id:result.meta.last_row_id

});

}




/*
ویرایش مشتری

PUT /api/v1/customers/:id

*/


if(
request.method === "PUT" &&
url.pathname.match(/^\/api\/v1\/customers\/\d+$/)
){


const id =
url.pathname.split("/")[4];


const body =
await request.json();



await env.DB.prepare(`

UPDATE customers

SET

name=?,
phone=?,
address=?,
customer_type=?,
source=?

WHERE id=?

`)
.bind(

body.name,
body.phone ?? null,
body.address ?? null,
body.customer_type ?? "normal",
body.source ?? "store",
id

)
.run();



return success({

message:"customer updated"

});

}



return null;


}
