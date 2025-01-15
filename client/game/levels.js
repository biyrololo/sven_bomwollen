import { GameLevel } from "../Canvas2DEngine/index.js";

const test_level = new GameLevel({
    entities: [],
    background_image_src: "src/images/fon1_winter.png",
    start_position: {x: 500, y: 200},
    name: "test_level",
    sizes: {
        width: 2800,
        height: 1400
    }
});

export { test_level };