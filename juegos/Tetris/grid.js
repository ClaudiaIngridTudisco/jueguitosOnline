
import {Pieza} from './pieza.js'

export class Grid{
    constructor(canvas, rows, cols, cellSize, space){
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");  //obtenemos el contexto
        this.rows = rows;
        this.cols = cols;
        this.cellSize = cellSize; //medida de la celda
        this.space = space;  //espacio entre bloques
        this.matriz = [];  
        this.restartMatriz();  //para que la matriz esté completa de ceros

        this.canvas.width = this.cols * this.cellSize + (this.space*this.cols);
        this.canvas.height = this.rows * this.cellSize + (this.space*this.rows);

        this.block = new Pieza(this.canvas, this.cellSize);
    }

    //completa la matriz con ceros
restartMatriz (){
 for (let r = 0; r < this.rows; r++ ){
    this.matriz [r] = [];
    for (let c = 0; c < this.cols; c++){
        this.matriz [r][c] = 0;
    }
 }
}

//dibujar un cuadro en el tablero
drawSquare(x,y,side,color,borderColor, border){
    const borderSize = side/border;    //tamaño del borde es igual al tamaño del cuadro dividido 10
    this.ctx.fillStyle = color;     //color del cuadro
    this.ctx.fillRect(x, y, side, side);  

    this.ctx.strokeStyle = borderColor;   //borde interno con color
    this.ctx.lineWidth = borderSize;    
    this.ctx.strokeRect(x + borderSize / 2, y + borderSize / 2, side - borderSize, side - borderSize);

}

//retorna la posición en píxeles en el tablero
getCoordinates(col, row){
    return {x: col * (this.cellSize + this.space), 
            y: row * (this.cellSize + this.space)
        };
    }

//dibuja el tablero
draw(){
    for (let r = 0; r < this.rows; r++){
        for (let c = 0; c < this.cols; c++){
            const position = this.getCoordinates(c,r);  //en cada iteración se obtienen los píxeles de esa posición
                if(this.matriz[r][c] !== 0){
                    this.block.drawBlock(position.x, position.y,this.matriz[r][c]);
                }
                else{
                    this.drawSquare(position.x, position.y, this.cellSize, "#000", "#303030", 10);  //se dibuja cada cuadro
                }
        }
    }
    this.printMatriz();
}
draw2(){
    this.drawBackground();
    for (let r = 0; r < this.rows; r++){
        for (let c = 0; c < this.cols; c++){
            const position = this.getCoordinates(c,r);  //en cada iteración se obtienen los píxeles de esa posición
                if(this.matriz[r][c] !== 0){
                    if(this.matriz[r][c] === 2){
                        this.block.drawBlock(position.x + this.cellSize, position.y, this.matriz[r][c]);
                    } else if(this.matriz[r][c] === 3){
                         this.block.drawBlock(position.x, position.y,this.matriz[r][c]);
                    } else{
                        this.block.drawBlock(position.x + this.cellSize/2, position.y, this.matriz[r][c]);
                    }
                   
                }
            }
        }
    }
    drawBackground(){
        this.ctx.fillStyle = "black";
        this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height)
    }

printMatriz(){
    let text = "";
    this.matriz.forEach((row)=>{
        text += row.join(" ") + "\n";
    });
    console.log(text);
}

}