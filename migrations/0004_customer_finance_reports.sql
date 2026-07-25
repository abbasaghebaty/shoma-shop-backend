PRAGMA foreign_keys = ON;


-- =========================
-- حساب گردش مشتری
-- =========================

CREATE TABLE customer_transactions (

    id INTEGER PRIMARY KEY AUTOINCREMENT,


    customer_id INTEGER NOT NULL,


    -- خرید، پرداخت، اصلاح حساب
    type TEXT NOT NULL,


    -- مبلغ مثبت یا منفی
    amount INTEGER NOT NULL,


    -- توضیح تراکنش
    description TEXT,


    reference_id INTEGER,


    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,


    FOREIGN KEY(customer_id)
    REFERENCES customers(id)

);



-- =========================
-- یادداشت و اطلاعات تکمیلی مشتری
-- =========================

CREATE TABLE customer_notes (

    id INTEGER PRIMARY KEY AUTOINCREMENT,


    customer_id INTEGER NOT NULL,


    note TEXT NOT NULL,


    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,


    FOREIGN KEY(customer_id)
    REFERENCES customers(id)

);



-- =========================
-- اهداف و گزارش های روزانه
-- =========================

CREATE TABLE daily_reports (

    id INTEGER PRIMARY KEY AUTOINCREMENT,


    report_date DATE UNIQUE NOT NULL,


    total_sales INTEGER DEFAULT 0,


    total_profit INTEGER DEFAULT 0,


    total_orders INTEGER DEFAULT 0,


    total_paid INTEGER DEFAULT 0,


    total_debt INTEGER DEFAULT 0,


    created_at DATETIME DEFAULT CURRENT_TIMESTAMP

);



-- =========================
-- گزارش سود کالاها
-- =========================

CREATE TABLE product_profit_reports (

    id INTEGER PRIMARY KEY AUTOINCREMENT,


    product_id INTEGER NOT NULL,


    total_sold_quantity INTEGER DEFAULT 0,


    total_sales INTEGER DEFAULT 0,


    total_profit INTEGER DEFAULT 0,


    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,


    FOREIGN KEY(product_id)
    REFERENCES products(id)

);



-- =========================
-- ثبت فعالیت های مدیریتی
-- =========================
-- برای اینکه بفهمیم چه چیزی و چه زمانی تغییر کرده

CREATE TABLE activity_logs (

    id INTEGER PRIMARY KEY AUTOINCREMENT,


    user_name TEXT,


    action TEXT NOT NULL,


    table_name TEXT,


    record_id INTEGER,


    description TEXT,


    created_at DATETIME DEFAULT CURRENT_TIMESTAMP

);



CREATE INDEX idx_customer_transactions_customer
ON customer_transactions(customer_id);


CREATE INDEX idx_activity_date
ON activity_logs(created_at);


CREATE INDEX idx_reports_date
ON daily_reports(report_date);
