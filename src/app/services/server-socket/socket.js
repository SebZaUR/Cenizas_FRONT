var players = [];
const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: {
      origin: "http://localhost:4200",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('Un cliente se ha conectado');
    players.push({ id: socket.id, posx: 400, posy: 300,velocityx: 0, velocityy: 0 , animation: null });

    socket.on('updatePlayers', (data) => {
        const index = players.findIndex(player => player.id === socket.id);
        if (index !== -1) {
            players[index].velocityx = data.velocityx;
            players[index].velocityy = data.velocityy;
            players[index].animation = data.animation; 
        }
        io.emit('updatePlayers', players); 
    });

    socket.on('disconnect', () => {        
        const index = players.findIndex(player => player.id === socket.id);
        if (index !== -1) {
            players.splice(index, 1); 
            io.emit('updatePlayers', players);
        }
    });
});

http.listen(2525, () => {
    console.log('Servidor escuchando en el puerto 2525');
});