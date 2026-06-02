import { sql } from 'drizzle-orm';
import { db } from '@workspace/db';

export class Storage {
  async listProductsWithPrices(active = true) {
    const result = await db.execute(
      sql`
        SELECT
          p.id as product_id,
          p.name as product_name,
          p.description as product_description,
          p.active as product_active,
          p.metadata as product_metadata,
          pr.id as price_id,
          pr.unit_amount,
          pr.currency,
          pr.active as price_active,
          pr.metadata as price_metadata
        FROM stripe.products p
        LEFT JOIN stripe.prices pr ON pr.product = p.id AND pr.active = true
        WHERE p.active = ${active}
        ORDER BY p.metadata->>'sort_order', p.id, pr.unit_amount
      `
    );
    return result.rows;
  }

  async getProduct(productId: string) {
    const result = await db.execute(
      sql`SELECT * FROM stripe.products WHERE id = ${productId}`
    );
    return result.rows[0] || null;
  }

  async getProductWithPrices(productId: string) {
    const result = await db.execute(
      sql`
        SELECT
          p.id as product_id,
          p.name as product_name,
          p.description as product_description,
          p.active as product_active,
          p.metadata as product_metadata,
          pr.id as price_id,
          pr.unit_amount,
          pr.currency,
          pr.active as price_active
        FROM stripe.products p
        LEFT JOIN stripe.prices pr ON pr.product = p.id AND pr.active = true
        WHERE p.id = ${productId}
      `
    );
    return result.rows;
  }
}

export const storage = new Storage();
