-- =========================================================
-- این migration مشکل تناقض بین 0002 و 0006 را حل می‌کند.
-- migration شماره 0006 دوباره جدول‌های orders, order_items,
-- payments, inventory_transactions را ساخته بود که با 0002
-- تکراری بود و روی دیتابیس تازه خطا می‌دهد.
--
-- از این به بعد دیگر لازم نیست 0006_sales_fix.sql را اجرا کنید.
-- اگر قبلاً 0006 را روی دیتابیس اجرا کرده‌اید، این فایل کاری
-- نمی‌کند چون IF NOT EXISTS دارد و همه چیز از قبل درست است.
-- =========================================================

PRAGMA foreign_keys = ON;


CREATE TABLE IF NOT EXISTS orders (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    order_number TEXT UNIQUE NOT NULL,

    customer_id INTEGER,

    source TEXT NOT NULL DEFAULT 'حضوری',

    status TEXT DEFAULT 'ثبت شده',

    payment_status TEXT DEFAULT 'پرداخت نشده',

    total_amount INTEGER DEFAULT 0,

    paid_amount INTEGER DEFAULT 0,

    debt_amount INTEGER DEFAULT 0,

    total_profit INTEGER DEFAULT 0,

    note TEXT,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(customer_id)
    REFERENCES customers(id)

);



CREATE TABLE IF NOT EXISTS order_items (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    order_id INTEGER NOT NULL,

    product_id INTEGER NOT NULL,

    quantity INTEGER NOT NULL,

    sale_price INTEGER NOT NULL,

    purchase_price INTEGER,

    profit INTEGER,

    FOREIGN KEY(order_id)
    REFERENCES orders(id),

    FOREIGN KEY(product_id)
    REFERENCES products(id)

);



CREATE TABLE IF NOT EXISTS payments (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    order_id INTEGER NOT NULL,

    customer_id INTEGER,

    amount INTEGER NOT NULL,

    method TEXT,

    paid_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    note TEXT,

    FOREIGN KEY(order_id)
    REFERENCES orders(id),

    FOREIGN KEY(customer_id)
    REFERENCES customers(id)

);



CREATE TABLE IF NOT EXISTS inventory_transactions (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    product_id INTEGER NOT NULL,

    warehouse_id INTEGER NOT NULL,

    type TEXT NOT NULL,

    quantity INTEGER NOT NULL,

    reason TEXT,

    reference_id INTEGER,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(product_id)
    REFERENCES products(id),

    FOREIGN KEY(warehouse_id)
    REFERENCES warehouses(id)

);



-- ایندکس روی order_number چون در جستجوها زیاد استفاده می‌شود
CREATE INDEX IF NOT EXISTS idx_orders_order_number
ON orders(order_number);


-- ایندکس روی وضعیت پرداخت برای فیلتر سریع سفارش‌های بدهکار
CREATE INDEX IF NOT EXISTS idx_orders_payment_status
ON orders(payment_status);
