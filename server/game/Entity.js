import MapMap from "./MapMap.js";
import Game from "../game.js";

let last_id = 0;
export default class Entity {
    constructor(name, position, speed) {
        this._id = ++last_id;
        this.speed = speed;
        this.name = name;
        this.position = position;
        this.destroy = () => {};
        /**
         * @type {MapMap}
         */
        this.map = null;
        /**
         * @type {Game}
         */
        this.game = null;
        this.target = {
            pos: {
                x: 0,
                y: 0
            },
            abs_target: {
                x: 0,
                y: 0,
                entity: null
            },
            active: false
        }
        this.move_time = 0;
        this.max_move_time = Math.sqrt(2) / this.speed;
    }

    get id(){
        return this._id;
    }

    update(dt){
    //    console.warn('not implemented');
    }

    start(){
        
    }

    distance_to(entity){
        return Math.sqrt(Math.pow(this.position.x - entity.position.x, 2) + Math.pow(this.position.y - entity.position.y, 2));
    }

    distance_to2(entity){
        return Math.pow(this.position.x - entity.position.x, 2) + Math.pow(this.position.y - entity.position.y, 2);
    }

    json(){
        return {
            id: this._id,
            name: this.name,
            position: this.position,
            speed: this.speed
        }
    }
}