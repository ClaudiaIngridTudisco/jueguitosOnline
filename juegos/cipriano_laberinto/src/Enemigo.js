import MovingDirection from "./MovingDirection.js";

export default class Enemigo {
  constructor(x, y, tileSize, velocity, tileMap) {
    this.x = x;
    this.y = y;
    this.tileSize = tileSize;
    this.velocity = velocity;
    this.tileMap = tileMap;

    this.#loadImages();

    this.movingDirection = Math.floor(
      Math.random() * Object.keys(MovingDirection).length
    );

    this.directionTimerDefault = this.#random(10, 25);
    this.directionTimer = this.directionTimerDefault;

    this.scaredAboutToExpireTimerDefault = 10;
    this.scaredAboutToExpireTimer = this.scaredAboutToExpireTimerDefault;
  }

  draw(ctx, pause, cipriano) {
    if (!pause) {
      this.#move();
      this.#changeDirection();
    }
    this.#setImage(ctx, cipriano);
  }

  collideWith(cipriano) {
    const size = this.tileSize / 2;
    if (
      this.x < cipriano.x + size &&
      this.x + size > cipriano.x &&
      this.y < cipriano.y + size &&
      this.y + size > cipriano.y
    ) {
      return true;
    } else {
      return false;
    }
  }

  #setImage(ctx, cipriano) {
    if (cipriano.pocionActive) {
      this.#setImageWhenpocionIsActive(cipriano);
    } else {
      this.image = this.murcielago;
    }
    ctx.drawImage(this.image, this.x, this.y, this.tileSize, this.tileSize);
  }

  #setImageWhenpocionIsActive(cipriano) {
    if (cipriano.pocionAboutToExpire) {
      this.scaredAboutToExpireTimer--;
      if (this.scaredAboutToExpireTimer === 0) {
        this.scaredAboutToExpireTimer = this.scaredAboutToExpireTimerDefault;
        if (this.image === this.murcielagoEmbrujado1) {
          this.image = this.murcielagoEmbrujado2;
        } else {
          this.image = this.murcielagoEmbrujado1;
        }
      }
    } else {
      this.image = this.murcielagoEmbrujado1;
    }
  }

  #changeDirection() {
    this.directionTimer--;
    let newMoveDirection = null;
    if (this.directionTimer === 0) {
      this.directionTimer = this.directionTimerDefault;
      newMoveDirection = Math.floor(
        Math.random() * Object.keys(MovingDirection).length
      );
    }

    if (newMoveDirection != null && this.movingDirection !== newMoveDirection) {
      if (
        Number.isInteger(this.x / this.tileSize) &&
        Number.isInteger(this.y / this.tileSize)
      ) {
        if (
          !this.tileMap.didCollideWithEnvironment(
            this.x,
            this.y,
            newMoveDirection
          )
        ) {
          this.movingDirection = newMoveDirection;
        }
      }
    }
  }

  #move() {
    if (
      !this.tileMap.didCollideWithEnvironment(
        this.x,
        this.y,
        this.movingDirection
      )
    ) {
      switch (this.movingDirection) {
        case MovingDirection.up:
          this.y -= this.velocity;
          break;
        case MovingDirection.down:
          this.y += this.velocity;
          break;
        case MovingDirection.left:
          this.x -= this.velocity;
          break;
        case MovingDirection.right:
          this.x += this.velocity;
          break;
      }
    }
  }

  #random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  #loadImages() {
    this.murcielago = new Image();
    this.murcielago.src = "images/murcielago.png";

    this.murcielagoEmbrujado1 = new Image();
    this.murcielagoEmbrujado1.src = "images/murcielagoEmbrujado1.png";

    this.murcielagoEmbrujado2 = new Image();
    this.murcielagoEmbrujado2.src = "images/murcielagoEmbrujado2.png";

    this.image = this.murcielago;
  }
}