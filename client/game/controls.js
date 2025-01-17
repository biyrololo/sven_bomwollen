import { GameEntity, Controls } from "../Canvas2DEngine/index.js";
import { DIRECTIONS } from "../Canvas2DEngine/GameEntity.js";
import { MyGameEntity } from "./MyGameEntity.js";
import find_shortest_path from "./find_shortest_path.js";
import { get_directions as get_directions_map } from "./find_shortest_path.js";


/**
 * . . . . . .
 * .    1  . 
 *   .    .   
 * 2   . .  3
 *    .   . 
 *   .    .   
 * .   4   . 
 * . . . . . .
 */

function get_triangle(frac_x, frac_y){
    if(frac_y <= 0.5){
        if(frac_y <= frac_x && frac_y <= 1 - frac_x){
            return 1;
        }

        if(frac_x <= 0.5){
            return 2;
        }
        return 3;
    }

    if(frac_y >= frac_x && frac_y >= 1 - frac_x){
        return 4;
    }

    if(frac_x >= 0.5){
        return 3;
    }

    return 2;
}

export function get_direction(block_x, block_y, player_x, player_y){

    // console.log(`compare: block: (${block_x}, ${block_y}) player: (${player_x}, ${player_y})`)
    if(block_x < player_x){
        if(block_y < player_y){
            return "UP_LEFT";
        }
        if(block_y > player_y){
            return "DOWN_LEFT";
        }
        return "LEFT";
    }

    if(block_x > player_x){
        if(block_y < player_y){
            return "UP_RIGHT";
        }
        if(block_y > player_y){
            return "DOWN_RIGHT";
        }
        return "RIGHT";    
    }

    return "NONE";
}

/**
 * 
 * @param {MyGameEntity} Player 
 * @param {WebSocket} socket
 * @returns {Controls}
 */
function get_controls(Player, socket){

    const controls = new Controls();

    const move_dir = (dir) => {
        Player.global_target = null;
        socket.send(JSON.stringify({
            event: "move_player",
            payload: {
                direction: dir
            }
        }));
    }

    controls.addKey("ArrowUp", {
        down: () => {
            move_dir("UP_LEFT");
        },
    });

    controls.addKey("ArrowDown", {
        down: () => {
            move_dir("DOWN_RIGHT");
        },
    });

    controls.addKey("ArrowLeft", {
        down: () => {
            move_dir("DOWN_LEFT");
        },
    });

    controls.addKey("ArrowRight", {
        down: () => {
            move_dir("UP_RIGHT");
        },
    });

    controls.addKey("Space", {
        down: () => {
            // check if sheep is nearby
            const player_pos = Player._map.mapMap.position_of(Player);
            if(!player_pos) return;
            let sheep = null;
            let sheep_pos = null;
            for(let dir of get_directions_map(player_pos.x, player_pos.y)){
                const ent_pos = {x: dir[0] + player_pos.x, y: dir[1] + player_pos.y};
                const ent = Player._map.mapMap.get(ent_pos.x, ent_pos.y);
                if(ent && ent.type === "SHEEP"){
                    sheep = ent;
                    sheep_pos = ent_pos;
                    break;
                }
            }
            if(sheep){
                socket.send(JSON.stringify({
                    event: 'satisfy_sheep',
                    payload: {
                        x: sheep_pos.x,
                        y: sheep_pos.y,
                        id: sheep._id
                    }
                }))
            }
        },
    });

    const handle_click = (e) => {
        if(!Player._map.mapMap.position_of(Player)) return;
        let { clientX, clientY } = e;
        let _x = ((clientX / Player._map.global_scale) - Player._map.block_size / 4 + (Player._map.camera.position.x)) / (Player._map.block_size / 2);
        let _y = ((clientY / Player._map.global_scale) - Player._map.block_size / 4 + (Player._map.camera.position.y)) / (Player._map.block_size / 2);
        let block_pos = {
            x: Math.floor(_x),
            y: Math.floor(_y),
            frac_x: _x - Math.floor(_x),
            frac_y: _y - Math.floor(_y)
        }

        let block_clicked_pos = {
            x: 0, y: 0
        }

        if(block_pos.y % 2 === block_pos.x % 2){
            // Player.setTarget(Player._map.get_posiiton(Math.floor(block_pos.x/2), block_pos.y));
            block_clicked_pos.x = Math.floor(block_pos.x/2);
            block_clicked_pos.y = block_pos.y;
            // console.log(`correct block;`, {x: Math.floor(block_pos.x/2), y: block_pos.y});
            // return;            
        } else {
            const triangle = get_triangle(block_pos.frac_x, block_pos.frac_y);
                if(triangle === 1){
                    // Player.setTarget(Player._map.get_posiiton(Math.floor(block_pos.x / 2), block_pos.y - 1));
                    block_clicked_pos.x = Math.floor(block_pos.x / 2);
                    block_clicked_pos.y = block_pos.y - 1;
                    // console.log(`triangle 1;`, {x: Math.floor(block_pos.x / 2), y: block_pos.y - 1});
                    // return;
                }
    
                if(triangle === 2){
                    // Player.setTarget(Player._map.get_posiiton(Math.floor((block_pos.x - 1) / 2), block_pos.y));
                    block_clicked_pos.x = Math.floor((block_pos.x - 1) / 2);
                    block_clicked_pos.y = block_pos.y;
                    // console.log(`triangle 2;`, {x: Math.floor((block_pos.x - 1) / 2), y: block_pos.y});
                    // return;
                }
    
                if(triangle === 3){
                    // Player.setTarget(Player._map.get_posiiton(Math.floor((block_pos.x + 1) / 2), block_pos.y));
                    block_clicked_pos.x = Math.floor((block_pos.x + 1) / 2);
                    block_clicked_pos.y = block_pos.y;
                    // console.log(`triangle 3;`, {x: Math.floor((block_pos.x + 1) / 2), y: block_pos.y});
                    // return;
                }
    
                if(triangle === 4){
                    // Player.setTarget(Player._map.get_posiiton(Math.floor(block_pos.x / 2), block_pos.y + 1));
                    block_clicked_pos.x = Math.floor(block_pos.x / 2);
                    block_clicked_pos.y = block_pos.y + 1;
                    // console.log(`triangle 4;`, {x: Math.floor(block_pos.x / 2), y: block_pos.y + 1});
                    // return;
                }
        }

        Player.global_target = {
            x: block_clicked_pos.x,
            y: block_clicked_pos.y
        }

        const path = find_shortest_path(
            Player._map.mapMap.position_of(Player),
            block_clicked_pos,
            Player._map.mapMap,
            Player
        );

        console.log(path);

        if(!path){
            console.log(`no path;`, block_clicked_pos);
            return;
        }

        if(path.length === 0){
            console.log(`zero path;`, block_clicked_pos);
            return;
        }

        if(path.length === 1){
            console.log(`one length path;`, block_clicked_pos);
            let ent = Player._map.mapMap.get(block_clicked_pos.x, block_clicked_pos.y);
            if(ent && ent?.type === "SHEEP"){
                socket.send(JSON.stringify({
                    event: 'satisfy_sheep',
                    payload: {
                        x: block_clicked_pos.x,
                        y: block_clicked_pos.y,
                        id: ent._id
                    }
                }))
                return;
            }
        }

        console.log(path);
        console.log(Player._map.mapMap.position_of(Player))
        console.log(block_clicked_pos)

        let dir = get_direction(
            Player._map.get_posiiton(path[0].x, path[0].y).x,
            Player._map.get_posiiton(path[0].x, path[0].y).y,
            Player.position_x,
            Player.position_y
        );

        console.log(dir)

        socket.send(JSON.stringify({
            event: "move_player",
            payload: {
                direction: dir
            }
        }));
    }

    window.addEventListener('mousedown', (e) => {
        handle_click(e);
    })

    window.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        handle_click({clientX: touch.clientX, clientY: touch.clientY});
    })

    return controls;
}

export default get_controls;