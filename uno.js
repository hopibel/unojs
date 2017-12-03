const Uno = {
  players: [],
  host: null,
  started: false,
  turn: 0,
  direction: 1,
  deck: [],
  discard: [],
  has_drawn: false,

  generate_deck: () => {
    const colors = ['red', 'yellow', 'green', 'blue'];
    const types = [...Array(10).keys()];
    // types.concat(['Draw two', 'Reverse', 'Skip']);

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
    /*
    for (let i = 0; i < 4; i += 1) {
      deck.push({
        color: 'black',
        type: 'Wild',
      });
    }
    */
    this.shuffle_deck(deck);
    return deck;
  },

  shuffle_deck: (deck) => {
    const array = deck;
    for (let i = array.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
  },

  set_host: (socket) => {
    this.host = socket;
  },

  add_player: (socket, name) => {
    if (this.started === true) {
      socket.emit('error', 'Game already started');
      return;
    }

    if (this.host === null) {
      this.set_host(socket);
    }

    this.players.push({
      socket,
      name,
      hand: [],
    });
  },

  start: (socket) => {
    if (socket !== this.host) {
      socket.emit('error', 'You are not the host');
    }

    this.deck = this.generate_deck();
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
        your_turn: i,
        current_card: this.discard[-1],
        hand: this.players[i].hand,
      };
      this.players[i].socket.emit('first-turn', turndata);
    }
  },

  draw: (n) => {
    const cards = this.deck.splice(this.deck.length - n, this.deck.length);
    return cards;
  },

  play_turn: (socket, turndata) => {
    // TODO: separate validation and card processing
    // use move types: card, draw, pass
    if (socket !== this.players[this.turn].socket) {
      socket.emit('error', 'It is not your turn');
      return;
    }

    const { card } = turndata;
    // check if player has that card
    function findCard(element) {
      return element.color === this.color && element.type === this.type;
    }
    const cardIndex = this.players[this.turn].hand.findIndex(findCard, card);
    if (cardIndex === -1) {
      socket.emit('error', "You don't even have that card, cheater!");
    }

    if (this.is_playable(card)) {
      this.discard.push(card);
      this.players[this.turn].hand.splice(cardIndex, 1);

      this.turn = (this.turn + this.direction) % this.players.length;
      this.send_turndata();
    } else {
      socket.emit('error', 'Illegal move');
    }

    this.has_drawn = false;
  },

  draw_card: (socket) => {
    if (socket !== this.players[this.turn].socket) {
      socket.emit('error', 'It is not your turn');
      return;
    } else if (this.has_drawn) {
      socket.emit('error', 'Already drawn a card this turn');
      return;
    }

    const card = this.draw(1);
    this.players[this.turn].hand.push(card);
    socket.emit('update', {
      turn: this.turn,
      your_turn: this.turn,
      current_card: this.discard[-1],
      draw_cards: [card],
    });

    this.has_drawn = true;
  },

  pass: (socket) => {
    // end turn after drawing and still no playable cards
    if (socket === this.players[this.turn].socket) {
      this.turn = (this.turn + this.direction) % this.players.length;
      this.has_drawn = false;
      this.send_turndata();
    }
  },

  is_playable: (card) => {
    const topCard = this.discard[-1];
    return card.type === topCard.type || card.color === topCard.color;
  },

  send_turndata: () => {
    // TODO: take draw cards as arg for next player
    for (let i = 0; i < this.players.length; i += 1) {
      const turndata = {
        turn: this.turn,
        your_turn: i,
        current_card: this.discard[-1],
        draw_cards: [],
      };
      this.players[i].socket.emit('update', turndata);
    }
  },
};

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected');

    socket.on('join', (name) => {
      Uno.add_player(socket, name);
    });

    socket.on('start', () => {
      Uno.start(socket);
    });

    socket.on('move', (turndata) => {
      Uno.play_turn(socket, turndata);
    });

    socket.on('draw', () => {
      Uno.draw_card(socket);
    });

    socket.on('pass', () => {
      Uno.pass(socket);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });
};
