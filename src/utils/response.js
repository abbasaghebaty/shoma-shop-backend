const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
};


export function success(data, status = 200) {
  return new Response(
    JSON.stringify({
      success: true,
      data
    }),
    {
      status,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders
      }
    }
  );
}


export function error(message, status = 400) {
  return new Response(
    JSON.stringify({
      success: false,
      error: message
    }),
    {
      status,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders
      }
    }
  );
}


export { corsHeaders };
