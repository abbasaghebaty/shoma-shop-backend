import bcrypt from "bcryptjs";


// ساخت هش رمز
export async function hashPassword(password){

    return await bcrypt.hash(password,10);

}


// بررسی رمز
export async function verifyPassword(password,hash){

    return await bcrypt.compare(password,hash);

}


// ساخت توکن سشن
export function generateToken(){

    return crypto.randomUUID();

}
