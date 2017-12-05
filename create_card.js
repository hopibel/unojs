window.onload = function(){
	console.log("finished loading");

	// errorMessage("hello");
	promptMessage("hello");

	var hand = "hand-deck";
	var discard = "discard-pile";
	var current = "current-card";
	var stock = "stock-pile";

	// var start = document.getElementById("start");
	// var join = document.getElementById("join");
	// var start_menu = document.getElementById("start-menu");

	// start.addEventListener("click", function(){
	// 	start_menu.style.top = "-100%";
	// });

	// join.addEventListener("click", function(){
	// 	start_menu.style.top = "-100%";
	// });

	var newCard = createCard("black", "wild");
	insertToDeck(newCard, hand);
	newCard = createCard("yellow", "four");
	insertToDeck(newCard, hand);
	newCard = createCard("green", "draw-two");
	insertToDeck(newCard, hand);
	newCard = createCard("blue", "zero");
	insertToDeck(newCard, hand);
	newCard = createCard("red", "reverse");
	insertToDeck(newCard, hand);

	newCard = createCard("black", "down");
	insertToDeck(newCard, stock);
	newCard = createCard("black", "down");
	insertToDeck(newCard, stock);
	newCard = createCard("black", "down");
	insertToDeck(newCard, stock);
	newCard = createCard("black", "down");
	insertToDeck(newCard, stock);
	

	newCard = createCard("black", "down");
	insertToDeck(newCard, discard);
	newCard = createCard("black", "down");
	insertToDeck(newCard, discard);
	newCard = createCard("black", "down");
	insertToDeck(newCard, discard);
	newCard = createCard("black", "down");
	insertToDeck(newCard, discard);

	newCard = createCard("black", "wild");
	insertToDeck(newCard, current);

	arrange_deck(hand);
	arrange_stock_pile();
	arrange_discard_pile();
}

function arrange_deck(deck){
	var cards = document.querySelectorAll("#" + deck + " > .card");
	var current_no_cards = cards.length;
	var margin = (100/current_no_cards);

	for (var i = 0; i < cards.length; i++) {
		cards[i].style.left = margin * i + "%";
	}
}

function arrange_stock_pile(){
	var cards = document.querySelectorAll("#stock-pile > .card");

	for (var i = 0; i < cards.length; i++) {
		cards[i].style.left = i * 0.2 + "em";
	}	
}

function arrange_discard_pile(){
	var cards = document.querySelectorAll("#discard-pile > .card");

	for (var i = 0; i < cards.length; i++) {
		cards[i].style.right = i * 0.2 + "em";
	}	
}

function insertToDeck(card, deck){
	var targetDeck = document.getElementById(deck);
	targetDeck.appendChild(card);
}

function createCard(color, content){
	var newCard = document.createElement("div");
	var attColor = document.createAttribute("data-color");
	var attContent = document.createAttribute("data-content");
	attColor.value = color;
	attContent.value = content;
	newCard.setAttributeNode(attColor);
	newCard.setAttributeNode(attContent);
	newCard.className = "card " + color;

	if (color == "red") 		{ var text_color = "#EF5350"; }
	else if (color == "yellow") { var text_color = "#FFEE58"; }
	else if (color == "green")  { var text_color = "#8dcf42"; }
	else if (color == "blue")   { var text_color = "#42A5F5"; }
	else if (color == "black")  { var text_color = "#222222"; }

	if (content != "wild" && content != "skip" && content != "reverse" && content != "draw-two" && content != "wild-four" && content != "down") {
		if (content == "zero") 		 { content = "0"; }
		else if (content == "one") 	 { content = "1"; }
		else if (content == "two") 	 { content = "2"; }
		else if (content == "three") { content = "3"; }
		else if (content == "four")  { content = "4"; }
		else if (content == "five")  { content = "5"; }
		else if (content == "six") 	 { content = "6"; }
		else if (content == "seven") { content = "7"; }
		else if (content == "eight") { content = "8"; }
		else if (content == "nine")  { content = "9"; }

		var center_text = document.createTextNode(content);
		var top_text 	= document.createTextNode(content);
		var bottom_text = document.createTextNode(content);

	} else if (content == "skip" || content == "reverse") {
		if (content == "skip") { var content = "block"; } 
		else { var content = "compare_arrows"; }

		var icon_one   = document.createElement("i");
		var icon_two   = document.createElement("i");
		var icon_three = document.createElement("i");

		icon_one.className 	 = "material-icons";
		icon_two.className 	 = "material-icons";
		icon_three.className = "material-icons";
		icon_one.innerHTML 	 = content;
		icon_two.innerHTML 	 = content;
		icon_three.innerHTML = content;
		
		var top_text 	= icon_one;
		var bottom_text = icon_two;
		var center_text = icon_three;

	} else if (content == "draw-two") { 
		content = "+2"; 

		var two_cards = document.createElement("div");
		var card = document.createElement("div");

		card.className = color;
		two_cards.appendChild(card);
		card = document.createElement("div");

		card.className = color;
		two_cards.appendChild(card);
		card = document.createElement("div");

		var center_text = two_cards;
		var top_text 	= document.createTextNode(content);
		var bottom_text = document.createTextNode(content);

	} else if (content == "wild-four") { 
		content = "+4"; 

		var four_cards = document.createElement("div");
		var card = document.createElement("div");

		card.className = "red";
		four_cards.appendChild(card);
		card = document.createElement("div");

		card.className = "yellow";
		four_cards.appendChild(card);
		card = document.createElement("div");

		card.className = "green";
		four_cards.appendChild(card);
		card = document.createElement("div");

		card.className = "blue";
		four_cards.appendChild(card);

		var center_text = four_cards;

		var top_text = document.createTextNode(content);
		var bottom_text = document.createTextNode(content);

	} else if (content == "wild") {
		var quad_one   = document.createElement("i"); 
		var quad_two   = document.createElement("i"); 
		var quad_three = document.createElement("i"); 
		quad_one.className 	 = "quad";
		quad_two.className 	 = "quad";
		quad_three.className = "quad";
		var top_text 	= quad_one;
		var bottom_text = quad_two;
		var center_text = quad_three;

	} else {
		content = "UNO";
		var center_text = document.createTextNode(content);
		var top_text 	= document.createTextNode(content);
		var bottom_text = document.createTextNode(content);
	}

	var symbol = document.createElement("span");
	symbol.appendChild(top_text);
	symbol.className = "top type";
	newCard.appendChild(symbol);
	
	symbol = document.createElement("span");
	symbol.appendChild(bottom_text);
	symbol.className = "bottom type";
	newCard.appendChild(symbol);

	symbol = document.createElement("span");
	symbol.appendChild(center_text);
	symbol.style.color = text_color;
	symbol.className = "center type";
	newCard.appendChild(symbol);

	return newCard;
}