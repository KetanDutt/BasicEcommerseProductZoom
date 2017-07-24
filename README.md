Zoom plugin For Ecommerce Site

This code is based on jquery.etalage.min.js function to achieve the jQuery magnifying effect! Code in the ./js/jqzoom.jscourse, the code to achieve the function of no one so full of people!

At present the main functions are:

Use fade effects to zoom in and out;
Automatically rotate the picture or manually switch pictures;
Set the number of images to display as needed;
Set the size of the display picture, small picture and magnified picture;
When using this class, refer to the following specifications:

The structure of html must be:
< Div  class = " etalage_wrap " >
    < Ul  id = " etalage " >
        < Li >
            < IMG  class = " etalage_thumb_image "  the src = " http://p3.jmstatic.com/product/000/506/506658_std/506658_pop_375_500_1.jpg "  title = " First IMG " />
            < IMG  class = " etalage_big_image "  the src = " http://p3.jmstatic.com/product/000/506/506658_std/506658_pop_750_1000_1.jpg " />
        </ Li >
       	...
    </ Ul >
</ Div >
Class name and id consistent with the above, class="etalage_thumb_image"the picture is the default display of the picture, class="etalage_big_image"the picture is the mouse hover when the enlarged picture.

Css style need to be introduced./css/style.css

parameter settings:

Var _option = {
	align = left :  " left " ,				 // the current position of the display image, the image is enlarged at its opposite position 
	thumb_image_width :  300 ,		 // current display image width 
	thumb_image_height :  400 ,	 // current image displayed high 
	source_image_width :  900 ,  	 / / enlarged image width 
	source_image_height :  1200 ,	 // enlarged image of high 
	zoom_area_width :  600 , 		 // width of the display area of the enlarged image 
	zoom_area_height :  " the justify " ,// enlarge the image display area of ​​the high 
	zoom_area_distance :  10 ,      //  
	zoom_easing :  true ,           // whether to fade in the 
	description_opacity :  0.7 ,
	Small_thumbs :  3 ,			 // number of small pictures displayed 
	smallthumb_inactive_opacity :  0.4 , 	 // mask transparency when image is inactive 
	smallthumbs_position :  " bottom " ,		 // location of small image 
	show_icon :  true ,
	hide_cursor :  false ,			 // the mouse into the picture, whether hidden pointer 
	Speed :  600 ,     			 //  
	autoplay :  to true ,				 // whether to automatically play 
	autoplay_interval :  6000 , 	 // residence time when each image is automatically play 
}
And then according to their own needs to set parameters:

$ ( " #etalage " ). Zoom ({
	Zoom_area_width :  300 ,
    Autoplay_interval : 3000 ,
    Small_thumbs :  4 ,
    Autoplay :  false 
});
Of course, is still only a prototype, there are a lot of problems to be solved, such as:

No more arrows to carry out more pictures of the rotation, can only show a fixed number of pictures;
The spacing between the pictures is not a reasonable calculation, is the value of writing dead;
The right side of the enlarged picture, because there is no border value, resulting in a little more than the left side;