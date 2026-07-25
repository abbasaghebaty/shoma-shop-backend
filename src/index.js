export default {
  async fetch(request, env) {

    const result = await env.DB
      .prepare("SELECT 1 as test")
      .first();

    return Response.json(result);

  }
}
