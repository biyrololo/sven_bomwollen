import GameEntity from "./GameEntity.js";
import GameMap from "./GameMap.js";

class GameCamera{
    constructor({position, sizes, innerBox}){
        this.position = {x: 0, y: 0};
        if(position){
            this.position.x = position.x;
            this.position.y = position.y;
        }
        /**
         * @type {GameEntity | null}
         */
        this.target = null;
        this.sizes = sizes;
        /**
         * @type {GameMap | null}
         */
        this._map = null;
        this.innerBox = innerBox;
        this.innerBox.x/=100;
        this.innerBox.y/=100;
        this.innerBox.width/=100;
        this.innerBox.height/=100;
        this.innerBox.x2 = this.innerBox.x + this.innerBox.width;
        this.innerBox.y2 = this.innerBox.y + this.innerBox.height;
        this.move_listener_index = -1;
        /**
         * @type {CanvasRenderingContext2D}
         */
        this.context = null;
    }

    move_listener(entity){;
        const box = entity.box;
        // console.log(box, this.position, this.innerBox);
        if(box.x2 > this.position.x + this.innerBox.x2*this.sizes.width){
            this.position.x = box.x2 - this.innerBox.x2*this.sizes.width;
            if(this._map.current_level.sizes){
                this.position.x = Math.min(this.position.x, this._map.current_level.sizes.width - this.sizes.width);
            }
            
        }
        if(box.y2 > this.position.y + this.innerBox.y2*this.sizes.height){
            this.position.y = box.y2 - this.innerBox.height*this.sizes.height;
        }
        if(box.x < this.position.x + this.innerBox.x*this.sizes.width){
            this.position.x = box.x - this.innerBox.x*this.sizes.width;
            if(this._map.current_level.sizes){
                this.position.x = Math.max(this.position.x, 0);
            }
        }
        if(box.y < this.position.y - this.innerBox.y*this.sizes.height){
            this.position.y = box.y - this.innerBox.y*this.sizes.height;
        }
    }

    setTarget(target){
        if(this.target){
            this.target.removeEventListener('move', this.move_listener_index);
        }
        this.target = target;
        if(!target) return;
        this.move_listener_index = this.target.addEventListener('move', (entity) => this.move_listener(entity));
    }

    update(entities, deltaTime, global_scale){
        entities.forEach(entity => {
            // const box = entity.box;
            // if(box.x2 < this.position.x) return;
            // if(box.y2 < this.position.y) return;
            // if(box.x > this.position.x + this.sizes.width) return;
            // if(box.y > this.position.y + this.sizes.height) return;
            entity.update(deltaTime);
        })
    }

    draw(entities, global_scale){
        let entities_ = entities.sort((a, b) => {
            if(a.z_index < b.z_index) return -1;
            if(a.z_index > b.z_index) return 1;
            if(a.collision?.type === "box" && b.collision?.type === "box"){
                return (a.collision.getBox().y2 + a.position.y) - (b.collision.getBox().y2 + b.position.y);
            }
            return (a.position.y + a.sizes.height + a.getOffset().y) - (b.position.y + b.sizes.height + b.getOffset().y);
        })
        entities_.forEach(entity => {
            const box = entity.box;
            if(box.x2 < this.position.x) return;
            if(box.y2 < this.position.y) return;
            if(box.x > this.position.x + this.sizes.width) return;
            if(box.y > this.position.y + this.sizes.height) return;
            entity.draw(this, global_scale);
        });
        // this.context.fillStyle = 'rgba(255, 0, 0, 0.2)';
        // this.context.fillRect(
        //     this.innerBox.x * global_scale * this.sizes.width,
        //     this.innerBox.y * global_scale * this.sizes.height,
        //     this.innerBox.width * global_scale * this.sizes.width,
        //     this.innerBox.height * global_scale * this.sizes.height
        // )
    }
}

export default GameCamera;