import { error } from "../utils/response.js";


// بررسی می‌کند که درخواست یک توکن معتبر همراه دارد یا نه
// اگر معتبر بود، اطلاعات session (شامل admin_id, username, role) را برمی‌گرداند
// اگر معتبر نبود، یک Response خطا (401) برمی‌گرداند

export async function requireAuth(request, env) {

    const authHeader = request.headers.get("Authorization");


    if (!authHeader) {

        return error(
            "برای این عملیات باید وارد حساب مدیر شوید",
            401
        );

    }


    const token = authHeader.replace("Bearer ", "");


    if (!token) {

        return error(
            "توکن نامعتبر است",
            401
        );

    }



    const session = await env.DB
        .prepare(`
            SELECT
                admin_sessions.id,
                admin_sessions.admin_id,
                admins.username,
                admins.role
            FROM admin_sessions
            JOIN admins
            ON admins.id = admin_sessions.admin_id
            WHERE admin_sessions.token = ?
            AND admin_sessions.is_active = 1
            AND admin_sessions.expires_at > CURRENT_TIMESTAMP
        `)
        .bind(token)
        .first();



    if (!session) {

        return error(
            "نشست شما نامعتبر است یا منقضی شده، دوباره وارد شوید",
            401
        );

    }



    // آپدیت آخرین زمان استفاده از این session (کار سنگینی نیست، برای گزارش‌گیری مفیده)
    await env.DB
        .prepare(`
            UPDATE admin_sessions
            SET last_used_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `)
        .bind(session.id)
        .run();



    return session;

}
