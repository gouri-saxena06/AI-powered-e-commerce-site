// Seeds a few demo products. Run with: npm run seed
import dotenv from 'dotenv';
import { pool } from './config/db.js';
dotenv.config();

const products = [
  ['Aurora Wireless Headphones', 'Over-ear headphones with active noise cancellation and 40-hour battery life.', 129.99, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600', 'electronics', 40],
  ['Terra Ceramic Pour-Over Set', 'Hand-glazed ceramic pour-over coffee dripper with matching mug.', 42.00, 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600', 'home', 60],
  ['Fjord Merino Wool Sweater', 'Lightweight merino wool sweater, breathable and machine washable.', 89.50, 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600', 'apparel', 25],
  ['Pulse Fitness Tracker Band', 'Tracks heart rate, sleep, and steps with a 10-day battery.', 59.99, 'https://images.unsplash.com/photo-1576243345690-4e4b79b63288?w=600', 'electronics', 75],
  ['Basalt Cast Iron Skillet', '10-inch pre-seasoned cast iron skillet, oven safe to 500°F.', 34.99, 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600', 'home', 50],
  ['Meridian Leather Backpack', 'Full-grain leather backpack with padded 15" laptop sleeve.', 148.00, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600', 'accessories', 20],
];

async function seed() {
  for (const p of products) {
    await pool.query(
      `INSERT INTO products (name, description, price, image_url, category, stock)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      p
    );
  }
  console.log(`Seeded ${products.length} products.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
