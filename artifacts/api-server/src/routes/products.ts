import { Router } from 'express';
import { PRODUCTS } from '../productData';

const router = Router();

router.get('/products', (_req, res) => {
  res.json(PRODUCTS);
});

router.get('/products/featured', (_req, res) => {
  const featured = PRODUCTS.filter(p => p.featured);
  res.json(featured);
});

router.get('/products/:id', (req, res): void => {
  const product = PRODUCTS.find(p => p.id === req.params.id || p.slug === req.params.id);
  if (!product) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }
  res.json(product);
});

export default router;
