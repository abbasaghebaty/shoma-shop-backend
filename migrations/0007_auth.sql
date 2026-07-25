-- جدول مدیران سیستم

CREATE TABLE IF NOT EXISTS admins (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    username TEXT NOT NULL UNIQUE,

    password_hash TEXT NOT NULL,

    name TEXT,

    role TEXT DEFAULT 'admin',

    is_active INTEGER DEFAULT 1,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP

);



-- جدول نشست‌ها / دستگاه‌های وارد شده

CREATE TABLE IF NOT EXISTS admin_sessions (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    admin_id INTEGER NOT NULL,

    token TEXT NOT NULL UNIQUE,

    device_name TEXT,

    user_agent TEXT,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    last_used_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    expires_at DATETIME NOT NULL,

    is_active INTEGER DEFAULT 1,


    FOREIGN KEY(admin_id)
    REFERENCES admins(id)

);
