const Address = require('../models/AddressModel');
const Customer = require('../models/CustomerModel');

const CustomerController = {
    findAll: async (req, res) => {
        Customer.find()
            .then((data) => res.status(200).json(data))
            .catch((err) => res.status(500).json(err.message))
    },
    getAddresses: async (req, res) => {
        const { customerId } = req.params;
        try {
            const customer = await Customer.findById(customerId)
                .populate('shippingAddresses'); // <<< POPULATE CÁC ĐỊA CHỈ Ở ĐÂY

            if (!customer) {
                return res.status(404).json({ message: 'Customer not found.' });
            }

            res.status(200).json({ customer });
        } catch (error) {
            console.error('Error fetching customer profile with addresses:', error);
            res.status(500).json({ message: 'Server error while fetching customer profile.', error: error.message });
        }
    },
    addAddress: async (req, res) => {
        const { customerId } = req.params;
        const { fullName, phone, street, city, district, zipcode, isDefault } = req.body;

        try {
            const customer = await Customer.findById(customerId);
            if (!customer) {
                return res.status(404).json({ message: 'Customer not found.' });
            }

            // Tạo một địa chỉ mới và gán customerId
            const newAddress = new Address({
                customer: customerId,
                fullName, phone, street, city, district, zipcode, isDefault
            });
            const savedAddress = await newAddress.save();

            // Thêm ID của địa chỉ mới vào mảng shippingAddresses của customer
            customer.shippingAddresses.push(savedAddress._id);
            await customer.save();

            res.status(201).json({ message: 'Address added successfully!', address: savedAddress });

        } catch (error) {
            console.error('Error adding address to customer:', error);
            res.status(500).json({ message: 'Server error adding address.', error: error.message });
        }
    },
};
module.exports = CustomerController;