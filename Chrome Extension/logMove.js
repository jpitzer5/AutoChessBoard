let socket;
let connected = false;

function handleMove(move) {
    console.log(move)
}

function connect() {
    socket = new WebSocket("ws://localhost:8080/ws");
    socket.onopen = () => {
      console.log("websocket opened");
      socket.send("connecting");
    };
    socket.onmessage = event => {
      msg = event.data;
      if (connected) {
        handleMove(msg)
      }
      else if (msg === "connection confirmed") connected = true;
    };
    socket.onclose = () => {
      console.log("websocket closed");
      // setTimeout(connect, 1000);
    };
    socket.onerror = event => {
      console.log(`Error: ${event}`);
    };
  }

connect();

if (typeof(observer) === "undefined") {
    var observer = new MutationObserver((MutationRecords, MutationObserver) => {
        const rawMove = document.querySelector('.selected').childNodes;
        var move = ""
        // make this a for of/in
        for (var i = 0; i < rawMove.length; i++) {
            if (rawMove[i].nodeType === Node.ELEMENT_NODE && rawMove[i].getAttribute('data-figurine') !== null) {
                move = rawMove[i].getAttribute('data-figurine')
            }
            else if (rawMove[i].nodeType == Node.TEXT_NODE) {
                text = rawMove[i].wholeText
                move = move.concat(text.trim())
                break;
            }
        }
        
        // const move = rawMove.length > 3 ? rawMove[0].getAttribute('data-figurine') + rawMove[2].wholeText : rawMove[0].wholeText;
        console.log(move);
        socket.send(move)
    });
}
observer.observe(document.querySelector('.move-list'), {subtree: true, childList: true});
console.log('observing');