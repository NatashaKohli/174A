//Global variables
frame = 0;
points = 0;
start = 0;
m_playing = 0;
scene = 1;

let music = new Audio('assets/pinkandwhite_trimmed.mp3');

CAM_START_X = 7.9; 
CAM_START_Y = 14; 
CAM_START_Z = 0; 
CAM_MOVE_X = -1.45;
CAM_MOVE_Y = -2.55;
CAM_MOVE_Z = 4.3;

LOOK_START_X = 8; 
LOOK_START_Y = 11;
LOOK_MOVE_X = -1.45;
LOOK_MOVE_Y = -2;

CAM_START2_X = 0; 
CAM_START2_Y = 0; 
CAM_START2_Z = 23; 
CAM_MOVE2_Z = -0.2;

LOOK_START2_X = 0; 
LOOK_START2_Y = -2.7;
LOOK_START2_Z = -15;
LOOK_MOVE2_Y = 0.05;
LOOK_MOVE2_Z = 0.2;

SAVED_END_CZ = 0;
SAVED_END_LY = 0;
SAVED_END_LZ = 0;

A_PRESSED = false;
S_PRESSED = false;
K_PRESSED = false;
L_PRESSED = false;

DROP_A = 7;
DROP_S = 7;
DROP_K = 7;
DROP_L = 7;

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
                     'sphere'          : new Subdivision_Sphere( 4 ),
                     'text'            : new Text_Line(35),
                     'letter'            : new Text_Line(1)
                    };
      this.submit_shapes( context, shapes );
      
       // Place the camera, which is stored in a scratchpad for globals.  Secondly, setup the projection:  The matrix that determines how depth is treated.  It projects 3D points onto a plane.
      Object.assign( context.globals.graphics_state, { camera_transform: Mat4.translation([ 0, 0,-25 ]), projection_transform: Mat4.perspective( Math.PI/4, context.width/context.height, .1, 1000 ) } );
      
      // *** Materials: *** Declare new ones as temps when needed; they're just cheap wrappers for some numbers.  1st parameter:  Color (4 floats in RGBA format),
      // 2nd: Ambient light, 3rd: Diffuse reflectivity, 4th: Specular reflectivity, 5th: Smoothness exponent, 6th: Optional texture object, leave off for un-textured.
      Object.assign( this, { 
        stars        : context.get_instance( Phong_Model  ).material( Color.of( 0,0,1,1 ), .5, .5, .5, 40, context.get_instance( "assets/stars.png" ) ),
        fur: context.get_instance( Phong_Model  ).material( Color.of( .3,.3,.1,1 ), .2, 1, 1, 40, context.get_instance( "assets/bear.jpg" ) ),
        sky: context.get_instance( Phong_Model  ).material( Color.of( .96,.79,.8, 1), .5, 1, 1, 40, context.get_instance( "assets/sky.jpg" ) ),
        ground: context.get_instance( Phong_Model  ).material( Color.of( 0,0,0, 1), .5, 1, 1, 40, context.get_instance( "assets/ground.png" ) ),
        text: context.get_instance( Phong_Model  ).material( Color.of( 0,0,0, 1), .5, 1, 1, 40, context.get_instance( "assets/text.png" ) ),
        yellow: context.get_instance( Phong_Model ).material( Color.of( .93, .93, 0,  1 ), 0.5, 1, .7, 40 ),  
        brown:  context.get_instance( Phong_Model ).material( Color.of( .3, .3, .1,  1 ), .2, 1,  1, 40 ),
        red:    context.get_instance( Phong_Model ).material( Color.of(  1,  0,  0, 1 ), 0.6, .7, 1, 40 ),  
        green:  context.get_instance( Phong_Model ).material( Color.of(  0, .5,  0,  1 ), 1, .5, .5, 40 ),
        blue:   context.get_instance( Phong_Model ).material( Color.of(  0,  0,  1, 1 ), .5, .5, .5, 40 ),
        silver: context.get_instance( Phong_Model ).material( Color.of( .8, .8, .8,  1 ),  0.9,  1, 1, 40 ) } 
      );    
  
      //ADD CONTROLS
      this.controls.add("A", function() {A_PRESSED = true;}); 
      this.controls.add("S", function() {S_PRESSED = true;}); 
      this.controls.add("K", function() {K_PRESSED = true;}); 
      this.controls.add("L", function() {L_PRESSED = true;}); 
      this.controls.add("enter", function() {start = 1;});
      
    }

  draw_floor(graphics_state) {
    let rotate = Math.PI/2;
    let model_transform = Mat4.identity();
    model_transform = model_transform.times(Mat4.translation(Vec.of(0, -2.8, 0)));
    model_transform = model_transform.times(Mat4.rotation(rotate, Vec.of(1, 0, 0)));
    model_transform = model_transform.times(Mat4.scale(Vec.of(50, 45, 0)));
    this.shapes.strip.draw(graphics_state, model_transform, this.ground);
  }

  draw_sky(graphics_state) {
    let rotate = Math.PI/3;
    let model_transform = Mat4.identity();
    model_transform = model_transform.times(Mat4.translation(Vec.of(0, 20, -5)));
    model_transform = model_transform.times(Mat4.rotation(rotate, Vec.of(1, 0, 0)));
    model_transform = model_transform.times(Mat4.scale(Vec.of(45, 45, 0)));
    this.shapes.strip.draw(graphics_state, model_transform, this.sky);
  }

  draw_body(graphics_state) {
    let model_transform = Mat4.identity();

    if (scene == 1) {
      let jump = (Math.sin(graphics_state.animation_time/200)) * 0.25;
      model_transform = model_transform.times(Mat4.translation(Vec.of(0, jump, 0)));
    }
    
    else if (scene == 2) {
      let rotate = (Math.sin(graphics_state.animation_time/500)) * 0.1;
      model_transform = model_transform.times(Mat4.translation(Vec.of(0, -1.5, 0)));
      model_transform = model_transform.times(Mat4.rotation(rotate, Vec.of(0, 0, 1)));
      model_transform = model_transform.times(Mat4.translation(Vec.of(0, 1.5, 0)));
    }

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
    let rotate, movement_u, movement_l = 0;

    if (scene == 1) {
      rotate = 0.87;
      movement_u = (Math.sin(graphics_state.animation_time/200)) * 0.3;
      movement_l = (Math.sin(graphics_state.animation_time/200)+3) * 0.25;
    }

    else if (scene == 2) {
      X_TOP_ARM = 0.9;
      rotate = 3 * Math.PI/4;
      movement_u = (Math.sin(graphics_state.animation_time/500)) * 0.3;
    }

    if (opposite) {
      X_TOP_ARM *= -1;
      rotate *= -1;

      if (scene == 1) {
        movement_u *= -1;
        movement_l *= -1;
      }
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
    if (scene == 1)
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
    let movement_l = (Math.sin(graphics_state.animation_time/200) + 1) * 0.5;

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
    if (scene == 1)
      model_transform = model_transform.times(Mat4.rotation(movement_l, Vec.of(1, 0, 0)));
    model_transform = model_transform.times(Mat4.translation(Vec.of(0, -0.25, 0)));
    model_transform = model_transform.times(Mat4.scale(Vec.of(0.25, 0.35, 0.25)));
    this.shapes.sphere.draw(graphics_state, model_transform, this.fur);
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

  draw_column(graphics_state, opposite) {
    let distance = 8;
    let movement = ((graphics_state.animation_time/150) );

    if (opposite) {
      distance *= -1;
    }

    let model_transform = Mat4.identity();
    model_transform = model_transform.times(Mat4.translation(Vec.of(distance, 2.2, 0)));
    model_transform = model_transform.times(Mat4.scale(Vec.of(0.5, 5, 0.5)));
    this.shapes.cube.draw(graphics_state, model_transform, this.blue); 

    model_transform = model_transform.times(Mat4.scale(Vec.of(1/0.5, 1/10, 1/0.5)));
    model_transform = model_transform.times(Mat4.translation(Vec.of(0, 11, 0)));
    model_transform = model_transform.times(Mat4.rotation(movement, Vec.of(0, 1, 0)));
    this.shapes.cone.draw(graphics_state, model_transform, this.stars);
  }

  draw_button(graphics_state, x_loc, color) {
    let model_transform = Mat4.identity();
    model_transform = model_transform.times(Mat4.translation(Vec.of(x_loc, -2.3, 15)));
    model_transform = model_transform.times(Mat4.scale(Vec.of(0.2, 0.2, 0.2)));
    
    this.shapes.sphere.draw(graphics_state, model_transform, color);
  }

  draw_letter(graphics_state, x_loc, string) {
    let model_transform = Mat4.identity();
    model_transform = model_transform.times(Mat4.translation(Vec.of(x_loc, -2, 16)));
    model_transform = model_transform.times(Mat4.scale(Vec.of(0.2, 0.2, 0.2)));

    this.shapes.letter.set_string(string);
    this.shapes.letter.draw( graphics_state, model_transform, this.text);
  }

  drop_a(graphics_state) {
    let model_transform = Mat4.identity();
    model_transform = model_transform.times(Mat4.translation(Vec.of(-2.7, DROP_A, 15)));
    model_transform = model_transform.times(Mat4.scale(Vec.of(0.2, 0.2, 0.2)));
    this.shapes.sphere.draw(graphics_state, model_transform, this.yellow);
  }

  drop_s(graphics_state) {
    let model_transform = Mat4.identity();
    model_transform = model_transform.times(Mat4.translation(Vec.of(-1.25, DROP_S, 15)));
    model_transform = model_transform.times(Mat4.scale(Vec.of(0.2, 0.2, 0.2)));
    this.shapes.sphere.draw(graphics_state, model_transform, this.yellow);
  }

  drop_k(graphics_state) {
    let model_transform = Mat4.identity();
    model_transform = model_transform.times(Mat4.translation(Vec.of(1.25, DROP_K, 15)));
    model_transform = model_transform.times(Mat4.scale(Vec.of(0.2, 0.2, 0.2)));
    this.shapes.sphere.draw(graphics_state, model_transform, this.yellow);
  }

  drop_l(graphics_state) {
    let model_transform = Mat4.identity();
    model_transform = model_transform.times(Mat4.translation(Vec.of(2.7, DROP_L, 15)));
    model_transform = model_transform.times(Mat4.scale(Vec.of(0.2, 0.2, 0.2)));
    this.shapes.sphere.draw(graphics_state, model_transform, this.yellow);
  }

  drop_sequence(graphics_state, t) {
    if ((t > 8 && t < 11.75) || (t > 26 && t < 29.75)) {
      this.drop_a(graphics_state);
      DROP_A -= 0.045;
    }

    if ((t > 9 && t < 12.75) || (t > 27 && t < 30.75)) {
      this.drop_k(graphics_state);
      DROP_K -= 0.045;
    }

    if ((t > 11 && t < 14.05) || (t > 29 && t < 32.05)) {
      this.drop_l(graphics_state);
      DROP_L -= 0.055;
    }

    if ((t > 13 && t < 16.75) || (t > 31 && t < 34.75)) {
      this.drop_a(graphics_state);
      DROP_A -= 0.045;
    }

    if ((t > 14 && t < 17.05) || (t > 33 && t < 36.05)) {
      this.drop_s(graphics_state);
      DROP_S -= 0.055;
    }

    if ((t > 16 && t < 18.85) || (t > 34 && t < 36.85)) {
      this.drop_k(graphics_state);
      DROP_K -= 0.06;
    }

    if ((t > 17 && t < 20.75) || (t > 36 && t < 39.75)) {
      this.drop_a(graphics_state);
      DROP_A -= 0.045;
    }

    if ((t > 19 && t < 21.85) || (t > 37 && t < 39.85)) {
      this.drop_l(graphics_state);
      DROP_L -= 0.06;
    }

    if ((t > 21 && t < 24.05) || (t > 38 && t < 41.05)) {
      this.drop_k(graphics_state);
      DROP_K -= 0.055;
    }

    if ((t > 22 && t < 25.75) || (t > 39 && t < 42.75)) {
      this.drop_s(graphics_state);
      DROP_S -= 0.045;
    }

    if ((t > 24 && t < 27.75) || (t > 41 && t < 44.75)) {
      this.drop_l(graphics_state);
      DROP_L -= 0.045;
    }

  }
    
  draw_scene( graphics_state ) { 
    graphics_state.lights = [ new Light( Vec.of(  30,  30,  34, 1 ), Color.of( 0, 0, 0, 1 ), 10 ),
    new Light( Vec.of( 30, 30, 34, 0 ), Color.of( 1, 1, 1, 1 ), 10    ) ];

    let t = graphics_state.animation_time/1000;
    let c = graphics_state.camera_transform;

    if( t < 2)
      graphics_state.camera_transform = Mat4.look_at(Vec.of(7.9, 14, 0), Vec.of(8, 11, 0), Vec.of(0, 1, 0));

    if ((c[0][3] > 0 || c[1][3] > 0 || c[2][3] > -23) && t > 2 && t < 7) {
      graphics_state.camera_transform = Mat4.look_at(Vec.of(CAM_START_X + ((t-1) * CAM_MOVE_X), CAM_START_Y + ((t-1) * CAM_MOVE_Y), CAM_START_Z + ((t-1) * CAM_MOVE_Z)), 
                                                    Vec.of(LOOK_START_X + ((t-1) * LOOK_MOVE_X), LOOK_START_Y + ((t-1) * LOOK_MOVE_Y), 0), 
                                                    Vec.of(0, 1, 0));                                             
    }

    if (t > 8 && t < 44.75)
      this.drop_sequence(graphics_state, t);
    
    if (t > 45 && t < 62) {
      scene = 2;
      graphics_state.camera_transform = Mat4.look_at(Vec.of(CAM_START2_X, CAM_START2_Y, CAM_START2_Z + ((t-1) * CAM_MOVE2_Z)), 
                                                    Vec.of(LOOK_START2_X, LOOK_START2_Y + ((t-1) * LOOK_MOVE2_Y), LOOK_START2_Z + ((t-1) * LOOK_MOVE2_Z)), 
                                                    Vec.of(0, 1, 0));
    }

    let model_transform = Mat4.identity();

    this.draw_floor(graphics_state);
    this.draw_sky(graphics_state);
    this.draw_bear(graphics_state);

    this.draw_column(graphics_state, true);
    this.draw_column(graphics_state, false);

    if (A_PRESSED) {
      this.draw_button(graphics_state, -2.7, this.blue);
      if (DROP_A < -2.15 && DROP_A > -2.45)
        points += 25;
    }
    else 
      this.draw_button(graphics_state, -2.7, this.yellow);
    this.draw_letter(graphics_state, -2.36, "A");

    if (S_PRESSED) {
      this.draw_button(graphics_state, -1.25, this.blue);
      if (DROP_S < -2.15 && DROP_S > -2.45)
        points += 25;
    }
    else 
      this.draw_button(graphics_state, -1.25, this.yellow);
    this.draw_letter(graphics_state, -1.1, "S");

    if (K_PRESSED) {
      this.draw_button(graphics_state, 1.25, this.blue);
      if (DROP_K < -2.15 && DROP_K > -2.45)
        points += 25;
    }
    else 
      this.draw_button(graphics_state, 1.25, this.yellow);
    this.draw_letter(graphics_state, 1.1, "K");

    if (L_PRESSED) {
      this.draw_button(graphics_state, 2.7, this.blue);
      if (DROP_L < -2.15 && DROP_L > -2.45)
        points += 25;
    }
    else 
      this.draw_button(graphics_state, 2.7, this.yellow);
    this.draw_letter(graphics_state, 2.38, "L");

  }

  draw_opening(graphics_state) {
    let model_transform = Mat4.identity();
    model_transform = model_transform.times(Mat4.translation(Vec.of(-8, 0, 0)));
    model_transform = model_transform.times(Mat4.scale(Vec.of(0.4, 0.4, 1)));
    this.shapes.text.set_string( "Ready to play? Press enter!" );
    this.shapes.text.draw( graphics_state, model_transform, this.text);
  }

  display( graphics_state ) {
    if (!start) {
      this.draw_opening(graphics_state);
      graphics_state.animation_time = 0;
    }
    else {
    if (!m_playing) {
      music.play();
      m_playing = 1;
    }
    this.draw_scene(graphics_state);

    //Display frame rate
    let model_transform = Mat4.identity();
    model_transform = model_transform.times(Mat4.translation(Vec.of(-6.75, 5.4, 10)));
    model_transform = model_transform.times(Mat4.scale(Vec.of(0.2, 0.2, 1)));
    this.shapes.text.set_string( "Frame Rate: " + Math.round(1/(graphics_state.animation_delta_time/1000)) );
    this.shapes.text.draw( graphics_state, model_transform, this.text);

    model_transform = Mat4.identity();
    model_transform = model_transform.times(Mat4.translation(Vec.of(-6.75, 5, 10)));
    model_transform = model_transform.times(Mat4.scale(Vec.of(0.2, 0.2, 1)));
    this.shapes.text.set_string( "Animation Time: " + (graphics_state.animation_time/1000).toFixed(2) );
    this.shapes.text.draw( graphics_state, model_transform, this.text);

    model_transform = Mat4.identity();
    model_transform = model_transform.times(Mat4.translation(Vec.of(-6.75, 4.6, 10)));
    model_transform = model_transform.times(Mat4.scale(Vec.of(0.2, 0.2, 1)));
    this.shapes.text.set_string( "Points: " + points );
    this.shapes.text.draw( graphics_state, model_transform, this.text);

    frame++;
    A_PRESSED = false;
    S_PRESSED = false;
    K_PRESSED = false;
    L_PRESSED = false;

    if (DROP_A < -3)
      DROP_A = 7;
    if (DROP_S < -3)
      DROP_S = 7;
      if (DROP_K < -3)
      DROP_K = 7;
    if (DROP_L < -3)
      DROP_L = 7;
    }
  }

}