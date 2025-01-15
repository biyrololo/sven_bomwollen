import { Animation } from "../../Canvas2DEngine/index.js";
import { DIRECTIONS } from "../../Canvas2DEngine/GameEntity.js";

const _path = `src/images/sheep/`;

// walkAnimation.onRender = (entity, deltaTime) => {
//     entity.position_x += entity.speed * deltaTime * entity.direction;
// }

const idleAnimation = new Animation({
    name: 'idle',
    image_right: `${_path}Idle.png`,
    image_left: `${_path}Idle_Left.png`,
});

const satisfyAnimation = new Animation({
    name: 'satisfy',
    image_right: `${_path}Satisfy.png`,
    image_left: `${_path}Satisfy_Left.png`,
});

const satisfyBackAnimation = new Animation({
    name: 'satisfy_back',
    image_right: `${_path}SatisfyBack.png`,
    image_left: `${_path}SatisfyBack_Left.png`,
});

export { idleAnimation, satisfyAnimation, satisfyBackAnimation };