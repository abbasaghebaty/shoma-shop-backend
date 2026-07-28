import { success, error } from "../utils/response.js";
import { adminOnly } from "../middleware/adminOnly.js";


export async function paymentsRouter(request, env) {


const url = new URL(request.url);



/*
ثبت پرداخت (فقط ادمین - فروشنده پرداختی که گرفته را ثبت می‌کند)
POST /api/v1/payments
*/

if (
    request.method === "POST" &&
    url.pathname === "/api/v1/payments"
) {

    const auth = await adminOnly(request, env);

    if (auth instanceof Response) {
        return auth;
    }


    try {


        const body = await request.json();


        if (!body.order_id || !body.amount) {

            return error(
                "شماره سفارش و مبلغ الزامی است",
                400
            );

        }


        if (body.amount <= 0) {

            return error(
                "مبلغ پرداخت باید بیشتر از صفر باشد",
                400
            );

        }



        const order =
            await env.DB.prepare(`
                SELECT *
                FROM orders
                WHERE id = ?
            `)
            .bind(body.order_id)
            .first();


        if (!order) {

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
            (?, ?, ?, ?, ?)
        `)
        .bind(
            body.order_id,
            body.customer_id ?? order.customer_id,
            body.amount,
            body.method ?? "cash",
            body.note ?? null
        )
        .run();



        const newPaid =
            (order.paid_amount ?? 0) + body.amount;


        const newDebt =
            (order.total_amount ?? 0) - newPaid;


        const newPaymentStatus =
            newDebt <= 0 ? "پرداخت شده" : "ناقص";



        await env.DB.prepare(`
            UPDATE orders
            SET
                paid_amount = ?,
                debt_amount = ?,
                payment_status = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `)
        .bind(
            newPaid,
            newDebt > 0 ? newDebt : 0,
            newPaymentStatus,
            body.order_id
        )
        .run();



        if (order.customer_id) {

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
                (?, ?, ?, ?, ?)
            `)
            .bind(
                order.customer_id,
                "PAYMENT",
                body.amount,
                "پرداخت سفارش شماره " + order.order_number,
                body.order_id
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
            "CREATE",
            "payments",
            body.order_id,
            "ثبت پرداخت"
        )
        .run();



        return success({

            message: "پرداخت با موفقیت ثبت شد",
            paid: newPaid,
            debt: newDebt > 0 ? newDebt : 0,
            payment_status: newPaymentStatus

        });


    }

    catch (err) {

        return error(err.message, 500);

    }

}




/*
گردش حساب مشتری (فقط ادمین)
GET /api/v1/customers/:id/transactions
*/

if (
    request.method === "GET" &&
    url.pathname.match(/^\/api\/v1\/customers\/\d+\/transactions$/)
) {

    const auth = await adminOnly(request, env);

    if (auth instanceof Response) {
        return auth;
    }


    const id =
        url.pathname.split("/")[4];


    const transactions =
        await env.DB.prepare(`
            SELECT *
            FROM customer_transactions
            WHERE customer_id = ?
            ORDER BY id DESC
        `)
        .bind(id)
        .all();


    return success(transactions.results);

}



return null;


}
