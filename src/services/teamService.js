const Team = require('../models/Team');
const fs = require('fs/promises');
const path = require('path');

module.exports = {
  async create(name, position, imagePath, bio = '') {
    if (!name || !position || !imagePath) {
      throw new Error('Name, position, and imagePath are required.');
    }

    return await Team.create(name, position, imagePath, bio);
  },

  async getAll() {
    return await Team.getAll();
  },

  async getById(id) {
    return await Team.getById(id);
  },

  async update(id, { name, position, imagePath, bio = '' }) {
    if (!name || !position || !imagePath) {
      throw new Error('Name, position, and imagePath are required for update.');
    }

    return await Team.update(id, {
      name,
      position,
      image_path: imagePath,
      bio
    });
  },

  async delete(id) {
    const member = await Team.getById(id);
    const success = await Team.delete(id);

    if (success && member?.image_path) {
      try {
        await fs.unlink(path.join('uploads', 'team', member.image_path));
      } catch (err) {
        console.error('Failed to delete image:', err.message);
      }
    }

    return success;
  }
};