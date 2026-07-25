PRAGMA foreign_keys = ON;


CREATE TABLE orders (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    order_number TEXT UNIQUE NOT NULL,

    customer_id INTEGER,

    source TEXT NOT NULL,

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



CREATE TABLE order_items (

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



CREATE TABLE payments (

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



CREATE TABLE inventory_transactions (

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
