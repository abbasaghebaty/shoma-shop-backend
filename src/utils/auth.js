import bcrypt from "bcryptjs";


// ساخت هش رمز عبور (برای ذخیره در دیتابیس)
export async function hashPassword(password) {

    return await bcrypt.hash(password, 10);

}


// بررسی رمز عبور وارد شده با هش ذخیره شده
export async function verifyPassword(password, hash) {

    return await bcrypt.compare(password, hash);

}


// ساخت توکن یکتا برای session
export function generateToken() {

    return crypto.randomUUID() + "-" + crypto.randomUUID();

}
