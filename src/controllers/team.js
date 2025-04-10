const teamService = require('../services/teamService');

const createTeamMember = async (req, res) => {
    try {
        const { name, position, imagePath, bio } = req.body;

        if (!name || !position || !imagePath) {
            return res.status(400).json({
                error: 'Name, position, and imagePath are required'
            });
        }

        const memberId = await teamService.create(name, position, imagePath, bio);
        res.status(201).json({
            message: 'Team member created successfully',
            memberId
        });
    } catch (err) {
        res.status(500).json({
            error: 'Failed to create team member',
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

const getTeamMembers = async (req, res) => {
    try {
        const members = await teamService.getAll();
        res.json(members);
    } catch (err) {
        res.status(500).json({
            error: 'Failed to fetch team members',
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

const getTeamMember = async (req, res) => {
    try {
        const member = await teamService.getById(req.params.id);
        if (!member) {
            return res.status(404).json({ error: 'Team member not found' });
        }
        res.json(member);
    } catch (err) {
        res.status(500).json({
            error: 'Failed to fetch team member',
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

const updateTeamMember = async (req, res) => {
    try {
        const { name, position, imagePath, bio } = req.body;

        if (!name || !position || !imagePath) {
            return res.status(400).json({
                error: 'Name, position, and imagePath are required'
            });
        }

        const updated = await teamService.update(req.params.id, {
            name,
            position,
            imagePath,
            bio
        });

        if (!updated) {
            return res.status(404).json({ error: 'Team member not found' });
        }

        res.json({ message: 'Team member updated successfully' });
    } catch (err) {
        res.status(500).json({
            error: 'Failed to update team member',
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

const deleteTeamMember = async (req, res) => {
    try {
        const deleted = await teamService.delete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ error: 'Team member not found' });
        }
        res.json({ message: 'Team member deleted successfully' });
    } catch (err) {
        res.status(500).json({
            error: 'Failed to delete team member',
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

module.exports = {
    createTeamMember,
    getTeamMembers,
    getTeamMember,
    updateTeamMember,
    deleteTeamMember
};
