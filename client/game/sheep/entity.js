import { MyGameEntity } from "../MyGameEntity.js";
import get_animation_controller from "./animation_controller.js";

function generate(props){
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