PRAGMA foreign_keys = ON;


-- =========================
-- دسته بندی محصولات
-- =========================

CREATE TABLE categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    name TEXT NOT NULL,

    parent_id INTEGER,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(parent_id)
    REFERENCES categories(id)
);



-- =========================
-- برندها
-- =========================

CREATE TABLE brands (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    name TEXT NOT NULL UNIQUE,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);



-- =========================
-- محصولات
-- =========================

CREATE TABLE products (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    -- شناسه کالا
    product_code TEXT NOT NULL UNIQUE,

    -- نام محصول
    name TEXT NOT NULL,


    -- بارکد
    barcode TEXT UNIQUE,


    category_id INTEGER,

    brand_id INTEGER,


    -- مثلا شامپو 400 میل
    variant TEXT,


    description TEXT,


    -- واحد شمارش
    unit TEXT DEFAULT 'عدد',


    -- وضعیت موجودی
    is_available INTEGER DEFAULT 1,


    -- تاریخ ایجاد
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,


    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,


    FOREIGN KEY(category_id)
    REFERENCES categories(id),


    FOREIGN KEY(brand_id)
    REFERENCES brands(id)

);



-- =========================
-- تصاویر محصولات (R2)
-- =========================

CREATE TABLE product_images (

    id INTEGER PRIMARY KEY AUTOINCREMENT,


    product_id INTEGER NOT NULL,


    image_url TEXT NOT NULL,


    alt_text TEXT,


    sort_order INTEGER DEFAULT 0,


    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,


    FOREIGN KEY(product_id)
    REFERENCES products(id)
);



-- =========================
-- انبارها
-- =========================

CREATE TABLE warehouses (

    id INTEGER PRIMARY KEY AUTOINCREMENT,


    name TEXT NOT NULL,


    address TEXT,


    is_active INTEGER DEFAULT 1,


    created_at DATETIME DEFAULT CURRENT_TIMESTAMP

);



-- =========================
-- موجودی محصولات در انبار
-- =========================

CREATE TABLE inventory (

    id INTEGER PRIMARY KEY AUTOINCREMENT,


    product_id INTEGER NOT NULL,


    warehouse_id INTEGER NOT NULL,


    quantity INTEGER DEFAULT 0,


    minimum_stock INTEGER DEFAULT 0,


    alert_enabled INTEGER DEFAULT 1,


    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,


    FOREIGN KEY(product_id)
    REFERENCES products(id),


    FOREIGN KEY(warehouse_id)
    REFERENCES warehouses(id)

);



-- =========================
-- قیمت فعلی محصولات
-- =========================

CREATE TABLE product_prices (

    id INTEGER PRIMARY KEY AUTOINCREMENT,


    product_id INTEGER NOT NULL,


    purchase_price INTEGER,


    consumer_price INTEGER,


    wholesale_price INTEGER,


    wholesale_min_quantity INTEGER,


    discount_percent INTEGER DEFAULT 0,


    profit_amount INTEGER,


    last_checked_at DATETIME,


    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,


    FOREIGN KEY(product_id)
    REFERENCES products(id)

);



-- =========================
-- تاریخچه تغییر قیمت
-- =========================

CREATE TABLE price_history (

    id INTEGER PRIMARY KEY AUTOINCREMENT,


    product_id INTEGER NOT NULL,


    old_price INTEGER,


    new_price INTEGER,


    price_type TEXT,


    changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,


    FOREIGN KEY(product_id)
    REFERENCES products(id)

);



-- =========================
-- ثبت چک کردن قیمت بدون تغییر
-- =========================

CREATE TABLE price_checks (

    id INTEGER PRIMARY KEY AUTOINCREMENT,


    product_id INTEGER NOT NULL,


    checked_at DATETIME DEFAULT CURRENT_TIMESTAMP,


    changed INTEGER DEFAULT 0,


    FOREIGN KEY(product_id)
    REFERENCES products(id)

);



-- =========================
-- مشتریان
-- =========================

CREATE TABLE customers (

    id INTEGER PRIMARY KEY AUTOINCREMENT,


    customer_code TEXT UNIQUE,


    name TEXT,


    phone TEXT,


    address TEXT,


    customer_type TEXT,


    -- تلفنی، سایت، کانال، چت
    source TEXT,


    created_at DATETIME DEFAULT CURRENT_TIMESTAMP

);



-- =========================
-- ایندکس‌ها
-- =========================

CREATE INDEX idx_product_name
ON products(name);


CREATE INDEX idx_barcode
ON products(barcode);


CREATE INDEX idx_customer_phone
ON customers(phone);
