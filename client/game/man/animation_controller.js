import { AnimationController } from "../../Canvas2DEngine/index.js";
import * as animations from "./animations.js";

function get_animation_controller(){
    const animation_controller = new AnimationController({
        entity: null,
        frequency: 1/10
    });
    
    for(const [name, animation] of Object.entries(animations)){
        animation_controller.addAnimation(animation);
    }
    return animation_controller;
}

export default get_animation_controller;