-- =========================================================
-- این migration یک باگ واقعی را برطرف می‌کند:
--
-- جدول product_prices در 0001 بدون UNIQUE روی ستون product_id
-- ساخته شده بود. اما تابع updateProductPrice در
-- src/services/priceService.js از دستور زیر استفاده می‌کند:
--
--   INSERT INTO product_prices (...) VALUES (...)
--   ON CONFLICT(product_id) DO UPDATE SET ...
--
-- در SQLite، برای اینکه ON CONFLICT(product_id) کار کند،
-- باید حتما یک UNIQUE INDEX یا UNIQUE CONSTRAINT روی همان
-- ستون وجود داشته باشد. چون این ایندکس وجود نداشت، هر بار
-- که ادمین از فرم «قیمت» برای ویرایش قیمت یک محصول استفاده
-- می‌کرد، درخواست با خطای زیر رد می‌شد:
--
--   "ON CONFLICT clause does not match any PRIMARY KEY or
--    UNIQUE constraint"
--
-- این همان دلیلی است که ویرایش قیمت محصول از داشبورد کار
-- نمی‌کرد. این migration مشکل را با ساخت یک UNIQUE INDEX
-- روی product_id برطرف می‌کند.
-- =========================================================

CREATE UNIQUE INDEX IF NOT EXISTS idx_product_prices_product
ON product_prices(product_id);
