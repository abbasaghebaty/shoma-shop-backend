PRAGMA foreign_keys = ON;


-- =========================
-- سفارش ها
-- =========================

CREATE TABLE orders (

    id INTEGER PRIMARY KEY AUTOINCREMENT,


    -- شماره سفارش
    order_number TEXT UNIQUE NOT NULL,


    -- مشتری
    customer_id INTEGER,


    -- منبع سفارش
    -- حضوری، تلفنی، سایت، کانال، چت
    source TEXT NOT NULL,


    -- وضعیت سفارش
    -- ثبت شده، آماده سازی، تحویل، لغو
    status TEXT DEFAULT 'ثبت شده',


    -- وضعیت پرداخت
    -- پرداخت شده، نسیه، ناقص
    payment_status TEXT DEFAULT 'پرداخت نشده',


    -- مبلغ کل
    total_amount INTEGER DEFAULT 0,


    -- مبلغ پرداخت شده
    paid_amount INTEGER DEFAULT 0,


    -- بدهی باقی مانده
    debt_amount INTEGER DEFAULT 0,


    -- سود کل این سفارش
    total_profit INTEGER DEFAULT 0,


    -- توضیحات
    note TEXT,


    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,


    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,


    FOREIGN KEY(customer_id)
    REFERENCES customers(id)

);



-- =========================
-- کالاهای داخل سفارش
-- =========================

CREATE TABLE order_items (

    id INTEGER PRIMARY KEY AUTOINCREMENT,


    order_id INTEGER NOT NULL,


    product_id INTEGER NOT NULL,


    -- تعداد خریداری شده
    quantity INTEGER NOT NULL,


    -- قیمت فروش در همان لحظه
    sale_price INTEGER NOT NULL,


    -- قیمت خرید در همان لحظه
    purchase_price INTEGER,


    -- سود این ردیف
    profit INTEGER,


    FOREIGN KEY(order_id)
    REFERENCES orders(id),


    FOREIGN KEY(product_id)
    REFERENCES products(id)

);



-- =========================
-- پرداخت ها
-- =========================

CREATE TABLE payments (

    id INTEGER PRIMARY KEY AUTOINCREMENT,


    order_id INTEGER NOT NULL,


    customer_id INTEGER,


    amount INTEGER NOT NULL,


    -- نقدی، کارت، آنلاین، انتقال
    method TEXT,


    -- زمان پرداخت
    paid_at DATETIME DEFAULT CURRENT_TIMESTAMP,


    note TEXT,


    FOREIGN KEY(order_id)
    REFERENCES orders(id),


    FOREIGN KEY(customer_id)
    REFERENCES customers(id)

);



-- =========================
-- گردش موجودی
-- =========================
-- هر ورود و خروج کالا اینجا ثبت می شود

CREATE TABLE inventory_transactions (

    id INTEGER PRIMARY KEY AUTOINCREMENT,


    product_id INTEGER NOT NULL,


    warehouse_id INTEGER NOT NULL,


    -- ورود یا خروج
    type TEXT NOT NULL,


    -- تعداد تغییر
    quantity INTEGER NOT NULL,


    -- دلیل
    -- خرید، فروش، اصلاح، برگشت
    reason TEXT,


    reference_id INTEGER,


    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,


    FOREIGN KEY(product_id)
    REFERENCES products(id),


    FOREIGN KEY(warehouse_id)
    REFERENCES warehouses(id)

);



CREATE INDEX idx_orders_customer
ON orders(customer_id);


CREATE INDEX idx_orders_date
ON orders(created_at);


CREATE INDEX idx_order_items_product
ON order_items(product_id);
