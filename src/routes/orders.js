import { success, error } from "../utils/response.js";
import { adminOnly } from "../middleware/adminOnly.js";


export async function ordersRouter(request, env) {

const url = new URL(request.url);



/*
ایجاد سفارش
POST /api/v1/orders
*/

if (
    request.method === "POST" &&
    url.pathname === "/api/v1/orders"
) {


    // فقط ادمین می‌تواند سفارش ثبت کند
    const auth = await adminOnly(request, env);

    if (auth instanceof Response) {
        return auth;
    }



    const body = await request.json();



    // بررسی اینکه اقلام سفارش وجود دارد

    if (!Array.isArray(body.items) || body.items.length === 0) {

        return error(
            "سفارش باید حداقل یک کالا داشته باشد",
            400
        );

    }


    if (!body.warehouse_id) {

        return error(
            "انبار مشخص نشده است",
            400
        );

    }



    try {


        // ساخت شماره سفارش یکتا
        const orderNumber =
            "ORD-" + Date.now() + "-" + Math.floor(Math.random() * 1000);



        // بررسی موجودی کافی برای همه اقلام قبل از هرگونه تغییر
        for (const item of body.items) {

            const stock = await env.DB.prepare(`
                SELECT quantity
                FROM inventory
                WHERE product_id = ?
                AND warehouse_id = ?
            `)
            .bind(item.product_id, body.warehouse_id)
            .first();


            if (!stock) {

                return error(
                    `موجودی برای کالای ${item.product_id} در این انبار ثبت نشده است`,
                    400
                );

            }


            if (stock.quantity < item.quantity) {

                return error(
                    `موجودی کافی نیست (کالای ${item.product_id})`,
                    400
                );

            }

        }




        // ساخت سفارش

        const order =
            await env.DB.prepare(`
                INSERT INTO orders
                (
                    order_number,
                    customer_id,
                    source,
                    total_amount,
                    paid_amount,
                    debt_amount,
                    total_profit,
                    note
                )
                VALUES
                (?, ?, ?, ?, ?, ?, ?, ?)
            `)
            .bind(
                orderNumber,
                body.customer_id ?? null,
                body.source ?? "حضوری",
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



        // ثبت اقلام سفارش

        for (const item of body.items) {


            const product =
                await env.DB.prepare(`
                    SELECT purchase_price
                    FROM product_prices
                    WHERE product_id = ?
                `)
                .bind(item.product_id)
                .first();


            const purchasePrice =
                product?.purchase_price ?? 0;


            const profit =
                (item.sale_price - purchasePrice) * item.quantity;


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
                (?, ?, ?, ?, ?, ?)
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


            totalAmount += item.sale_price * item.quantity;
            totalProfit += profit;



            // کم کردن موجودی

            await env.DB.prepare(`
                UPDATE inventory
                SET quantity = quantity - ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE product_id = ?
                AND warehouse_id = ?
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
                (?, ?, ?, ?, ?, ?)
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

        const debtAmount = totalAmount;

        await env.DB.prepare(`
            UPDATE orders
            SET
                total_amount = ?,
                total_profit = ?,
                debt_amount = ?,
                payment_status = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `)
        .bind(
            totalAmount,
            totalProfit,
            debtAmount,
            "پرداخت نشده",
            orderId
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
            (?, ?, ?, ?, ?)
        `)
        .bind(
            auth.username ?? "admin",
            "CREATE",
            "orders",
            orderId,
            "ثبت سفارش جدید"
        )
        .run();



        return success({

            message: "order created",
            order_id: orderId,
            order_number: orderNumber,
            total: totalAmount,
            profit: totalProfit

        });


    }

    catch (err) {

        return error(err.message, 500);

    }


}




/*
لیست سفارش‌ها
GET /api/v1/orders
*/

if (
    request.method === "GET" &&
    url.pathname === "/api/v1/orders"
) {


    const auth = await adminOnly(request, env);

    if (auth instanceof Response) {
        return auth;
    }


    const orders =
        await env.DB.prepare(`
            SELECT
                orders.*,
                customers.name AS customer_name

            FROM orders

            LEFT JOIN customers
            ON customers.id = orders.customer_id

            ORDER BY orders.id DESC
        `)
        .all();


    return success(orders.results);

}




/*
یک سفارش با جزئیات کامل اقلامش
GET /api/v1/orders/:id
*/

if (
    request.method === "GET" &&
    url.pathname.match(/^\/api\/v1\/orders\/\d+$/)
) {


    const auth = await adminOnly(request, env);

    if (auth instanceof Response) {
        return auth;
    }


    const id =
        url.pathname.split("/")[4];


    const order =
        await env.DB.prepare(`
            SELECT
                orders.*,
                customers.name AS customer_name,
                customers.phone AS customer_phone

            FROM orders

            LEFT JOIN customers
            ON customers.id = orders.customer_id

            WHERE orders.id = ?
        `)
        .bind(id)
        .first();


    if (!order) {

        return error("Order not found", 404);

    }


    const items =
        await env.DB.prepare(`
            SELECT
                order_items.*,
                products.name AS product_name

            FROM order_items

            JOIN products
            ON products.id = order_items.product_id

            WHERE order_id = ?
        `)
        .bind(id)
        .all();


    return success({
        ...order,
        items: items.results
    });

}



return null;


}
