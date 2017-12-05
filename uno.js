function Uno(io) {
  this.io = io;
  this.init();
}

Uno.prototype.init = function init() {
  this.players = [];
  this.host = null;
  this.started = false;
  this.turn = 0;
  this.direction = 1;
  this.deck = [];
  this.discard = [];
  this.hasDrawn = false;
};

Uno.prototype.generateDeck = function generateDeck() {
  const colors = ['red', 'yellow', 'green', 'blue'];
  const types = [...Array(10).keys()];
  types.concat(['Skip', 'Reverse', 'Draw Two']);

  const deck = [];
  for (let i = 0; i < colors.length; i += 1) {
    for (let j = 0; j < types.length; j += 1) {
      deck.push({
        color: colors[i],
        type: types[j],
      });
      if (types[j] !== 0) {
        deck.push({
          color: colors[i],
          type: types[j],
        });
      }
    }
  }
  for (let i = 0; i < 4; i += 1) {
    deck.push({
      color: 'black',
      type: 'Wild',
    });
  }
  this.shuffleDeck(deck);
  return deck;
};

Uno.prototype.shuffleDeck = function shuffleDeck(deck) {
  const array = deck;
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
};

Uno.prototype.setHost = function setHost(socket) {
  this.host = socket;
};

Uno.prototype.addPlayer = function addPlayer(socket, name) {
  if (this.started === true) {
    socket.emit('status', 'Game already started');
    return;
  }

  if (this.host === null) {
    this.setHost(socket);
    socket.emit('host', 'You are the host');
  }

  this.players.push({
    socket,
    name,
    hand: [],
  });

  // send player list
  const playerList = [];
  for (let i = 0; i < this.players.length; i += 1) {
    playerList.push(this.players[i].name);
  }
  this.io.sockets.emit('player list', playerList);
};

Uno.prototype.start = function start(socket) {
  if (socket !== this.host) {
    socket.emit('status', 'You are not the host');
  }

  this.deck = this.generateDeck();
  this.started = true;
  this.turn = 0;

  // deal hands
  for (let i = 0; i < this.players.length; i += 1) {
    this.players[i].hand = this.draw(7);
  }

  // play the first card
  this.discard.push(this.deck.pop());

  // send starting state
  for (let i = 0; i < this.players.length; i += 1) {
    const turndata = {
      turn: this.turn,
      yourTurn: i,
      currentCard: this.discard[this.discard.length - 1],
      hand: this.players[i].hand,
    };
    this.players[i].socket.emit('first-turn', turndata);
  }
};

Uno.prototype.draw = function draw(n) {
  // Returns an array of n cards, shuffling the discard pile back into the deck if necessary
  if (n > this.deck.length) {
    const topCard = this.discard.pop();
    this.deck = this.deck.concat(this.discard);
    this.shuffleDeck(this.deck);
    this.discard = [topCard];
  }
  const cards = this.deck.splice(this.deck.length - n, this.deck.length);
  return cards;
};

Uno.prototype.playTurn = function playTurn(socket, turndata) {
  // Process a turn
  if (socket !== this.players[this.turn].socket) {
    socket.emit('status', 'It is not your turn');
    return;
  }

  switch (turndata.type) {
    case 'card': {
      const cardIndex = this.findCard(turndata.card);
      if (cardIndex === -1) {
        socket.emit('status', "You don't even have that card!");
        return;
      } else if (this.isPlayable(turndata.card) === false) {
        socket.emit('illegal move', turndata.card);
        return;
      }

      switch (turndata.card.type) {
        case 'Skip':
          this.turn = this.nextTurn();
          break;
        case 'Reverse':
          this.direction = -this.direction;
          break;
        case 'Draw Two': {
          const drawCards = this.draw(2);
          this.sendTurndata(this.nextTurn(), drawCards);
          break;
        }
        case 'Wild':
          // Client changes this card's color to the new one
          break;
        default:
          // wtf
      }

      this.discard.push(turndata.card);
      this.players[this.turn].hand.splice(cardIndex, 1);
      break;
    }
    case 'draw': {
      if (this.hasDrawn) {
        socket.emit('status', 'Already drawn a card this turn');
        return;
      }
      const drawCard = this.drawCard(socket);
      this.sendTurndata(this.turn, [drawCard]);
      return;
    }
    case 'pass':
      break;
    default:
      // wtf
  }

  this.hasDrawn = false;
  if (this.isWinner()) {
    this.init();
    return;
  }
  this.turn = this.nextTurn();
  for (let playerID = 0; playerID < this.players.length; playerID += 1) {
    this.sendTurndata(playerID, []);
  }
};

Uno.prototype.findCard = function findCard(card) {
  // check if current player has that card
  function matchCard(element) {
    return element.color === this.color && element.type === this.type;
  }
  return this.players[this.turn].hand.findIndex(matchCard, card);
};

Uno.prototype.drawCard = function drawCard(socket) {
  const card = this.draw(1);
  this.players[this.turn].hand.push(card[0]);
  socket.emit('update', {
    turn: this.turn,
    yourTurn: this.turn,
    currentCard: this.discard[this.discard.length - 1],
    drawCards: card,
  });

  this.hasDrawn = true;
};

Uno.prototype.isPlayable = function isPlayable(card) {
  const topCard = this.discard[this.discard.length - 1];
  return card.type === topCard.type || card.type === 'Wild'
    || card.color === topCard.color || topCard.color === 'black';
};

Uno.prototype.nextTurn = function nextTurn() {
  const next = (this.turn + this.direction) % this.players.length;
  return next;
};

Uno.prototype.isWinner = function isWinner() {
  if (this.players[this.turn].hand.length === 0) {
    this.io.sockets.emit('game over', {
      winner: {
        name: this.players[this.turn].name,
        id: this.turn,
      },
    });
    return true;
  }
  return false;
};

Uno.prototype.sendTurndata = function sendTurndata(playerID, cards) {
  // Send turn data to this.players[playerID]
  // playerID: index of player in this.players
  // drawCards: array of cards this player has drawn
  const turndata = {
    turn: this.turn,
    yourTurn: playerID,
    currentCard: this.discard[this.discard.length - 1],
    drawCards: cards,
  };
  this.players[playerID].socket.emit('update', turndata);
};

Uno.prototype.handleDisconnect = function handleDisconnect(socket) {
  const index = this.players.findIndex(function matchSocket(element) {
    return element.socket === this;
  }, socket);
  if (index !== -1) {
    this.players.splice(index, 1);
  }
  if (this.players.length > 0) {
    if (socket === this.host) {
      this.host = this.players[0].socket;
    }
  } else {
    this.init();
  }
};

module.exports = (io) => {
  const game = new Uno(io);
  io.on('connection', (socket) => {
    console.log('User connected');

    socket.on('join', (name) => {
      game.addPlayer(socket, name);
    });

    socket.on('start', () => {
      game.start(socket);
    });

    socket.on('move', (turndata) => {
      game.playTurn(socket, turndata);
    });

    socket.on('disconnect', () => {
      game.handleDisconnect(socket);
      console.log('User disconnected');
    });
  });
};
