import MovingDirection from "./MovingDirection.js";

export default class cipriano {
  constructor(x, y, tileSize, velocity, tileMap) {
    this.x = x;
    this.y = y;
    this.tileSize = tileSize;
    this.velocity = velocity;
    this.tileMap = tileMap;

    this.currentMovingDirection = null;
    this.requestedMovingDirection = null;

    this.ciprianoAnimationTimerDefault = 10;
    this.ciprianoAnimationTimer = null;

    this.ciprianoRotation = this.Rotation.right;
    
    // Sonidos
    this.diamanteSound = new Audio("sounds/diamante.wav");
    this.pocionSound = new Audio("sounds/pocion.mp3");
    this.matarMurcielagoSound = new Audio("sounds/murcielagodes.wav");

    // Estados de la Poción
    this.pocionActive = false;
    this.pocionAboutToExpire = false;
    this.timers = [];

    this.madeFirstMove = false;

    // Variables para registrar dónde empieza y termina el toque en la pantalla
    this.touchStartX = 0;
    this.touchStartY = 0;
    document.addEventListener("keydown", this.#keydown);
    // Escuchadores para pantallas táctiles
    document.addEventListener("touchstart", this.#handleTouchStart, { passive: true });
    document.addEventListener("touchend", this.#handleTouchEnd, { passive: true });
    this.#loadciprianoImages();
  }

  Rotation = {
    right: 0,
    down: 1,
    left: 2,
    up: 3,
  };

  draw(ctx, pause, enemigos) {
    if (!pause) {
      this.#move();
      this.#animate();
    }
    this.#tomarPocion();
    this.#juntarDiamantes();
    this.#matarMurcielago(enemigos);

    const size = this.tileSize / 2;

    ctx.save();
    ctx.translate(this.x + size, this.y + size);

    if (this.ciprianoRotation === this.Rotation.left) {
      ctx.scale(-1, 1); 
    } else {
      ctx.rotate((this.ciprianoRotation * 90 * Math.PI) / 180);
    }

    ctx.drawImage(
      this.ciprianoImages[this.ciprianoImageIndex],
      -size,
      -size,
      this.tileSize,
      this.tileSize
    );
    ctx.restore();
  }

  #loadciprianoImages() {
    const ciprianoImage1 = new Image();
    ciprianoImage1.src = "images/cipriano0.png";

    const ciprianoImage2 = new Image();
    ciprianoImage2.src = "images/cipriano1.png";

    const ciprianoImage3 = new Image();
    ciprianoImage3.src = "images/cipriano2.png";

    const ciprianoImage4 = new Image();
    ciprianoImage4.src = "images/cipriano1.png";

    this.ciprianoImages = [
      ciprianoImage1,
      ciprianoImage2,
      ciprianoImage3,
      ciprianoImage4,
    ];

    this.ciprianoImageIndex = 0;
  }

  #keydown = (event) => {
    //up
    if (event.keyCode == 38) {
      if (this.currentMovingDirection == MovingDirection.down)
        this.currentMovingDirection = MovingDirection.up;
      this.requestedMovingDirection = MovingDirection.up;
      this.madeFirstMove = true;
    }
    //down
    if (event.keyCode == 40) {
      if (this.currentMovingDirection == MovingDirection.up)
        this.currentMovingDirection = MovingDirection.down;
      this.requestedMovingDirection = MovingDirection.down;
      this.madeFirstMove = true;
    }
    //left
    if (event.keyCode == 37) {
      if (this.currentMovingDirection == MovingDirection.right)
        this.currentMovingDirection = MovingDirection.left;
      this.requestedMovingDirection = MovingDirection.left;
      this.madeFirstMove = true;
    }
    //right
    if (event.keyCode == 39) {
      if (this.currentMovingDirection == MovingDirection.left)
        this.currentMovingDirection = MovingDirection.right;
      this.requestedMovingDirection = MovingDirection.right;
      this.madeFirstMove = true;
    }
  };

  #move() {
    if (this.currentMovingDirection !== this.requestedMovingDirection) {
      if (
        Number.isInteger(this.x / this.tileSize) &&
        Number.isInteger(this.y / this.tileSize)
      ) {
        if (
          !this.tileMap.didCollideWithEnvironment(
            this.x,
            this.y,
            this.requestedMovingDirection
          )
        )
          this.currentMovingDirection = this.requestedMovingDirection;
      }
    }

    if (
      this.tileMap.didCollideWithEnvironment(
        this.x,
        this.y,
        this.currentMovingDirection
      )
    ) {
      this.ciprianoAnimationTimer = null;
      this.ciprianoImageIndex = 1;
      return;
    } else if (
      this.currentMovingDirection != null &&
      this.ciprianoAnimationTimer == null
    ) {
      this.ciprianoAnimationTimer = this.ciprianoAnimationTimerDefault;
    }

    switch (this.currentMovingDirection) {
      case MovingDirection.up:
        this.y -= this.velocity;
        this.ciprianoRotation = this.Rotation.up;
        break;
      case MovingDirection.down:
        this.y += this.velocity;
        this.ciprianoRotation = this.Rotation.down;
        break;
      case MovingDirection.left:
        this.x -= this.velocity;
        this.ciprianoRotation = this.Rotation.left;
        break;
      case MovingDirection.right:
        this.x += this.velocity;
        this.ciprianoRotation = this.Rotation.right;
        break;
    }
  }

  #animate() {
    if (this.ciprianoAnimationTimer == null) {
      return;
    }
    this.ciprianoAnimationTimer--;
    if (this.ciprianoAnimationTimer == 0) {
      this.ciprianoAnimationTimer = this.ciprianoAnimationTimerDefault;
      this.ciprianoImageIndex++;
      if (this.ciprianoImageIndex == this.ciprianoImages.length)
        this.ciprianoImageIndex = 0;
    }
  }

  // Activa los estados de la poción y limpia la inconsistencia de variables anteriores
  #tomarPocion() {
    if (this.tileMap.tomarPocion(this.x, this.y) && this.madeFirstMove) {
      this.pocionSound.play();
      
      this.pocionActive = true;
      this.pocionAboutToExpire = false;
      
      // Limpiar temporizadores activos previos si se consume otra poción seguidas
      this.timers.forEach((timer) => clearTimeout(timer));
      this.timers = [];

      // Temporizador total de duración (6 segundos)
      let pocionTimer = setTimeout(() => {
        this.pocionActive = false;
        this.pocionAboutToExpire = false;
      }, 1000 * 6);
      this.timers.push(pocionTimer);

      // Temporizador de advertencia de expiración (a los 3 segundos)
      let pocionAboutToExpireTimer = setTimeout(() => {
        this.pocionAboutToExpire = true;
      }, 1000 * 3);
      this.timers.push(pocionAboutToExpireTimer);
    }
  }

  // gestionar la recolección de diamantes
  #juntarDiamantes() {
    if (this.tileMap.juntarDiamantes(this.x, this.y)) {
      this.diamanteSound.play();
    }
  }

  #matarMurcielago(enemigos) {
    if (this.pocionActive) {
      const collideenemigos = enemigos.filter((Enemigo) => Enemigo.collideWith(this));
      collideenemigos.forEach((Enemigo) => {
        for (let i = enemigos.length - 1; i >= 0; i--) {
    if (enemigos[i].collideWith(this)) {
        this.matarMurcielagoSound.play();
        enemigos.splice(i, 1);
    }
}
      });
    }
  }
  #handleTouchStart = (event) => {
  // Registra las coordenadas exactas de dónde el dedo tocó la pantalla
  this.touchStartX = event.changedTouches[0].screenX;
  this.touchStartY = event.changedTouches[0].screenY;
};

#handleTouchEnd = (event) => {
  // Registra dónde se levantó el dedo
  const touchEndX = event.changedTouches[0].screenX;
  const touchEndY = event.changedTouches[0].screenY;

  // Calcular la distancia recorrida en X y en Y
  const diffX = touchEndX - this.touchStartX;
  const diffY = touchEndY - this.touchStartY;

  // Umbral mínimo en píxeles para que un toque accidental no cuente como movimiento
  const umbral = 30; 

  // Si el movimiento horizontal fue mayor que el vertical
  if (Math.abs(diffX) > Math.abs(diffY)) {
    if (Math.abs(diffX) > umbral) {
      if (diffX > 0) {
        // Deslizó a la derecha
        if (this.currentMovingDirection == MovingDirection.left) this.currentMovingDirection = MovingDirection.right;
        this.requestedMovingDirection = MovingDirection.right;
      } else {
        // Deslizó a la izquierda
        if (this.currentMovingDirection == MovingDirection.right) this.currentMovingDirection = MovingDirection.left;
        this.requestedMovingDirection = MovingDirection.left;
      }
      this.madeFirstMove = true;
    }
  } 
  // Si el movimiento vertical fue mayor
  else {
    if (Math.abs(diffY) > umbral) {
      if (diffY > 0) {
        // Deslizó hacia abajo
        if (this.currentMovingDirection == MovingDirection.up) this.currentMovingDirection = MovingDirection.down;
        this.requestedMovingDirection = MovingDirection.down;
      } else {
        // Deslizó hacia arriba
        if (this.currentMovingDirection == MovingDirection.down) this.currentMovingDirection = MovingDirection.up;
        this.requestedMovingDirection = MovingDirection.up;
      }
      this.madeFirstMove = true;
    }
  }
};
}
