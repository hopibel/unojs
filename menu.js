console.log("finished loading");

// var hand = "hand-deck";
// var discard = "discard-pile";
// var current = "current-card";
// var stock = "stock-pile";

var player_name = document.getElementById("player-name");
var start = document.getElementById("start");
var join = document.getElementById("join");
var start_menu = document.getElementById("start-menu");
var waiting = document.getElementById("waiting");

player_name.addEventListener("blur", function(){
	console.log("Checking if player has set their name...")
	if (player_name.value) {
		console.log("The player has set their name.");
		join.style = "height: 13em; transform: scale(1, 1);";
	} else{
		console.log("The player has not set their name.");
		join.style = "height: 0; transform: scale(1, 0);";
	}
});

join.addEventListener("click", function(){
	player_name.className = "locked";
	player_name.disabled = true;
	start.style = "display: block; height: 13em; transform: scale(1, 1);";
	join.style = "display: none; height: 0; transform: scale(1, 0);";	
	waiting.style = "transform: scale(1,1)";
});

start.addEventListener("click", function(){
	start_menu.style.top = "-100%";
});