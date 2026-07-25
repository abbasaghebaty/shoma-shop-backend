import { error } from "../utils/response.js";


export async function requireAuth(request, env) {

    const authHeader = request.headers.get("Authorization");


    if (!authHeader) {

        return error(
            "Unauthorized",
            401
        );

    }


    const token = authHeader.replace("Bearer ", "");



    const session = await env.DB
        .prepare(`
            SELECT 
                admin_sessions.*,
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
            "Invalid or expired session",
            401
        );

    }



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
