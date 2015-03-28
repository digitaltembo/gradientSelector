# gradientSelector
pure Javascript/Canvas gradient input item

For a project in WebGL, I needed a color pallet, a 1D texture to color my fragment shader with.
And there are a lot of gradient selectors out there, but I wanted something simple, small, and that outputted
an array of colors rather than a description of a gradient for CSS.

And this is what I have so far.

A view of the selector, maximized:

![Minimum Image](http://dijitalelefan.com/images/github/maximized.png)

And when it is collapsed: 

![Collapsed Image](http://dijitalelefan.com/images/github/minimized.png)

To the end-user, the usage is hopefully fairly intuitive?  If it is collapsed, click on it and it will maximize (to collapse it again, right now you double click, but I will be adding some onblur eventually). To add a pallet marker, click the '+' button, to remove one, click the 'x' button. To move it, click and drag, to change the color, click on the marker and drag across the color swatch.

To the developer, it should be super simple to install as well.

### Usage
_____
Usage is extremely simple. Just put the line 
```<script src="gradientSelector.js" ></script>```
anywhere in your code, and wherever you want to select a gradient, simply make an ```<input type="gradient />```.
To change the selector's size, just change the style of the input. 
To access the pallet, you can either use the pallet array that is stored in the javascript DOM representation of the input,
or you can attatch an onchange listener to the element. The event thrown in an onchange will contain the pallet.

I chose to represent colors as RGB objects like so:
```javascript
var black = {r:0, g:0, b:0};
var red   = {r:255, g:0, b:0};
```
And the pallet is in turn an array of those color objects.

### Example
____

Basically the simplest example of use would be this:
```html
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
and you can see basically this example, with a few form elements for added context while not doing to much to obfuscate the basic code, at http://digitaltembo.github.io/gradientSelector/
