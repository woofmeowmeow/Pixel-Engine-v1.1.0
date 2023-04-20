/////////////////////////////////////////////////////// canvas rendering context 2d
///////////////////////////////////////////////////////
const game = document.createElement("canvas"), 
      gfx  = game.getContext("2d");

    game.id   = "game_window";
    let gameW = game.width, 
        gameH = game.height;
    let body  = document.getElementsByTagName("body")[0];

/////////////////////////////////////////////////////// canvas rendering context webgl
///////////////////////////////////////////////////////
const WGL_CANVAS = document.createElement("canvas");
let wgl = WGL_CANVAS.getContext("webgl");
    
if(wgl === null){ 
    // for IE, Edge and Safari
    alert("your browser does not support webgl. now trying webgl experimental...");
    wgl = WGL_CANVAS.getContext("experimental-webgl");
}

    WGL_CANVAS.id   = "webgl_window";
    let wglW = WGL_CANVAS.width, 
        wglH = WGL_CANVAS.height;

///////////////////////////////////////////////////////
///////////////////////////////////////////////////////

// append canvas element to the document body.
// the type can be "2d" or "webgl".
function AppendCanvas(type){
    if(type === "2d"){
        body.appendChild(game);
    }

    if(type === "webgl"){
        body.appendChild(WGL_CANVAS);
    }
}

// global variables for the physics engine and other stuff 
    const delta_time        = 0.008;            // 0.005 years is equal to 1.825 days
    const softeningConstant = 0.15;
    const g_constant        = 6.673*(10**-11);
    let   workspace         = [];               // workspace stores all entitys in your game

// mouseX and mouseY coordinates
let mouseX = undefined;
let mouseY = undefined;
    
window.addEventListener('mousemove', (event) => {
    mouseX = event.clientX, 
    mouseY = event.clientY;
});

/******************************
 * canvas background color
 * param_1: color or url
 * param_2: "Image" or nothing
******************************/

let Background = function(color,type){
    if(!type){
        gfx.fillStyle = color;
        gfx.fillRect(0,0,game.width,game.height);
    }else{
        let image = new Image();
        image.src = color;
        gfx.fillRect(0,0,game.width,game.height);
        gfx.drawImage(image,0,0,game.width,game.height);
    }
};

/******************************
 * canvas window size for 2d
******************************/

let GameSize = function(w,h){
    game.width  = w;
    game.height = h;
    gameW = game.width;
    gameH = game.height;
};

/******************************
 * canvas background color
 * for webgl
 * param_1: color or url
 * param_2: "Image" or nothing
******************************/

let WebglBackground = function(color,type){
    if(!type){
        wgl.clearColor(color);
        wgl.clear(wgl.COLOR_BUFFER_BIT | wgl.DEPTH_BUFFER_BIT);
    }else{}
};

/*******************************
 * canvas window size for webgl
*******************************/

let GameSizeWebgl = function(w,h){
    WGL_CANVAS.width  = w;
    WGL_CANVAS.height = h;
    wglW = WGL_CANVAS.width;
    wglH = WGL_CANVAS.height;
};

/******************************
 * light source object
******************************/

let LightSource = function(x,y,w,h){
    this.x = x; this.y = y;
    this.w = w; this.h = h;

    this.position   = new vector2(x,y);
    this.brightness = 0.0;
    this.c          = lcb(this,0,0,0);
    Pos             = new vector2(x,y);
    Size            = new vector2(w,h);
    Vel             = new vector2(0,0);
    Acc             = new vector2(0,0);
    Grav            = new vector2(0,0);
    this.light      = new Entity(Pos,Size,Vel,Acc,Grav,"circle");

    this.on = function(){
        this.brightness = 1.0;
        this.light.ShadowColor = "grey";
        this.light.ShadowBlur = 15;
    };
    this.off = function(){
        this.brightness = 0.0;
        this.light.ShadowColor;
        this.light.ShadowBlur = 0;
    };
};

/*********************************
 * use this instead of rgba.
 * for light source objects only.
*********************************/

let lcb = function(l,r,g,b){
    this.c = rgba(r,g,b,l.brightness);
};

/*************
 * rgba color
*************/

let rgba = function(r,g,b,a){
    return "rgba"+"("+r+", "+g+", "+b+", "+a+")";
};

/***************
 * sound object
***************/

let Sound = function(src){
    let sound = document.createElement("audio");

    sound.src = src;
    sound.setAttribute("preload","auto");
    sound.setAttribute("controls","none");
    sound.style.display = "none";
    document.body.appendChild(sound);

    this.volume = function(v){
        sound.volume = v;
    };

    this.play = function(){
        let playPromise = sound.play();
        if(playPromise !== undefined){
            playPromise.then(function(){
                sound.play();
            }).catch(function(error){
                console.log("error playing sound. "+error);
            });
        }
    };

    this.stop = function(){
        sound.pause();
    };
};

/***************************
 * returns a random integer
***************************/

let Random = function(min,max){
    return Math.floor(Math.random() * (max - min)) + min;
};

/*******************************************************
 * convert negative to positive or positive to negative
*******************************************************/

let Reverse = function(num){
    if(num > 0){
        return -Math.abs(num);
    }else{
        return Math.abs(-num);
    }
};

/*******************************************************
 * lineToAngle(gfx, x1, y1, length, angle)
*******************************************************/

function lineToAngle(gfx,x1,y1,length,angle){
    angle *= Math.PI / 180;
    
    var x2 = x1 + length * Math.cos(angle),
        y2 = y1 + length * Math.sin(angle);
    
    gfx.moveTo(x1, y1);
    gfx.lineTo(x2, y2);

    return {x: x2, y: y2};
}

/*******************************************************
 * convertToRadians converts degrees to radians
*******************************************************/

function convertToRadians(degree) {
    return degree*(Math.PI/180);
}

/******************************************************
 * returns the distance between two entitys
******************************************************/

let GetEntityDistance = function(ent1,ent2){
    this.ent1 = ent1;
    this.ent2 = ent2;

    vec1 = new vector2(ent1.x,ent1.y);
    vec2 = new vector2(ent2.x,ent2.y);

    let a = vec1.x - vec2.x;
    let b = vec1.y - vec2.y;

    return Math.sqrt(a*a + b*b);
};

/******************************************************
 * returns the distance between two vectors
******************************************************/

let GetVectorDistance = function(vec1,vec2){
    this.vec1 = vec1;
    this.vec2 = vec2;

    let a = vec1.x - vec2.x;
    let b = vec1.y - vec2.y;

    return Math.sqrt(a*a + b*b);
};

/***********
 * interval
***********/

let Update = function(f){
    this.f = f;

    let interval = setInterval(f,30);

    this.stop = function(){
        clearInterval(interval);
    };
};

/*****************
 * RecurringTimer
*****************/

let RecurringTimer = function(callback, delay) {
    let timerId, start, remaining = delay;

    this.pause = function() {
        window.clearTimeout(timerId);
        remaining -= new Date() - start;
    };

    let resume = function() {
        start = new Date();
        timerId = window.setTimeout(function() {
            remaining = delay;
            resume();
            callback();
        }, remaining);
    };

    this.resume = resume;

    this.resume();
};

/******************************************
 * draws all entitys in the workspace
******************************************/

let RenderAllEntitys = function(){
    for(let i in workspace){
        workspace[i].render();
    }
};

/**************************************************
 * removes and erases all entitys in the workspace
**************************************************/

let DestroyAllEntitys = function(){
    for(let i in workspace){
        workspace[i].destroy();
    }
};

/**************************************************
 * uses entity.rotate to spin an entity
 * (Spin.init gets called inside the game loop)
**************************************************/

let Spin = function(entVal,value,color){
    this.entVal = entVal;
    this.value = value;
    this.color = color;
    
    this.init = function(){
        value = value + 1

        if(value != 360){
            entVal.erase();
            entVal.c = color;
            entVal.rotate(value);
        }else{
            value = 0;
        }
    };
};

/****************************************************
 * apply physics by calling ApplyPhysics() in update
****************************************************/

let ApplyPhysics = function(){
    for(let i in workspace){
        workspace[i].applyGravity();
    }
};

/***************
 * event class
***************/

let Event = function(parent,event,fn,bool){
    parent.addEventListener(event,fn,bool);
};

/********************************
 * event detector class
********************************/

let EventDetector = function(vectorPos,vectorSize,evnt,fn){
    this.event = function(){
        let ev = new Event(game,evnt,function(e){
            let x = e.clientX,
                y = e.clientY;

            if(Math.pow(x-vectorPos.x,vectorSize.y)+Math.pow(y-vectorPos.y,vectorSize.x) < Math.pow(vectorSize.x,vectorSize.y)){
                fn();
            }
        });
    };
};

/************************
 * viewport class
************************/

let Viewport = function(vecSize,entity){
    this.x          = entity.x;
    this.y          = entity.y;
    this.w          = vecSize.x;
    this.h          = vecSize.y;
    Pos             = new vector2(this.x,this.y);
    Size            = new vector2(this.w,this.h);
    Vel             = new vector2(0,0);
    Acc             = new vector2(0,0);
    Grav            = new vector2(0,0);
    this.viewport   = new Entity(Pos,Size,Vel,Acc,Grav,"rectangle");
    this.viewport.c = rgba(255,255,255,0.5);

    this.enable = function(){
        for(let i in workspace){
            if(DetectEdges(this.viewport,workspace[i]) !== false && workspace[i].id !== this.viewport.id){
                workspace[i].render();
            }
        }

        this.viewport.x = (entity.x-this.viewport.w/2)+(entity.w/2);
        this.viewport.y = (entity.y-this.viewport.h/2)+(entity.h/2);
    };
};

/************************
 * entity collision
 * returns true or false
************************/

let DetectEdges = function(ent1,ent2){
    this.x1 = ent1.x;
    this.y1 = ent1.y;
    this.w1 = ent1.w;
    this.h1 = ent1.h;
    this.x2 = ent2.x;
    this.y2 = ent2.y;
    this.w2 = ent2.w;
    this.h2 = ent2.h;

    if(this.x2 >= this.w1 + this.x1 || this.x1 >= this.w2 + this.x2 || 
       this.y2 >= this.h1 + this.y1 || this.y1 >= this.h2 + this.y2){
        return false;
    }
    return true;
};

/************************
 * object collision
 * returns true or false
************************/

function collison(x1, y1, w1, h1, x2, y2, w2, h2){
    if(x2 >= w1 + x1 || x1 >= w2 + x2 || y2 >= h1 + y1 || y1 >= h2 + y2){
        return false;
    }
    return true;
}

/*****************************
 * entity collision detection
*****************************/

function EnableEntityCollision(){
    let obj1;
    let obj2;

    // reset collision state of all objects
    for(let i = 0; i < workspace.length; i++){
        workspace[i].hit = false;
    }

    // start checking for collisions
    for(let i = 0; i < workspace.length; i++){
        obj1 = workspace[i];
        for(let j = i + 1; j < workspace.length; j++){
            obj2 = workspace[j];

            // compare object1 with object2
            if(collison(obj1.x, obj1.y, obj1.w, obj1.h, obj2.x, obj2.y, obj2.w, obj2.h)){
                obj1.hit = true;
                obj2.hit = true;
   
                // reverse velocity of both objects on x axis
                obj1.vx = Reverse(obj1.vx);
                obj2.vx = Reverse(obj2.vx);
                obj1.vy = Reverse(obj1.vy);
                obj2.vy = Reverse(obj2.vy);

                // reverse obj1 velocity by gravitySpeed - velocity and just reverse obj2 velocity 
                if(obj1.y <= obj2.y + obj2.h && obj2.y >= obj1.y - obj1.h){
                    obj1.vy = Reverse(obj1.gravityVector.y-obj1.vy);
                    obj2.y = obj2.y;
                }
                // reverse obj2 velocity by gravitySpeed - velocity and just reverse obj1 velocity 
                else if(obj2.y <= obj1.y + obj1.h && obj1.y >= obj2.y - obj2.h){
                    obj2.vy = Reverse(obj2.gravityVector.y-obj2.vy);
                    obj1.vy = obj1.vy;
                }
                // move obj position if they get stuck
                if(obj1.x > obj2.x && obj2.x < obj1.x && obj1.y > obj2.y && obj2.y < obj1.y){
                    console.log("unstuck");
                    obj1.x = obj1.x - obj2.w;
                }
            }
        }
    }
}

/********************
 * draws a grid
********************/

let DrawGrid = function(c,r,vec2,color){
    this.c = c;
    this.r = r;
    this.w = 25;
    this.h = 25;
    this.vec2 = vec2;
    this.color = color;

    for(let i = 0; i < c; i++){
        for(let j = 0; j < r; j++){
            let x = i * vec2.x;
            let y = j * vec2.y;
            
            gfx.strokeStyle = color;
            gfx.strokeRect(x,y,this.w,this.h);
        }
    }
};

/********************
 * 2d array class
 * 
 * Example:
 *
 *   let cols = 10,
 *       rows = 10,
 *   let arr = new Array2D(cols,rows);
 * 
 *   for(let i = 0;i<cols;i++){
 *       for(let j = 0;j<rows;j++){
 *           arr[i][j] = Random(0,2)
 *       }
 *   }
 * 
 * console.table(arr)
********************/

let Array2D = function(cols,rows){
    this.cols = cols;
    this.rows = rows;

    let arr = new Array(cols);

    for(let i = 0; i < arr.length; i++){
        arr[i] = new Array(rows);
    }
    return arr;
};

/************************************************************
 * GetEntityById returns the entity with the specified id
************************************************************/

let GetEntityById = function(id){
    this.id = id;

    for(i in workspace){
        if(workspace[i].id === id){
            return workspace[i];
        }
    }
};

/************************************************************
 * the Duplicate function will duplicate an entity
************************************************************/

let Duplicate = function(ent){
    let p                  = ent.position;
    let s                  = ent.size;
    let v                  = ent.velocity;
    let a                  = ent.acceleration;
    let g                  = ent.gravityVector;
    this.clone             = new Entity(p,s,v,a,g,ent.type);
    this.clone.c           = ent.c;
    this.clone.imagePath   = ent.imagePath;
};

/************************************************************
 * (Ray and Boundary are workspace objects)
 * Example:
 *     let b =  new Boundary(x1,y1,x2,y2);
 *     b.c = "orange";
 *     b.render();
************************************************************/

function Boundary(x1,y1,x2,y2){
    workspace.push(this);
    this.a     = new vector2(x1,y1);
    this.b     = new vector2(x2,y2);
    this.c     = "white"

    this.render = function(){
        gfx.beginPath();
        gfx.moveTo(this.a.x,this.a.y)
        gfx.lineTo(this.b.x,this.b.y);
        gfx.strokeStyle = this.c;
        gfx.stroke();
    }
}

/************************************************************
 * Ray class (Ray and Boundary are workspace objects)
 * Example:
//////////////////////////////////////////////
//            GLOBAL VARS/FUNCS             //
//////////////////////////////////////////////
const ray  = new Ray(100, 200, 1, 0);
const wall = new Boundary(300, 100, 300, 300);

let pp = new vector2(0, 0),
    ps = new vector2(3, 3),
    pv = new vector2(0, 0),
    pa = new vector2(0, 0),
    pg = new vector2(0, 0);

const point = new Entity(pp, ps, pv, pa, pg, "circle");
point.c     = rgba(150, 50, 50, 1.0);
//////////////////////////////////////////////
//                GAME LOOP                 //
//////////////////////////////////////////////
window.onload = new RecurringTimer(function(){
    Background("Black");
    wall.render();
    ray.render();
    ray.setDirection(mouseX, mouseY);

    let pt = ray.cast(wall);

    if(pt){
        point.x = pt.x;
        point.y = pt.y;

        point.render();
    }else{ return }
}, 0);
************************************************************/

function Ray(x,y,d1,d2){
    workspace.push(this);
    this.pos = new vector2(x,y);
    this.dir = new vector2(d1,d2);
    this.c = "white";

    this.x = this.pos.x;
    this.y = this.pos.y;

    this.setDirection = function(x,y){
        this.dir.x = x - this.pos.x;
        this.dir.y = y - this.pos.y;
        this.dir.normalize();
    }

    this.render = function(){
        gfx.save();
        gfx.translate(this.pos.x,this.pos.y);
        gfx.beginPath();
        gfx.moveTo(0,0)
        gfx.lineTo(this.dir.x * 10,this.dir.y * 10);
        gfx.strokeStyle = this.c;
        gfx.stroke();
        gfx.restore();
    };

    this.cast = function(boundary){
        const x1 = boundary.a.x;
        const y1 = boundary.a.y;
        const x2 = boundary.b.y;
        const y2 = boundary.b.y;

        const x3 = this.pos.x;
        const y3 = this.pos.y;
        const x4 = this.pos.x + this.dir.x;
        const y4 = this.pos.y + this.dir.y;

        const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

        if(den == 0){
            return;
        }

        const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
        const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;

        if(t > 0 && t < 1 && u > 0){
            let pt = new vector2(0,0);

            pt.x = x1 + t * (x2 - x1);
            pt.y = y1 + t * (y2 - y1);

            return pt;
        }else{
            return;
        }

    };
}

/************************************************
 * a basic function to create a rectangle.
************************************************/

let Rect = function(p,s,c){
    workspace.push(this);
    
    this.p = new vector2(0,0);
    this.s = new vector2(10,10);
    this.x = p.x;
    this.y = p.y;
    this.w = s.x;
    this.h = s.y;
    this.c = c;
    
    this.render = function(){
    	gfx.fillStyle = c;
    	gfx.fillRect(this.x,this.y,this.w,this.h);
    }
    
    this.destroy = function(){
        let index = workspace.indexOf(this);
        workspace.splice(index,1);

    	gfx.fillStyle = rgba(255,255,255,0.0);
    	gfx.clearRect(this.x,this.y,this.w,this.h);
    }
}

/************************************************
 * create a game object using the Entity() class
************************************************/

let Entity = function(vecP,vecS,vecV,vecA,vecG,type,imagePath){ // types: "rectangle", "circle", "line"
    workspace.push(this);

    this.hit  = false;this.vecP = vecP; this.vecS      = vecS;this.vecG = vecG;
    this.vecV = vecV;this.vecA  = vecA; this.imagePath = imagePath;
    this.imagePattern; // leave this as undefined if you do not want an image pattern
    
    this.position = vecP;      // position vector
    this.x = this.position.x;
    this.y = this.position.y;
    vecP.x = this.x;
    vecP.y = this.y;
    
    this.size = vecS;          // size vector
    this.w = this.size.x;
    this.h = this.size.y;
    vecS.x = this.w;
    vecS.y = this.h;
    
    this.velocity = vecV;      // velocity vector
    this.vx = vecV.x;
    this.vy = vecV.y;
    vecV.x  = this.vx;
    vecV.y  = this.vy;

    this.acceleration = vecA;  // acceleration vector
    this.ax = vecA.x;
    this.ay = vecA.y;
    vecA.x  = this.ax;
    vecA.y  = this.ay;

    this.gravityVector = vecG; // gravity vector
    this.gravity       = vecG.x;
    this.gravitySpeed  = vecG.y;
    vecG.x             = this.gravity;
    vecG.y             = this.gravitySpeed;
    
    this.ShadowColor;
    this.ShadowBlur;
    this.c    = "grey";                      // color
    this.r    = 70;                          // radius
    this.m    = Math.pow(1.5,this.size.x/3); // mass value (scales by size)
    this.f    = 0.99;                        // friction value
    this.id   = Random(1,Math.pow(5,20));    // entity id
    this.hp   = 100;                         // health points
    this.rotation = 0;                       // entitys rotation angle
    this.type = type;                        // entity type (rectangle, circle, line)
    /******************************************
     * draw your entity by calling ent.render()
    ******************************************/

    this.render = function(){
        if(type == "rectangle" && this.imagePattern == undefined){
            if(imagePath){
                gfx.save();
                let image = new Image();
                image.src = imagePath;
                gfx.shadowColor = this.ShadowColor;
                gfx.shadowBlur = this.ShadowBlur;
                gfx.fillRect(this.x,this.y,this.w,this.h);
                gfx.drawImage(image,this.x,this.y,this.w,this.h);
                gfx.restore();
            }else{
                gfx.save();
                gfx.shadowColor = this.ShadowColor;
                gfx.shadowBlur = this.ShadowBlur;
                gfx.fillStyle = this.c;
                gfx.fillRect(this.x,this.y,this.w,this.h);
                gfx.restore();
            }
        }
        if(type == "rectangle" && this.imagePattern == "repeat"){
            gfx.save();
            let image = new Image();
            image.src = imagePath;
            gfx.shadowColor = this.ShadowColor;
            gfx.shadowBlur = this.ShadowBlur;
            let ptrn = gfx.createPattern(image, "repeat");
            gfx.fillStyle = ptrn;
            gfx.fillRect(this.x,this.y,this.w,this.h);
            gfx.restore();
        }
        if(type == "circle" && this.imagePattern == undefined){
            if(imagePath){
                gfx.save();
                let image = new Image();
                image.src = imagePath;
                gfx.shadowColor = this.ShadowColor;
                gfx.shadowBlur = this.ShadowBlur;
                gfx.beginPath();
                gfx.arc(this.x,this.y,this.w,this.h,this.r,0,2*Math.PI,false);
                gfx.fill();
                gfx.drawImage(image,this.x,this.y,this.w,this.h);
                gfx.restore();
            }else{
                gfx.shadowColor = this.ShadowColor;
                gfx.shadowBlur = this.ShadowBlur;
                gfx.beginPath();
                gfx.arc(this.x,this.y,this.w,this.h,this.r,0,2*Math.PI,false);
                gfx.fillStyle = this.c;
                gfx.fill();
            }
        }
        if(type == "line"){
            gfx.shadowColor = this.ShadowColor;
            gfx.shadowBlur = this.ShadowBlur;
            gfx.beginPath();
            gfx.moveTo(this.x,this.y);
            gfx.lineTo(this.w,this.h);
            gfx.stroke();
            gfx.strokeStyle = this.c;
        }
    };

    /*************************************************
     * destroy an entity by calling ent.destroy()
    *************************************************/
	
    this.destroy = function(){ 
        this.hit = false;
        let index = workspace.indexOf(this);
        workspace.splice(index,1);

        if(type == "rectangle"){
            gfx.shadowColor = rgba(0,0,0,0.0);
            gfx.shadowBlur = 0;
            gfx.fillStyle = rgba(0,0,0,0.0);
            gfx.fillRect(this.x,this.y,this.w,this.h);
        }
        if(type == "circle"){
            gfx.shadowColor = rgba(0,0,0,0.0);
            gfx.shadowBlur = 0;
            gfx.fillStyle = rgba(0,0,0,0.0);
            gfx.beginPath();
            gfx.arc(this.x,this.y,this.w,this.h,this.r,0,2*Math.PI,false);
        }
        if(type == "line"){
            gfx.shadowColor = rgba(0,0,0,0.0);
            gfx.shadowBlur = 0;
            gfx.beginPath();
            gfx.moveTo(this.x,this.y);
            gfx.lineTo(this.w,this.h);
            gfx.stroke();
            gfx.strokeStyle = rgba(0,0,0,0.0);
        }
    };

    /*************************************************
     * erase an entity by calling ent.erase()
    *************************************************/
	
    this.erase = function(){ 
        this.c = rgba(0,0,0,0.0);
        gfx.fillRect(this.x,this.y,this.w,this.h);
    };

    /*************************************************
     * rotates entity by the specified angle (degrees)
    *************************************************/

    this.rotate = function(angle){
        this.rotation = angle;

        function incrementAngle(){
            this.rotation++;
            if(this.rotation > 360){
                this.rotation = 0;
            }
        }

        if(type == "rectangle" && this.imagePattern == undefined){
            if(imagePath){
                incrementAngle();
                gfx.save();
                gfx.translate(this.x+this.w/2,this.y+this.h/2);
                gfx.rotate(convertToRadians(this.rotation));
                gfx.translate(-(this.x+this.w/2),-(this.y+this.h/2));
                let image = new Image();
                image.src = imagePath;
                gfx.shadowColor = this.ShadowColor;
                gfx.shadowBlur = this.ShadowBlur;
                gfx.fillRect(this.x,this.y,this.w,this.h);
                gfx.drawImage(image,this.x,this.y,this.w,this.h);
                gfx.restore();
                
            }else{
                incrementAngle();
                gfx.save();
                gfx.translate(this.x+this.w/2,this.y+this.h/2);
                gfx.rotate(convertToRadians(this.rotation));
                gfx.translate(-(this.x+this.w/2),-(this.y+this.h/2));
                gfx.shadowColor = this.ShadowColor;
                gfx.shadowBlur = this.ShadowBlur;
                gfx.fillStyle = this.c;
                gfx.fillRect(this.x,this.y,this.w,this.h);
                gfx.restore();
            }
        }
        if(type == "rectangle" && this.imagePattern == "repeat"){
            incrementAngle();
            gfx.save();
            gfx.translate(this.x+this.w/2,this.y+this.h/2);
            gfx.rotate(convertToRadians(this.rotation));
            gfx.translate(-(this.x+this.w/2),-(this.y+this.h/2));
            let image = new Image();
            image.src = imagePath;
            gfx.shadowColor = this.ShadowColor;
            gfx.shadowBlur = this.ShadowBlur;
            const ptrn = gfx.createPattern(image, "repeat");
            gfx.fillStyle = ptrn;
            gfx.fillRect(this.x,this.y,this.w,this.h);
            gfx.restore();
        }
        if(type == "circle"){
            incrementAngle();
            gfx.save();
            gfx.translate(this.x+this.w/2,this.y+this.h/2);
            gfx.rotate(convertToRadians(this.rotation));
            gfx.translate(-(this.x+this.w/2),-(this.y+this.h/2));
            gfx.shadowColor = this.ShadowColor;
            gfx.shadowBlur = this.ShadowBlur;
            gfx.beginPath();
            gfx.arc(this.x,this.y,this.w,this.h,this.r,0,2*Math.PI,false);
            gfx.fillStyle = this.c;
            gfx.fill();
            gfx.restore();
        }
        if(type == "line"){
            incrementAngle();
            gfx.stroke();
            gfx.strokeStyle = rgba(0,0,0,1.0);
            gfx.save();
            gfx.translate(this.x+this.w/2,this.y+this.h/2);
            gfx.rotate(convertToRadians(this.rotation));
            gfx.translate(-(this.x+this.w/2),-(this.y+this.h/2));
            gfx.shadowColor = this.ShadowColor;
            gfx.shadowBlur = this.ShadowBlur;
            gfx.beginPath();
            gfx.moveTo(this.x,this.y);
            gfx.lineTo(this.w,this.h);
            gfx.stroke();
            gfx.strokeStyle = this.c;
            gfx.restore();
        }
    };

    /*****************************************************
     * quickly duplicate an entity by calling ent.dupe()
    *****************************************************/

    this.dupe = function(){
        p                 = this.position;
        s                 = this.size;
        v                 = this.velocity;
        a                 = this.acceleration;
        g                 = this.gravityVector;
        let clone         = new Entity(p,s,v,a,g,this.type);
        clone.c           = this.c; clone.imagePath = imagePath;
        return clone;
    };

    /***********************************************
     * apply gravity by calling ent.applyGravity()
    ***********************************************/

    this.applyGravity = function(){
        this.gravityVector.y += this.gravityVector.x;
        this.x               += this.vx;
        this.y               += this.vy + this.gravityVector.y;
    };

    /*****************************************************************
     * ent.getDistance(vec2) returns the distance between two entitys
    *****************************************************************/

    this.getDistance = function(vec2){
        this.vec2 = vec2;

        let a = this.x - vec2.x;
        let b = this.y - vec2.y;

        return Math.sqrt(a*a + b*b);
    };

    /*****************************************************************
     * ent.getForce(ent) returns the g-force between two entitys
    *****************************************************************/

    this.getForce = function(m2){
        this.m2 = m2;

        r = this.getDistance(m2.position);
        G = g_constant;
        F = (G*this.m*m2.m)/(r**2);

        num = F.toFixed(2);
        return parseFloat(num);
    };

    /***************************
     * apply force to entitys
    ***************************/

    this.applyForce = function(force){
        this.acceleration = force;
    };

    /**********************************************************************
     * check if an entity hits a border of the canvas
     * note: these returns true or false
    **********************************************************************/

    this.hitTop = function(){ //--top
        let top = 0;
        if(this.y <= top){
            return true;
        }else{
            return false;
        }
    };

    this.hitBottom = function(){ //--bottom
        let bottom = gameH;
        if(this.y >= bottom - this.h){
            return true;
        }else{
            return false;
        }
    };

    this.hitLeftSide = function(){ //--left
        let side = 0;
        if(this.x <= side){
            return true;
        }else{
            return false;
        }
    };

    this.hitRightSide = function(){ //--right
        let side = gameW - this.w ;
        if(this.x >= side){
            return true;
        }else{
            return false;
        }
    };

    /*******************************************
     * to enable borders call ent.enableWalls()
    *******************************************/

    this.enableWalls = function(){
        if(this.hitBottom()){
            this.vy -= 1.5;
            this.y = gameH-this.h;
        }
        if(this.hitTop()){
            this.vy += 0.9;
        }
        if(this.hitLeftSide()){
            this.vx += 0.9;
        }
        if(this.hitRightSide()){
            this.vx -= 0.9;
        }
    };

    /******************************************
     * updates position, velocity and friction
    ******************************************/

    this.updatePosition = function(){
        //update velocity
        this.vx += this.ax;
        this.vy += this.ay;
    
        //cheat's friction (friction = 0.97)
        this.vx *= this.f;
        this.vy *= this.f;
    
        //update position
        this.x += this.vx;
        this.y += this.vy;
    };

    this.updateVectorPosition = function(){
        this.velocity.add(this.acceleration);
        this.position.add(this.velocity);
        this.vx *= this.f;
        this.vy *= this.f;
        this.acceleration.set(0,0);
    };

    /*******************************************************
     * ent.wander() will make it randomly wander x & y axis
    *******************************************************/

    this.wander = function(){
        this.newPos = new vector2(Random(-8,8),Random(-8,8));
        let rand = Random(1,50);

        if(this.gravity != 0 && this.x != this.newPos.x || this.y != this.newPos.y){
            if(rand === 1){
                this.vx += 0.1;
            }
            if(rand === 2){
                this.vx -= 0.1;
            }
            if(rand === 3){
                this.vy += 0.1;
            }
            if(rand === 4){
                this.vy -= 0.1;
            }
        }
    };

    /*********************************************************
     * ent.moveRandom() will make it randomly move x & y axis
    *********************************************************/

    this.moveRandom = function(){
        let newPos = new vector2(Random(-8,8),Random(-8,8));
        let rand = Random(1,45);

        if(this.x != newPos.x || this.y != newPos.y){
            if(rand === 1){
                /*X:*/ this.x = this.x + newPos.x; /*Y:*/ this.y = this.y + newPos.y;
            }
            if(rand === 2){
                /*X:*/ this.x = this.x - newPos.x; /*Y:*/ this.y = this.y - newPos.y;
            }
        }
    };
};