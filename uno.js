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
    // Returns an array of n cards, shuffling the discard pile back into the deck if necessary
    if (n > this.deck.length) {
      const topCard = this.discard.pop();
      this.deck = this.deck.concat(this.discard);
      this.shuffle_deck(this.deck);
      this.discard = [topCard];
    }
    const cards = this.deck.splice(this.deck.length - n, this.deck.length);
    return cards;
  },

  play_turn: (socket, turndata) => {
    // Process a turn
    if (socket !== this.players[this.turn].socket) {
      socket.emit('error', 'It is not your turn');
      return;
    }

    switch (turndata.type) {
      case 'card': {
        const cardIndex = this.find_card(turndata.card);
        if (cardIndex === -1) {
          socket.emit('error', "You don't even have that card!");
          return;
        } else if (this.is_playable(turndata.card) === false) {
          socket.emit('error', 'Illegal move');
          return;
        }

        switch (turndata.card.type) {
          case 'Skip':
            this.turn = this.next_turn();
            break;
          case 'Reverse':
            this.direction = -this.direction;
            break;
          case 'Draw Two': {
            const drawCards = this.draw(2);
            this.send_turndata(this.next_turn(), drawCards);
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
        if (this.has_drawn) {
          socket.emit('error', 'Already drawn a card this turn');
          return;
        }
        const drawCard = this.draw_card(socket);
        this.send_turndata(this.turn, [drawCard]);
        return;
      }
      case 'pass':
        break;
      default:
        // wtf
    }

    this.has_drawn = false;
    this.turn = this.next_turn();
    for (let playerID = 0; playerID < this.players.length; playerID += 1) {
      this.send_turndata(playerID, []);
    }
  },

  find_card: (card) => {
    // check if current player has that card
    function findCard(element) {
      return element.color === this.color && element.type === this.type;
    }
    return this.players[this.turn].hand.findIndex(findCard, card);
  },

  draw_card: (socket) => {
    const card = this.draw(1);
    this.players[this.turn].hand.push(card[0]);
    socket.emit('update', {
      turn: this.turn,
      your_turn: this.turn,
      current_card: this.discard[-1],
      draw_cards: card,
    });

    this.has_drawn = true;
  },

  is_playable: (card) => {
    const topCard = this.discard[-1];
    return card.type === topCard.type || card.color === topCard.color || topCard.color === 'black';
  },

  next_turn: () => {
    const next = (this.turn + this.direction) % this.players.length;
    return next;
  },

  send_turndata: (playerID, drawCards) => {
    // Send turn data to this.players[playerID]
    // playerID: index of player in this.players
    // drawCards: array of cards this player has drawn
    const turndata = {
      turn: this.turn,
      your_turn: playerID,
      current_card: this.discard[-1],
      draw_cards: drawCards,
    };
    this.players[playerID].socket.emit('update', turndata);
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

    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });
};
