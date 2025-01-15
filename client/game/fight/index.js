import { Animation, AnimationController } from "../../Canvas2DEngine/index.js";
import { MyGameEntity } from "../MyGameEntity.js";

const _path = `src/images/fight/`;

const FightAnimation = new Animation({
    name: 'fight',
    image_right: `${_path}fight.png`,
    image_left: `${_path}fight_Left.png`,
});

function get_animation_controller(){
    const animation_controller = new AnimationController({
        entity: null,
        frequency: 1/10,
    })

    animation_controller.addAnimation(FightAnimation);
    return animation_controller;
}

export default function generate_fight(props){
    const DEFAULT_RROPS = {
        position: { x: 0, y: 0 },
        sizes: { width: 300, height: 300 },
        context: null,
        max_health: 100,
        speed: 50,
        type: 'fight'
    }

    const entity = new MyGameEntity({
        ...DEFAULT_RROPS,
        ...props
    });
    entity.addAnimationController(get_animation_controller());
    entity.animation_controller.setAnimationByName('fight');
    entity.animation_controller.max_frame = 7;
    entity.movable = false;
    entity.z_index = 2;
    entity.getOffset = function(){
        return {
            x: -50,
            y: -50
        }
    }
    return entity;
}
    