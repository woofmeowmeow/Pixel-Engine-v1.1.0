# Pixel-Engine-Experimental
2d Javascript Game Engine

This is going to be the new version of pe.js after I finish everything that I have planned.

New features.

- Added a function to append the canvas to the body
  (In v1.1.0 it automatically appended the canvas to the body,
  I added another canvas that uses webgl so now I have a function to
  choose which canvas you want to draw. You can also use both if you need to). 
  Now you can simply use AppendCanvas("2d"). Or AppendCanvas("webgl") or both.

- Added some more global variables and basic functions for the webgl canvas 
  (mouseX, mouseY, GameSizeWebgl, WebglBackground).

- Fixed all the issues with the Ray class (I just uploaded an example on here of how to use ray casting. It is called example.txt).

- Fixed various bugs in the GUI and main framework.
