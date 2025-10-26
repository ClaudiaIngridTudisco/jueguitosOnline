
import {PiezasBag} from './pieza.js'
import {BoardTetris, BoardNext, BoardHold} from './boardTetris.js'

export class Game {

    constructor(canvas, rows, cols, cellSize, space, canvasNext, canvasHold){
        this.boardTetris = new BoardTetris(canvas, rows, cols, cellSize, space);
        this.piezasBag = new PiezasBag(canvas, cellSize);
        this.currentPieza = this.piezasBag.nextPieza();
        this.keyboard();
        this.keys = { up: false, down: false }
        this.lastDownTime = 0;
        this.touchControls();
        document.getElementById("canvas-hold").addEventListener("touchstart", () => {
        if (!this.gameOver) {
        this.holdPieza();
        }
});
        this.keys = {up:false,down:false};


        this.lastTime = 0;
        this.lastTime2 = 0;

        this.next = new BoardNext(canvasNext,8,4,cellSize,space,this.piezasBag.getThreeNextPiezas());
        this.hold = new BoardHold(canvasHold,2,4,cellSize,space);
        this.canHold = true;

        this.score = 0;
        this.gameOver = false;

    }

    update(){
        let currentTime = Date.now();
        let deltaTime = currentTime - this.lastTime;
        let deltaTime2 = currentTime - this.lastTime2;
        if(deltaTime >= 1000){
            this.autoMovePiezaDown();
            this.lastTime = currentTime;
        }
        if(deltaTime2 >=50){
            this.boardTetris.draw();
            this.drawPiezaGhost();
            this.currentPieza.draw(this.boardTetris);
            this.next.draw2();
            this.hold.draw2();
      
            if(this.keys.down && currentTime - this.lastDownTime > 100){
                this.movePiezaDown();
                this.lastDownTime = currentTime;
            }
            this.lastTime2 = currentTime;
        }
       
    }

    autoMovePiezaDown(){
        this.currentPieza.move(1,0);
        if(this.blockedPieza()){
            this.currentPieza.move(-1,0);
            this.placePieza();
    }
}

    blockedPieza(){
        const piezaPositions = this.currentPieza.currentPositions();
        for (let i = 0; i<piezaPositions.length; i++){
            if(!this.boardTetris.isEmpty(piezaPositions[i].row, piezaPositions[i].column)){
                return true;
            } 
        }
        return false;
    }

    movePiezaLeft(){
        this.currentPieza.move(0,-1);
        if(this.blockedPieza()){
            this.currentPieza.move(0,1);
        }
    }
    movePiezaRight(){
         this.currentPieza.move(0,1);
        if(this.blockedPieza()){
            this.currentPieza.move(0,-1);
        }
    }
    movePiezaDown(){
        this.currentPieza.move(1,0);
        if(this.blockedPieza()){
            this.currentPieza.move(-1,0);
        }
    }

    rotationPiezaCW(){
        this.currentPieza.rotation++;
        if(this.currentPieza.rotation > this.currentPieza.shapes.length-1){
            this.currentPieza.rotation = 0;
        }
        if(this.blockedPieza()){
            this.rotationPiezaCCW();
        }
    }
    rotationPiezaCCW(){
        this.currentPieza.rotation--;
        if(this.currentPieza.rotation < 0){
            this.currentPieza.rotation = this.currentPieza.shapes.length -1;
        }
        if(this.blockedPieza()){
            this.rotationPiezaCW();
        }
    }
    placePieza(){
        const piezaPositions = this.currentPieza.currentPositions();
        for(let i = 0; i < piezaPositions.length; i++){
            this.boardTetris.matriz
                [piezaPositions[i].row]
                [piezaPositions[i].column] = this.currentPieza.id;
        }
        this.score += this.boardTetris.clearFullRows()*7;
        
        if(this.boardTetris.gameOver()){
            setTimeout(()=>{
           this.gameOver = true;
            }, 500);           
            return true;
        }else{
            this.currentPieza = this.piezasBag.nextPieza();
            this.next.listPiezas = this.piezasBag.getThreeNextPiezas();
            this.next.updateMatriz();
            this.canHold = true;
        }
    }
    dropDistance(position){
        let distance = 0;
        while(this.boardTetris.isEmpty(position.row + distance + 1, position.column)){
            distance++;
        } 
        return distance;
    }

    piezaDropDistance(){
        let drop = this.boardTetris.rows;
        const piezaPositions = this.currentPieza.currentPositions();
        for (let i = 0; i<piezaPositions.length; i++){
            drop = Math.min(drop,this.dropDistance(piezaPositions[i]))
        }
        return drop;
    }
    drawPiezaGhost(){
        const dropDistance = this.piezaDropDistance();
        const piezaPositions = this.currentPieza.currentPositions();
        for(let i = 0; i<piezaPositions.length; i++){
            let position = this.boardTetris.getCoordinates(
                piezaPositions[i].column,
                piezaPositions[i].row + dropDistance
            );
            this.boardTetris.drawSquare(position.x, position.y, this.boardTetris.cellSize, "#000","white",20);
        }
    }
    dropBlock(){
        this.currentPieza.move(this.piezaDropDistance(),0);
        this.placePieza();

    }
    holdPieza(){
        if(!this.canHold) return;
        if(this.hold.pieza === null){
            this.hold.pieza = this.currentPieza;
            this.currentPieza = this.piezasBag.nextPieza();
        }else{
            [this.currentPieza, this.hold.pieza] = [this.hold.pieza, this.currentPieza];
        }
        this.hold.updateMatriz();
        this.canHold = false;
    }
    reset(){
        this.gameOver = false;
        this.boardTetris.restartMatriz();
        this.score = 0;
        this.hold.pieza = null;
        this.piezasBag.reset();
        this.currentPieza = this.piezasBag.nextPieza();
        this.hold.drawBackground();
        this.canHold = true;
        this.hold.restartMatriz();
        this.next.restartMatriz();
        this.next.listPiezas = this.piezasBag.getThreeNextPiezas();
        this.next.updateMatriz();
        this.next.draw2();
        
    }
    keyboard(){
        window.addEventListener("keydown",(evt)=>{
            if(evt.key === "ArrowLeft"){
                this.movePiezaLeft();
            }
            if(evt.key === "ArrowRight"){
                this.movePiezaRight();
            }
            if(evt.key === "ArrowUp" && !this.keys.up){
                this.rotationPiezaCW();
                this.keys.up = true;
            }
            if(evt.key === "ArrowDown"){
                this.keys.down = true;
            }
            if(evt.key === "c" || evt.key === "C"){
                this.holdPieza();
            }
        });
        window.addEventListener("click", ()=>{
            if(!this.gameOver){
            this.dropBlock();
            }
            
        })
        window.addEventListener("keyup",(evt)=>{
            if(evt.key === "ArrowUp"){
                this.keys.up = false;
            }
            if(evt.key === "ArrowDown"){
                this.keys.down = false;
            }
        })
        

    }
touchControls() {
  const leftBtn = document.getElementById('left');
  const rightBtn = document.getElementById('right');
  const rotateBtn = document.getElementById('rotate');

  if (leftBtn && rightBtn && rotateBtn) {
    // Mover a la izquierda
    leftBtn.addEventListener('pointerdown', (e) => {
      e.preventDefault(); // evita que se dispare click o scroll
      this.movePiezaLeft();
      navigator.vibrate?.(30);
    });

    // Mover a la derecha
    rightBtn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.movePiezaRight();
      navigator.vibrate?.(30);
    });

    // Rotar
    rotateBtn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.rotationPiezaCW();
      navigator.vibrate?.(30);
    });
  }
}
}



    

