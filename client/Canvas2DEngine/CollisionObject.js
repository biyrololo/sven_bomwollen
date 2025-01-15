import GameObject from "./GameObject.js";
import { BoxCollision, Collision } from "./Collision.js";
import GameMap from "./GameMap.js";

class CollisionObject extends GameObject {
    constructor({position, sizes}){
        super({position, sizes});
        /**
         * @type {Collision | BoxCollision | null}
         */
        this.collision = null;
        /**
         * @type {GameMap | null}
         */
        this._map = null;
    }

    set position(position){
        let prev_position = {...this._position};
        if(this._map){
            this._position = {...position};
            if(this._map.check_collision(this, this.sizes.width + this.sizes.height)){
                this._position = {...prev_position};
                return;
            }
        }
        this._position = position;
        for(const listener of this.event_listeners['move']){
            listener(this);
        }
    }

    get position(){
        return this._position;
    }

    set position_x(x){
        let prev_position = {...this._position};
        if(this._map){
            this._position = {x, y: this._position.y};
            if(this._map.check_collision(this, this.sizes.width + this.sizes.height)){
                this._position = {...prev_position};
                return;
            }
        }
        this._position.x = x;
        for(const listener of this.event_listeners['move']){
            listener(this);
        }
    }

    get position_x(){
        return this._position.x;
    }

    set position_y(y){
        let prev_position = {...this._position};
        if(this._map){
            this._position = {x: this._position.x, y};
            if(this._map.check_collision(this, this.sizes.width + this.sizes.height)){
                this._position = {...prev_position};
                return;
            }
        }
        this._position.y = y;
        for(const listener of this.event_listeners['move']){
            listener(this);
        }
    }

    get position_y(){
        return this._position.y;
    }

    addCollision(collision){
        if(collision === undefined){
            this.collision = (
                new BoxCollision({
                    x1: this.position.x,
                    y1: this.position.y,
                    x2: this.position.x + this.sizes.width,
                    y2: this.position.y + this.sizes.height
                })
            )
            return;
        }
        this.collision = collision;
    }
}

export default CollisionObject;