import User from '../models/User.js';
import bcrypt from 'bcrypt';

export const deleteUser = async (req, res) => {
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