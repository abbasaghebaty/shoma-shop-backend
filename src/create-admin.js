import bcrypt from "bcryptjs";


const password = "رمزی که خودت میخوای";


const hash = await bcrypt.hash(password,10);


console.log(hash);
