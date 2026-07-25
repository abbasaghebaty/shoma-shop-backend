import { success, error } from "../utils/response.js";


export async function dashboardRouter(request, env){


const url = new URL(request.url);



if(
request.method === "GET" &&
url.pathname === "/api/v1/dashboard"
){


try{


// تعداد محصولات

const products =
await env.DB.prepare(`

SELECT COUNT(*) as count

FROM products

`)
.first();




// تعداد مشتری‌ها

const customers =
await env.DB.prepare(`

SELECT COUNT(*) as count

FROM customers

`)
.first();





// سفارش‌های امروز

const todayOrders =
await env.DB.prepare(`

SELECT 

COUNT(*) as orders,
COALESCE(SUM(total_amount),0) as sales,
COALESCE(SUM(total_profit),0) as profit

FROM orders

WHERE DATE(created_at)=DATE('now')

`)
.first();





// کالاهای کم موجودی

const lowStock =
await env.DB.prepare(`

SELECT COUNT(*) as count

FROM inventory

WHERE quantity <= minimum_stock

AND alert_enabled=1

`)
.first();






return success({

products_count:
products.count,


customers_count:
customers.count,


today:{

orders:
todayOrders.orders,

sales:
todayOrders.sales,

profit:
todayOrders.profit

},


low_stock_products:
lowStock.count


});



}

catch(err){

return error(err.message,500);

}


}



return null;


}
