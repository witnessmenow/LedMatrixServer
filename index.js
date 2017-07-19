const express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static('public'));

// I need to understand this more - read on https://github.com/onedesign/express-socketio-tutorial
app.use((req, res, next) => {
  res.io = io;
  next();
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/join', (req, res) => {
  console.log(`Client joined: ${req.query.id}`);
  res.sendFile(__dirname + '/public/index.html');
});

http.listen(3070, () => {
  console.log('listening on *:3070');
});

io.on('connection', (socket) => {
  console.log('Got a connection');
  socket.on('create_game', function(roomCode){
    console.log(roomCode)
    if(!roomCode) {
      roomCode = generateRoomCode();
    }
    io.to(socket.id).emit('game_created', roomCode);
    console.log(`session id - create game: ${socket.id}`);
    socket.join(roomCode);
  });

  socket.on('client_voted', (roomCode, data) => {
    if (socket.rooms[roomCode]) {
      io.sockets.in(roomCode).emit('add_to_results', data);
    }
  });

  socket.on('disconnect', () => {
    console.log('client disconnected');
  });
});

var code = 0;

function generateRoomCode(){
  code += 1;
  return code;
}
