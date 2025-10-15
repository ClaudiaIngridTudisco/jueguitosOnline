var playerRed = "R"; //jugador rojo
var playerYellow = "Y"; //jugador amarillo
var currPlayer = playerRed;  // Jugador actual

var gameOver = false;// Bandera para detener el juego si hay ganador
var board; // Matriz que representa el estado del tablero
var currColumns; // Array que indica la fila disponible más baja en cada columna

var rows = 6; // Número de filas del tablero
var columns = 7; // Número de columnas del tablero

// Se ejecuta cuando la página termina de cargar
window.onload = function () {
    setGame();  // Inicializa el tablero


    //Crea el tablero visual y lógico (rellena las fichas del tablero)
    function setGame() {
        board = [];  // Inicializa la matriz del tablero
        currColumns = [5, 5, 5, 5, 5, 5, 5];  // Cada columna empieza con la fila 5 disponible (de abajo hacia arriba)

        for (let r = 0; r < rows; r++) {
            let row = [];
            for (let c = 0; c < columns; c++) {
                //js
                row.push(' '); // Espacio vacío en la matriz

                //HTML
                // Crea el div visual para cada celda
                let tile = document.createElement("div");
                tile.id = r.toString() + "-" + c.toString();  //Ej: 0-0
                tile.classList.add("tile");
                tile.addEventListener("click", setPiece); // Asigna evento de click
                document.getElementById("board").append(tile); // Agrega el div al tablero
            }
            board.push(row);  // Agrega la fila al tablero lógico
        }
    }
}

function setPiece() {
    if (gameOver) {
        return;     // Si el juego terminó, no hace nada
    }
    let coords = this.id.split("-"); //"0-0" => ["0","0"]  Obtiene fila y columna del id del div
    let r = parseInt(coords[0]);
    let c = parseInt(coords[1]);

    r = currColumns[c];   // Obtiene la fila disponible en esa columna
    if (r < 0) {
        return;           // Si la columna está llena, no hace nada
    }

    board[r][c] = currPlayer;    // Actualiza la matriz lógica
    let tile = document.getElementById(r.toString() + "-" + c.toString());
    if (currPlayer == playerRed) {
        tile.classList.add("red-piece");      // Cambia el color visual
        currPlayer = playerYellow;              // Cambia de turno
    }
    else {
        tile.classList.add("yellow-piece");
        currPlayer = playerRed;
    }

    r -= 1;  // Actualiza la fila disponible en esa columna
    currColumns[c] = r;   //actualiza el array

    checkWinner();        // Verifica si hay ganador

}

function checkWinner() {
    //Verifica horizontalmente
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns - 3; c++) {
            if (board[r][c] != ' ') {
                if (board[r][c] == board[r][c + 1] && board[r][c + 1] == board[r][c + 2] && board[r][c + 2] == board[r][c + 3]) {
                    setWinner(r, c);
                    return;
                }
            }
        }
    }
    //Verifica verticalmente
    for (let c = 0; c < columns; c++) {
        for (let r = 0; r < rows - 3; r++) {
            if (board[r][c] != ' ') {
                if (board[r][c] == board[r + 1][c] && board[r + 1][c] == board[r + 2][c] && board[r + 2][c] == board[r + 3][c]) {
                    setWinner(r, c);
                    return;
                }
            }
        }
    }
    //Verifica diagonalmente (de arriba a abajo, izquierda a derecha)
    for (let r = 0; r < rows - 3; r++) {
        for (let c = 0; c < columns - 3; c++) {
            if (board[r][c] != ' ') {
                if (board[r][c] == board[r + 1][c + 1] && 
                    board[r + 1][c + 1] == board[r + 2][c + 2] && 
                    board[r + 2][c + 2] == board[r + 3][c + 3]) {
                    setWinner(r, c);
                    return;
                }
            }
        }
    }


    //verifica diagonalmente (de abajo a arriba, izquierda a derecha)
    for (let r = 3; r < rows; r++) {
        for (let c = 0; c < columns - 3; c++) {
            if (board[r][c] != ' ') {
                if (
                    board[r][c] == board[r - 1][c + 1] &&
                    board[r - 1][c + 1] == board[r - 2][c + 2] &&
                    board[r - 2][c + 2] == board[r - 3][c + 3])
                    {
                    setWinner(r, c);
                    return;
                    }
            }
        }
    
    }
}



function setWinner(r, c) {
  let winner = document.getElementById("winner");
  if (board[r][c] == playerRed) {
    winner.innerText = "🔴 Red Wins!";
  } else {
    winner.innerText = "🟡 Yellow Wins!";
  }
  winner.classList.add("show"); // activa animación del título
  gameOver = true;

  // Confeti animado
  confetti({
    particleCount: 150,
    spread: 70,
    origin: { y: 0.6 }
  });
}

