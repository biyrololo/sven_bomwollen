import GameMap from "../Canvas2DEngine/GameMap.js";
import MapMap from "./MapMap.js";
import { Btn } from "./UIBtn.js";

class MyGameMap extends GameMap{
    socket = null;
    constructor(props){
        super(props);
        this.health = new Image();
        this.health.src = '/src/images/health.jpg';
        this.block_size = 200;
        this.mapMap = new MapMap({
            width: 1,
            height: 1
        });
        this.game_time = 180;
    }

    set_ui(){
        this.btns = [
            new Btn({
                img: '/src/images/autoplay.jpg',
                sizes: {width: 200, height: 200},
                position: {x: this.camera.sizes.width - 300, y: this.camera.sizes.height / 2 - 100},
                global_scale: this.global_scale,
                onClick: ()=>this.makeAutoplay()
            })
        ]
    }

    makeAutoplay(){
        this.socket.send(JSON.stringify({
            event: 'change_autoplay'
        }))
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
        if(!pos) return;
        this.mapMap.remove(pos.x, pos.y);
    }
    
    draw(){
        super.draw();
        this.draw_ui();
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

    draw_ui(){
        this.draw_time();
        this.btns.forEach(btn => btn.draw(this.context));
        this.draw_health();
    }

    draw_health(){
        const PARAMS = {
            x: 100,
            y: this.camera.sizes.height - 150,
            size: 100,
            gap: 40
        }
        for(let i = 0; i < this.player.health; i++){
            this.context.drawImage(
                this.health,
                0,
                0,
                this.health.width,
                this.health.height,
                (PARAMS.x + i * PARAMS.size + (i * PARAMS.gap)) * this.global_scale,
                PARAMS.y * this.global_scale,
                PARAMS.size * this.global_scale,
                PARAMS.size * this.global_scale
            )
        }
    }

    draw_time(){
        this.context.fillStyle = 'red';
        this.context.font = '50px Arial';
        this.context.textAlign = 'center';
        this.context.textBaseline = 'middle';
        const draw_time = Math.floor(this.game_time / 60) + ':' + (this.game_time % 60).toString().padStart(2, '0');
        this.context.fillText(draw_time, 80, 50);
    }

    get_posiiton(x, y){
        return {
            x: x * this.block_size + (y % 2) * this.block_size / 2,
            y: y / 2 * this.block_size
        }
    }
}

export default MyGameMap;