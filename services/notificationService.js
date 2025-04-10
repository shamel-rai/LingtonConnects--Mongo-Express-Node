// services/notificationService.js
const admin = require('./firebaseAdmin');

exports.sendNotifications = async (tokens, title, body) => {
    // Prepare message objects for each token
    const messages = tokens.map(token => ({
        token,
        notification: {
            title: title || 'Default Title',
            body: body || 'Default Body',
        },
    }));

    // admin.messaging().sendAll sends multiple messages in one call
    return await admin.messaging().sendAll(messages);
};

exports.sendPushToToken = async (fcmToken) => {
    try {
        const message = {
            notification: {
                title: 'Hello from your Node server!',
                body: 'FCM-based push notification',
            },
            token: fcmToken,
        };
        const response = await admin.messaging().send(message);
        console.log('Successfully sent message:', response);
        return response;
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
};