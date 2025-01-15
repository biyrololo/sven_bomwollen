import { GameEntity } from "../Canvas2DEngine/index.js";
import { DIRECTIONS } from "../Canvas2DEngine/GameEntity.js";
import MyGameMap from "./MyGameMap.js";

class MyGameEntity extends GameEntity {
    constructor(props){
        super(props);
        /**
         * @type {MyGameMap}
         */
        this._map;
        this.$type = props.type;
        this.is_sleepeing = false;
        this._inited = false;
        this.target = {
            pos: {
                x: 0,
                y: 0
            },
            active: false
        }
        this.movable = true;
        this.is_hidden = false;
    }

    setTarget(pos){
        this.target.pos = {
            x: pos.x,
            y: pos.y
        }
        this.target.active = true;
    }

    reachTarget(){
        this.target.active = false;
        this.event_listeners['target_reached']?.forEach(listener => listener(this));
    }

    update(deltaTime){
        super.update(deltaTime);
        if(!this.movable) return;
        if(this.target.active){
            if(this.position.x !== this.target.pos.x && this.position.y !== this.target.pos.y){
                // if two coordinates are different
                const get_diffs = (x, y) => {
                    return {
                        x: this.target.pos.x - x,
                        y: this.target.pos.y - y
                    }
                }
                let prev_diffs = get_diffs(this.position.x, this.position.y);
                this.direction = DIRECTIONS.right;
                if(this.position.x > this.target.pos.x){
                    this.direction = DIRECTIONS.left;
                }


                let angle = Math.atan2(this.target.pos.y - this.position.y, this.target.pos.x - this.position.x);
                this.position_x += Math.cos(angle) * this._speed * deltaTime;
                this.position_y += Math.sin(angle) * this._speed * deltaTime;
                let curr_diffs = get_diffs(this.position.x, this.position.y);
                if(curr_diffs.x * prev_diffs.x <=0 || curr_diffs.y * prev_diffs.y <=0){
                    this.position_x = this.target.pos.x;
                    this.position_y = this.target.pos.y;
                    // console.log('target reached');
                    // this.target.active = false;
                    this.reachTarget();
                }
                
            } else {
                return;
                // if one coordinate is different
                if(this.position.x > this.target.pos.x){
                    this.direction = DIRECTIONS.left;
                    this.position_x -= this._speed * deltaTime;
                    if(this.position.x <= this.target.pos.x){
                        this.position_x = this.target.pos.x;
                        // console.log('target reached2');
                        // this.target.active = false;
                        this.reachTarget();
                    }
                }
    
                if(this.position_x < this.target.pos.x){
                    this.direction = DIRECTIONS.right;
                    this.position_x += this._speed * deltaTime;
                    if(this.position_x >= this.target.pos.x){
                        this.position_x = this.target.pos.x;
                        // console.log('target reached3');
                        // this.target.active = false;
                        this.reachTarget();
                    }
                }
    
                if(this.position_y > this.target.pos.y){
                    this.position_y -= this._speed * deltaTime;
                    if(this.position_y <= this.target.pos.y){
                        this.position_y = this.target.pos.y;
                        // console.log('target reached4');
                        // this.target.active = false;
                        this.reachTarget();
                    }
                }
    
                if(this.position_y < this.target.pos.y){
                    this.position_y += this._speed * deltaTime;
                    if(this.position_y >= this.target.pos.y){
                        this.position_y = this.target.pos.y;
                        // console.log('target reached5');
                        // this.target.active = false;
                        this.reachTarget();
                    }
                }
            }
        } else {
            if(this.animation_controller.current_animation.name !== 'idle'){
                this.animation_controller.setAnimationByName('idle');
            }
        }
    }
    
    draw(camera, global_scale){
        if(this.is_hidden) return;
        super.draw(camera, global_scale);
    }
}

export { MyGameEntity };