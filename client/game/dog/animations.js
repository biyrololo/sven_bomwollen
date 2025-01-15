import { Animation } from "../../Canvas2DEngine/index.js";
import { DIRECTIONS } from "../../Canvas2DEngine/GameEntity.js";

const _path = `src/images/dog/`;

const walkAnimation = new Animation({
    name: 'walk',
    image_right: `${_path}Walk.png`,
    image_left: `${_path}Walk_Left.png`,
});

const walkBackAnimation = new Animation({
    name: 'walk_back',
    image_right: `${_path}Walk_Back.png`,
    image_left: `${_path}Walk_Back_Left.png`,
});

// walkAnimation.onRender = (entity, deltaTime) => {
//     entity.position_x += entity.speed * deltaTime * entity.direction;
// }

const idleAnimation = new Animation({
    name: 'idle',
    image_right: `${_path}Idle.png`,
    image_left: `${_path}Idle_Left.png`,
});

export { walkAnimation, idleAnimation, walkBackAnimation };