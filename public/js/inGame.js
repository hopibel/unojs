var pass = document.getElementById("pass-btn");
var draw = document.getElementById("stock-pile");

pass.addEventListener("click", function(){
	socket.emit('move',{
		type:'pass'
	});
});

draw.addEventListener("click", function(){
	socket.emit('move',{
		type:'draw'
	});
});

socket.on('host', (message) => {
	// document.getElementById('sampleText').innerHTML = message;

	var start = document.getElementById("start");
	var waiting = document.getElementById("waiting");

	waiting.children[0].style.display = "none";
	waiting.children[1].innerHTML = "Waiting for you to start the game."
	waiting.style = "transform: scale(1,1)";
	start.style = "display: block; height: 13em; transform: scale(1, 1);";

	// document.getElementById('start').style.display = "inline-block";
});

socket.on('status', (message) => {
	errorMessage(message);

	// document.getElementById('sampleText').innerHTML = message;
})

socket.on('player list', (playerList) => {
	var players = document.getElementById('players');
	players.innerHTML = "";

	for (let i = 0; i < playerList.length; i += 1) {
		var newPlayer = document.createElement("li");
		var playerName = document.createElement("span");

		playerName.innerHTML = playerList[i];
		playerName.className = "name";

		newPlayer.appendChild(playerName);
		players.appendChild(newPlayer);


		// document.getElementById('playerList').innerHTML = document.getElementById('playerList').innerHTML + playerList[i] + '<br>';
		//Update a whole new list of players
	}
});

socket.on('first-turn', (turndata) => {
	var start_menu = document.getElementById("start-menu");
	start_menu.style.top = "-100%";

	checkTurn(turndata.turn, turndata.yourTurn);

	document.getElementById('hand-deck').innerHTML = '';
	for (let i = 0; i < turndata.hand.length; i++) {
		addCard(turndata.hand[i]);
		// console.log(card);
		//Parse the cards to show up
	}

	setCurrentCard(turndata.currentCard);
});

socket.on('illegal move', (card) => {
	addCard(card);
});

socket.on('game over', (winner) => {
	var players = document.getElementById("players").children;
	var output = document.getElementById("game-message").innerHTML = winner.name + " has won the game!";
	players[winner.id].className = "winner";
});

socket.on('update', (turndata) => {
	for(let i = 0; i < turndata.drawCards.length; i++){
		addCard(turndata.drawCards[i]);
	}
	checkTurn(turndata.turn, turndata.yourTurn);
	setCurrentCard(turndata.currentCard);
});

function playCard(type, color){
	console.log("Playing card " + type + " " + color);
	socket.emit('move', {
		type:'card',
		card:{
			type:type,
			color:color,
		}
	});
	arrange_deck("hand-deck");
}

function addCard(card){
	// document.getElementById('cardList').innerHTML = document.getElementById('cardList').innerHTML + card.type + " " + card.color + " - ";
	var newCard = createCard(card.color, card.type);
	addEventListenerToCard(newCard);
	insertToDeck(newCard, "hand-deck");
	arrange_deck("hand-deck");
}

function setCurrentCard(card){
	var current_card = document.getElementById("current-card");
	var newCard = createCard(card.color, card.type);

	// current_card.innerHTML = newCard;
	current_card.innerHTML = "";
	
	insertToDeck(newCard, "current-card");
	// document.getElementById('currentCard').innerHTML = card.type + " " + card.color;
}

function checkTurn(gameTurn, myTurn){
	var players = document.getElementById("players").children;
	for (var i = 0; i < players.length; i++) {
		if(gameTurn == i){
			players[i].className = "active";
		} else {
			players[i].className = "";
		}
	}

	if (gameTurn === myTurn){
		//Display that it's your current turn
		document.getElementById('game-message').innerHTML = "Your turn!";
	}else{
		document.getElementById('game-message').innerHTML = "It's not your turn";
		//Wait for your turn
		//Could make literally everything else unclickable (to avoid errors or some shit)
	}
}

// var handDeck = document.getElementById("hand-deck").children;

// for (var i = 0; i < handDeck.length; i++) {
// 	addEventListenerToCard(handDeck[i]);
// }

function addEventListenerToCard(card){
	console.log("added event listeners to " + card);
	card.addEventListener("click", function(){
		var color = card.getAttribute("data-color");
		var type = card.getAttribute("data-content");
		
		if (document.getElementById("game-message").innerHTML == "Your turn!") {
			this.remove();
		}

		if (type == "Wild") {
			var suitPicker = document.getElementById("change-suit");

			suitPicker.children[0].addEventListener("click", function(){
				playCard(type, "red");
				suitPicker.style.display = "none";
			});
			suitPicker.children[1].addEventListener("click", function(){
				playCard(type, "yellow");
				suitPicker.style.display = "none";
			});
			suitPicker.children[2].addEventListener("click", function(){
				playCard(type, "green");
				suitPicker.style.display = "none";
			});
			suitPicker.children[3].addEventListener("click", function(){
				playCard(type, "blue");
				suitPicker.style.display = "none";
			});

			suitPicker.style.display = "flex";
		} else {
			playCard(type, color);
		}
	});	
}

Element.prototype.remove = function() {
    this.parentElement.removeChild(this);
}
NodeList.prototype.remove = HTMLCollection.prototype.remove = function() {
    for(var i = this.length - 1; i >= 0; i--) {
        if(this[i] && this[i].parentElement) {
            this[i].parentElement.removeChild(this[i]);
        }
    }
}
