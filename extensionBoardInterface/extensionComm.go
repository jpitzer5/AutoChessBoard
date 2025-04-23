package main

import (
	"bufio"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"

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
	playing := false
	myMove := false
	for {
		// Read message from the client
		msg, err := readMessage(conn)
		if err != nil {
			fmt.Println("Error reading message:", err)
			break
		}

		// receive game start message if we're not already playing, else just receive move
		if !playing {
			// ensure game start message is in the correct format. If not, then just ignore the message
			fmt.Printf("Received: %s\n", msg)
			myColor, numMovesString, found := strings.Cut(msg, ",")
			fmt.Println(myColor, numMovesString, found)
			numMoves, err := strconv.Atoi(strings.TrimSpace(numMovesString))
			fmt.Println(numMoves, err)
			if !found || (myColor != "white" && myColor != "black") || err != nil {
				continue
			}

			playing = true

			// get moves
			for i := 0; i < numMoves; i++ {
				msg, err := readMessage(conn)
				if err != nil {
					fmt.Println("Error reading message:", err)
					break
				}
				fmt.Printf("Received move: %s\n", msg)
			}

			// if its my move then make a move
			if (numMoves%2 == 0 && myColor == "white") || (numMoves%2 == 1 && myColor == "black") {
				myMove = true
				if err := makeMove(conn); err != nil {
					fmt.Println("Error writing message:", err)
					break
				}
			}

		} else {
			fmt.Println("Received move: ", msg)

			if myMove {
				// TODO: check that the move received back from the extension matches the one we just sent to it
				myMove = false
			} else {
				myMove = true
				// make a move
				if err := makeMove(conn); err != nil {
					fmt.Println("Error writing message:", err)
					break
				}
			}
		}
	}
}

func readMessage(conn *websocket.Conn) (string, error) {
	_, rawData, err := conn.ReadMessage()
	if err != nil {
		return "error", err
	}
	msg := string(rawData)
	return msg, err
}

func makeMove(conn *websocket.Conn) error {
	// get user to input move from the terminal
	fmt.Println("input move:")
	reader := bufio.NewReader(os.Stdin)
	line, err := reader.ReadString('\n')
	if err != nil {
		log.Fatal(err)
	}

	// send move over socket
	if err := conn.WriteMessage(websocket.TextMessage, []byte(line)); err != nil {
		return err
	}

	return nil
}

func main() {
	http.HandleFunc("/ws", wsHandler)
	fmt.Println("WebSocket server started on :8080")
	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		fmt.Println("Error starting server:", err)
	}
}
