import { success, error } from "../utils/response.js";
import { adminOnly } from "../middleware/adminOnly.js";


export async function customersRouter(request, env) {


const url = new URL(request.url);



/*
لیست مشتری‌ها (فقط ادمین - اطلاعات همه مشتری‌ها را می‌بیند)
GET /api/v1/customers
*/

if (
    request.method === "GET" &&
    url.pathname === "/api/v1/customers"
) {

    const auth = await adminOnly(request, env);

    if (auth instanceof Response) {
        return auth;
    }


    const customers =
        await env.DB.prepare(`
            SELECT
                id,
                customer_code,
                name,
                phone,
                address,
                customer_type,
                source,
                created_at
            FROM customers
            ORDER BY id DESC
        `)
        .all();


    return success(customers.results);

}




/*
یک مشتری (فقط ادمین)
GET /api/v1/customers/:id
*/

if (
    request.method === "GET" &&
    url.pathname.match(/^\/api\/v1\/customers\/\d+$/)
) {

    const auth = await adminOnly(request, env);

    if (auth instanceof Response) {
        return auth;
    }


    const id =
        url.pathname.split("/")[4];


    const customer =
        await env.DB.prepare(`
            SELECT
                id,
                customer_code,
                name,
                phone,
                address,
                customer_type,
                source,
                created_at
            FROM customers
            WHERE id = ?
        `)
        .bind(id)
        .first();


    if (!customer) {
        return error("Customer not found", 404);
    }


    return success(customer);

}




/*
ثبت مشتری جدید (توسط ادمین یا خودِ فروشگاه - قبل از اینکه مشتری بتونه
رمز بسازه یا سفارش بزنه، شماره‌اش باید اینجا ثبت شده باشه)
POST /api/v1/customers
*/

if (
    request.method === "POST" &&
    url.pathname === "/api/v1/customers"
) {

    const auth = await adminOnly(request, env);

    if (auth instanceof Response) {
        return auth;
    }


    const body = await request.json();


    if (!body.phone) {

        return error(
            "شماره تلفن الزامی است",
            400
        );

    }


    const existing =
        await env.DB.prepare(`
            SELECT id FROM customers WHERE phone = ?
        `)
        .bind(body.phone)
        .first();


    if (existing) {

        return error(
            "این شماره تلفن قبلا ثبت شده است",
            409
        );

    }


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
            (?, ?, ?, ?, ?)
        `)
        .bind(
            body.name ?? null,
            body.phone,
            body.address ?? null,
            body.customer_type ?? "normal",
            body.source ?? "store"
        )
        .run();


    return success({

        message: "مشتری با موفقیت ثبت شد",
        id: result.meta.last_row_id

    });

}




/*
ویرایش اطلاعات مشتری (فقط ادمین)
PUT /api/v1/customers/:id
*/

if (
    request.method === "PUT" &&
    url.pathname.match(/^\/api\/v1\/customers\/\d+$/)
) {

    const auth = await adminOnly(request, env);

    if (auth instanceof Response) {
        return auth;
    }


    const id =
        url.pathname.split("/")[4];


    const body = await request.json();


    await env.DB.prepare(`
        UPDATE customers
        SET
            name = ?,
            address = ?,
            customer_type = ?,
            source = ?
        WHERE id = ?
    `)
    .bind(
        body.name ?? null,
        body.address ?? null,
        body.customer_type ?? "normal",
        body.source ?? "store",
        id
    )
    .run();


    return success({
        message: "اطلاعات مشتری بروزرسانی شد"
    });

}



return null;


}
