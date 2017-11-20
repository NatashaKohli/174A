class Tutorial_Animation extends Scene_Component  // An example of a Scene_Component that our class Canvas_Manager can manage.  Like most, this one draws 3D shapes.
{ constructor( context )
    { super( context );
      var shapes = { 'triangle'        : new Triangle(),                            // At the beginning of our program, instantiate all shapes we plan to use,
                     'strip'           : new Square(),                              // each with only one instance in the graphics card's memory.
                     'pyramid'           : new Pyramid(),
                     'bad_tetrahedron' : new Tetrahedron( false ),                  // For example we would only create one "cube" blueprint in the GPU, but then 
                     'tetrahedron'     : new Tetrahedron( true ),                   // re-use it many times per call to display to get multiple cubes in the scene.
                     'windmill'        : new Windmill( 10 ) };
      this.submit_shapes( context, shapes );
      
       // Place the camera, which is stored in a scratchpad for globals.  Secondly, setup the projection:  The matrix that determines how depth is treated.  It projects 3D points onto a plane.
      Object.assign( context.globals.graphics_state, { camera_transform: Mat4.translation([ 0, 0,-25 ]), projection_transform: Mat4.perspective( Math.PI/4, context.width/context.height, .1, 1000 ) } );
      
      // *** Materials: *** Declare new ones as temps when needed; they're just cheap wrappers for some numbers.  1st parameter:  Color (4 floats in RGBA format),
      // 2nd: Ambient light, 3rd: Diffuse reflectivity, 4th: Specular reflectivity, 5th: Smoothness exponent, 6th: Optional texture object, leave off for un-textured.
      Object.assign( this, { purplePlastic: context.get_instance( Phong_Model  ).material( Color.of( .9,.5,.9, 1 ), .4, .4, .8, 40 ),
                             greyPlastic  : context.get_instance( Phong_Model  ).material( Color.of( .5,.5,.5, 1 ), .4, .8, .4, 20 ),   // Smaller exponent means 
                             blueGlass    : context.get_instance( Phong_Model  ).material( Color.of( .5,.5, 1,.2 ), .4, .8, .4, 40 ),   // a bigger shiny spot.
                             fire         : context.get_instance( Funny_Shader ).material(),
                             stars        : context.get_instance( Phong_Model  ).material( Color.of( 0,0,1,1 ), .5, .5, .5, 40, context.get_instance( "assets/stars.png" ) ) } );                             
    }

  draw_floor(graphics_state) {
    let model_transform = Mat4.identity();
    model_transform = model_transform.times(Mat4.translation(Vec.of(0, -5, 0)));
    model_transform = model_transform.times(Mat4.rotation(90, Vec.of(1, 0, 0)));
    model_transform = model_transform.times(Mat4.scale(Vec.of(10, 5, 0)));
    //model_transform = model_transform.times(Mat4.rotation(45, Vec.of(1, 0, 0)));
    this.shapes.strip.draw(graphics_state, model_transform, this.purplePlastic);
  }
    
  display( graphics_state ) { 
      this.draw_floor(graphics_state);
  }
}