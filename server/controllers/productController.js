const JsonStorageService = require('../services/jsonStorageService');

const getProducts = async (req, res) => {
  const products = await JsonStorageService.readData('products');
  res.json(products);
};

const createProduct = async (req, res) => {
  const { name, category, price, originalPrice, stockQty, inStock, description } = req.body;
  const products = await JsonStorageService.readData('products');
  const parsedStock = Number(stockQty) || 0;

  const newProduct = {
    id: `prod-${Date.now()}`,
    name,
    category,
    price: Number(price),
    originalPrice: Number(originalPrice || price),
    stockQty: parsedStock,
    inStock: inStock !== undefined ? Boolean(inStock) : parsedStock > 0,
    description: description || ''
  };

  products.push(newProduct);
  await JsonStorageService.writeData('products', products);
  res.status(201).json(newProduct);
};

const updateProduct = async (req, res) => {
  const { id } = req.params;
  let products = await JsonStorageService.readData('products');
  const index = products.findIndex((p) => p.id === id);

  if (index === -1) return res.status(404).json({ message: 'Product not found' });

  const parsedStock = req.body.stockQty !== undefined ? Number(req.body.stockQty) : products[index].stockQty;

  products[index] = {
    ...products[index],
    ...req.body,
    price: req.body.price !== undefined ? Number(req.body.price) : products[index].price,
    stockQty: parsedStock,
    inStock: req.body.inStock !== undefined ? Boolean(req.body.inStock) : parsedStock > 0
  };

  await JsonStorageService.writeData('products', products);
  res.json(products[index]);
};

const deleteProduct = async (req, res) => {
  const { id } = req.params;
  let products = await JsonStorageService.readData('products');
  products = products.filter((p) => p.id !== id);
  await JsonStorageService.writeData('products', products);
  res.json({ message: 'Product deleted successfully' });
};

module.exports = { getProducts, createProduct, updateProduct, deleteProduct };