import { requireAuth } from "./auth.js";


// این تابع رو در ابتدای هر route که فقط ادمین باید بهش دسترسی داشته باشه صدا می‌زنیم
// اگه کاربر لاگین نکرده باشه یا توکنش منقضی شده باشه، یک Response خطا برمی‌گرده
// اگه معتبر باشه، اطلاعات session (شامل admin_id, username, role) برمی‌گرده

export async function adminOnly(request, env) {

    const session = await requireAuth(
        request,
        env
    );


    // اگه requireAuth یک Response برگردونده باشه یعنی خطا بوده (401)
    if (session instanceof Response) {
        return session;
    }


    return session;

}
