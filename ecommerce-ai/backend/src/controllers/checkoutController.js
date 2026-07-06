import Stripe from 'stripe';
import dotenv from 'dotenv';
import { pool } from '../config/db.js';
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

// Body: { items: [{ product_id, quantity }] }
export async function createCheckoutSession(req, res) {
  try {
    const { items } = req.body;
    if (!Array.isArray(items) || !items.length) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    const ids = items.map((i) => i.product_id);
    const { rows: products } = await pool.query(
      'SELECT * FROM products WHERE id = ANY($1::int[])',
      [ids]
    );

    const lineItems = [];
    let total = 0;
    for (const item of items) {
      const product = products.find((p) => p.id === item.product_id);
      if (!product) continue;
      const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
      total += Number(product.price) * qty;
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: product.name,
            images: product.image_url ? [product.image_url] : [],
          },
          unit_amount: Math.round(Number(product.price) * 100),
        },
        quantity: qty,
      });
    }

    if (!lineItems.length) {
      return res.status(400).json({ error: 'No valid products in cart' });
    }

    const orderRes = await pool.query(
      'INSERT INTO orders (user_id, total, status) VALUES ($1, $2, $3) RETURNING id',
      [req.user?.id || null, total, 'pending']
    );
    const orderId = orderRes.rows[0].id;

    for (const item of items) {
      const product = products.find((p) => p.id === item.product_id);
      if (!product) continue;
      const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
      await pool.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
        [orderId, product.id, qty, product.price]
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
      success_url: `${process.env.CLIENT_URL}/order-success?order_id=${orderId}`,
      cancel_url: `${process.env.CLIENT_URL}/cart`,
      metadata: { order_id: String(orderId) },
    });

    await pool.query('UPDATE orders SET stripe_session_id = $1 WHERE id = $2', [session.id, orderId]);

    res.json({ url: session.url, order_id: orderId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
}

// Stripe webhook - marks order paid. Requires raw body (wired up in server.js).
export async function stripeWebhook(req, res) {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const orderId = session.metadata?.order_id;
    if (orderId) {
      await pool.query('UPDATE orders SET status = $1 WHERE id = $2', ['paid', orderId]);
    }
  }

  res.json({ received: true });
}

export async function getOrder(req, res) {
  try {
    const orderRes = await pool.query('SELECT * FROM orders WHERE id = $1', [req.params.id]);
    if (!orderRes.rows.length) return res.status(404).json({ error: 'Order not found' });
    const itemsRes = await pool.query(
      `SELECT oi.*, p.name, p.image_url FROM order_items oi
       JOIN products p ON p.id = oi.product_id WHERE order_id = $1`,
      [req.params.id]
    );
    res.json({ order: orderRes.rows[0], items: itemsRes.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load order' });
  }
}

export async function listMyOrders(req, res) {
  try {
    const result = await pool.query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load orders' });
  }
}

export async function listAllOrders(req, res) {
  try {
    const result = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load orders' });
  }
}
