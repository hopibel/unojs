function errorMessage(message){
	var messageBox = document.getElementById("error-message");
	messageBox.innerHTML = message;

	setTimeout(function(){
		messageBox.style = "opacity: 1; transform: translate(-50%, -50%) scale(1,1);"
		setTimeout(function(){
			messageBox.style = "opacity: 0; transform: translate(-50%, -50%) scale(1,0);"
		}, 2000);
	}, 1000);
}

function promptMessage(message){
	var messageBox = document.getElementById("prompt-message");
	messageBox.innerHTML = message;

	setTimeout(function(){
		messageBox.style = "opacity: 1; transform: translate(-50%, -50%) scale(1,1);"
		setTimeout(function(){
			messageBox.style = "opacity: 0; transform: translate(-50%, -50%) scale(1,0);"
		}, 2000);
	}, 1000);
}