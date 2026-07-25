export async function getProducts(DB) {

  const { results } = await DB
    .prepare(
      `
      SELECT 
      products.*,
      brands.name AS brand_name,
      categories.name AS category_name

      FROM products

      LEFT JOIN brands 
      ON products.brand_id = brands.id

      LEFT JOIN categories
      ON products.category_id = categories.id

      ORDER BY products.id DESC
      `
    )
    .all();


  return results;
}
