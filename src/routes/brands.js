import { success, error } from "../utils/response.js";
import { adminOnly } from "../middleware/adminOnly.js";


export async function brandsRouter(request, env) {

const url = new URL(request.url);


/*
لیست برندها (عمومی)
GET /api/v1/brands
*/

if (
    request.method === "GET" &&
    url.pathname === "/api/v1/brands"
) {

    const brands =
        await env.DB.prepare(`
            SELECT * FROM brands ORDER BY name
        `)
        .all();

    return success(brands.results);

}




/*
ثبت برند جدید (فقط ادمین)
POST /api/v1/brands
*/

if (
    request.method === "POST" &&
    url.pathname === "/api/v1/brands"
) {

    const auth = await adminOnly(request, env);
    if (auth instanceof Response) return auth;


    const body = await request.json();


    if (!body.name) {
        return error("نام برند الزامی است", 400);
    }


    try {

        const result =
            await env.DB.prepare(`
                INSERT INTO brands (name) VALUES (?)
            `)
            .bind(body.name)
            .run();


        return success({
            id: result.meta.last_row_id,
            message: "برند با موفقیت ثبت شد"
        });

    }
    catch (err) {
        return error(err.message, 500);
    }

}




/*
حذف برند (فقط ادمین)
DELETE /api/v1/brands/:id
*/

if (
    request.method === "DELETE" &&
    url.pathname.match(/^\/api\/v1\/brands\/\d+$/)
) {

    const auth = await adminOnly(request, env);
    if (auth instanceof Response) return auth;


    const id = url.pathname.split("/")[4];


    try {

        await env.DB.prepare(`DELETE FROM brands WHERE id = ?`)
            .bind(id)
            .run();

        return success({ message: "برند حذف شد" });

    }
    catch (err) {
        return error(err.message, 500);
    }

}


return null;

}
