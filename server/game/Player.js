import Entity from "./Entity.js";
import Directions from "./Directions.js";

export default class Player extends Entity{
    score = 0;
    constructor(position) {
        super('player', position, 2);
        this.satisfying_sheep = null;
    }

    move(direction){
        // this.start_move = performance.now();
        const delta = Directions.get_delta(this.position.y);
        const new_x = this.position.x + delta[direction][0];
        const new_y = this.position.y + delta[direction][1];
        this.game.broadcast({
            event: 'player_move',
            payload: {
                direction: direction,
                old_pos: this.position,
                new_pos: {x: new_x, y: new_y},
                id: this._id
            }
        })
        let is_teleport = this.game.map.get(new_x, new_y)?.name === 'teleport';
        if(!is_teleport){
            this.map.move(this.position.x, this.position.y, new_x, new_y);
            this.position.x = new_x;
            this.position.y = new_y;
        }
        this.move_time = this.max_move_time;
        this.move_timeout = setTimeout(() => {
            this.move_time = 0;
            // console.log('player', this.id, 'arrived');
            if(is_teleport){
                this.game.teleportPlayer(this, {x: new_x, y: new_y});
            }
        }, this.max_move_time * 1000 * 0.9);
    }
}