import GameEntity from "./GameEntity.js";

class Animation{
    name;
    image_right=null;
    image_left=null;
    frames_count=0;

    /**
     * 
     * @param {name: string, image_right: string, image_left: string, frames_count: number} param0 
     */
    constructor({name, image_right, image_left}){
        this.name = name;
        this.frames_count = 0;
        this.size = 0;
        this.image_right_src = image_right;
        this.image_right = new Image();
        this.image_right.onload = () => {
            this.frames_count = Math.floor(this.image_right.width / this.image_right.height);
            this.size = this.image_right.height;
        };
        this.image_right.src = image_right;
        this.image_left_src = image_left;
        this.image_left = new Image();
        this.image_left.src = image_left;
    }


    /**
     * 
     * @param {GameEntity} entity the entity to animate
     * @param {number} frame the current frame to animate
     */
    onEachFrame(entity, frame){
    }

    onRender(entity, deltaTime){
    }

    /**
     * calls on end of the animation
     * @param {GameEntity} entity 
     */
    onEnd(entity){

    }
}

export default Animation;