// Obtener elementos del DOM
const container = document.getElementById("container");
const user = document.getElementById("user");
const comp = document.getElementById("comp");
const ball = document.getElementById("ball");
const user_score = document.getElementById("user-score");
const comp_score = document.getElementById("comp-score");

// Obtener dimensiones reales del contenedor
let TABLE_WIDTH = container.offsetWidth;
let TABLE_HEIGHT = container.offsetHeight;

// Constantes de tamaño de elementos
const IMG_SIZE = 100; // coincide con el CSS
const BALL_SIZE = 20;
const WINNER_SCORE = 5;
let comlevel = 0.9; // velocidad de reacción de la computadora

// Estado de teclas del jugador
let keys = { ArrowUp: false, ArrowDown: false };
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

// Posiciones iniciales
function setInitialPositions() {
  TABLE_WIDTH = container.offsetWidth;
  TABLE_HEIGHT = container.offsetHeight;

  user.style.marginLeft = `0px`;
  user.style.marginTop = `${TABLE_HEIGHT / 2 - IMG_SIZE / 2}px`;

  comp.style.marginLeft = `${TABLE_WIDTH - IMG_SIZE}px`;
  comp.style.marginTop = `${TABLE_HEIGHT / 2 - IMG_SIZE / 2}px`;

  ball.style.marginLeft = `${TABLE_WIDTH / 2 - BALL_SIZE / 2}px`;
  ball.style.marginTop = `${TABLE_HEIGHT / 2 - BALL_SIZE / 2}px`;
}
setInitialPositions();

// Velocidades iniciales
let Vx = -1;
let Vy = -1;
let V = Math.sqrt(Vx ** 2 + Vy ** 2);
let game_setting;

// Funciones auxiliares
function marginTop(elem) {
  return Number(elem.style.marginTop.split("p")[0]);
}

function marginLeft(elem) {
  return Number(elem.style.marginLeft.split("p")[0]);
}

// Reiniciar juego tras un punto
function reset() {
  clearInterval(game_setting);
  Vx = -1;
  Vy = -1;
  V = Math.sqrt(Vx ** 2 + Vy ** 2);
  setInitialPositions();
  gameLoop();
}

// Detección de colisión entre pelota y paleta
function collisionDetected(chara) {
  let ballTop = marginTop(ball);
  let ballBottom = ballTop + BALL_SIZE;
  let ballLeft = marginLeft(ball);
  let ballRight = ballLeft + BALL_SIZE;

  let charaTop = marginTop(chara);
  let charaBottom = charaTop + IMG_SIZE;
  let charaLeft = marginLeft(chara);
  let charaRight = charaLeft + IMG_SIZE;

  let type = (charaLeft === 0) ? "user" : "comp";
  let validDirection = (type === "user" && Vx < 0) || (type === "comp" && Vx > 0);

  let collision = ballLeft < charaRight &&
                  ballRight > charaLeft &&
                  ballTop < charaBottom &&
                  ballBottom > charaTop;

  return collision && validDirection;
}

// Bucle principal del juego
function gameLoop() {
  setTimeout(() => {
    game_setting = setInterval(() => {
      // Gol del comp
      if (marginLeft(ball) < 0) {
        comp_score.innerHTML = Number(comp_score.innerHTML) + 1;
        return reset();
      }

      // Gol del user
      if (marginLeft(ball) + BALL_SIZE > TABLE_WIDTH) {
        user_score.innerHTML = Number(user_score.innerHTML) + 1;
        return reset();
      }

      // Verificar si alguien ganó
      if (Number(comp_score.innerHTML) === WINNER_SCORE) {
        alert("Computer wins!");
        comp_score.innerHTML = 0;
        user_score.innerHTML = 0;
        return reset();
      } else if (Number(user_score.innerHTML) === WINNER_SCORE) {
        alert("You win!");
        comp_score.innerHTML = 0;
        user_score.innerHTML = 0;
        return reset();
      }

      // Rebote contra bordes superior/inferior
      if (marginTop(ball) < 0 || marginTop(ball) + BALL_SIZE > TABLE_HEIGHT) {
        Vy = -Vy;
      }

      // Colisión con paleta
      let chara = (marginLeft(ball) + BALL_SIZE / 2 < TABLE_WIDTH / 2) ? user : comp;
      let charaCenterY = marginTop(chara) + IMG_SIZE / 2;
      let ballCenterY = marginTop(ball) + BALL_SIZE / 2;

      if (collisionDetected(chara)) {
        let angle;
        let type = (marginLeft(chara) === 0) ? "user" : "comp";

        if (ballCenterY < charaCenterY) {
          angle = (type === "user") ? -Math.PI / 4 : -3 * Math.PI / 4;
        } else if (ballCenterY > charaCenterY) {
          angle = (type === "user") ? Math.PI / 4 : 3 * Math.PI / 4;
        } else {
          angle = (type === "user") ? 0 : Math.PI;
        }

        V += 0.5;
        Vx = V * Math.cos(angle);
        Vy = V * Math.sin(angle);
      }

      // Movimiento de la paleta comp
      let compCenterY = marginTop(comp) + IMG_SIZE / 2;
      let deltaY = (ballCenterY - compCenterY) * comlevel;
      comp.style.marginTop = `${marginTop(comp) + deltaY}px`;

      // Limitar movimiento de comp dentro del área
      if (marginTop(comp) < 0) {
        comp.style.marginTop = "0px";
      } else if (marginTop(comp) > TABLE_HEIGHT - IMG_SIZE) {
        comp.style.marginTop = `${TABLE_HEIGHT - IMG_SIZE}px`;
      }

      // Movimiento de la pelota
      ball.style.marginLeft = `${marginLeft(ball) + Vx}px`;
      ball.style.marginTop = `${marginTop(ball) + Vy}px`;

      // Movimiento del jugador
      if (keys.ArrowUp && marginTop(user) > 0) {
        user.style.marginTop = `${marginTop(user) - 2}px`;
      } else if (keys.ArrowDown && marginTop(user) < TABLE_HEIGHT - IMG_SIZE) {
        user.style.marginTop = `${marginTop(user) + 2}px`;
      }

    }, 5);
  }, 500);
}

// Iniciar juego
gameLoop();

// Actualizar dimensiones si se redimensiona la ventana
window.addEventListener("resize", () => {
  TABLE_WIDTH = container.offsetWidth;
  TABLE_HEIGHT = container.offsetHeight;
});


// Activar controles táctiles solo en dispositivos con pantalla táctil
if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
  container.addEventListener("touchstart", handleTouchMove);
  container.addEventListener("touchmove", handleTouchMove);
}

// Función para mover la paleta del jugador según el toque
function handleTouchMove(e) {
  const touchY = e.touches[0].clientY;
  const containerTop = container.getBoundingClientRect().top;
  const relativeY = touchY - containerTop;

  const newTop = relativeY - IMG_SIZE / 2;

  // Limitar el movimiento dentro del área de juego
  if (newTop >= 0 && newTop <= TABLE_HEIGHT - IMG_SIZE) {
    user.style.marginTop = `${newTop}px`;
  }
}
