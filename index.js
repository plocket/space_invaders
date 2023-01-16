// Game objects and logic

const get_position = function ( obj ) {
  /** Get the relative position and dimensions of an
  *    object's `.node` as floats.
  * 
  * @param {object} obj
  * @param {HTML Node} obj.node
  * 
  * @returns {object} pos The relative position and dimensions of the object's node.
  * @returns {float} pos.left The left position relative to the parent node. Left edge = 0.
  * @returns {float} pos.right The right position relative to the parent node. Left edge = 0.
  * @returns {float} pos.top The top position relative to the parent node. Left edge = 0.
  * @returns {float} pos.bottom The bottom position relative to the parent node. Left edge = 0.
  * @returns {float} pos.width The width of the node.
  * @returns {float} pos.height The height of the node.
  * @returns {float} pos.center_x The horizontal x value of the center of the node relative to the parent.
  */

  return {
    left: obj.node.offsetLeft,
    right: obj.node.offsetLeft + obj.node.offsetWidth,
    top: obj.node.offsetTop,
    bottom: obj.node.offsetTop + obj.node.offsetHeight,
    width: obj.node.offsetWidth,
    height: obj.node.offsetHeight,
    center_x: obj.node.offsetLeft + (obj.node.offsetWidth/2),
  }
};  // Ends get_position()

const hits_screen_left = function ( obj, screen ) {
  /** Return whether or not the object's node hits the left side of the screen.
  * 
  * @param {object} obj Game object.
  * @param {HTML Node} obj.node HTML Node belonging to the game object.
  * @param {object} screen An instance of Screen. Here for consistent signature.
  * 
  * @returns {bool} Whether the left side of the object hit the left side of the screen.
  */

  let obj_pos = get_position( obj );

  // Uses the position of the object relative to its parent Screen.
  if ( obj_pos.left <= 0 ) {
    return true;
  } else {
    return false;
  }

}  // Ends hits_screen_left()


const hits_screen_right = function ( obj, screen ) {
  /** Return whether or not the object's node hits the right side of the screen.
  * 
  * @param {object} obj Game object.
  * @param {HTML Node} obj.node HTML Node belonging to the game object.
  * @param {object} screen A Screen instance.
  * @param {float} screen.width The width of the screen.
  * 
  * @returns {bool} Whether the right side of the object hit the right side of the screen.
  */

  let obj_pos = get_position( obj );

  // Uses the position of the object relative to its parent Screen.
  if ( obj_pos.right >= screen.width ) {
    return true;
  } else {
    return false;
  }

}  // Ends hits_screen_right()


// =====================
// =====================
// Classes
// =====================
// =====================

class Screen {
  constructor ( selector ) {
    this.node = document.body.querySelector( selector );
    // These will always be the same
    this.left = 0;
    this.right = this.node.offsetWidth;
    this.top = 0;
    this.bottom = this.node.offsetHeight;
    this.center_x = this.right/2;
  }
};  // Ends Screen{}


class Player {
  constructor ( selector, screen ) {
    this.node = document.body.querySelector( selector );
    this.disable_left = false;
    this.disable_right = false;
    this.distance = 20;

    this.screen = screen;
    this.place_center();

    let player = this;
    document.addEventListener( 'keydown', function ( event, target ) {
      if ( event.keyCode === 37 ) {
        player.move_left();
      } else if ( event.keyCode === 39 ) {
        player.move_right();
      }
    });
  }  // Ends player.constructor()

  place_center () {
    /** Put the player avatar in the center of the screen */
    let pos = get_position( this );
    this.node.style.left = `${ this.screen.center_x - (pos.width/2) }px`;
  }  // Ends player.place_center()

  move_left () {
    /** Move the player left one distance unit if possible. */

    // If the player hasn't hit the left edge of the screen
    if ( !this.disable_left ) {

      // Move the player left once using their distance
      let this_pos = get_position( this );
      this.node.style.left = `${ this_pos.left - this.distance }px`;

      if ( hits_screen_left( this, this.screen ) ) {
        this.disable_left = true;
      }

    }

    // Make sure player can now move right again
    this.disable_right = false;

  }  // Ends player.move_left()

  move_right () {
    /** Move the player right one distance unit if possible. */

    // If the player hasn't hit the right edge of the screen
    if ( !this.disable_right ) {

      // Move the player right once using their distance
      let this_pos = get_position( this );
      this.node.style.left = `${ this_pos.left + this.distance }px`;

      if ( hits_screen_right( this, this.screen ) ) {
        this.disable_right = true;
      }

    }

    // Make sure player can now move left again
    this.disable_left = false;

  }  // Ends player.move_right()

};  // Ends Player{}



let screen = new Screen( `#screen` );
let player = new Player( `#player`, screen );

