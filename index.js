// Game objects and logic

// =====================
// =====================
// Classes
// Q: Classes or object primitives? Composition vs. inheritance?
// =====================
// =====================


class Game {
  /** Game state. Manages interactions for whole game and, maybe
  *   between pieces of the game.
  * 
  * Not sure this needs to be a class right now, but
  *   might be useful in future.
  */
  constructor ( outcome_node ) {
    this.paused = false;
    this.outcome_node = outcome_node;
    // Storing this list in the Descenders instance and here seems wrong
    this.descenders = null;
    this.player = null;
    // Should this be a prop of the Player instance?
    this.player_status = `playing`;

    // Pause when the pause key is pressed
    document.body.addEventListener( `keydown`, this.pause.bind( this ));
  }  // Ends game.constructor()

  pause ( event ) {
  /** Pause the game. It drives me crazy when I can't pause a game, even
  *   though I know the loops are still running when it's paused. */

    // The escape key pauses the game
    if ( event.keyCode === 27 ) {
      if ( this.paused === true ) {
        this.paused = false;
      } else {
        this.paused = true;
      }
    }
  }  // Ends game.pause()

}  // Ends Game{}


class Container {
  constructor ( selector ) {
    /** An object containing an HTML node constraining the game entities that it contains.
    *   They must stay inside it.
    * 
    * @params {str} selector HTML selector of the pre-existing DOM node
    */
    this.node = document.body.querySelector( selector );
    // These will always be the same
    this.left = 0;
    this.width = this.node.offsetWidth;
    this.top = 0;
    this.height = this.node.offsetHeight;
    this.half_width = this.width/2;
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

  move_x ( vector ) {
    /** Move in the given direction. -1 moves left, 1 moves right. */
    // TODO: Change vector to an argument instead
    if ( !this.game.paused ) {
      let this_pos = get_position( this );
      this.node.style.left = `${ this_pos.left + (this.x_distance * vector ) }px`;
    }
  }

  move_y ( vector ) {
    /** Move in the given direction. -1 moves up, 1 moves down. */
    // TODO: Change vector to an argument instead
    if ( !this.game.paused ) {
      let this_pos = get_position( this );
      this.node.style.top = `${ this_pos.top + (this.y_distance * vector ) }px`;
    }
  }

  hits_parent_left () {
    /** Return whether or not the mover's node reaches the left edge of the parent.
    * 
    * @returns {bool} Whether the left edge of the mover reaches the left edge of the parent.
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
    /** Return whether or not the mover's node reaches the right edge of the parent.
    * 
    * @returns {bool} Whether the right edge of the mover hit the right edge of the parent.
    */
    let obj_pos = get_position( this );

    // Uses the position of the mover relative to its parent.
    if ( obj_pos.right >= this.parent.width ) {
      return true;
    } else {
      return false;
    }
  }  // Ends mover.hits_parent_right()

};  // Ends Mover{}


class Player extends Mover {
  /** A player-controlled avatar that can move left and right and fire "bullets". */
  constructor ( game, parent ) {
    /**
    * @param {HTML Node} parent Instance of parent that contains the player
    * @param {obj} game Game state. Messy to have in here? Helps later fun?
    * @param {bool} game.paused Whether to allow progress or not. (TODO)
    */
    super( `player`, parent );
    this.game = game;  // TODO: Pass this into super?

    this.place_center();

    // Whether the player can move left and right
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
    document.addEventListener( `keydown`, function ( event, target ) {
      if ( event.keyCode === 37 ) {  // left arrow
        player.move_left();
      } else if ( event.keyCode === 39 ) {  // right arrow
        player.move_right();
      }
    });
  }  // Ends player.constructor()

  place_center () {
    /** Put the object avatar in the horizontal center of the parent. */
    let pos = get_position( this );
    this.node.style.left = `${ this.parent.half_width - (pos.width/2) }px`;
    this.node.style.bottom = 0;
  }  // Ends player.place_center()

  move_left () {
    /** Move the player left once using their distance and direction. */

    // If the player hasn't hit the left edge of the parent
    if ( !this.left_disabled ) {
      this.move_x( -1 );

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
      this.move_x( 1 );

      // If the player has _now_ hit the edge of the parent
      if ( this.hits_parent_right() ) {
        // Don't allow further movement in this direction
        this.right_disabled = true;
      }
    }  // ends if not right_disabled

    // Make sure player can now move left again
    // TODO: Watch out this doesn't get enabled when pausing game, allowing
    // the player to move right after pausing.
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
    * @paream {bool} game.paused Whether to allow progress or not.
    */
    // Just use global `game`?
    this.game = game;
    this.x_vector = -1  // left first

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

    // if (all_stop) {return;}

    if ( !all_stop ) {

      let did_hit_wall = false;
      let descender_count = 0;

      for ( let row of this.rows ) {
        for ( let descender of row.descenders ) {
          // Number of descenders will affect speed of travel
          descender_count += 1;

          // Hmm, this is getting a bit messy just for potential future fun...
          descender.move_x( this.x_vector );

          // Prepare to change direction if needed
          if ( descender.hits_parent_left() ) {
            did_hit_wall = true;
          }
          if ( descender.hits_parent_right() ) {
            did_hit_wall = true;
          }
        }  // end for each descender in row
      }  // end for each row

      // After all the descenders have moved, if at least one of them hit a wall...
      if ( did_hit_wall ) {
        // All should move in the opposite direction in next loop
        this.x_vector *= -1;
        // All should move down
        for ( let row of this.rows ) {
          for ( let descender of row.descenders ) {
            // Move down
            descender.move_y( 1 );

            // TODO: Need to wait to do this until after all have moved down
            // Check if they any hit the ground yet
            if ( descender.hits_parent_floor() ) {
              if ( descender_count === 50 ) {  // hard coded magic number for now
                this.game.player_status = `won`;
              } else {
                this.game.player_status = `lost`;
              }

              this.game.pause();

              // Don't like this being burried here
              let status_node = this.game.outcome_node.querySelector(`.status`);
              // Don't love using the status as the literal text
              status_node.innerText = this.game.player_status;
              this.game.outcome_node.style.display = `block`;

            }  // ends if hits floor

          }  // ends for each descender in row
        }  // ends for each row
      }  // ends if did_hit_wall

      // Enemies move faster the fewer there are
      // Maximum speed (6ms) still allows the user to catch up if they
      // have a long enough time to do it. 2ms more for each descender after the first (When
      // there is only 1 descender, it'll be fastest. Haven't handled 0 descenders yet.)
      this.wait = ((descender_count - 1) * 2) + 6;  // hard coded magic number
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
    * @param {number} parent.width
    * @param {number} parent.left
    * @param {str} type At the moment, the size of the row's descenders.
    * @param {int} row_num The vertical position of the row relative to other rows.
    *   Top is 1.
    */
    // Keep everything in multiples of 2? With Math.
    let num_cols = 10;  // Could pass this as an argument instead.
    let column_width = 50;
    let row_width = num_cols * column_width;

    // Put each descender in the middle of its column. Include side_padding
    // to give room for horizontal movement. More dynamic in future?
    let side_padding = (parent.width - row_width)/2;
    let start = parent.width - row_width - side_padding;
    let curr_col_middle = start + (column_width/2);

    this.descenders = [];
    for ( let des_i = 0; des_i < num_cols; des_i++ ) {

      let descender = new Descender( game, parent, type, this );
      this.descenders.push( descender );
      let pos = get_position( descender );
      // Descender's appearance is in the middle of the column
      descender.node.style.left = `${ curr_col_middle - pos.half_width}px`;
      descender.node.style.top = `${row_num * 40}px`;

      // Move to the starting point of the next descender
      curr_col_middle += column_width;
    }  // ends place descenders

  }  // ends row.constructor()
}  // Ends DescenderRow{}


class Descender extends Mover {
  constructor ( game, parent, type ) {
    /**
    * @param {obj} parent The object containing this row.
    * @param {HTML Node} parent.node HTML node of the parent object.
    * @param {number} parent.left Always 0 to this child.
    * @param {number} parent.width X coord of the right edge relative to this child.
    * @param {number} parent.height Y coord of the bottom edge of the container (top is 0).
    * @param {str} type At the moment, the size of the row's descenders.
    *   'small', 'medium', or 'big'
    */
    super( `descender ${ type }`, parent );
    this.game = game;  // TODO: Pass this into super?

    // Travel direction and distance in here to allow messing around in future.
    // Maybe not worth the maintanance cost.

    // Horizontal distance whenever it moves
    this.x_distance = 2;
    // Vertical direction and distance whenever it moves
    this.y_distance = 10;

    // // For testing - speed up to get to end
    // this.x_distance = 50;
    // this.y_distance = 50;
  }  // end descender.constructor()

  hits_parent_floor () {
    /** Return whether or not the mover's node has reached the bottom edge of the parent.
    * 
    * @returns {bool} Whether the bottom of the mover has reached the bottom of the parent.
    */

    let obj_pos = get_position( this );

    // Uses the position of the mover relative to its parent.
    if ( obj_pos.bottom >= this.parent.height ) {
      return true;
    } else {
      return false;
    }

  }  // Ends descender.hits_parent_floor()
}  // Ends Descender{}



// ===========================================
// General Helpers
// ===========================================

const get_position = function ( obj ) {
  /** Get the relative position and dimensions of an
  *   object's `.node` as floats.
  * 
  * TODO: "Position" isn't a great word for stuff in here, but I don't know
  *   a better one? "box"? "rectangle"?
  * 
  * There's something that feels better having it out here
  *   as opposed to as a method of an instance.
  * 
  * @param {object} obj
  * @param {HTML Node} obj.node
  * 
  * @returns {object} pos The relative position and dimensions of the object's node.
  * @returns {float} pos.left The position of the object's left edge relative to the parent node. Left edge = 0.
  * @returns {float} pos.right The position of the object's right edge relative to the parent node. Left edge = 0.
  * @returns {float} pos.top The position of the object's top edge relative to the parent node. Top edge = 0.
  * @returns {float} pos.bottom The position of the object's bottom edge relative to the parent node. Top edge = 0.
  * @returns {float} pos.width The width of the node.
  * @returns {float} pos.height The height of the node.
  * @returns {float} pos.half_width The width of half the node.
  */

  return {
    left: obj.node.offsetLeft,
    right: obj.node.offsetLeft + obj.node.offsetWidth,
    top: obj.node.offsetTop,
    bottom: obj.node.offsetTop + obj.node.offsetHeight,
    // Q: These are currently unchanging, so do they really need to be in here?
    width: obj.node.offsetWidth,
    height: obj.node.offsetHeight,
    half_width: obj.node.offsetWidth/2,
  }
};  // Ends get_position()

const have_collided = function ( obj1, obj2 ) {
  /** Returns true if two objects are colliding, false if no. */
  let pos1 = get_position( obj1 );
  let pos2 = get_position( obj2 );

  // TODO: Check for collision...
};  // Ends have_collided()


// ===========================================
// ===========================================
// ===========================================

// Place the pieces and start the game

// Game state
let game = new Game( document.querySelector( `.outcome` ) );
// Do this in Player?
let screen = new Container( `.screen` );
let player = new Player( game, screen );
// Do this in Descenders?
let descent_space = new Container( `.descent_space` );
let descenders = new Descenders( game, descent_space );
// game.paused = false;
