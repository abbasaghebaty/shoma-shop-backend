export async function getProductPrice(DB, productId) {

    const price = await DB
    .prepare(`
        SELECT *
        FROM product_prices
        WHERE product_id = ?
    `)
    .bind(productId)
    .first();


    return price;

}



export async function updateProductPrice(DB, productId, data) {


    const oldPrice = await getProductPrice(DB, productId);



    // ثبت تاریخچه تغییر
    if(oldPrice){

        if(data.consumer_price !== oldPrice.consumer_price){

            await DB.prepare(`
                INSERT INTO price_history
                (
                    product_id,
                    old_price,
                    new_price,
                    price_type
                )

                VALUES (?, ?, ?, ?)

            `)
            .bind(
                productId,
                oldPrice.consumer_price,
                data.consumer_price,
                "consumer"
            )
            .run();

        }


    }



    await DB.prepare(`
        INSERT INTO product_prices
        (
            product_id,
            purchase_price,
            consumer_price,
            wholesale_price,
            wholesale_min_quantity,
            discount_percent,
            profit_amount,
            last_checked_at
        )

        VALUES
        (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)

        ON CONFLICT(product_id)

        DO UPDATE SET

        purchase_price=?,
        consumer_price=?,
        wholesale_price=?,
        wholesale_min_quantity=?,
        discount_percent=?,
        profit_amount=?,
        last_checked_at=CURRENT_TIMESTAMP

    `)
    .bind(

        productId,

        data.purchase_price ?? null,
        data.consumer_price ?? null,
        data.wholesale_price ?? null,
        data.wholesale_min_quantity ?? null,
        data.discount_percent ?? 0,

        // سود
        (data.consumer_price ?? 0) - (data.purchase_price ?? 0),


        // update values

        data.purchase_price ?? null,
        data.consumer_price ?? null,
        data.wholesale_price ?? null,
        data.wholesale_min_quantity ?? null,
        data.discount_percent ?? 0,

        (data.consumer_price ?? 0) - (data.purchase_price ?? 0)

    )
    .run();


}




export async function addPriceCheck(DB, productId, changed=false){


    await DB.prepare(`
        INSERT INTO price_checks
        (
            product_id,
            changed
        )

        VALUES (?,?)

    `)
    .bind(
        productId,
        changed ? 1 : 0
    )
    .run();


}
