let pelotas = [];
let cuerdas = [];
let arenaX, arenaY, arenaR;
let lastSpeedUp;
let numPelotas = 6;
let nombresPelotas = [];
let gameStarted = false;

// ----- Setup p5.js -----
function setup() {
  let canvas = createCanvas(windowWidth*0.9, windowHeight*0.7);
  canvas.parent('juego');
  arenaX = width/2;
  arenaY = height/2;
  arenaR = min(width, height)/2 - 50;

  let colores = [
    color(0, 200, 0),
    color(160, 60, 200),
    color(230, 50, 50),
    color(60, 120, 255),
    color(255, 180, 40),
    color(0, 220, 200),
    color(50,23,99)
  ];

  pelotas = [];
  cuerdas = [];

  for (let i = 0; i < numPelotas; i++) {
    let ang = TWO_PI / numPelotas * i;
    let p = new Pelota(
      arenaX + cos(ang)*100,
      arenaY + sin(ang)*100,
      20,
      colores[i % colores.length],
      nombresPelotas[i] || `Ball${i+1}`
    );
    pelotas.push(p);

    for (let k = 0; k < 3; k++) {
      let angC = atan2(p.y - arenaY, p.x - arenaX) + map(k, 0, 2, -0.3, 0.3);
      let cx = arenaX + cos(angC)*arenaR;
      let cy = arenaY + sin(angC)*arenaR;
      cuerdas.push(new Cuerda(p, cx, cy));
    }
  }

  lastSpeedUp = millis();
}

// ----- Draw loop -----
function draw() {
  background(0);
  noFill();
  stroke(200);
  strokeWeight(3);
  ellipse(arenaX, arenaY, arenaR*2, arenaR*2);

  if (millis() - lastSpeedUp > 1000) {
    for (let p of pelotas) {
      p.vx *= 1.05;
      p.vy *= 1.05;
    }
    lastSpeedUp = millis();
  }

  // Cuerdas
  for (let i = cuerdas.length-1; i >=0; i--) {
    let c = cuerdas[i];
    c.mostrar();
    for (let p of pelotas) {
      if (p != c.owner && p.c != c.owner.c) {
        if (c.tocaPelota(p)) {
          cuerdas.splice(i,1);
          break;
        }
      }
    }
  }

  // Pelotas
  for (let i = pelotas.length-1; i>=0; i--) {
    let p = pelotas[i];
    p.mover();
    p.colisiones(pelotas);
    p.mostrar();
    if (!p.tieneCuerda()) {
      pelotas.splice(i,1);
    }
  }
}

// ----- Clases -----
class Pelota {
  constructor(x, y, r, c, nombre){
    this.x = x; this.y = y; this.r = r; this.c = c; this.nombre = nombre;
    this.vx = random(-3,3); this.vy = random(-3,3);
  }

  mover(){
    this.x += this.vx; this.y += this.vy;
    let d = dist(this.x,this.y,arenaX,arenaY);
    if(d+this.r>=arenaR){
      let ang = atan2(this.y-arenaY,this.x-arenaX);
      let nx = cos(ang), ny = sin(ang);
      let dot = this.vx*nx + this.vy*ny;
      this.vx -= 2*dot*nx; this.vy -= 2*dot*ny;
      for(let k=0;k<3;k++){
        let offset = map(k,0,2,-0.3,0.3);
        let cx = arenaX+cos(ang+offset)*arenaR;
        let cy = arenaY+sin(ang+offset)*arenaR;
        cuerdas.push(new Cuerda(this,cx,cy));
      }
    }
  }

  mostrar(){
    fill(this.c); noStroke();
    ellipse(this.x,this.y,this.r*2,this.r*2);
    fill(255); textSize(12); textAlign(CENTER,CENTER);
    text(this.nombre,this.x,this.y);
  }

  colisiones(otros){
    for(let o of otros){
      if(o!=this){
        let d = dist(this.x,this.y,o.x,o.y);
        let minD = this.r+o.r;
        if(d<minD){
          let overlap=(minD-d)/2;
          let ang = atan2(this.y-o.y,this.x-o.x);
          this.x+=cos(ang)*overlap; this.y+=sin(ang)*overlap;
          o.x-=cos(ang)*overlap; o.y-=sin(ang)*overlap;
          let tempVx=this.vx,tempVy=this.vy;
          this.vx=o.vx; this.vy=o.vy; o.vx=tempVx; o.vy=tempVy;
        }
      }
    }
  }

  tieneCuerda(){
    for(let c of cuerdas) if(c.owner==this) return true;
    return false;
  }
}

class Cuerda{
  constructor(owner,bx,by){ this.owner=owner; this.bx=bx; this.by=by; }
  mostrar(){ stroke(this.owner.c); strokeWeight(2); line(this.owner.x,this.owner.y,this.bx,this.by); }
  tocaPelota(p){
    let d=this.distPointToLine(p.x,p.y,this.owner.x,this.owner.y,this.bx,this.by);
    return d<p.r;
  }
  distPointToLine(px,py,x1,y1,x2,y2){
    let A=px-x1, B=py-y1, C=x2-x1, D=y2-y1;
    let dot=A*C+B*D;
    let len=C*C+D*D;
    let param=len!=0?dot/len:-1;
    let xx,yy;
    if(param<0){xx=x1;yy=y1;}
    else if(param>1){xx=x2;yy=y2;}
    else{xx=x1+param*C; yy=y1+param*D;}
    return dist(px,py,xx,yy);
  }
}

// ----- Botones -----
document.getElementById('jugar').addEventListener('click',()=>{
  let n = parseInt(document.getElementById('numPelotas').value);
  if(n>=2 && n<=7) numPelotas=n;
  nombresPelotas=document.getElementById('nombres').value.split(',');
  document.getElementById('inicio').style.display='none';
  document.getElementById('juego').style.display='block';
  gameStarted=true;
  setup();
});

document.getElementById('restart').addEventListener('click',()=>{
  setup();
  gameStarted=true;
});

document.getElementById('backMenu').addEventListener('click',()=>{
  document.getElementById('juego').style.display='none';
  document.getElementById('inicio').style.display='flex';
  gameStarted=false;
});
