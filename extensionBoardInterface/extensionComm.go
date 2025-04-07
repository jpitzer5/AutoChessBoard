package main

import (
	"bufio"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/gorilla/websocket"
)

// Upgrader is used to upgrade HTTP connections to WebSocket connections.
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func wsHandler(w http.ResponseWriter, r *http.Request) {
	// Upgrade the HTTP connection to a WebSocket connection
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Println("Error upgrading:", err)
		return
	}
	defer conn.Close()
	// Listen for incoming messages
	for {
		// Read message from the client
		_, rawData, err := conn.ReadMessage()
		if err != nil {
			fmt.Println("Error reading message:", err)
			break
		}
		msg := string(rawData)
		fmt.Printf("Received: %s\n", msg)
		// confirm connection
		if msg == "connecting" {
			if err := conn.WriteMessage(websocket.TextMessage, []byte("connection confirmed")); err != nil {
				fmt.Println("Error writing message:", err)
				break
			}
			fmt.Println("Established websocket connection to chess.com extension")
		} else {
			// get user to input move from terminal
			fmt.Println("Received move: ", msg)
			fmt.Println("input move:")
			reader := bufio.NewReader(os.Stdin)
			line, err := reader.ReadString('\n')
			if err != nil {
				log.Fatal(err)
			}

			if err := conn.WriteMessage(websocket.TextMessage, []byte(line)); err != nil {
				fmt.Println("Error writing message:", err)
				break
			}
			fmt.Println("Established websocket connection to chess.com extension")
		}
	}
}

func main() {
	http.HandleFunc("/ws", wsHandler)
	fmt.Println("WebSocket server started on :8080")
	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		fmt.Println("Error starting server:", err)
	}
}
