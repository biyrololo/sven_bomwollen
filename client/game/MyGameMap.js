import GameMap from "../Canvas2DEngine/GameMap.js";
import MapMap from "./MapMap.js";

class MyGameMap extends GameMap{
    constructor(props){
        super(props);
        this.block_size = 200;
        this.mapMap = new MapMap({
            width: 1,
            height: 1
        });
    }

    setMapMap(sizes){
        this.mapMap = new MapMap(sizes);
    }

    addEntityToCurrentLevel(entity){
        entity._map = this;
        entity.context = this.context;
        this.current_level.addEntity(entity);
    }

    removeEntityFromCurrentLevel(entity){
        this.current_level.removeEntity(entity);
        let pos = this.mapMap.position_of(entity);
        this.mapMap.remove(pos.x, pos.y);
    }
    
    draw(){
        super.draw();
        return;
        for(let x = 0; x < this.mapMap.$map[0].length; x++){
            for(let y = 0; y < this.mapMap.$map.length; y++){
                this.context.fillStyle = 'rgba(0, 0, 0, 0.3)';
                if(y % 2){
                    this.context.fillStyle = 'rgba(255, 0, 0, 0.2)';
                }
                this.context.fillRect(
                    (x * this.block_size - this.camera.position.x + (y % 2) * this.block_size / 2 + this.block_size / 4) * this.global_scale,
                    (y / 2 * this.block_size - this.camera.position.y + this.block_size / 4) * this.global_scale,
                    this.block_size * this.global_scale * 0.99 / 2,
                    this.block_size * this.global_scale * 0.99 / 2
                )
            }
        }
    }

    get_posiiton(x, y){
        return {
            x: x * this.block_size + (y % 2) * this.block_size / 2,
            y: y / 2 * this.block_size
        }
    }
}

export default MyGameMap;