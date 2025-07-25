const Product = require('../models/ProductModel.js');
const Cart = require('../models/CartModel.js');
const Customer = require('../models/CustomerModel.js');

const productPopulate = {
  path: 'items.product',
  model: 'Product',
  select: 'name price images stock productId',
};

async function getCustomer(userId) {
  return Customer.findOne({ user: userId });
}
async function getCartByCustomer(customerId) {
  return Cart.findOne({ customer: customerId }).populate(productPopulate);
}

const CartController = {
  findAll: async (req, res) => {
    try {
      res.status(200).json(await Cart.find());
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  getCartByUserId: async (req, res) => {
    try {
      const customer = await getCustomer(req.params.userId);
      if (!customer) return res.status(404).json({ message: 'Không tìm thấy customer qua userId.' });
      const cart = await getCartByCustomer(customer._id);
      res.status(200).json(cart || { customer: customer._id, items: [] });
    } catch (error) {
      res.status(500).json({ message: 'Server Error', error: error.message });
    }
  },

  addToCart: async (req, res) => {
    try {
      const { userId } = req.params, { productId, quantity } = req.body;
      if (!productId || !quantity) return res.status(400).json({ success: false, message: 'Thiếu thông tin: productId, hoặc quantity.' });
      const customer = await getCustomer(userId);
      if (!customer) return res.status(404).json({ success: false, message: 'Không tìm thấy customer.' });
      const product = await Product.findById(productId);
      if (!product) return res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại.' });
      if (product.stock < quantity) return res.status(400).json({ success: false, message: 'Số lượng sản phẩm trong kho không đủ.' });
      let cart = await Cart.findOne({ customer: customer._id });
      if (!cart) cart = new Cart({ customer: customer._id, items: [] });
      const item = cart.items.find(i => i.product.toString() === productId);
      if (item) {
        const newQuantity = item.quantity + quantity;
        if (product.stock < newQuantity) return res.status(400).json({ success: false, message: 'Số lượng thêm vào vượt quá số lượng trong kho.' });
        item.quantity = newQuantity;
      } else {
        cart.items.push({ product: productId, quantity });
      }
      await cart.save();
      await cart.populate(productPopulate);
      res.status(200).json({ success: true, message: 'Sản phẩm đã được thêm vào giỏ hàng!', cart });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
  },

  updateCartItemQuantity: async (req, res) => {
    try {
      const { cartId } = req.params, { productId, quantity } = req.body;
      if (!productId || typeof quantity !== 'number' || quantity < 1) return res.status(400).json({ success: false, message: 'Thiếu thông tin: productId, hoặc số lượng không hợp lệ.' });
      const product = await Product.findById(productId);
      if (!product) return res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại.' });
      if (product.stock < quantity) return res.status(400).json({ success: false, message: 'Số lượng cập nhật vượt quá số lượng trong kho.' });
      const cart = await Cart.findById(cartId);
      if (!cart) return res.status(404).json({ success: false, message: 'Giỏ hàng không tồn tại.' });
      const item = cart.items.find(i => i.product.toString() === productId);
      if (!item) return res.status(404).json({ success: false, message: 'Sản phẩm không tìm thấy trong giỏ hàng.' });
      item.quantity = quantity;
      await cart.save();
      await cart.populate(productPopulate);
      res.status(200).json({ success: true, message: 'Cập nhật số lượng sản phẩm thành công!', cart });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
  },

  removeCartItem: async (req, res) => {
    try {
      const { cartId, productId } = req.params;
      const cart = await Cart.findById(cartId);
      if (!cart) return res.status(404).json({ success: false, message: 'Giỏ hàng không tồn tại.' });
      const before = cart.items.length;
      cart.items = cart.items.filter(i => i.product.toString() !== productId);
      if (cart.items.length === before) return res.status(404).json({ success: false, message: 'Sản phẩm không tìm thấy trong giỏ hàng để xóa.' });
      await cart.save();
      await cart.populate(productPopulate);
      res.status(200).json({ success: true, message: 'Sản phẩm đã được xóa khỏi giỏ hàng!', cart });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
  },

  clearCart: async (req, res) => {
    try {
      const { cartId } = req.params;
      const cart = await Cart.findById(cartId);
      if (!cart) return res.status(404).json({ success: false, message: 'Giỏ hàng không tồn tại.' });
      cart.items = [];
      await cart.save();
      res.status(200).json({ success: true, message: 'Giỏ hàng đã được làm trống!', cart });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
  },

  transferGuestCartToUser: async (req, res) => {
    try {
      const { userId } = req.params, { guestCartItems } = req.body;
      if (!userId || !guestCartItems || !guestCartItems.length) return res.status(400).json({ success: false, message: 'Invalid parameters for cart transfer', warnings: [], cartData: null });
      const customer = await getCustomer(userId);
      if (!customer) return res.status(404).json({ success: false, message: 'Không tìm thấy customer.' });
      let userCartData = await getCartByCustomer(customer._id);
      let currentUserCart = userCartData?.items || [];
      const stockWarnings = [];
      for (const guestItem of guestCartItems) {
        const product = await Product.findById(guestItem.productId);
        if (!product) continue;
        const existingItem = currentUserCart.find(i => i.product._id.toString() === guestItem.productId);
        const existingQuantity = existingItem ? existingItem.quantity : 0;
        const guestQuantity = guestItem.quantity || 0;
        const productStock = product.stock || 0;
        const maxCanAdd = Math.max(0, productStock - existingQuantity);
        const actualQuantityToAdd = Math.min(guestQuantity, maxCanAdd);
        if (actualQuantityToAdd > 0) {
          if (existingItem && userCartData?._id) {
            const newTotalQuantity = existingQuantity + actualQuantityToAdd;
            await Cart.updateOne({ _id: userCartData._id, 'items.product': guestItem.productId }, { $set: { 'items.$.quantity': newTotalQuantity } });
            existingItem.quantity = newTotalQuantity;
          } else if (userCartData) {
            await Cart.updateOne({ _id: userCartData._id }, { $push: { items: { product: guestItem.productId, quantity: actualQuantityToAdd } } });
          } else {
            await Cart.create({ customer: customer._id, items: [{ product: guestItem.productId, quantity: actualQuantityToAdd }] });
          }
          currentUserCart.push({ product, quantity: actualQuantityToAdd });
        }
        if (actualQuantityToAdd < guestQuantity || actualQuantityToAdd === 0) {
          const msg = actualQuantityToAdd === 0 ? `Sản phẩm "${product.name}" không thể thêm do giới hạn tồn kho (${productStock})` : `Sản phẩm "${product.name}" chỉ có thể thêm ${actualQuantityToAdd}/${guestQuantity} do giới hạn tồn kho (${productStock})`;
          stockWarnings.push(msg);
        }
      }
      const updatedCartData = await getCartByCustomer(customer._id);
      res.status(200).json({ success: true, message: 'Đã chuyển sản phẩm từ giỏ hàng tạm thời vào tài khoản!', warnings: stockWarnings, cartData: updatedCartData });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Không thể chuyển sản phẩm vào tài khoản!', warnings: [], cartData: null });
    }
  }
};

module.exports = CartController;