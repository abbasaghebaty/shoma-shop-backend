import { success, error } from "../utils/response.js";
import { adminOnly } from "../middleware/adminOnly.js";


export async function categoriesRouter(request, env) {

const url = new URL(request.url);


/*
لیست دسته‌بندی‌ها (عمومی)
GET /api/v1/categories
*/

if (
    request.method === "GET" &&
    url.pathname === "/api/v1/categories"
) {

    const categories =
        await env.DB.prepare(`
            SELECT
                categories.*,
                parent.name AS parent_name
            FROM categories
            LEFT JOIN categories AS parent
            ON parent.id = categories.parent_id
            ORDER BY categories.name
        `)
        .all();

    return success(categories.results);

}




/*
ثبت دسته‌بندی جدید (فقط ادمین)
POST /api/v1/categories
*/

if (
    request.method === "POST" &&
    url.pathname === "/api/v1/categories"
) {

    const auth = await adminOnly(request, env);
    if (auth instanceof Response) return auth;


    const body = await request.json();


    if (!body.name) {
        return error("نام دسته‌بندی الزامی است", 400);
    }


    try {

        const result =
            await env.DB.prepare(`
                INSERT INTO categories (name, parent_id)
                VALUES (?, ?)
            `)
            .bind(body.name, body.parent_id ?? null)
            .run();


        return success({
            id: result.meta.last_row_id,
            message: "دسته‌بندی با موفقیت ثبت شد"
        });

    }
    catch (err) {
        return error(err.message, 500);
    }

}




/*
حذف دسته‌بندی (فقط ادمین)
DELETE /api/v1/categories/:id
*/

if (
    request.method === "DELETE" &&
    url.pathname.match(/^\/api\/v1\/categories\/\d+$/)
) {

    const auth = await adminOnly(request, env);
    if (auth instanceof Response) return auth;


    const id = url.pathname.split("/")[4];


    try {

        await env.DB.prepare(`DELETE FROM categories WHERE id = ?`)
            .bind(id)
            .run();

        return success({ message: "دسته‌بندی حذف شد" });

    }
    catch (err) {
        return error(err.message, 500);
    }

}


return null;

}
