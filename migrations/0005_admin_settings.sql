PRAGMA foreign_keys = ON;


-- =========================
-- کاربران پنل مدیریت
-- =========================

CREATE TABLE admin_users (

    id INTEGER PRIMARY KEY AUTOINCREMENT,


    username TEXT UNIQUE NOT NULL,


    password_hash TEXT NOT NULL,


    full_name TEXT,


    role TEXT DEFAULT 'admin',
    -- admin
    -- manager
    -- warehouse


    is_active INTEGER DEFAULT 1,


    last_login DATETIME,


    created_at DATETIME DEFAULT CURRENT_TIMESTAMP

);



-- =========================
-- سطح دسترسی کاربران
-- =========================

CREATE TABLE permissions (

    id INTEGER PRIMARY KEY AUTOINCREMENT,


    user_id INTEGER NOT NULL,


    permission TEXT NOT NULL,


    -- products.view
    -- products.edit
    -- sales.view
    -- customers.edit
    -- reports.view


    FOREIGN KEY(user_id)
    REFERENCES admin_users(id)

);



-- =========================
-- تنظیمات فروشگاه
-- =========================

CREATE TABLE settings (

    id INTEGER PRIMARY KEY AUTOINCREMENT,


    setting_key TEXT UNIQUE NOT NULL,


    setting_value TEXT,


    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP

);



-- =========================
-- تاریخچه تغییرات مهم
-- =========================

CREATE TABLE audit_logs (

    id INTEGER PRIMARY KEY AUTOINCREMENT,


    user_id INTEGER,


    action TEXT NOT NULL,


    target_table TEXT,


    target_id INTEGER,


    old_value TEXT,


    new_value TEXT,


    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,


    FOREIGN KEY(user_id)
    REFERENCES admin_users(id)

);



-- =========================
-- اعلان ها
-- =========================

CREATE TABLE notifications (

    id INTEGER PRIMARY KEY AUTOINCREMENT,


    title TEXT NOT NULL,


    message TEXT,


    type TEXT,


    is_read INTEGER DEFAULT 0,


    created_at DATETIME DEFAULT CURRENT_TIMESTAMP

);



CREATE INDEX idx_audit_date
ON audit_logs(created_at);


CREATE INDEX idx_notifications_status
ON notifications(is_read);
