export async function getProducts(DB) {

  const { results } = await DB
    .prepare(`
      SELECT *
      FROM products
      ORDER BY id DESC
    `)
    .all();

  return results;
}



export async function getProduct(DB, id) {

  const product = await DB
    .prepare(`
      SELECT *
      FROM products
      WHERE id = ?
    `)
    .bind(id)
    .first();

  return product;
}



export async function createProduct(DB, data) {

  const result = await DB
    .prepare(`
      INSERT INTO products
      (
        product_code,
        name,
        barcode,
        category_id,
        brand_id,
        variant,
        description,
        unit
      )

      VALUES
      (?, ?, ?, ?, ?, ?, ?, ?)

    `)
    .bind(
      data.product_code,
      data.name,
      data.barcode ?? null,
      data.category_id ?? null,
      data.brand_id ?? null,
      data.variant ?? null,
      data.description ?? null,
      data.unit ?? "عدد"
    )
    .run();


  return result.meta.last_row_id;

}



export async function updateProduct(DB, id, data) {


  await DB
    .prepare(`
      UPDATE products

      SET

      name=?,
      barcode=?,
      category_id=?,
      brand_id=?,
      variant=?,
      description=?,
      unit=?,
      updated_at=CURRENT_TIMESTAMP


      WHERE id=?

    `)

    .bind(
      data.name,
      data.barcode ?? null,
      data.category_id ?? null,
      data.brand_id ?? null,
      data.variant ?? null,
      data.description ?? null,
      data.unit ?? "عدد",
      id
    )

    .run();


}



export async function deleteProduct(DB,id){

  await DB
  .prepare(`
    DELETE FROM products
    WHERE id=?
  `)
  .bind(id)
  .run();

}
