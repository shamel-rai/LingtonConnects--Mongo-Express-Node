// services/socketServices.js
let io;

module.exports = {
    initSocket: function (server) {
        const socketIo = require("socket.io");
        io = socketIo(server, {
            cors: { origin: "*" }, // adjust for production
        });

        io.on("connection", (socket) => {
            console.log("New client connected:", socket.id);

            // Join conversation room
            socket.on("joinConversation", (conversationId) => {
                socket.join(conversationId);
                console.log(`Socket ${socket.id} joined conversation ${conversationId}`);
            });

            // Optionally handle 'leaveConversation'
            socket.on("leaveConversation", (conversationId) => {
                socket.leave(conversationId);
                console.log(`Socket ${socket.id} left conversation ${conversationId}`);
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

    // Emit to a specific conversation room
    emitNewMessage: function (conversationId, message) {
        if (io) {
            io.to(conversationId).emit("newMessage", message);
        }
    },
};
