import GameEntity from "./GameEntity.js";
import GameObject from "./GameObject.js";
import GameCamera from "./GameCamera.js";

var last_id = 0;

class GameLevel{
    /**
     * 
     * @param {{entities: GameObject[], background_image_src: string, start_position: {x: number, y: number}, name: string, sizes: {width: number, height: number}}} props 
     */
    constructor(props){
        this._id = ++last_id;
        /** 
        @type {GameEntity[]} 
        **/
        this.entities = props.entities || [];
        this.background_image_src = props.background_image_src || null;
        this.background_image = new Image();
        if(this.background_image_src) this.background_image.src = this.background_image_src;
        this.start_position = props.start_position || {x: 0, y: 0};
        this.name = props.name || null;
        this.static_background = props.static_background || false;
        this.sizes = props.sizes || {width: 100, height: 100};
    }

    addEntity(entity){
        this.entities.push(entity);
    }

    removeEntity(entity){
        this.entities = this.entities.filter(e => e._id !== entity._id);
    }

    addEntites(entities){
        this.entities = this.entities.concat(entities);
    }

    loadBackgroundImage(src){
        this.background_image_src = src;
        this.background_image.src = this.background_image_src;
    }
    
    set_spawn_position(position){
        this.start_position = position;
    }

    /**
     * 
     * @param {CanvasRenderingContext2D} ctx 
     * @param {number} global_scale 
     * @param {GameCamera} camera 
     */
    draw_background(ctx, global_scale, camera){
        if(this.static_background){
            ctx.drawImage(this.background_image, 0, 0, camera.sizes.width, camera.sizes.height);
        } else {
            let image_width = camera.sizes.height * this.background_image.width / this.background_image.height;
            let bg_count = Math.floor(camera.position.x / image_width);
            // console.log(camera.position.x, image_width, bg_count);
            for(let x = bg_count; x * image_width < camera.position.x + camera.sizes.width * 2; x += 1){
                let x_ = Math.floor(x * image_width * 100) / 100;
                ctx.drawImage(
                    this.background_image,
                    0,0,
                    this.background_image.width,
                    this.background_image.height,
                    (x_-camera.position.x) * global_scale,
                    -camera.position.y * global_scale,
                    image_width * global_scale+1,
                    camera.sizes.height * global_scale
                )
            }
        }
    }

    /**
     * 
     * @param {CanvasRenderingContext2D} ctx 
     * @param {number} global_scale 
     * @param {GameCamera} camera 
     */
    draw_foreground(ctx, global_scale, camera){
        // draw foreground
    }
}

export default GameLevel;