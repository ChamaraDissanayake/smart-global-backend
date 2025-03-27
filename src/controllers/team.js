import teamService from '../services/teamService.js';

export const createTeamMember = async (req, res) => {
    try {
        const { name, position } = req.body;
        const image = req.file;

        // Validate all required fields
        if (!name || !position || !image) {
            return res.status(400).json({
                error: 'Name, position, and image are all required'
            });
        }

        const memberId = await teamService.createTeamMember({
            name,
            position,
            image
        });

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

export const getTeamMembers = async (req, res) => {
    try {
        const members = await teamService.getAllTeamMembers();
        res.json(members);
    } catch (err) {
        res.status(500).json({
            error: 'Failed to fetch team members',
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

export const getTeamMember = async (req, res) => {
    try {
        const member = await teamService.getTeamMember(req.params.id);
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

export const updateTeamMember = async (req, res) => {
    try {
        const { name, position } = req.body;
        const image = req.file;

        // Validate all required fields
        if (!name || !position) {
            return res.status(400).json({
                error: 'Name and position are required'
            });
        }

        const updated = await teamService.updateTeamMember(req.params.id, {
            name,
            position,
            image
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

export const deleteTeamMember = async (req, res) => {
    try {
        const deleted = await teamService.deleteTeamMember(req.params.id);
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