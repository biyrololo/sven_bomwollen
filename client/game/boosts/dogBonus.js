import { AnimationController } from "../../Canvas2DEngine/index.js";
import { Animation } from "../../Canvas2DEngine/index.js";
import { MyGameEntity } from "../MyGameEntity.js";

const animation = new Animation({
    name: 'idle',
    image_right: `src/images/bone.jpeg`,
    image_left: `src/images/bone.jpeg`,
    frames_count: 1
});

function get_animation_controller(){
    const animation_controller = new AnimationController({
        entity: null,
        frequency: 1/6
    });
    
    animation_controller.addAnimation(animation);
    return animation_controller;
}

export function generateDogBonus(props){
    const DEFAULT_RROPS = {
        position: { x: 0, y: 0 },
        sizes: { width: 150, height: 150 },
        context: null,
        max_health: 100,
        speed: 100
    };

    const entity = new MyGameEntity({
        ...DEFAULT_RROPS,
        ...props
    });
    entity.type = 'dogBonus';
    entity.$type = 'dogBonus';
    entity.addAnimationController(get_animation_controller());
    entity.animation_controller.setAnimationByName('idle');
    return entity;
}