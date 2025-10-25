
import {Grid} from './grid.js'

export class BoardTetris extends Grid{
    constructor(canvas, rows, cols, cellSize, space){
        super(canvas, rows, cols, cellSize, space);
    }
    isInside(row,col){
        return row>=0 && row<this.rows && col>=0 && col<this.cols;
    }
    isEmpty(row,col){
        return this.isInside(row, col) && this.matriz[row][col] === 0;
    }
    isRowFull(row){
        return this.matriz[row].every(element => element !== 0);
    }
    isRowEmpty(row){
        return this.matriz[row].every(element => element === 0);
    }
    clearRow(row){
        this.matriz[row].fill(0);
    }
    moveRowDown(row, numRows){
        this.matriz[row + numRows] = this.matriz[row].slice();
        this.clearRow(row);
    }
    clearFullRows(){
        let cont = 0;

        for (let row = this.rows -1; row>=0; row--){
            if(this.isRowFull(row)){
                this.clearRow(row);
                cont++;
            } else if (cont > 0){
                this.moveRowDown(row, cont);
                }
            }
            return cont;
        }
        
    gameOver(){
            return !(this.isRowEmpty(0));
        }
    }

export class BoardNext extends Grid{
    constructor(canvas,rows,cols,cellSize,space,listPiezas){
        super(canvas, rows, cols, cellSize, space);
        this.listPiezas = listPiezas;
        this.updateMatriz();
    }
    updateMatriz(){
        this.restartMatriz();
        let cont = 0;
        for(let i = 0; i<this.listPiezas.length; i++){
            const shape = this.listPiezas[i].currentShape();
            for(let j = 0; j<shape.length; j++){
                this.matriz[shape[j].row + cont][shape[j].column] = this.listPiezas[i].id;
            }
            cont+=3;
        }
    }
}

export class BoardHold extends Grid{
    constructor(canvas,rows,cols,cellSize,space){
        super(canvas, rows, cols, cellSize, space);
        this.pieza = null;
        this.updateMatriz();
    }
    updateMatriz(){
        if(this.pieza===null) return;
        this.pieza.reset();
        this.restartMatriz();
        const shape = this.pieza.currentShape();
        for(let i = 0; i < shape.length; i++){
            this.matriz[shape[i].row][shape[i].column] = this.pieza.id;
            }
        }
    }

