import AnimationController from "./AnimationController.js";
import CollisionObject from "./CollisionObject.js";
import { BoxCollision } from "./Collision.js";

const DIRECTIONS = {
    'left': -1,
    'right': 1,
    'up': -2,
    'down': 2,
    'none': 0
};

class GameEntity extends CollisionObject{
    z_index = 0;
    scale = 1;
    /**
     * 
     * @param {position: {x: number, y: number}, sizes: {width: number, height: number}, context: CanvasRenderingContext2D} param0 
     */
    constructor({position, sizes, context, max_health, speed}){
        super({position, sizes});
        /**
         * @type {AnimationController | null}
         */
        this.animation_controller = null;
        /**
         * @type {keyof typeof DIRECTIONS}
         */
        this.direction = DIRECTIONS.right;
        /**
         * direction of movement
         * @type {keyof typeof DIRECTIONS}
         */
        this.mh_direction = DIRECTIONS.none;
        this.mv_direction = DIRECTIONS.none;
        /**
         * @type {CanvasRenderingContext2D}
         */
        this.context = context || null;
        this._health = max_health || 100;
        this.event_listeners = {
            ...this.event_listeners,
            damage: [],
            heal: []
        }
        this._speed = speed || 1;
        this.show_sizes = false;
        this.show_collision = false;
    }

    setContext(context){
        this.context = context;
    }

    set speed(speed){
        this._speed = speed;
        if(!this.event_listeners['speed_change']) return;
        for(const listener of this.event_listeners['speed_change']){
            listener(this);
        }
    }

    get speed(){
        return this._speed;
    }

    get type(){
        return this.$type;
    }

    set type(type){
        this.$type = type;
    }

    applyHeal(heal){
        this.health += heal;
        for(const listener of this.event_listeners['heal']){
            listener(this);
        }
    }

    applyDamage(damage){
        this.health -= damage;
        for(const listener of this.event_listeners['damage']){
            listener(this);
        }
    }

    set health(health){
        if(health > this._health){
            for(const listener of this.event_listeners['heal']){
                listener(this);
            }
        }
        if(health < this._health){
            for(const listener of this.event_listeners['damage']){
                listener(this);
            }
        }
        this._health = health;
    }

    get health(){
        return this._health;
    }

    addAnimationController(animation_controller){
        this.animation_controller = animation_controller;
        this.animation_controller.setEntity(this);
    }

    update(deltaTime){
        this.animation_controller.update(deltaTime);
    }

    draw(camera, global_scale){
        if(!this.animation_controller) return;
        let drawn_position = {
            x: this.position.x - camera.position.x,
            y: this.position.y - camera.position.y
        }

        let current_frame = this.animation_controller.getCurrentFrame();
        /**
         * @type {HTMLImageElement}
         */
        let image = this.animation_controller.current_animation.image_left;
        if(this.direction == DIRECTIONS.right){
            image = this.animation_controller.current_animation.image_right;
        }

        this.customDraw(image, current_frame, camera, global_scale, drawn_position);
    }

    customDraw(image, current_frame, camera, global_scale, drawn_position){
        let scale = this.scale;
        let offset = this.getOffset();
        this.context.drawImage(
            image,
            current_frame * this.animation_controller.current_animation.size,
            0,
            this.animation_controller.current_animation.size,
            this.animation_controller.current_animation.size,
            (drawn_position.x + offset.x) * global_scale,
            (drawn_position.y + offset.y) * global_scale,
            this.sizes.width * global_scale * scale,
            this.sizes.height * global_scale * scale
        )

        if(this.show_sizes){
            this.context.fillStyle = 'rgba(0, 255, 0, 0.2)';
            this.context.fillRect(
                drawn_position.x * global_scale,
                drawn_position.y * global_scale,
                this.sizes.width * global_scale * scale,
                this.sizes.height * global_scale * scale
            )
        }

        if(this.show_collision && this.collision?.type === 'box'){
            let collision_box = this.collision.getBox();
            this.context.fillStyle = 'rgba(0, 0, 255, 0.5)';
            this.context.fillRect(
                (drawn_position.x + collision_box.x1) * global_scale,
                (drawn_position.y + collision_box.y1) * global_scale,
                (collision_box.x2 - collision_box.x1) * global_scale,
                (collision_box.y2 - collision_box.y1) * global_scale
            )
        }
    }

    getOffset(){
        return {x: 0, y: 0}
    }

    /**
     * Check if this entity is colliding with another entity
     * @param {GameEntity} entity 
     * @returns 
     */
    interact(entity){
        if(!this.collision) return;
        if(!entity.collision.type === "box") return;
        let box1 = this.collision.getBox();
        let box2 = entity.collision.getBox();
        box1.x1 += this._position.x;
        box1.y1 += this._position.y;
        box1.x2 += this._position.x;
        box1.y2 += this._position.y;
        box2.x1 += entity._position.x;
        box2.y1 += entity._position.y;
        box2.x2 += entity._position.x;
        box2.y2 += entity._position.y;
        return BoxCollision.box_interact(box1, box2);
    }
}

export default GameEntity;
export {DIRECTIONS};