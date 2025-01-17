import Directions from "./Directions.js";
import Entity from "./Entity.js";
import find_shortest_path, { comparePosition } from "./find_shortest_path.js";

const STATES = {
    idle: 0,
    move: 1,
    follow: 2
}

const STAY_TIME_MOVE = 5;

export default class Oldman extends Entity {
    constructor(position) {
        super('oldman', position, 0.5);
        this.state = STATES.idle;
        this.stay_time = 0;
        this.moveTimeout = null;
        this.waitTimeout = null;
    }

    move_to_sheep(){
        let sheep = this.game.get_next_closes_sheep(this, `oldman`);
        // console.log(`start move to sheep ${sheep.id}`);
        // console.log('sheep', sheep);
        if(sheep){
            sheep.checked_by_dog = true;
            let path = find_shortest_path(this.position, sheep.position, this.game.map);
            // console.log(path)
            if(path.length > 0){
                this.state = STATES.move;
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
                    event: 'oldman_move',
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
                this.moveTimeout = setTimeout(() => {
                    this.move_time = 0;
                    if(this.state === STATES.follow){
                        this.follow_player();
                        return;
                    }
                    if(!this.check_goal()){
                        this.continue_move();
                    } else {
                        this.state = STATES.idle;
                        this.waiting();
                    }
                }, this.max_move_time * 1000);
            } else {
                this.state = STATES.idle;
                this.waiting();
            }
        }
    }

    continue_move(){
        // console.log(`continue move to sheep ${this.target.abs_target.entity.id}`);
        let path = find_shortest_path(this.position, this.target.abs_target.entity.position, this.game.map);
        if(path.length > 0){
            this.state = STATES.move;
            this.target.pos = path[0];
            let last_path = path[path.length - 1];
            this.target.abs_target.x = last_path.x;
            this.target.abs_target.y = last_path.y;
            this.target.active = true;
            this.move_time = this.max_move_time;
            this.game.broadcast({
                event: 'oldman_move',
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
            this.moveTimeout = setTimeout(() => {
                this.move_time = 0;
                if(this.state === STATES.follow){
                    this.follow_player();
                    return;
                }
                if(!this.check_goal()){
                    this.continue_move();
                } else {
                    this.state = STATES.idle;
                    this.waiting();
                }
            }, this.max_move_time * 1000);
        } else {
            this.state = STATES.idle;
            this.waiting();
        }
    }

    waiting(){
        if(this.state === STATES.idle){
            if(Math.random() > 0.5){
                this.state = STATES.move;
                this.move_to_sheep();
            } else {
                this.waitTimeout = setTimeout(() => {
                    this.waiting();
                }, STAY_TIME_MOVE * 1000);
            }
        }
    }

    check_goal(){
        if(comparePosition(this.position, this.target.abs_target)){
            // this.state = STATES.idle;
            return true;
        } else {
            return false;
        }
    }

    start_follow_player(player){
        this.state = STATES.follow;
        this.target.abs_target = player;
        this.target.active = true;
        if(this.move_time === 0){
            clearTimeout(this.moveTimeout);
            clearTimeout(this.waitTimeout);
            this.follow_player();
        }
    }
    
    follow_player(){
        let path = find_shortest_path(this.position, this.target.abs_target.position, this.game.map, true);
        if(path.length > 0){
            this.state = STATES.move;
            this.target.pos = path[0];
            let last_path = path[path.length - 1];
            this.target.abs_target.x = last_path.x;
            this.target.abs_target.y = last_path.y;
            this.target.active = true;
            this.move_time = this.max_move_time;
            this.game.broadcast({
                event: 'oldman_move',
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
            this.moveTimeout = setTimeout(() => {
                this.move_time = 0;
                this.follow_player();
            }, this.max_move_time * 1000);
        } else {
            if(comparePosition(this.position, this.target.abs_target.position)){
                this.state = STATES.idle;
                this.game.looseGame(this.target.abs_target, this);
                return;
            }
            this.moveTimeout = setTimeout(() => {
                this.follow_player();
            }, this.max_move_time * 1000);
        }
    }
    
    stop_follow_player(){
        clearTimeout(this.moveTimeout);
        this.move_time = 0;
        this.state = STATES.idle;
        this.waiting();
    }

    start(){
        this.waiting();
    }

    stop_all(){
        clearTimeout(this.moveTimeout);
        clearTimeout(this.waitTimeout);
    }
}