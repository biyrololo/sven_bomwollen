import Entity from "./Entity.js";
import Directions from "./Directions.js";
import find_shortest_path, { comparePosition } from "./find_shortest_path.js";

export default class Player extends Entity{
    score = 0;
    healths = 3;
    autoplay = false;
    constructor(position) {
        super('player', position, 2);
        this.satisfying_sheep = null;
    }   

    stopAutoplay(){
        this.autoplay = false;
        this.move_time = 0;
        clearTimeout(this.moveTimeout);
    }

    startAutoplay(){
        this.autoplay = true;
        if(this.moveTimeout) clearTimeout(this.moveTimeout);
        this.start_follow_to_sheep();
    }

    start_follow_to_sheep(){
        let sheep = this.game.get_next_closes_sheep(this, `player_${this.id}`);
        if(sheep){
            let path = find_shortest_path(this.position, sheep.position, this.game.map);
            if(path.length > 0){
                const k = this.speed_bonus ? 2 : 1;
                this.target.pos = path[0];
                let last_path = path[path.length - 1];
                this.target.abs_target = {
                    x: last_path.x,
                    y: last_path.y,
                    entity: sheep
                };
                this.target.active = true;
                this.move_time = this.max_move_time;
                this.game.broadcast({
                    event: 'player_move',
                    payload: {
                        old_pos: this.position,
                        new_pos: {
                            x: this.target.pos.x,
                            y: this.target.pos.y
                        },
                        id: this._id
                    }
                })
                this.map.move(this.position.x, this.position.y, this.target.pos.x, this.target.pos.y);
                this.position.x = this.target.pos.x;
                this.position.y = this.target.pos.y;
                let is_token = null;
                for(let token of this.game.tokens){
                    if(token.position.x === this.position.x && token.position.y === this.position.y){
                        is_token = token;
                        break;
                    }
                }
                let goal = path.length === 1 ? sheep: null;
                this.moveTimeout = setTimeout(() => {
                    if(is_token){
                        this.game.takeToken(this, is_token);
                    }
                    this.move_time = 0;
                    if(goal){
                        this.satisfy_sheep(goal);
                    } else{
                        this.start_follow_to_sheep();
                    }
                }, this.max_move_time / k * 1000);
            }
        } else {
            setTimeout(() => {
                this.start_follow_to_sheep();
            }, 1000);
        }
    }

    satisfy_sheep(sheep){
        if(!this.autoplay) return;
        if(sheep.current_satisfy_level <= 0){
            this.start_follow_to_sheep();
            return;
        }
        this.satisfying_sheep = sheep;
        sheep.is_satisfying = true;
        sheep.satisfying_by = this;
        this.game.broadcast({
            event: 'satisfy_sheep',
            payload: {
                sheep: {
                    x: sheep.position.x,
                    y: sheep.position.y,
                    id: sheep.id
                },
                player: {
                    x: this.position.x,
                    y: this.position.y,
                    id: this.id
                }
            }
        })
        sheep.startSatisfying();
        setTimeout(() => {
            this.satisfy_sheep(sheep);
        }, sheep.satisty_speed * 1000 + 10);
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
        if(this.game.bonus){
            if(this.game.bonus.position.x === new_x && this.game.bonus.position.y === new_y){
                this.game.takeBonus(this);
            }
        }
        let is_token = null;
        for(let token of this.game.tokens){
            if(token.position.x === new_x && token.position.y === new_y){
                is_token = token;
                break;
            }
        }
        if(is_token){
            setTimeout(
                ()=>{
                    this.game.takeToken(this, is_token);
                },
                this.max_move_time / k * 1000 * 0.9
            )
        }
        let is_teleport = this.game.map.get(new_x, new_y)?.name === 'teleport';
        if(!is_teleport){
            this.map.move(this.position.x, this.position.y, new_x, new_y);
            this.position.x = new_x;
            this.position.y = new_y;
        }
        this.move_time = this.max_move_time;
        const k = this.speed_bonus ? 2 : 1;
        this.move_time /= k;
        this.move_timeout = setTimeout(() => {
            this.move_time = 0;
            // console.log('player', this.id, 'arrived');
            if(is_teleport){
                this.game.teleportPlayer(this, {x: new_x, y: new_y});
            }
        }, this.max_move_time / k * 1000 * 0.9);
    }
}