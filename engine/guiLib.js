/********************************************************/
/*                     GUI OBJECTS                      */
/********************************************************/

/**************
 * TextLabel
**************/

let TextLabel = function(vector2,font,textAlign){
    this.text      = "text";    this.font = font;
    this.textAlign = textAlign; this.c    = "grey";

    this.draw = function(){
        gfx.font = font;
        gfx.fillStyle = this.c;
        gfx.textAlign = textAlign;
        gfx.fillText(this.text,vector2.x,vector2.y);
    };

    this.erase = function(){
        this.c = rgba(0,0,0,0.0);
        gfx.fillText(this.text,vector2.x,vector2.y);
    };
};

/**************
 * TextButton
**************/

let TextButton = function(vector2,vector2Size,fn){
    this.vector2     = vector2;  this.vector2Size = vector2Size;
    this.text        = "button"; this.font        = "30px Comic Sans MS";
    this.textAlign   = "center"; this.c           = "grey";

    this.clicked = function(){
        let evnt = new Event(game,"click",function(e){
            let x = e.clientX,
                y = e.clientY;

            if(Math.pow(x-vector2.x,vector2Size.y)+Math.pow(y-vector2.y,vector2Size.x) < Math.pow(vector2Size.x,vector2Size.y)){
                fn();
            }
        });
    };

    this.draw = function(){
        gfx.font = this.font;
        gfx.fillStyle = this.c;
        gfx.textAlign = this.textAlign;
        gfx.fillText(this.text,vector2.x,vector2.y);
    };

    this.erase = function(){
        this.c = rgba(0,0,0,0.0);
        gfx.fillText(this.text,vector2.x,vector2.y);
    };
};

/***************************************************
 * Frame
 * let frame = new frame(positionVector,sizeVector)
***************************************************/

let Frame = function(vector2Pos,vector2Size,imagePath){
    this.c     = "grey";
    this.vector2Pos  = vector2Pos;
    this.vector2Size = vector2Size;
    this.imagePath = imagePath;
    this.x = vector2Pos.x;
    this.y = vector2Pos.y;
    this.w = vector2Size.x;
    this.h = vector2Size.y;

    this.draw = function(){
        if(imagePath){
            console.log("drawing image...");
            gfx.save();
            let image = new Image();
            image.src = imagePath;
            gfx.fillRect(this.x,this.y,this.w,this.h);
            gfx.drawImage(image,this.x,this.y,this.w,this.h);
            gfx.restore();
        }else{
            console.log("drawing frame...");
            gfx.save();
            gfx.fillStyle = this.c;
            gfx.fillRect(this.x,this.y,this.w,this.h);
            gfx.restore();
        }
    }

    this.erase = function(){
        this.c = rgba(0,0,0,0.0);
        gfx.fillRect(vector2Pos.x,vector2Pos.y,vector2Size.x,vector2Size.y);
    };
};

/****************************************************************
 * DialogBox Example:
 * 
 * inside gameloop{
 *      dialog.draw();
 * }
 * 
 * outside gameloop{
 *     let dialog = new DialogBox(positionVector,"textColor");
 *     dialog.tl.text = "text";
 * 
 *     if(something){
 *         dialog.change("new text");
 *     }
 * }
****************************************************************/

let DialogBox = function(vec,color){
    this.text;
    this.vec       = vec;
    this.color     = color;
    this.font      = "20px Aerial";
    this.tl        = new TextLabel(vec,this.font,color);
    this.tl.text   = this.text;
    let changedVal = false;

    /*********************&
     * render dialog text
     * dialog.draw()
    **********************/

    this.draw = function(){
        this.tl.draw();
    };

    /*********************&
     * erase dialog text
     * dialog.erase()
    **********************/

    this.erase = function(){
        this.tl.erase();
    };

    /****************************
     * change dialog text
     * dialog.change("new text")
    ****************************/

    this.change = function(newText){
        this.tl      = new TextLabel(vec,this.font,color);
        this.tl.text = newText;
        changedVal   = true;
    };

    /*******************************
     * returns true if text changes
    *******************************/

    this.changed = function(){
        if(changedVal == true){
            changedVal = false;
            return true;
        }
    };
};