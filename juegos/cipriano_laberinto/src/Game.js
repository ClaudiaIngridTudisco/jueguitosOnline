import TileMap from "./TileMap.js";

// 1. CONFIGURACIÓN DEL CANVAS
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const tileSize = 32;
const velocity = 2;

// 2. CONFIGURACIÓN DE AUDIO / SONIDOS
const gameWinSound = new Audio("sounds/ganador.mp3");     // Sonido final del juego
const levelWinSound = new Audio("sounds/ganador.mp3");   // Sonido al pasar de nivel
const gameOverSound = new Audio("sounds/fin.wav");   // Sonido al perder el juego

// 3. ESTADO GLOBAL DEL JUEGO
let tileMap = new TileMap(tileSize);
let cipriano = tileMap.getcipriano(velocity);
let enemigos = tileMap.getEnemigos(velocity);

let gameOver = false;
let gameWin = false;
let cambiandoNivel = false; 

// Configurar el tamaño inicial del canvas según el mapa 1
tileMap.setCanvasSize(canvas);

// 4. BUCLE PRINCIPAL (GAME LOOP)
function gameLoop() {
  // 1. Limpieza absoluta de la pantalla
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 2. Dibujar el escenario de fondo
  tileMap.draw(ctx);
  
  // 3. Calcular estado de pausa (congela movimientos si cambia de nivel o terminó)
  const isPaused = pause() || gameOver || gameWin || cambiandoNivel;
  
  // 4. Dibujar personajes pasándoles el estado de pausa
  cipriano.draw(ctx, isPaused, enemigos);
  enemigos.forEach((enemigo) => enemigo.draw(ctx, isPaused, cipriano));
  
  // 5. Verificaciones de estado del juego
  checkGameOver();
  checkGameWin();

  // 6. RENDERIZADO DEL CARTEL DE TRANSICIÓN (Por encima de todo)
  if (cambiandoNivel) {
    // Fondo oscuro semitransparente
    ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Texto de nivel completado
    ctx.font = "bold 28px Arial";
    ctx.fillStyle = "#27aed6";
    ctx.textAlign = "center";
    ctx.fillText("¡NIVEL COMPLETADO!", canvas.width / 2, canvas.height / 2 - 15);
    
    // Subtexto dinámico leyendo directamente del mapa actual (+1 porque arranca en 0)
    ctx.font = "18px Arial";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(`Preparando Nivel ${tileMap.currentLevel + 1}...`, canvas.width / 2, canvas.height / 2 + 25);
  }

  // 7. Carteles finales (Game Over / Ganaste todo)
  drawGameEnd();
}

// 5. CONTROL DE PASAR DE NIVEL (SISTEMA SEGURO ANTI-BUCLE)
function checkGameWin() {
  // Si ya terminó el juego o está corriendo la animación, no hace nada
  if (gameWin || cambiandoNivel) return;

  if (tileMap.didWin()) {
    cambiandoNivel = true; // Bloqueo instantáneo

    // Calcular el índice del próximo nivel basándonos en el actual
    const proximoNivel = tileMap.currentLevel + 1;
    
    //cargar el siguiente mapa en memoria
    const hayMasNiveles = tileMap.cargarNivel(proximoNivel);

    if (hayMasNiveles) {
      // Reproducir sonido de nivel completado si querés
      if (levelWinSound) levelWinSound.play().catch(() => {});

      // Setear el nuevo tamaño del canvas por si el mapa cambió de dimensiones
      tileMap.setCanvasSize(canvas); 
      
      // Instanciar a los personajes en sus nuevos puntos
      cipriano = tileMap.getcipriano(velocity);
      enemigos = tileMap.getEnemigos(velocity);

      //Congelar los controles de Cipriano para que los enemigos no arranquen
      cipriano.madeFirstMove = false; 
      cipriano.currentMovingDirection = null;
      cipriano.requestedMovingDirection = null;

      //cartel en pantalla durante 2 segundos
      setTimeout(() => {
        cambiandoNivel = false; // Se apaga el cartel y se reanuda la acción
      }, 2000);

    } else {
      // Si cargó nivel y devolvió false, es porque completó el último nivel del juego
      gameWin = true;
      if (gameWinSound) gameWinSound.play().catch(() => {});
      cambiandoNivel = false;
    }
  }
}

// 6. LOGICA DE gameOver
function checkGameOver() {
  if (gameOver) return;

  // Mientras la poción está activa, los murciélagos no matan
  if (cipriano.pocionActive) return;

  const colision = enemigos.some((enemigo) => enemigo.collideWith(cipriano));

  if (colision) {
    gameOver = true;
    gameOverSound.play().catch(() => {});
  }
}

// 7. DETECCIÓN DE PAUSA EXTERNA
function pause() {
  // Retorna true si hay alguna condición del teclado o UI externa que pause el juego voluntariamente
  // Si no hay pausa manual,  puede retornar false
  return false; 
}

// 8. RENDERIZADO DE FIN DE JUEGO (GAME OVER / VICTORIA)
function drawGameEnd() {
  if (gameOver || gameWin) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.textAlign = "center";

    // Título
    ctx.font = "bold 40px Arial";

    if (gameOver) {
      ctx.fillStyle = "#ff8b33";
      ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
    }

    if (gameWin) {
      ctx.fillStyle = "#33f1ff";
      ctx.fillText("¡GANASTE EL JUEGO!", canvas.width / 2, canvas.height / 2);
    }

    // Instrucción
    ctx.font = "bold 15px Arial";
    ctx.fillStyle = "white";

    const mensaje = gameOver
      ? "Presioná ESPACIO o tocá la pantalla para reiniciar"
      : "Presioná ESPACIO o tocá la pantalla para volver a jugar";

    
    ctx.fillText(
      mensaje,
      canvas.width / 2,
      canvas.height / 2 + 50
    );
  }
}

function reiniciarJuego(nivel = 0) {
    gameOver = false;
    gameWin = false;
    cambiandoNivel = false;

    tileMap = new TileMap(tileSize);
    tileMap.cargarNivel(nivel);
    tileMap.setCanvasSize(canvas);

    cipriano = tileMap.getcipriano(velocity);
    enemigos = tileMap.getEnemigos(velocity);
}

// Reiniciar con la barra espaciadora
document.addEventListener("keydown", (event) => {
    if ((gameOver || gameWin) && event.code === "Space") {
        reiniciarJuego();
    }
});

// Reiniciar tocando la pantalla (celular)
canvas.addEventListener("touchstart", () => {
    if (gameOver || gameWin) {
        reiniciarJuego();
    }
});

//ejecución del bucle principal
setInterval(gameLoop, 1000 / 60);