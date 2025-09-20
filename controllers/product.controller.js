const { dbGet, dbAll, dbRun } = require('../utils/dbproduct');
const asyncWrap = require('../middlewares/asyncWrapper');
const httpStatusText = require('../utils/httpStatusText');
const ValidateProduct = require('../utils/validateProduct');

const getProducts = asyncWrap(async (req, res) => {
  const userId = req.currentUser.id;
  const page = Number(req.body.page) || 1;
  const limit = Number(req.body.limit) || 10;

  if (!ValidateProduct.validatePage(page) || !ValidateProduct.validateLimit(limit)) {
    return res.status(400).json({ status: httpStatusText.FAIL, message: 'Invalid page or limit' });
  }

  const offset = (page - 1) * limit;
  const countResult = await dbGet(`
    SELECT COUNT(*) as total
    FROM user_products
    WHERE user_id = ?
  `, [userId]);

  if (offset >= countResult.total) {
    if (countResult.total === 0) return res.json({ status: httpStatusText.SUCCESS, data: [] });
    return res.status(400).json({ status: httpStatusText.FAIL, message: 'Invalid page number' });
  }

  const rows = await dbAll(`
    SELECT p.*
    FROM products p
    INNER JOIN user_products up ON p.id = up.product_id
    WHERE up.user_id = ?
    LIMIT ? OFFSET ?
  `, [userId, limit, offset]);

  res.json({ status: httpStatusText.SUCCESS, data: rows });
});

const search = asyncWrap(async (req, res) => {
  const userId = req.currentUser.id;
  const { name } = req.body;

  if (!ValidateProduct.validateName(name)) {
    return res.status(400).json({ status: httpStatusText.FAIL, message: 'Invalid product name' });
  }

  const product = await dbGet(`
    SELECT p.*
    FROM products p
    INNER JOIN user_products up ON p.id = up.product_id
    WHERE up.user_id=? AND p.name=?
  `, [userId, name]);

  if (!product) return res.status(404).json({ status: httpStatusText.FAIL, message: 'Product not found' });

  res.json({ status: httpStatusText.SUCCESS, data: product });
});

const add = asyncWrap(async (req, res) => {
  const userId = req.currentUser.id;
  const { name, price, amount } = req.body;

  if (!ValidateProduct.validateName(name) || !ValidateProduct.validatePrice(price) || !ValidateProduct.validateAmount(amount)) {
    return res.status(400).json({ status: httpStatusText.FAIL, message: 'Invalid product data' });
  }

  let product = await dbGet('SELECT * FROM products WHERE name=?', [name]);

  if (!product) {
    const result = await dbRun('INSERT INTO products (name, price, amount) VALUES (?, ?, ?)', [name, price, amount]);
    product = { id: result.lastID, name, price, amount };
  }

  await dbRun('INSERT OR IGNORE INTO user_products (user_id, product_id) VALUES (?, ?)', [userId, product.id]);

  res.json({ status: httpStatusText.SUCCESS, data: price });
});

const delet = asyncWrap(async (req, res) => {
  const userId = req.currentUser.id;
  const { name } = req.body;

  if (!ValidateProduct.validateName(name)) {
    return res.status(400).json({ status: httpStatusText.FAIL, message: 'Invalid product name' });
  }

  const product = await dbGet('SELECT id FROM products WHERE name=?', [name]);
  if (!product) return res.status(404).json({ status: httpStatusText.FAIL, message: 'Product not found' });

  const result = await dbRun('DELETE FROM user_products WHERE user_id=? AND product_id=?', [userId, product.id]);

  res.json({ status: httpStatusText.SUCCESS, data: { changes: result.changes } });
});

const updatePrice = asyncWrap(async (req, res) => {
  const userId = req.currentUser.id;
  const { name, price } = req.body;

  if (!ValidateProduct.validateName(name) || !ValidateProduct.validatePrice(price)) {
    return res.status(400).json({ status: httpStatusText.FAIL, message: 'Invalid data' });
  }

  const product = await dbGet(`
    SELECT p.* 
    FROM products p
    INNER JOIN user_products up ON p.id = up.product_id
    WHERE up.user_id=? AND p.name=?
  `, [userId, name]);

  if (!product) return res.status(404).json({ status: httpStatusText.FAIL, message: 'Product not found' });

  await dbRun('UPDATE products SET price=? WHERE id=?', [price, product.id]);

  res.json({ status: httpStatusText.SUCCESS, data: { price } });
});

const addAmount = asyncWrap(async (req, res) => {
  const userId = req.currentUser.id;
  const { name, amount } = req.body;

  const product = await dbGet(`
    SELECT p.* 
    FROM products p
    INNER JOIN user_products up ON p.id = up.product_id
    WHERE up.user_id=? AND p.name=?
  `, [userId, name]);

  if (!product) return res.status(404).json({ status: httpStatusText.FAIL, message: 'Product not found' });

  const newAmount = product.amount + Number(amount);
  await dbRun('UPDATE products SET amount=? WHERE id=?', [newAmount, product.id]);

  res.json({ status: httpStatusText.SUCCESS, data: {  amount: newAmount } });
});

const removeAmount = asyncWrap(async (req, res) => {
  const userId = req.currentUser.id;
  const { name, amount } = req.body;

  const product = await dbGet(`
    SELECT p.* 
    FROM products p
    INNER JOIN user_products up ON p.id = up.product_id
    WHERE up.user_id=? AND p.name=?
  `, [userId, name]);

  if (!product) return res.status(404).json({ status: httpStatusText.FAIL, message: 'Product not found' });

  if (product.amount < Number(amount)) {
    return res.status(400).json({ status: httpStatusText.FAIL, message: 'Not enough product amount' });
  }

  const newAmount = product.amount - Number(amount);
  await dbRun('UPDATE products SET amount=? WHERE id=?', [newAmount, product.id]);

  res.json({ status: httpStatusText.SUCCESS, data: { amount: newAmount } });
});

module.exports = {
  getProducts,
  search,
  add,
  delet,
  updatePrice,
  addAmount,
  removeAmount
};
