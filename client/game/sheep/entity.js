import { MyGameEntity } from "../MyGameEntity.js";
import get_animation_controller from "./animation_controller.js";

class Sheep extends MyGameEntity{
    constructor(props){
        const DEFAULT_RROPS = {
            position: { x: 0, y: 0 },
            sizes: { width: 150, height: 150 },
            context: null,
            max_health: 100,
            speed: 100  
        };
        super({
            ...DEFAULT_RROPS,
            ...props
        });
        this.type = 'SHEEP';
        this.is_satisfying = false;
        this.addAnimationController(get_animation_controller());
        this.animation_controller.setAnimationByName('idle');
        this.animation_controller.current_frame = Math.floor(Math.random() * this.animation_controller.max_frame);
        this.movable = false;
        this.mood = 1;
        this.mood_img = new Image();
        this.mood_img.src = '/src/images/mood1.png';
    }

    getOffset(){
        if(this.animation_controller.currentAnimationIn(['satisfy', 'satisfy_back'])){
            this.scale = 1.5;
            return {
                x: 10,
                y: -50
            }
        }

        this.scale = 1;

        return {
            x: 30,
            y: 10
        }
    }

    draw(camera, global_scale){
        super.draw(camera, global_scale);
        this.context.drawImage(
            this.mood_img, 
            0, 0, this.mood_img.width, this.mood_img.height,
            (this.position.x - camera.position.x + this.sizes.width - 50) * global_scale,
            (this.position.y - camera.position.y) * global_scale,
            80 * global_scale,
            80 * this.mood_img.height / this.mood_img.width * global_scale
        );
    }
}

function generate(props){
    return new Sheep(props);
    const DEFAULT_RROPS = {
        position: { x: 0, y: 0 },
        sizes: { width: 150, height: 150 },
        context: null,
        max_health: 100,
        speed: 100  
    }
    const entity =  new MyGameEntity({
        ...DEFAULT_RROPS,
        ...props
    });
    entity.getOffset = function(){
        return {
            x: 20,
            y: 20
        }
    }
    entity.type = 'SHEEP';
    entity.is_satisfying = false;
    entity.getOffset = function(){
        if(entity.animation_controller.currentAnimationIn(['satisfy', 'satisfy_back'])){
            entity.scale = 1.5;
            return {
                x: 10,
                y: -50
            }
        }

        entity.scale = 1;

        return {
            x: 30,
            y: 10
        }
    }
    entity.addAnimationController(get_animation_controller());
    entity.animation_controller.setAnimationByName('idle');
    entity.animation_controller.current_frame = Math.floor(Math.random() * entity.animation_controller.max_frame);
    entity.movable = false;
    return entity;
}



export { generate };