import cipriano from "./Cipriano.js";
import Enemigo from "./Enemigo.js";
import MovingDirection from "./MovingDirection.js";
import { mapas } from "./Mapas.js";

export default class TileMap {
  constructor(tileSize) {
    this.tileSize = tileSize;
    this.currentLevel = 0; // nivel 0 (el primero)
    this.map = JSON.parse(JSON.stringify(mapas[this.currentLevel])); // Clonar el mapa

    // Imagen del Diamante
    this.diamante = new Image();
    this.diamante.src = "images/diamante.png"; 

    // Imágenes para la Poción y su animación
    this.pocionOriginal = new Image();
    this.pocionOriginal.src = "images/pocion.png";
    this.pocionImprimible = this.pocionOriginal;

    // Imagen de la Pared
    this.pared = new Image();
    this.pared.src = "images/pared.png";

    // Temporizador de animación
    this.pocionAnmationTimerDefault = 30;
    this.pocionAnmationTimer = this.pocionAnmationTimerDefault;
  }

  // Método para cambiar de nivel
  cargarNivel(numeroNivel) {
    if (numeroNivel < mapas.length) {
      this.currentLevel = numeroNivel;
      //JSON.parse/stringify para copiar el mapa limpio sin modificar el original
      this.map = JSON.parse(JSON.stringify(mapas[this.currentLevel]));
      return true;
    }
    return false; // No hay más niveles (Fin del juego)
  }

  draw(ctx) {
    // Actualiza el temporizador una sola vez por fotograma de renderizado
    this.#actualizarAnimacionPocion();

    for (let row = 0; row < this.map.length; row++) {
      for (let column = 0; column < this.map[row].length; column++) {
        let tile = this.map[row][column];
        if (tile === 1) {
          this.#drawPared(ctx, column, row, this.tileSize);
        } else if (tile === 0) {
          this.#drawDiamante(ctx, column, row, this.tileSize);
        } else if (tile === 7) {
          this.#drawPocion(ctx, column, row, this.tileSize);
        } else {
          this.#drawEspacioEnBlanco(ctx, column, row, this.tileSize);
        }
      }
    }
  }

  #actualizarAnimacionPocion() {
    this.pocionAnmationTimer--;
    if (this.pocionAnmationTimer <= 0) {
      this.pocionAnmationTimer = this.pocionAnmationTimerDefault;
      // Alterna entre la poción y el diamante
      this.pocionImprimible = 
        this.pocionImprimible === this.pocionOriginal 
          ? this.diamante 
          : this.pocionOriginal;
    }
  }

  #drawDiamante(ctx, column, row, size) {
    ctx.drawImage(
      this.diamante,
      column * this.tileSize,
      row * this.tileSize,
      size,
      size
    );
  }

  #drawPocion(ctx, column, row, size) {
    ctx.drawImage(this.pocionImprimible, column * size, row * size, size, size);
  }

  #drawPared(ctx, column, row, size) {
    ctx.drawImage(
      this.pared,
      column * this.tileSize,
      row * this.tileSize,
      size,
      size
    );
  }

  #drawEspacioEnBlanco(ctx, column, row, size) {
    ctx.fillStyle = "black";
    ctx.fillRect(column * this.tileSize, row * this.tileSize, size, size);
  }

  getcipriano(velocity) {
    for (let row = 0; row < this.map.length; row++) {
      for (let column = 0; column < this.map[row].length; column++) {
        let tile = this.map[row][column];
        if (tile === 4) {
          this.map[row][column] = 5; // Cambia a espacio en blanco
          return new cipriano(
            column * this.tileSize,
            row * this.tileSize,
            this.tileSize,
            velocity,
            this
          );
        }
      }
    }
  }

  getEnemigos(velocity) {
    const enemigos = [];
    for (let row = 0; row < this.map.length; row++) {
      for (let column = 0; column < this.map[row].length; column++) {
        const tile = this.map[row][column];
        if (tile === 6) {
          this.map[row][column] = 5; // Cambia a espacio en blanco
          enemigos.push(
            new Enemigo(
              column * this.tileSize,
              row * this.tileSize,
              this.tileSize,
              velocity,
              this
            )
          );
        }
      }
    }
    return enemigos;
  }

  setCanvasSize(canvas) {
    canvas.width = this.map[0].length * this.tileSize;
    canvas.height = this.map.length * this.tileSize;
  }
  

  didCollideWithEnvironment(x, y, direction) {
    if (direction == null) return false;

    if (
      Number.isInteger(x / this.tileSize) &&
      Number.isInteger(y / this.tileSize)
    ) {
      let column = x / this.tileSize;
      let row = y / this.tileSize;

      switch (direction) {
        case MovingDirection.right:
          column++;
          break;
        case MovingDirection.left:
          column--;
          break;
        case MovingDirection.up:
          row--;
          break;
        case MovingDirection.down:
          row++;
          break;
      }
      
      const tile = this.map[row]?.[column]; // El ?. evita errores si se sale de los bordes del mapa
      if (tile === 1) {
        return true;
      }
    }
    return false;
  }

  didWin() {
    return this.#diamantesLeft() === 0;
  }

  #diamantesLeft() {
    return this.map.flat().filter((tile) => tile === 0).length;
  }

  tomarPocion(x, y) {
    const row = y / this.tileSize;
    const column = x / this.tileSize;
    if (Number.isInteger(row) && Number.isInteger(column)) {
      // Las pociones son el identificador 7
      if (this.map[row][column] === 7) {
        this.map[row][column] = 5;
        return true;
      }
    }
    return false;
  }

  juntarDiamantes(x, y) {
    const row = y / this.tileSize;
    const column = x / this.tileSize;
    if (Number.isInteger(row) && Number.isInteger(column)) {
      // Los diamantes son el identificador 0
      if (this.map[row][column] === 0) {
        this.map[row][column] = 5;
        return true;
      }
    }
    return false;
  }
}