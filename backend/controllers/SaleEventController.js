const SaleEvent = require('../models/SaleEventModel');

exports.createSaleEvent = async (req, res) => {
  try {
    if (Array.isArray(req.body)) {
      const events = await SaleEvent.insertMany(req.body);
      res.status(201).json(events);
    } else {
      const event = await SaleEvent.create(req.body);
      res.status(201).json(event);
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getSaleEvents = async (req, res) => {
  try {
    const events = await SaleEvent.find();
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 