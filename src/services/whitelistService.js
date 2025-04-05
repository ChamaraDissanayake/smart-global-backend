const Whitelist = require('../models/Whitelist');

const addEmail = async (email) => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error('Invalid email format');
    }

    await Whitelist.addEmail(email);
};

const getEmails = async () => {
    return await Whitelist.getAllEmails();
};

const getPendingEmails = async () => {
    return await Whitelist.getAllPendingEmails();
};

const removeEmail = async (email) => {
    return await Whitelist.removeEmail(email);
};

module.exports = {
    addEmail,
    getEmails,
    removeEmail,
    getPendingEmails
};