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
  * @returns {float} pos.center_x The width of half the node.
  */

  return {
    left: obj.node.offsetLeft,
    right: obj.node.offsetLeft + obj.node.offsetWidth,
    top: obj.node.offsetTop,
    bottom: obj.node.offsetTop + obj.node.offsetHeight,
    center_x: obj.node.offsetWidth/2,
    width: obj.node.offsetWidth,
    height: obj.node.offsetHeight,
  }
};  // Ends get_position()

const do_collide = function ( obj1, obj2 ) {
  /** Returns true if two objects are colliding, false if no. */
  let pos1 = get_position( obj1 );
  let pos2 = get_position( obj2 );
};  // Ends do_collide()


// =====================
// =====================
// Classes
// =====================
// =====================

class Container {
  constructor ( selector ) {
    /** A box containing other game entities.
    * 
    * @params {str} selector HTML selector of the pre-existing DOM node
    */
    this.node = document.body.querySelector( selector );
    // These will always be the same
    this.left = 0;
    this.right = this.node.offsetWidth;
    this.top = 0;
    this.bottom = this.node.offsetHeight;
    this.center_x = this.right/2;
  }
};  // Ends Container{}


class Mover {
  constructor ( classNames, parent ) {
    /** An object that can move in the parent.
    * 
    * @param {str} classNames Names of classes to give the new mover
    * @param {HTML Node} parent Instance of parent that contains this player
    */
    this.node = document.createElement( `div` );
    this.node.className = classNames;

    parent.node.appendChild( this.node );
    this.parent = parent;
  }  // Ends mover.constructor()

  move_x () {
    /** Move in the given direction. -1 moves left, 1 moves right. */
    if ( !this.game.pause ) {
      let this_pos = get_position( this );
      this.node.style.left = `${ this_pos.left + (this.x_distance * this.x_vector) }px`;
    }
  }

  move_y () {
    /** Move in the given direction. -1 moves up, 1 moves down. */
    if ( !this.game.pause ) {
      let this_pos = get_position( this );
      this.node.style.top = `${ this_pos.top + (this.y_distance * this.y_vector) }px`;
    }
  }

  hits_parent_left () {
    /** Return whether or not the mover's node hits the left side of the parent.
    * 
    * @returns {bool} Whether the left side of the mover hit the left side of the parent.
    */
    let obj_pos = get_position( this );

    // Uses the position of the mover relative to its parent.
    if ( obj_pos.left <= 0 ) {
      return true;
    } else {
      return false;
    }
  }  // Ends mover.hits_parent_left()


  hits_parent_right () {
    /** Return whether or not the mover's node hits the right side of the parent.
    * 
    * @returns {bool} Whether the right side of the mover hit the right side of the parent.
    */
    let obj_pos = get_position( this );

    // Uses the position of the mover relative to its parent.
    if ( obj_pos.right >= this.parent.right ) {
      return true;
    } else {
      return false;
    }
  }  // Ends mover.hits_parent_right()

};  // Ends Mover{}


class Player extends Mover {
  /** A player-controlled avatar that can move left and right and fire a "bullet". */
  constructor ( game, parent ) {
    /**
    * @param {HTML Node} parent Instance of parent that contains the player
    * @param {obj} game Game state. Messy to have in here? Helps later fun?
    * @paream {bool} game.pause Whether to allow progress or not.
    */
    super( `player`, parent );
    this.game = game;  // TODO: Pass this into super?

    this.place_center();

    // Whether the parent can move left and right
    this.left_disabled = false;
    this.right_disabled = false;
    // Distance divides exactly in parent so the avatar stops right
    // at the wall of the parent.
    // This feels a bit big, leaving gaps, but allows the speed of
    // travel I desire considering we don't have control of the rate
    // of the loop movement because we're using the `keydown` event.
    this.x_distance = 20;

    let player = this;
    // `keydown` fires repeatedly, but the repeat is a bit slow for what I'd like
    document.addEventListener( 'keydown', function ( event, target ) {
      if ( event.keyCode === 37 ) {
        player.move_left();
      } else if ( event.keyCode === 39 ) {
        player.move_right();
      }
    });
  }  // Ends player.constructor()

  place_center () {
    /** Put the object avatar in the horizontal center of the parent. */
    let pos = get_position( this );
    this.node.style.left = `${ this.parent.center_x - (pos.width/2) }px`;
    this.node.style.bottom = 0;
  }  // Ends player.place_center()

  move_left () {
    /** Move the player left once using their distance and direction. */

    // If the player hasn't hit the left edge of the parent
    if ( !this.left_disabled ) {
      this.x_vector = -1;
      this.move_x();

      // If the player has _now_ hit the edge of the parent
      if ( this.hits_parent_left( this, this.parent ) ) {
        // Don't allow further movement in this direction
        this.left_disabled = true;
      }
    }  // ends if not left_disabled

    // Make sure player can now move right again
    // TODO: Watch out this doesn't get enabled when pausing game, allowing
    // the player to move right after pausing.
    this.right_disabled = false;
  }  // Ends player.move_left()

  move_right () {
    /** Move the player right once using their distance and direction. */

    // If the player hasn't hit the right edge of the parent
    if ( !this.right_disabled ) {
      this.x_vector = 1;
      this.move_x();

      // If the player has _now_ hit the edge of the parent
      if ( this.hits_parent_right() ) {
        // Don't allow further movement in this direction
        this.right_disabled = true;
      }
    }  // ends if not right_disabled

    // Make sure player can now move left again
    // TODO: Watch out this doesn't get enabled when pausing game
    this.left_disabled = false;

  }  // Ends player.move_right()

};  // Ends Player{}


class Descenders {
  /** Descender manager. Handles movement loop and game end, though
  * game end handling seems too important to the full game to bury deep in here...
  * 
  * Handle movement in here because the whole group moves as a unit.
  */

  constructor ( game ) {
    /**
    * @param {obj} game Game state. Messy to have in here? Helps later fun?
    * @param {str} game.player_status Whether the player has won/lost/etc.
    * @paream {bool} game.pause Whether to allow progress or not.
    */
    // Just use global `game`?
    this.game = game;
    this.x_vector = -1

    // Make all children
    this.rows = [
      new DescenderRow( game, descent_space, `small`, 1 ),
      new DescenderRow( game, descent_space, `medium`, 2 ),
      new DescenderRow( game, descent_space, `medium`, 3 ),
      new DescenderRow( game, descent_space, `big`, 4 ),
      new DescenderRow( game, descent_space, `big`, 5 ),
    ];

    // Start moving
    this.hit_floor = false;

    // Start the descent loop. Between each loop of movement, wait a bit.
    this.wait = 1 * 1000;
    setTimeout(this.move_all.bind(this), this.wait );

  }

  move_all () {
    /** Move all descenders. Recursive. */

    // If we moved one descender every "frame", they would naturally speed up,
    // but right now we're moving them all at once. Either figure out frames
    // or do the Math.
    let all_stop = this.game.player_status === `won`
      || this.game.player_status === `lost`;
    if ( !all_stop ) {

      let did_hit_wall = false;
      let descender_count = 0;

      for ( let row of this.rows ) {
        for ( let descender of row.descenders ) {
          descender_count += 1;

          // Hmm, this is getting a bit messy just for potential future fun...
          descender.x_vector = this.x_vector;
          descender.move_x();
          // Prepare to change direction
          if ( descender.hits_parent_left() ) {
            did_hit_wall = true;
          }
          if ( descender.hits_parent_right() ) {
            did_hit_wall = true;
          }
        }  // end for each descender in row
      }  // end for each row

      // After all the descenders have moved,
      // if at least one of them hit a wall
      if ( did_hit_wall ) {
        // All should pause in the opposite direction
        this.x_vector *= -1;
        // All shouold move down
        for ( let row of this.rows ) {
          for ( let descender of row.descenders ) {
            // Move down
            descender.y_vector = 1;
            descender.move_y();

            // Check if they any hit the ground yet
            if ( descender.hits_parent_floor() ) {
              if ( descender_count === 50 ) {
                this.game.player_status = `won`;
              } else {
                this.game.player_status = `lost`;
              }
            }  // ends if hits floor

          }  // ends for each descender in row
        }  // ends for each row
      }  // ends if did_hit_wall

      // Enemies move faster the fewer there are
      // Maximum speed (6ms) still allows the user to catch up if they
      // have a long enough time to do it.
      this.wait = ((descender_count - 1) * 2) + 6;
      // Loop again
      setTimeout( this.move_all.bind(this), this.wait );

    }  // ends if not all_stop

  }  // Ends Descenders.move_all()
}  // Ends Descenders{}


class DescenderRow {
  /** A visual row of descenders. Handles their initial placement and contains them.
  *    TODO: Explore putting this functionality elsewhere. This may
  *    be a spurious class.
  */
  constructor ( game, parent, type, row_num ) {
    /**
    * @param {obj} parent The object containing this row.
    * @param {HTML Node} parent.node HTML node of the parent object.
    * @param {number} parent.right
    * @param {number} parent.left
    * @param {str} type At the moment, the size of the row's descenders.
    * @param {int} row_num The vertical position of the row relative to other rows.
    *   Top is 1.
    */
    // Start moving horizontally in this direction
    this.x_vector = -1;

    // Keep everything in multiples of 2? With Math.
    let num_cols = 10;  // Could pass this in instead.
    let column_width = 50;
    let row_width = num_cols * column_width;

    // Put each descender in the middle of its column. Include side_padding
    // to give room for horizontal movement. More dynamic in future?
    let side_padding = (parent.right - row_width)/2;
    let start = parent.right - row_width - side_padding;
    let curr_col_middle = start + (column_width/2);

    this.descenders = [];
    for ( let des_i = 0; des_i < num_cols; des_i++ ) {

      let descender = new Descender( game, parent, type, this );
      this.descenders.push( descender );
      let pos = get_position( descender );
      // Descender's appearance is in the middle of the column
      descender.node.style.left = `${ curr_col_middle - pos.center_x}px`;
      descender.node.style.top = `${row_num * 40}px`;

      // Move to the starting point of the next descender
      curr_col_middle += column_width;
    }  // ends place descenders

  }  // ends row.constructor()
}  // Ends DescenderRow{}


class Descender extends Mover {
  constructor( game, parent, type ) {
    /**
    * @param {obj} parent The object containing this row.
    * @param {HTML Node} parent.node HTML node of the parent object.
    * @param {number} parent.right
    * @param {number} parent.left
    * @param {str} type At the moment, the size of the row's descenders.
    * @param {str} type 'top', 'middle', or 'bottom'
    */
    super( `descender ${ type }`, parent );
    this.game = game;  // TODO: Pass this into super?

    // Travel direction and distance in here to allow messing around in future.
    // Maybe not worth the maintanance cost.

    // Horizontal distance whenever it moves
    this.x_distance = 2;
    // Vertical direction and distance whenever it moves
    this.y_vector = 1;
    this.y_distance = 10;
  }  // end descender.constructor()

  hits_parent_floor () {
    /** Return whether or not the mover's node hit the bottom of the parent.
    * 
    * @returns {bool} Whether the bottom of the mover hit the bottom of the parent.
    */

    let obj_pos = get_position( this );

    // Uses the position of the mover relative to its parent.
    if ( obj_pos.bottom >= this.parent.bottom ) {
      return true;
    } else {
      return false;
    }

  }  // Ends descender.hits_parent_floor()
}  // Ends Descender{}


// Game state
let game = {
  pause: true,
  player_status: 'playing',
}

// Place the pieces and start the game
let screen = new Container( `.screen` );
let player = new Player( game, screen );
let descent_space = new Container( `.descent_space` );
let descenders = new Descenders( game, descent_space );
game.pause = false;

