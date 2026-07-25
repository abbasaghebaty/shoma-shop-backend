import { success } from "../utils/response.js";
import { getProducts } from "../services/productService.js";


export async function productsRouter(request, env) {


  const url = new URL(request.url);


  if (
    request.method === "GET" &&
    url.pathname === "/api/v1/products"
  ) {

    const products = await getProducts(env.DB);

    return success(products);

  }


  return null;

}
