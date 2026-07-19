
//board
let board;
let boardWidth = 960;
let boardHeight = 800;
let context;

//Cipriano
let ciprianoWidth = 64; //width/height ratio = 408/228 = 17/12
let ciprianoHeight = 45;
let ciprianoX = boardWidth/8;
let ciprianoY = boardHeight/2;
let ciprianoImg;

let cipriano = {
    x : ciprianoX,
    y : ciprianoY,
    width : ciprianoWidth,
    height : ciprianoHeight
}

//estalactitas
let estalactitaArray = [];
let estalactitaWidth = 64; //width/height ratio = 384/3072 = 1/8
let estalactitaHeight = 512;
let estalactitaX = boardWidth;
let estalactitaY = 0;

let estalactita1Img;
let estalactita2Img;

//physics
let velocityX = -2; //velocidad de movimiento de las estalactitas a la izquierda
let velocityY = 0; //cipriano velocidad de salto
let gravity = 0.4;

let gameOver = false;
let score = 0;

window.onload = function() {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d"); //para dibujar en el tablero

    //dibujar Cipriano
    // context.fillStyle = "green";
    // context.fillRect(cipriano.x, cipriano.y, cipriano.width, cipriano.height);

    //load images
    ciprianoImg = new Image();
    ciprianoImg.src = "./cipriano_vuela.png";
    ciprianoImg.onload = function() {
        context.drawImage(ciprianoImg, cipriano.x, cipriano.y, cipriano.width, cipriano.height);
    }

    estalactita1Img = new Image();
    estalactita1Img.src = "./estalactita1.png";

    estalactita2Img = new Image();
    estalactita2Img.src = "./estalactita2.png";

    requestAnimationFrame(update);
    setInterval(placeEstalactitas, 1500); //cada 1.5 seconds
    document.addEventListener("keydown", moveCipriano);
    document.addEventListener("touchstart", moveCipriano);
}

function update() {
    requestAnimationFrame(update);
    if (gameOver) {
        return;
    }
    context.clearRect(0, 0, board.width, board.height);

    //cipriano
    velocityY += gravity;
    // cipriano.y += velocityY;
    cipriano.y = Math.max(cipriano.y + velocityY, 0); //aplicar gravedad a cipriano.y, limitar a cipriano.y el top de canvas
    context.drawImage(ciprianoImg, cipriano.x, cipriano.y, cipriano.width, cipriano.height);

    if (cipriano.y > board.height) {
        gameOver = true;
    }

    //estalactitas
    for (let i = 0; i < estalactitaArray.length; i++) {
        let estalactita = estalactitaArray[i];
        estalactita.x += velocityX;
        context.drawImage(estalactita.img, estalactita.x, estalactita.y, estalactita.width, estalactita.height);

        if (!estalactita.passed && cipriano.x > estalactita.x + estalactita.width) {
            score += 0.5; //0.5 porque hay 2 estalactitas!  0.5*2 = 1, 1 por cada set de estalactitas
            estalactita.passed = true;
        }

        if (detectCollision(cipriano, estalactita)) {
            gameOver = true;
        }
    }

    //limpiar estalactitas
    while (estalactitaArray.length > 0 && estalactitaArray[0].x < -estalactitaWidth) {
        estalactitaArray.shift(); //removes first element from the array
    }

    //score
    context.fillStyle = "skyblue";
    context.font="35px sans-serif";
    context.fillText(score, 5, 45);

    if (gameOver) {
        context.fillText("GAME OVER", 5, 90);
    }
}

function placeEstalactitas() {
    if (gameOver) {
        return;
    }

    //(0-1) * estalactitaHeight/2.
    // 0 -> -128 (estalactitaHeight/4)
    // 1 -> -128 - 256 (estalactitaHeight/4 - estalactitaHeight/2) = -3/4 estalactitaHeight
    let randomEstalactitaY = estalactitaY - estalactitaHeight/4 - Math.random()*(estalactitaHeight/2);
    let openingSpace = board.height/4;

    let estalactita1 = {
        img : estalactita1Img,
        x : estalactitaX,
        y : randomEstalactitaY,
        width : estalactitaWidth,
        height : estalactitaHeight,
        passed : false
    }
    estalactitaArray.push(estalactita1);

    let estalactita2 = {
        img : estalactita2Img,
        x : estalactitaX,
        y : randomEstalactitaY + estalactitaHeight + openingSpace,
        width : estalactitaWidth,
        height : estalactitaHeight,
        passed : false
    }
    estalactitaArray.push(estalactita2);
}


function moveCipriano(e) {
    if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX" || e.type == "touchstart") {
        
        //salto
        velocityY = -6;

        //reset game
        if (gameOver) {
            cipriano.y = ciprianoY;
            estalactitaArray = [];
            score = 0;
            gameOver = false;
        }
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&   //a's top left corner doesn't reach b's top right corner
           a.x + a.width > b.x &&   //a's top right corner passes b's top left corner
           a.y < b.y + b.height &&  //a's top left corner doesn't reach b's bottom left corner
           a.y + a.height -5 > b.y;    //a's bottom left corner passes b's top left corner
}