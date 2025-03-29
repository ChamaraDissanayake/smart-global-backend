const User = require('../models/User');
const bcrypt = require('bcrypt');

const deleteUser = async (req, res) => {
    try {
        const { password } = req.body;
        const user = await User.findById(req.userId);

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        await User.delete(req.userId);
        res.json({ message: 'User account deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    deleteUser
};