// src/routes/dashboard.js

import { success, error } from "../utils/response.js";
import { adminOnly } from "../middleware/adminOnly.js";


export async function dashboardRouter(request, env) {

    const url = new URL(request.url);


    // فقط:
    // GET /api/v1/dashboard
    if (
        request.method !== "GET" ||
        url.pathname !== "/api/v1/dashboard"
    ) {
        return null;
    }


    try {

        // ================================
        // بررسی دسترسی ادمین
        // ================================

        const auth = await adminOnly(request, env);

        // اگر احراز هویت شکست خورد
        if (auth instanceof Response) {
            return auth;
        }


        // ================================
        // تعداد محصولات
        // ================================

        const products = await env.DB
            .prepare(`
                SELECT COUNT(*) AS count
                FROM products
            `)
            .first();


        // ================================
        // تعداد مشتری‌ها
        // ================================

        const customers = await env.DB
            .prepare(`
                SELECT COUNT(*) AS count
                FROM customers
            `)
            .first();


        // ================================
        // آمار سفارش‌های امروز
        // ================================

        const todayOrders = await env.DB
            .prepare(`
                SELECT
                    COUNT(*) AS orders,
                    COALESCE(SUM(total_amount), 0) AS sales,
                    COALESCE(SUM(total_profit), 0) AS profit
                FROM orders
                WHERE DATE(created_at) = DATE('now')
            `)
            .first();


        // ================================
        // کالاهای کم موجودی
        // ================================

        const lowStock = await env.DB
            .prepare(`
                SELECT COUNT(*) AS count
                FROM inventory
                WHERE quantity <= minimum_stock
                AND alert_enabled = 1
            `)
            .first();


        // ================================
        // پاسخ نهایی
        // ================================

        return success({

            products_count: Number(products?.count ?? 0),

            customers_count: Number(customers?.count ?? 0),

            today: {

                orders: Number(
                    todayOrders?.orders ?? 0
                ),

                sales: Number(
                    todayOrders?.sales ?? 0
                ),

                profit: Number(
                    todayOrders?.profit ?? 0
                )

            },

            low_stock_products: Number(
                lowStock?.count ?? 0
            )

        });


    } catch (err) {

        console.error(
            "Dashboard Error:",
            err
        );


        return error(
            err?.message || "خطا در دریافت اطلاعات داشبورد",
            500
        );

    }

}
