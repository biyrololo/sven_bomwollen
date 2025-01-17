import { get_direction } from "../controls.js";
import find_shortest_path from "../find_shortest_path.js";
import { MyGameEntity } from "../MyGameEntity.js";
import get_animation_controller from "./animation_controller.js";

function generate(props, socket){
    const DEFAULT_RROPS = {
        position: { x: 0, y: 0 },
        sizes: { width: 200, height: 200 },
        context: null,
        max_health: 100,
        speed: 50
    }
    const entity =  new MyGameEntity({
        ...DEFAULT_RROPS,
        ...props
    });
    entity.$type = 'player'
    entity.global_target = null;
    entity.addAnimationController(get_animation_controller());
    entity.addEventListener('target_reached', e => {
        return;
        
        if(entity.global_target){
            if(entity._map.mapMap.position_of(entity).compare(entity.global_target)){
                entity.global_target = null;
                return;
            }
            const path = find_shortest_path(entity._map.mapMap.position_of(entity), entity.global_target, entity._map.mapMap, entity);
            if(path.length > 0){
                console.log(path);
                const dir = get_direction(
                    entity._map.get_posiiton(path[0].x, path[0].y).x,
                    entity._map.get_posiiton(path[0].x, path[0].y).y,
                    entity.position_x,
                    entity.position_y
                )

                console.log(`move_player dir: ${dir}`);

                socket.send(JSON.stringify({
                    event: 'move_player',
                    payload: {
                        direction: dir
                    }
                }));
            }
        }
    });
    return entity;
}



export { generate };