import { requireAuth } from "./auth.js";


export async function adminOnly(request, env) {

    const session = await requireAuth(
        request,
        env
    );


    if(session instanceof Response){
        return session;
    }


    return session;

}
