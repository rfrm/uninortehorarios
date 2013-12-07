function messageHandler(event) {
	var xmlhttp=new XMLHttpRequest();
	xmlhttp.onreadystatechange=function(){
		if (xmlhttp.readyState==4 && xmlhttp.status==200){
			this.postMessage(xmlhttp.responseText);
	    }
    }
    xmlhttp.open("GET", "http://www.uninorte.edu.co/web/matriculas/horarios", true);
	xmlhttp.send();
}

// Declara la function de callback que se ejecutará cuando la página principal nos haga una llamada
this.addEventListener('message', messageHandler, false);
