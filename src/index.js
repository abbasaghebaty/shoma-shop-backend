import { productsRouter } from "./routes/products.js";
import { error } from "./utils/response.js";


export default {

async fetch(request, env) {


  try {


    const productResponse =
      await productsRouter(request, env);


    if(productResponse){
      return productResponse;
    }



    return error(
      "Route not found",
      404
    );


  } catch(error){


    return new Response(
      JSON.stringify({
        success:false,
        error:error.message
      }),
      {
        status:500,
        headers:{
          "Content-Type":"application/json"
        }
      }
    );


  }

}

};
