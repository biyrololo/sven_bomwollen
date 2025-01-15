import { GameCamera } from "../Canvas2DEngine/index.js";

const camera = new GameCamera({
    position: {x: 0, y: 0},
    sizes: {width: 2800, height: 1400},
    innerBox: {x: 30, y: 0, width: 40, height: 100}
});
export default camera;