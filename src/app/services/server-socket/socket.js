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
    
    const isFirstPlayer = players.length === 0;

    socket.emit('firstPlayer', isFirstPlayer);

    const initialCoordinates = {x: 370 + players.length * 30, y: 270};  
    players.push({ id: socket.id, posx: initialCoordinates.x, posy: initialCoordinates.y, velocityx: 0, velocityy: 0, animation: null });
    socket.emit('initialCoordinates', initialCoordinates);

    socket.on('updatePlayers', (data) => {
        const index = players.findIndex(player => player.id === socket.id);
        if (index !== -1) {
            players[index].posx = data.posx;
            players[index].posy = data.posy;
            players[index].velocityx = data.velocityx;
            players[index].velocityy = data.velocityy;
            players[index].animation = data.animation; 
            players[index].key = data.key;

        }
        io.emit('updatePlayers', players); 
    });

    socket.on('goToDesert', () => {
        io.emit('goToDesert');
    });


    socket.on('disconnect', () => {     
    const index = players.findIndex(player => player.id === socket.id);
        if (index !== -1) {
            players.splice(index, 1); 
            io.emit('playerDisconnected', socket.id);
        }
        });
    });

http.listen(2525, () => {
    console.log('Servidor escuchando en el puerto 2525');
});