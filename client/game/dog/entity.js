import { MyGameEntity } from "../MyGameEntity.js";
import get_animation_controller from "./animation_controller.js";

function generate(props){
    const DEFAULT_RROPS = {
        position: { x: 0, y: 0 },
        sizes: { width: 250, height: 250 },
        context: null,
        max_health: 100,
        speed: 50
    }
    const entity =  new MyGameEntity({
        ...DEFAULT_RROPS,
        ...props
    });
    entity.getOffset = function(){
        return {
            x: -25,
            y: -25
        }
    }
    entity.addAnimationController(get_animation_controller());
    return entity;
}

export { generate };