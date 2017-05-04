module.exports = function(io) {

  io.sockets.on('connection', function(socket) {

    console.log('User connected to API!');

    socket.on('disconnect', function() {
      console.log('User disconnected from API!');
    });

    socket.emit('join', 'Welcome to API!');

    socket.on('join', function(data) {

      const client_id = data.client_id;
      console.log('Client id ' + client_id);

      socket.join(client_id);
      socket.emit('joined', "You are connected to the API!");

    });
  });
};
