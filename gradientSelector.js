var gradients = [];
(function(){
    window.addEventListener("load", function(){
        var ins = document.getElementsByTagName("input");
        for(var i=0;i<ins.length;i++){
            if(ins[i].getAttribute("type")== "gradient"){
                new GradientInput(ins[i]);
            }
        }
    });
    function triggerEvent(object, eventName, options) {
        var event; // The custom event that will be created

        if (document.createEvent) {
            event = document.createEvent("HTMLEvents");
            event.initEvent(eventName, true, true);
        } else {
            event = document.createEventObject();
            event.eventType = eventName;
        }

        event.eventName = eventName;
        if(options){
            for(key in options){
                event[key]=options[key];
            }
        }
        if (document.createEvent) {
            object.dispatchEvent(event);
        } else {
            object.fireEvent("on" + event.eventType, event);
        }
    }
    function lerpColor(col1, col2, s){
        return {r:Math.round(col1.r*(1-s) + col2.r*s),
                g:Math.round(col1.g*(1-s) + col2.g*s),
                b:Math.round(col1.b*(1-s) + col2.b*s)}
    }
    function color(grey){
        return {r:grey, g:grey, b:grey};
    }
    function color3(red, green, blue){
        return {r:red, g:green, b:blue};
    }
    function randomColor(){
        return color3(Math.floor(Math.random()*256),
                    Math.floor(Math.random()*256),
                    Math.floor(Math.random()*256));
    }
    function invert(color){
        return {r:(255-color.r), g:(255-color.g), b:(255-color.b)};
    }
    function getRGB(col){
        return "rgb("+col.r+", "+col.g+", "+col.b+")";
    }
    function GradientMarker(ctx, width, height, pallet,radius, params){
        this.radius=radius;
        this.width = width;
        this.heigth = height;
        this.ctx=ctx;
        this.color=(params.color) ? params.color : randomColor();
        this.position=('position' in params) ? params.position : Math.random();
        this.coords = {cx:this.position*width + 3*this.radius, cy:this.radius, py:0};
        this.coords.py=this.coords.cy +  this.radius*Math.sqrt(2);
        this.locked = (params.locked) ? true : false;
        this.active = false;
        this.pallet=pallet;
        this.draw = function(selected){
            this.ctx.beginPath();
            this.ctx.moveTo(this.coords.cx, this.coords.py);
            this.ctx.arc(this.coords.cx, this.coords.cy, this.radius, 3/4*Math.PI, 1/4 * Math.PI, false);
            this.ctx.lineTo(this.coords.cx, this.coords.py);
            this.ctx.fillStyle = (selected) ? '#DDD':'#FFF';
            this.ctx.fill();
            this.ctx.lineWidth = 2;
            this.ctx.strokeStyle = '#555';
            this.ctx.lineCap = 'round';
            this.ctx.stroke();
            this.ctx.beginPath();
            
            this.ctx.arc(this.coords.cx, this.coords.cy, this.radius*2/3, 0, 2*Math.PI, false);
            this.ctx.fillStyle = getRGB(this.color);
            this.ctx.fill();
            this.ctx.lineWidth = 2;
            this.ctx.strokeStyle = '#555';
            this.ctx.lineCap = 'round';
            this.ctx.stroke();
            
        };
        this.setPosition = function(pos){
            this.position=pos;
            this.coords = {cx:this.position*width + 3*this.radius, cy:this.radius, py:0};
            this.coords.py=this.coords.cy +  this.radius*Math.sqrt(2);
        }

            
    }
    function insertAfter(elementToInsert,element){
        element.parentElement.insertBefore(elementToInsert, element.nextSibling);
    }

    function getMousePos(_canvas, evt) {
        var rect = _canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    }
    Array.prototype.swap = function (x,y) {
    var b = this[x];
    this[x] = this[y];
    this[y] = b;
    return this;
    }
    function GradientInput(element){
        
        var _self=this;
        var offset=10;
        this.offset=10;
        if(!element.style.width)
            element.style.width="276px";
        this.width = element.offsetWidth - offset*6;
        if(!element.style.height)
        element.style.height="64px";
        this.height=element.offsetHeight-offset*2;
        this.lineColor=(element.style.color) ? element.style.color : "#000";
        this.depth = element.getAttribute("depth");
        if(!this.depth)
            this.depth = 256;
        else
            this.depth=parseInt(this.depth);
        
        
        
        this.element=element;
        this.pallet=[];
        this.colors=[];
        element.style.display="none";
        this.canvas=document.createElement("CANVAS");
        this.canvas.setAttribute("width" , this.width + 6*offset);
        this.canvas.setAttribute("height", this.height + 2*offset);
        this.canvas.style.display = "block";
        insertAfter(this.canvas, element);
        
        
        this.ctx = this.canvas.getContext("2d");
        this.ctx.font="12px Arial";
        this.colorCanvas=document.createElement("CANVAS");
        this.colorCanvas.setAttribute("width" , this.width + 6*offset);
        this.colorCanvas.setAttribute("height" , this.width + 2*offset);
        insertAfter(this.colorCanvas, this.canvas);
        this.ctx2 = this.colorCanvas.getContext("2d");
        
        this.markers=[new GradientMarker(this.ctx, this.width, this.height, this.pallet,offset, {position:0,locked:true}),
                    new GradientMarker(this.ctx, this.width, this.height, this.pallet,offset, {position:1,locked:true})];
        
        this.activeMarker = 1; 
        this.markerSelected=false;
        this.colorSwatch = this.ctx2.createImageData(this.width, this.width);
        this.active=false;
        this.mouseOver=0;
        this.m={};
        
        var i = 0;
        this.editMarkerSort=function(){
            var p1=this.markers[this.activeMarker].position;
            while(1){
                if(this.activeMarker>0 && this.markers[this.activeMarker-1].position > p1){
                    this.markers.swap(this.activeMarker, this.activeMarker-1);
                    this.activeMarker--;
                }else if(this.activeMarker<this.markers.length-1 && this.markers[this.activeMarker+1].position < p1){
                    this.markers.swap(this.activeMarker, this.activeMarker+1);
                    this.activeMarker++;
                }else{
                    break;
                }
            }
        }
        this.clearBar=function(){
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
        this.drawBar=function(){
            for(var x = 0;x < this.width; x++){
                var col = this.pallet[Math.floor(this.depth*x/this.width)];
                this.ctx.beginPath();
                this.ctx.moveTo(x+3*offset, (1+Math.sqrt(2))*offset);
                this.ctx.lineTo(x+3*offset,this.height);
                this.ctx.strokeStyle=getRGB(col);
                this.ctx.stroke();
            }
            var my=((1+Math.sqrt(2))*offset+this.height)/2;
            
            this.ctx.strokeStyle=this.lineColor;
            if(this.markers.length>2){
                this.ctx.beginPath();
                this.ctx.lineWidth=(this.mouseOver==1)?5:2;
                this.ctx.moveTo(5,my-7.5);
                this.ctx.lineTo(20, my+7.5);
                this.ctx.moveTo(20,my-7.5);
                this.ctx.lineTo(5, my+7.5);
                this.ctx.stroke();
            }
            this.ctx.beginPath();
            this.ctx.lineWidth=(this.mouseOver==2)?5:2;
            this.ctx.moveTo(this.width+6*this.offset-3,my);
            this.ctx.lineTo(this.width+6*this.offset-23, my);
            this.ctx.moveTo(this.width+6*this.offset-12.5,my-10);
            this.ctx.lineTo(this.width+6*this.offset-12.5, my+10);
            this.ctx.stroke();
            
            this.ctx.lineWidth=1;
            if(this.active){
                this.drawMarkers();
            }
            
        };
        this.drawColorSelector=function(){
            var col=this.markers[this.activeMarker].color;
            this.ctx2.fillStyle=getRGB(col);
            this.ctx2.fillRect(0,0,this.colorCanvas.width, this.colorCanvas.height);
            var blue=col.b;
            for(var x = 0;x<this.width;x++){
                for(var y=0;y<this.width;y++){
                    var index=4*(x+y*this.width);
                    this.colorSwatch.data[index  ]=Math.floor((x* 256)/this.width);
                    this.colorSwatch.data[index+1]=Math.floor((y* 256)/this.width);
                    this.colorSwatch.data[index+2]=blue;
                    this.colorSwatch.data[index+3]=255;
                }
            }
            for(var y=0;y<this.width; y++){
                this.ctx2.beginPath();
                this.ctx2.moveTo(this.width+this.offset*2, this.offset+y);
                this.ctx2.lineTo(this.width+this.offset*5, this.offset+y);
                this.ctx2.strokeStyle=getRGB(color3(col.r, col.g, Math.floor((y*256)/this.width)));
                this.ctx2.stroke();
            }
            this.ctx2.putImageData(this.colorSwatch, this.offset, this.offset);
            var c={x:col.r*this.width/256+this.offset, y:col.g*this.width/256+this.offset};
            this.ctx2.beginPath();
            this.ctx2.moveTo(c.x, this.offset);
            this.ctx2.lineTo(c.x, c.y-this.offset/2);
            
            this.ctx2.moveTo(c.x, this.colorCanvas.height-this.offset);
            this.ctx2.lineTo(c.x, c.y+this.offset/2);
            this.ctx2.moveTo(this.offset, c.y);
            this.ctx2.lineTo(c.x - this.offset/2, c.y);
            this.ctx2.moveTo(c.x + this.offset/2, c.y);
            this.ctx2.lineTo(this.colorCanvas.height-this.offset, c.y);
            this.ctx2.moveTo(this.width+this.offset*2, this.offset+(col.b*this.width)/256);
            this.ctx2.lineTo(this.width+this.offset*5, this.offset+(col.b*this.width)/256);
            this.ctx2.strokeStyle=getRGB(invert(col));
            this.ctx2.stroke();
            this.ctx2.strokeRect(c.x-this.offset/2, c.y-this.offset/2, this.offset, this.offset);
            this.ctx2.strokeRect(this.width+this.offset*2, this.offset, this.offset*3, this.width);
            
        };
        this.drawMarkers=function(){
            for(var i=0;i<this.markers.length;i++){
                this.markers[i].draw(i==this.activeMarker);
            }
        }
        this.draw = function(){
            this.drawBar();
            if(this.active){
                this.drawColorSelector();
            }
        };
        this.colorMouseDown = function(e){
            var col=this.markers[this.activeMarker].color;
            var m=getMousePos(this.colorCanvas, e);
            if(m.x > this.offset && m.x < this.offset + this.width &&
            m.y > this.offset && m.y < this.offset + this.width){
                this.markers[this.activeMarker]
                    .color = color3(Math.floor(((m.x-this.offset)*256)/this.width),
                                    Math.floor(((m.y-this.offset)*256)/this.width),
                                    col.b);
                this.generatePallet(); 
                this.draw();
            }else if(m.x > this.width+this.offset*2 && m.x < this.width+this.offset*5 &&
                    m.y > this.offset && m.y < this.offset+this.width){
                this.markers[this.activeMarker]
                    .color = color3(col.r, col.g,
                                    Math.floor(((m.y-this.offset)*256)/this.width));
                this.generatePallet(); 
                this.draw();
            }  
        };
        this.mainMouseDown=function(e){
            if(this.markers.length>2 && this.m.x > 5 && this.m.x < 20 && this.m.y >this.offset && this.m.y < this.height){
                if(this.markers[this.activeMarker].locked){
                    this.markers.splice(1, 1);
                }else{
                    this.markers.splice(this.activeMarker, 1);
                    this.activeMarker--;
                }
                this.generatePallet();
                this.draw();
            }else if(this.m.x > this.width+6*this.offset-23 && this.m.x < this.width+6*this.offset-3 && this.m.y >this.offset && this.m.y < this.height){
                this.markers.push(new GradientMarker(this.ctx, this.width, this.height, this.pallet,offset,{}));
                this.activeMarker=this.markers.length-1;
                this.editMarkerSort();
                this.generatePallet();
                this.draw();
                
            }else{if(!this.active){
                    this.active=true;
                    this.colorCanvas.style.display="block";
                    this.draw();
                }else{
                    var m=getMousePos(this.canvas, e);
                    if(m.y < (1+Math.sqrt(2))*this.offset){
                        for(var i=0;i<this.markers.length;i++){
                            if(Math.abs(m.x-this.markers[i].coords.cx) < this.offset &&
                            Math.abs(m.y-this.markers[i].coords.cy) < this.offset){
                                this.activeMarker = i;
                                this.markerSelected = true;
                                this.draw();
                                break;
                            }
                        }
                    }
                }
            }
        };
        this.mainMouseMoved = function(e){
            if(this.texting){
                this.clearBar();
                this.drawBar();
                if(this.active){
                    this.drawMarkers();
                }
                this.texting=false;
                
            }
            this.m=getMousePos(this.canvas, e);
            if(e.buttons > 0 && this.markerSelected && !this.markers[this.activeMarker].locked){
                this.clearBar();
                this.markers[this.activeMarker].setPosition(Math.min(1, Math.max(0, (this.m.x-3*this.offset)/this.width)));
                this.editMarkerSort();
                this.generatePallet();
                this.drawBar();
                this.drawMarkers();
            }else{
                if(this.markers.length>2 && this.m.x > 5 && this.m.x < 20 && this.m.y >this.offset && this.m.y < this.height){
                    if(this.mouseOver != 1){
                        this.mouseOver=1;
                        this.drawBar();
                        this.dra
                    }
                    
                    setTimeout(function(){
                        if(_self.m.x > 5 && _self.m.x < 20 && _self.m.y >_self.offset && _self.m.y < _self.height){
                            var txt="Remove";
                            var w = _self.ctx.measureText(txt).width;
                            _self.ctx.fillStyle="#fff";
                            _self.ctx.fillRect(_self.m.x, _self.m.y-14, w+4, 14);
                            _self.ctx.strokeStyle="#000";
                            _self.ctx.lineWidth=1;
                            _self.ctx.strokeRect(_self.m.x, _self.m.y-14, w+4, 14);
                            _self.ctx.fillStyle="#000";
                            _self.ctx.fillText(txt, _self.m.x+2, _self.m.y-2);
                            _self.texting=true;
                        }
                    }, 600);
                }else if(this.m.x > this.width+6*this.offset-23 && this.m.x < this.width+6*this.offset-3 && this.m.y >this.offset && this.m.y < this.height){

                    if(this.mouseOver != 2){
                        this.mouseOver=2;
                        this.drawBar();
                    }
                    setTimeout(function(){
                        if(_self.m.x > _self.width+6*_self.offset-23 && _self.m.x < _self.width+6*_self.offset-3 && _self.m.y >_self.offset && _self.m.y < _self.height){
                            var txt="Add";
                            var w = _self.ctx.measureText(txt).width;
                            _self.ctx.fillStyle="#fff";
                            _self.ctx.fillRect(_self.m.x-w-4, _self.m.y-14, w+4, 14);
                            _self.ctx.strokeStyle="#000";
                            _self.ctx.strokeRect(_self.m.x-w-4, _self.m.y-14, w+4, 14);
                            _self.ctx.fillStyle="#000";
                            _self.ctx.fillText(txt, _self.m.x-w-2, _self.m.y-2);
                            this.texting=true;
                        }
                    }, 600);
                    
                }else if(this.mouseOver != 0){
                    this.mouseOver=0;
                    this.clearBar();
                    this.drawBar();
                }
            }
        }
        this.doubleClick = function(){
            if(this.active){
                this.colorCanvas.style.display="none";
                this.active=false;
                this.clearBar();
                this.drawBar();
            }else{
                this.active=true;
                this.colorCanvas.style.display="block";
                this.draw();
            }
        }
                    
                
        
        
        this.generatePallet = function(){
            var i=0;
            for(var x = 0;x < this.depth; x++){
                if(x/this.depth >= this.markers[i+1].position)
                    i ++;
                var map=(x/this.depth - this.markers[i].position)/(this.markers[i+1].position -this.markers[i].position);
                this.pallet[x] =lerpColor(this.markers[i].color, this.markers[i+1].color, map);
            }
            this.element.pallet=this.pallet;
            triggerEvent(this.element, "change", {pallet:this.pallet});
        };
        this.setPallet = function(markerData){
            this.markers=[];
            for(var i=0;i<markerData.length;i++){
                this.markers[i]= new GradientMarker(this.ctx, this.width, this.height,
                                                    this.pallet, this.offset,
                                                    {position:(i==0)? 0 : ((i==colors.length-1)? 1 : markerData[i].position),
                                                    locked:(i==0 || i==colors.length-1),
                                                    color:markerData[i].color
                                                    });
            }
        }
        this.set
        this.generatePallet(); 
        this.draw();
        this.colorCanvas.addEventListener("mousedown",function(e){
            _self.colorMouseDown(e);
        });
        this.colorCanvas.addEventListener("mousemove", function(e){
            if(e.buttons>0){
                _self.colorMouseDown(e);
            }
        });
        this.canvas.addEventListener("mousedown", function(e){
            _self.mainMouseDown(e);
        });
        this.canvas.addEventListener("mousemove", function(e){
                _self.mainMouseMoved(e);
        });
        this.canvas.addEventListener("dblclick", function(e){
            _self.doubleClick();
        });
        this.canvas.addEventListener("blur", function(e){
            _self.markerSelected=false;
        });
        this.canvas.addEventListener("mouseup", function(e){
            _self.markerSelected=false;
        });
        this.colorCanvas.addEventListener("dblclick", function(e){
            _self.doubleClick();
        });
        
                
        gradients.push(this);
    }
})();
