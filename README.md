# gradientSelector
pure Javascript/Canvas gradient input item

For a project in WebGL, I needed a color pallet, a 1D texture to color my fragment shader with.
And there are a lot of gradient selectors out there, but I wanted something simple, small, and that outputted
an array of colors rather than a description of a gradient for CSS.

And this is what I have so far.

### Usage
_____
Usage is extremely simple. Just put the line 
```<script src="gradientSelector.js" ></script>```
anywhere in your code, and wherever you want to select a gradient, simply make an ```<input type="gradient />```.
To change the selector's size, just change the style of the input. 
To access the pallet, you can either use the pallet array that is stored in the javascript DOM representation of the input,
or you can attatch an onchange listener to the element. The event thrown in an onchange will contain the pallet.

I chose to represent colors as RGB objects like so:
```
var black = {r:0, g:0, b:0};
var red   = {r:255, g:0, b:0};
```
And the pallet is in turn an array of those color objects.

### Example
____

Basically the simplest example of use woulf be this:
```
<html>
    <head>
        <script src="gradientSelector.js" ></script>
    </head>
    <body>
        <input id="grad1" type="gradient"/>
        <script>
            document.getElementById("grad1").addEventListener("change", function(e){
                console.log(e.pallet);
            });
        </script>
    </body>
</html>
```
