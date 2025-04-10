// // // services/socketServices.js
// // let io;

// // module.exports = {
// //     initSocket: function (server) {
// //         const socketIo = require("socket.io");
// //         io = socketIo(server, {
// //             cors: { origin: "*" }, // adjust for production
// //         });

// //         io.on("connection", (socket) => {
// //             console.log("New client connected:", socket.id);

// //             // Join conversation room
// //             socket.on("joinConversation", (conversationId) => {
// //                 socket.join(conversationId);
// //                 console.log(`Socket ${socket.id} joined conversation ${conversationId}`);
// //             });

// //             // Optionally handle 'leaveConversation'
// //             socket.on("leaveConversation", (conversationId) => {
// //                 socket.leave(conversationId);
// //                 console.log(`Socket ${socket.id} left conversation ${conversationId}`);
// //             });

// //             socket.on("disconnect", () => {
// //                 console.log("Client disconnected:", socket.id);
// //             });
// //         });
// //     },

// //     getIo: function () {
// //         if (!io) {
// //             throw new Error("Socket.io not initialized");
// //         }
// //         return io;
// //     },

// //     // Emit to a specific conversation room
// //     emitNewMessage: function (conversationId, message) {
// //         if (io) {
// //             io.to(conversationId).emit("newMessage", message);
// //         }
// //     },
// // };

// // services/socketServices.js

// let io;

// module.exports = {
//     initSocket: function (server) {
//         const socketIo = require("socket.io");
//         io = socketIo(server, {
//             cors: { origin: "*" }, // for production, set your domain
//         });

//         io.on("connection", (socket) => {
//             console.log("New client connected:", socket.id);

//             // =====================
//             // (1) Messaging rooms
//             // =====================
//             socket.on("joinConversation", (conversationId) => {
//                 socket.join(conversationId);
//                 console.log(`Socket ${socket.id} joined conversation ${conversationId}`);
//             });

//             socket.on("leaveConversation", (conversationId) => {
//                 socket.leave(conversationId);
//                 console.log(`Socket ${socket.id} left conversation ${conversationId}`);
//             });

//             // =====================
//             // (2) Notification rooms
//             // =====================
//             socket.on("joinNotifications", (userId) => {
//                 socket.join(userId);
//                 console.log(`Socket ${socket.id} joined notifications for user ${userId}`);
//             });

//             socket.on("leaveNotifications", (userId) => {
//                 socket.leave(userId);
//                 console.log(`Socket ${socket.id} left notifications for user ${userId}`);
//             });

//             socket.on("disconnect", () => {
//                 console.log("Client disconnected:", socket.id);
//             });
//         });
//     },

//     getIo: function () {
//         if (!io) {
//             throw new Error("Socket.io not initialized");
//         }
//         return io;
//     },

//     // ==============
//     // Messaging
//     // ==============
//     emitNewMessage: function (conversationId, message) {
//         if (io) {
//             io.to(conversationId).emit("newMessage", message);
//         }
//     },

//     // ==============
//     // Notifications
//     // ==============
//     emitNotification: function (userId, notification) {
//         if (io) {
//             // broadcast to the user's room
//             io.to(userId).emit("newNotification", notification);
//             console.log(`Emitted newNotification to user ${userId}`);
//         }
//     },
// };


// services/socketServices.js

let io;

module.exports = {
    initSocket: function (server) {
        const socketIo = require("socket.io");
        io = socketIo(server, {
            cors: { origin: "*" }, // For production, restrict to your domain
        });

        io.on("connection", (socket) => {
            console.log("New client connected:", socket.id);

            // Messaging rooms
            socket.on("joinConversation", (conversationId) => {
                socket.join(conversationId);
                console.log(`Socket ${socket.id} joined conversation ${conversationId}`);
            });
            socket.on("leaveConversation", (conversationId) => {
                socket.leave(conversationId);
                console.log(`Socket ${socket.id} left conversation ${conversationId}`);
            });

            // Notification rooms
            socket.on("joinNotifications", (userId) => {
                socket.join(userId);
                console.log(`Socket ${socket.id} joined notifications for user ${userId}`);
            });
            socket.on("leaveNotifications", (userId) => {
                socket.leave(userId);
                console.log(`Socket ${socket.id} left notifications for user ${userId}`);
            });

            socket.on("disconnect", () => {
                console.log("Client disconnected:", socket.id);
            });
        });
    },

    getIo: function () {
        if (!io) {
            throw new Error("Socket.io not initialized");
        }
        return io;
    },

    // Emitter for messaging: emits a "newMessage" event to a conversation room.
    emitNewMessage: function (conversationId, message) {
        if (io) {
            io.to(conversationId).emit("newMessage", message);
            console.log(`Emitted newMessage to conversation ${conversationId}`);
        }
    },

    // Emitter for notifications: emits a "newNotification" event to a specific user room.
    emitNotification: function (userId, notification) {
        if (io) {
            io.to(userId).emit("newNotification", notification);
            console.log(`Emitted newNotification to user ${userId}`);
        }
    },
};
