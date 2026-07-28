import { verifyPassword, generateToken } from "../utils/auth.js";
import { error, success, corsHeaders } from "../utils/response.js";


export async function authRouter(request, env) {

    const url = new URL(request.url);



    // LOGIN
    if (
        request.method === "POST" &&
        url.pathname === "/api/v1/auth/login"
    ) {


        const body = await request.json();


        const username = body.username;
        const password = body.password;



        if (!username || !password) {

            return error(
                "Username and password required",
                400
            );

        }



        // پیدا کردن ادمین

        const admin = await env.DB
            .prepare(
                `
                SELECT *
                FROM admins
                WHERE username = ?
                AND is_active = 1
                `
            )
            .bind(username)
            .first();



        if (!admin) {

            return error(
                "Invalid credentials",
                401
            );

        }



        // بررسی رمز هش شده

        const valid =
            await verifyPassword(
                password,
                admin.password_hash
            );



        if (!valid) {

            return error(
                "Invalid credentials",
                401
            );

        }




        // ساخت توکن Session

        const token =
            generateToken();



        // اطلاعات دستگاه

        const userAgent =
            request.headers.get("User-Agent") || "unknown";


        const ip =
            request.headers.get("CF-Connecting-IP") || "unknown";




        // ذخیره Session

        await env.DB
            .prepare(
                `
                INSERT INTO admin_sessions
                (
                    admin_id,
                    token,
                    device_name,
                    user_agent,
                    expires_at
                )
                VALUES
                (
                    ?,
                    ?,
                    ?,
                    ?,
                    datetime('now','+30 days')
                )
                `
            )
            .bind(
                admin.id,
                token,
                ip,
                userAgent
            )
            .run();




        return new Response(
            JSON.stringify({

                success: true,

                token,


                admin: {

                    id: admin.id,
                    username: admin.username,
                    name: admin.name,
                    role: admin.role

                }

            }),
            {
                status: 200,
                headers: {
                    "Content-Type": "application/json",
                    ...corsHeaders
                }
            }
        );

    }




    return null;

}
