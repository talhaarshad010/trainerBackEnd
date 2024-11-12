module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("User is connected to Socket ", socket.id);

    socket.on("join_room", (chatId) => {
      socket.join(chatId);
      console.log(`User${socket.id} joined chat room ${chatId}`);
    });

    socket.on("Send_Message", (data) => {
      console.log("Recieved Backend ", data);
      io.to(data.data.chatId).emit("Send_Message", data);
    });

    socket.on("disconnect", () => {
      console.log("User is Disconnected");
    });
  });
};
