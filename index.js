const express = require('express');

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');
require('./uno.js')(io);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/index.html'));
});
app.use(express.static(path.join(__dirname, '/public')));

http.listen(10000, () => {
  console.log('listening on *:10000');
});
