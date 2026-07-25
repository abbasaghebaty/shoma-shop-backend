PRAGMA foreign_keys = ON;


-- =========================
-- تامین کنندگان
-- =========================

CREATE TABLE suppliers (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    name TEXT NOT NULL,

    phone TEXT,

    address TEXT,

    note TEXT,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP

);



-- =========================
-- فاکتورهای خرید
-- =========================

CREATE TABLE purchases (

    id INTEGER PRIMARY KEY AUTOINCREMENT,


    purchase_number TEXT UNIQUE NOT NULL,


    supplier_id INTEGER,


    -- مبلغ کل خرید
    total_amount INTEGER DEFAULT 0,


    -- پرداخت شده
    paid_amount INTEGER DEFAULT 0,


    -- بدهی به تامین کننده
    debt_amount INTEGER DEFAULT 0,


    status TEXT DEFAULT 'ثبت شده',


    note TEXT,


    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,


    FOREIGN KEY(supplier_id)
    REFERENCES suppliers(id)

);



-- =========================
-- اقلام خرید
-- =========================

CREATE TABLE purchase_items (

    id INTEGER PRIMARY KEY AUTOINCREMENT,


    purchase_id INTEGER NOT NULL,


    product_id INTEGER NOT NULL,


    quantity INTEGER NOT NULL,


    -- قیمت خرید هر عدد
    purchase_price INTEGER NOT NULL,


    total_price INTEGER,


    FOREIGN KEY(purchase_id)
    REFERENCES purchases(id),


    FOREIGN KEY(product_id)
    REFERENCES products(id)

);



-- =========================
-- پرداخت به تامین کننده
-- =========================

CREATE TABLE supplier_payments (

    id INTEGER PRIMARY KEY AUTOINCREMENT,


    supplier_id INTEGER NOT NULL,


    purchase_id INTEGER,


    amount INTEGER NOT NULL,


    method TEXT,


    paid_at DATETIME DEFAULT CURRENT_TIMESTAMP,


    note TEXT,


    FOREIGN KEY(supplier_id)
    REFERENCES suppliers(id),


    FOREIGN KEY(purchase_id)
    REFERENCES purchases(id)

);



CREATE INDEX idx_purchase_supplier
ON purchases(supplier_id);


CREATE INDEX idx_purchase_date
ON purchases(created_at);
