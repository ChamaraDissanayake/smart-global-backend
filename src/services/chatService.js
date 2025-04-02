const { openai, assistantId } = require('../config/open-ai');
const Chat = require('../models/Chat');

const { getThreadByUserId, createThread, getChatHistory } = Chat;

const processChat = async (userId, userInput) => {
    let threadId = await getThreadByUserId(userId).id;
    if (!threadId) {
        const newThread = await openai.beta.threads.create();
        threadId = newThread.id;
        await createThread(threadId, userId);
    }

    await openai.beta.threads.messages.create(threadId, {
        role: 'user',
        content: userInput,
    });

    const run = await openai.beta.threads.runs.create(threadId, {
        assistant_id: assistantId,
    });

    let runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
    while (runStatus.status !== 'completed') {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
    }

    const messages = await openai.beta.threads.messages.list(threadId, {
        order: 'desc',
        limit: 1
    });
    const botResponse = messages.data.length > 0
        ? messages.data[0].content[0].text.value
        : "I'm not sure how to respond.";

    return botResponse;
};

const getHistory = async (userId, limit, offset) => {
    return await getChatHistory(userId, limit, offset);
};

module.exports = {
    processChat,
    getHistory
};