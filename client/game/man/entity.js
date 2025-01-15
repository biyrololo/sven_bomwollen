import { MyGameEntity } from "../MyGameEntity.js";
import get_animation_controller from "./animation_controller.js";

function generate(props){
    const DEFAULT_RROPS = {
        position: { x: 0, y: 0 },
        sizes: { width: 300, height: 300 },
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
            x: -100,
            y: -100
        }
    }
    entity.addAnimationController(get_animation_controller());
    return entity;
}

export { generate };