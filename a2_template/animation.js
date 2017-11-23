//Global variables

//Run game
class Tutorial_Animation extends Scene_Component  // An example of a Scene_Component that our class Canvas_Manager can manage.  Like most, this one draws 3D shapes.
{ constructor( context )
    { super( context );
      var shapes = { 'triangle'        : new Triangle(),                            // At the beginning of our program, instantiate all shapes we plan to use,
                     'strip'           : new Square(),                              // each with only one instance in the graphics card's memory.
                     'cone'         : new Pyramid(),
                     'bad_tetrahedron' : new Tetrahedron( false ),                  // For example we would only create one "cube" blueprint in the GPU, but then 
                     'tetrahedron'     : new Tetrahedron( true ),                   // re-use it many times per call to display to get multiple cubes in the scene.
                     'windmill'        : new Windmill( 10 ), 
                     'cube'            : new Cube(),
                     'sphere'          : new Subdivision_Sphere( 4 )};
      this.submit_shapes( context, shapes );
      
       // Place the camera, which is stored in a scratchpad for globals.  Secondly, setup the projection:  The matrix that determines how depth is treated.  It projects 3D points onto a plane.
      Object.assign( context.globals.graphics_state, { camera_transform: Mat4.translation([ 0, 0,-25 ]), projection_transform: Mat4.perspective( Math.PI/4, context.width/context.height, .1, 1000 ) } );
      
      // *** Materials: *** Declare new ones as temps when needed; they're just cheap wrappers for some numbers.  1st parameter:  Color (4 floats in RGBA format),
      // 2nd: Ambient light, 3rd: Diffuse reflectivity, 4th: Specular reflectivity, 5th: Smoothness exponent, 6th: Optional texture object, leave off for un-textured.
      Object.assign( this, { 
        purplePlastic: context.get_instance( Phong_Model  ).material( Color.of( .9,.5,.9, 1 ), .4, .4, .8, 40 ),
        //greyPlastic  : context.get_instance( Phong_Model  ).material( Color.of( .5,.5,.5, 1 ), .4, .8, .4, 20 ),   // Smaller exponent means 
        //blueGlass    : context.get_instance( Phong_Model  ).material( Color.of( .5,.5, 1,.2 ), .4, .8, .4, 40 ),   // a bigger shiny spot.
        //fire         : context.get_instance( Funny_Shader ).material(),
        stars        : context.get_instance( Phong_Model  ).material( Color.of( 0,0,1,1 ), .5, .5, .5, 40, context.get_instance( "assets/stars.png" ) ),
        fur: context.get_instance( Phong_Model  ).material( Color.of( .3,.3,.1,1 ), .2, 1, 1, 40, context.get_instance( "assets/bear.jpg" ) ),
        yellow: context.get_instance( Phong_Model ).material( Color.of( .8, .8, .3,  1 ), .2, 1, .7, 40 ),  // Call material() on the Phong_Shader,
        brown:  context.get_instance( Phong_Model ).material( Color.of( .3, .3, .1,  1 ), .2, 1,  1, 40 ),
        brown2:  context.get_instance( Phong_Model ).material( Color.of( .4, .26, .13,  1 ), 1, .7,  1, 40 ),  // which returns a special-made "material" 
        red:    context.get_instance( Phong_Model ).material( Color.of(  1,  0,  0, .9 ), .1, .7, 1, 40 ),  // (a JavaScript object)
        green:  context.get_instance( Phong_Model ).material( Color.of(  0, .5,  0,  1 ), .1, .7, 1, 40 ),
        blue:   context.get_instance( Phong_Model ).material( Color.of(  0,  0,  1, .8 ), .1, .7, 1, 40 ),
        silver: context.get_instance( Phong_Model ).material( Color.of( .8, .8, .8,  1 ),  0,  1, 1, 40 ) } 
      );    
                            
    }

  draw_floor(graphics_state) {
    let rotate = Math.PI/2;
    let model_transform = Mat4.identity();
    model_transform = model_transform.times(Mat4.translation(Vec.of(0, -2.8, 0)));
    model_transform = model_transform.times(Mat4.rotation(rotate, Vec.of(1, 0, 0)));
    model_transform = model_transform.times(Mat4.scale(Vec.of(10, 5, 0)));
    //model_transform = model_transform.times(Mat4.rotation(45, Vec.of(1, 0, 0)));
    this.shapes.strip.draw(graphics_state, model_transform, this.purplePlastic);
  }

  draw_body(graphics_state) {
    let jump = (Math.sin(graphics_state.animation_time/200)) * 0.25;

    let model_transform = Mat4.identity();
    model_transform = model_transform.times(Mat4.translation(Vec.of(0, jump, 0)));
    model_transform = model_transform.times(Mat4.scale(Vec.of(1.2, 1.5, 1)));
    this.shapes.sphere.draw(graphics_state, model_transform, this.fur);
    model_transform = model_transform.times(Mat4.scale(Vec.of(1/1.2, 1/1.5, 1)));
    return model_transform;
  }

  draw_head(graphics_state, model_transform) {
    model_transform = model_transform.times(Mat4.translation(Vec.of(0, 2, 0)));
    model_transform = model_transform.times(Mat4.scale(Vec.of(1.2, 1, 1)));
    this.shapes.sphere.draw(graphics_state, model_transform, this.fur);
    model_transform = model_transform.times(Mat4.scale(Vec.of(1/1.2, 1, 1)));
    return model_transform;
  }

  draw_ear(graphics_state, model_transform, opposite) {
    if (opposite)
      model_transform = model_transform.times(Mat4.translation(Vec.of(0.75, 0.9, 0)));
    else 
      model_transform = model_transform.times(Mat4.translation(Vec.of(-0.75, 0.9, 0)));
    model_transform = model_transform.times(Mat4.scale(Vec.of(0.4, 0.3, 0.3)));
    this.shapes.sphere.draw(graphics_state, model_transform, this.fur);
  }

  draw_hat(graphics_state, model_transform) {
    model_transform = model_transform.times(Mat4.translation(Vec.of(0, 1.45, 0)));
    model_transform = model_transform.times(Mat4.scale(Vec.of(0.3, 0.5, 0.3)));
    this.shapes.cone.draw(graphics_state, model_transform, this.stars);
  }

  draw_arm(graphics_state, model_transform, opposite) {
    let X_TOP_ARM = 1;
    let rotate = 0.87;
    let movement_u = (Math.sin(graphics_state.animation_time/200)) * 0.3;
    let movement_l = (Math.sin(graphics_state.animation_time/200)+3) * 0.25;

    if (opposite) {
      X_TOP_ARM *= -1;
      rotate *= -1;
      movement_u *= -1;
      movement_l *= -1;
    }

    //top of arm
    model_transform = model_transform.times(Mat4.translation(Vec.of(X_TOP_ARM , 0.7, 0.3)));
    model_transform = model_transform.times(Mat4.rotation(rotate, Vec.of(0, 0, 1)));
    model_transform = model_transform.times(Mat4.rotation(movement_u, Vec.of(0, 0, 1)));
    model_transform = model_transform.times(Mat4.translation(Vec.of(0, -0.45, 0)));
    model_transform = model_transform.times(Mat4.scale(Vec.of(0.25, 0.4, 0.25)));
    this.shapes.sphere.draw(graphics_state, model_transform, this.fur);

    //bottom of arm
    model_transform = model_transform.times(Mat4.scale(Vec.of(1/0.25, 1/0.5, 1/0.25)));
    model_transform = model_transform.times(Mat4.translation(Vec.of(0 , -0.4, 0)));
    model_transform = model_transform.times(Mat4.rotation(movement_l, Vec.of(0, 0, 1)));
    model_transform = model_transform.times(Mat4.translation(Vec.of(0 , -0.45, 0)));
    model_transform = model_transform.times(Mat4.scale(Vec.of(0.25, 0.4, 0.25)));
    this.shapes.sphere.draw(graphics_state, model_transform, this.fur);

    //paw
    model_transform = model_transform.times(Mat4.scale(Vec.of(1/0.25, 1/0.5, 1/0.25)));
    model_transform = model_transform.times(Mat4.translation(Vec.of(0 , -0.65, 0)));
    model_transform = model_transform.times(Mat4.scale(Vec.of(0.2, 0.2, 0.2)));
    this.shapes.sphere.draw(graphics_state, model_transform, this.fur);
  }

  draw_leg(graphics_state, model_transform, opposite) {
    let X_TOP_LEG = 0.5;
    let movement_u = (Math.sin(graphics_state.animation_time/200) + 1) * 0.5;

    if (opposite) {
      X_TOP_LEG *= -1;
    }

    //top of leg
    model_transform = model_transform.times(Mat4.translation(Vec.of(X_TOP_LEG, -1.7, 0)));
    model_transform = model_transform.times(Mat4.scale(Vec.of(0.25, 0.35, 0.25)));
    this.shapes.sphere.draw(graphics_state, model_transform, this.fur);

    //bottom of leg
    model_transform = model_transform.times(Mat4.scale(Vec.of(1/0.25, 1/0.35, 1/0.25)));
    model_transform = model_transform.times(Mat4.translation(Vec.of(0, -0.25, 0)));
    model_transform = model_transform.times(Mat4.rotation(movement_u, Vec.of(1, 0, 0)));
    model_transform = model_transform.times(Mat4.translation(Vec.of(0, -0.25, 0)));
    model_transform = model_transform.times(Mat4.scale(Vec.of(0.25, 0.35, 0.25)));
    this.shapes.sphere.draw(graphics_state, model_transform, this.fur);
    //model_transform = model_transform.times(Mat4.scale(Vec.of(1/0.25, 1/0.5, 1/0.25)));
    //this.draw_shoe(graphics_state, model_transform, opposite);
  }

  draw_shoe(graphics_state, model_transform, opposite) {
    let X_SHOE = 0.1;
    model_transform = model_transform.times(Mat4.translation(Vec.of(X_SHOE, -0.5, 0)));
    model_transform = model_transform.times(Mat4.scale(Vec.of(0.3, 0.2, 0.3)));
    this.shapes.cube.draw(graphics_state, model_transform, this.stars);
  }

  draw_bear(graphics_state) {
    //BODY
    let model_transform = this.draw_body(graphics_state);
    let base = model_transform;

    //HEAD
    model_transform = this.draw_head(graphics_state, model_transform);
    this.draw_ear(graphics_state, model_transform, true);
    this.draw_ear(graphics_state, model_transform, false);
    this.draw_hat(graphics_state, model_transform);

    //ARMS
    model_transform = base;
    this.draw_arm(graphics_state, model_transform, true);
    this.draw_arm(graphics_state, model_transform, false);

    //LEGS
    this.draw_leg(graphics_state, model_transform, true);
    this.draw_leg(graphics_state, model_transform, false);

  }
    
  display( graphics_state ) { 
    graphics_state.lights = [ new Light( Vec.of(  30,  30,  34, 1 ), Color.of( 0, 0, 0, 1 ), 10 ),
    new Light( Vec.of( 30, 30, 34, 0 ), Color.of( 1, 1, 1, 1 ), 10    ) ];

    this.draw_floor(graphics_state);
    this.draw_bear(graphics_state);
  }
}