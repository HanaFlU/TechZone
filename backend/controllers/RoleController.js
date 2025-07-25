const Role = require('../models/RoleModel');

const RoleController = {
    // Create a new role
    createRole: async (req, res) => {
        if (!req.body) {
            return res.status(400).json({ message: 'Name and permissions are required.' });
        }
        const { name, permissions } = req.body;
        if (!name || !permissions || permissions.length === 0) {
            return res.status(400).json({ message: 'Name and permissions are required.' });
        }
        try {
            const existingRole = await Role.findOne({ name });
            if (existingRole) {
                return res.status(400).json({ message: 'Role already exists.' });
            }
            const newRole = new Role({ name, permissions });
            await newRole.save();
            res.status(201).json({ message: 'Role created successfully.', role: newRole });
        } catch (error) {
            console.error('Error creating role:', error);
            res.status(500).json({ message: 'Server error while creating role.' });
        }
    },
    // Get all roles
    getAllRoles: async (req, res) => {
        try {
            const roles = await Role.find();
            res.status(200).json(roles);
        } catch (error) {
            console.error('Error fetching roles:', error);
            res.status(500).json({ message: 'Server error while fetching roles.' });
        }
    },
    // Get all staff roles
    getAllStaffRoles: async (req, res) => {
        try {
            const roles = await Role.find({
                name: { $ne: "CUS" }
            });
            res.status(200).json(roles);
        } catch (error) {
            console.error('Error fetching staff roles:', error);
            res.status(500).json({ message: 'Server error while fetching staff roles.' });
        }
    },
    // Update a role
    updateRole: async (req, res) => {
        const { id } = req.params;
        if (!req.body) {
            return res.status(400).json({ message: 'Name and permissions are required.' });
        }
        const { name, permissions } = req.body;
        if (!name || !permissions || permissions.length === 0) {
            return res.status(400).json({ message: 'Name and permissions are required.' });
        }
        try {
            const role = await Role.findById(id);
            if (!role) {
                return res.status(404).json({ message: 'Role not found.' });
            }
            role.name = name;
            role.permissions = permissions;
            await role.save();
            res.status(200).json({ message: 'Role updated successfully.', role });
        } catch (error) {
            console.error('Error updating role:', error);
            res.status(500).json({ message: 'Server error while updating role.' });
        }
    }
}


module.exports = RoleController;