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
    center_x: obj.node.offsetLeft + (obj.node.offsetWidth/2),
    // Probably don't need these dimensions
    width: obj.node.offsetWidth,
    height: obj.node.offsetHeight,
  }
};  // Ends get_position()


// =====================
// =====================
// Classes
// =====================
// =====================

class Screen {
  constructor ( selector ) {
    /** A box containing other game entities.
    * 
    * @params {str} selector HTML selector of the pre-existing screen's node
    */
    this.node = document.body.querySelector( selector );
    // These will always be the same
    this.left = 0;
    this.right = this.node.offsetWidth;
    this.top = 0;
    this.bottom = this.node.offsetHeight;
    this.center_x = this.right/2;
  }
};  // Ends Screen{}


class Mover {
  constructor ( classNames, screen ) {
    /** An object that can move in the screen.
    * 
    * @param {str} classNames Names of classes to give the new mover
    * @param {Screen} screen Instance of Screen that contains this player
    */
    this.node = document.createElement( `div` );
    this.node.className = classNames;

    screen.node.appendChild( this.node );

    this.disable_left = false;
    this.disable_right = false;
    this.distance = 20;
    this.screen = screen;
  }  // Ends mover.constructor()

  move_left () {
    /** Move the mover left one distance unit if possible. */

    // If the mover hasn't hit the left edge of the screen
    if ( !this.disable_left ) {
      // Move the mover left once using their distance
      let this_pos = get_position( this );
      this.node.style.left = `${ this_pos.left - this.distance }px`;

      if ( this.hits_screen_left( this, this.screen ) ) {
        this.disable_left = true;
      }
    }  // ends if disable_left

    // Make sure mover can now move right again
    this.disable_right = false;
  }  // Ends mover.move_left()

  move_right () {
    /** Move the mover right one distance unit if possible. */

    // If the mover hasn't hit the right edge of the screen
    if ( !this.disable_right ) {
      // Move the mover right once using their distance
      let this_pos = get_position( this );
      this.node.style.left = `${ this_pos.left + this.distance }px`;

      if ( this.hits_screen_right( this, this.screen ) ) {
        this.disable_right = true;
      }
    }  // ends if disable_right

    // Make sure mover can now move left again
    this.disable_left = false;

  }  // Ends mover.move_right()


  hits_screen_left () {
    /** Return whether or not the mover's node hits the left side of the screen.
    * 
    * @returns {bool} Whether the left side of the mover hit the left side of the screen.
    */

    let obj_pos = get_position( this );

    // Uses the position of the mover relative to its parent Screen.
    if ( obj_pos.left <= 0 ) {
      return true;
    } else {
      return false;
    }
  }  // Ends mover.hits_screen_left()


  hits_screen_right () {
    /** Return whether or not the mover's node hits the right side of the screen.
    * 
    * @returns {bool} Whether the right side of the mover hit the right side of the screen.
    */

    let obj_pos = get_position( this );

    // Uses the position of the mover relative to its parent Screen.
    if ( obj_pos.right >= this.screen.right ) {
      return true;
    } else {
      return false;
    }
  }  // Ends mover.hits_screen_right()

}


class Player extends Mover {
  constructor ( screen ) {
    /** A player-controlled avatar.
    * 
    * @param {Screen} screen Instance of Screen that contains the player
    */
    super( `player`, screen )

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
    this.node.style.bottom = 0;
  }  // Ends player.place_center()

};  // Ends Player{}



let screen = new Screen( `.screen` );
let player = new Player( screen );
let descender = new Descender( screen );

