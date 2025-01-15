import { GameMap, Controls } from "../Canvas2DEngine/index.js";
import { test_level } from "./levels.js";
import camera from "./camera.js";
import { generate as generatePlayer } from "./svan/index.js";
import { generate as generateMan } from "./man/index.js";
import { generate as generateDog } from "./dog/index.js";
import load from "./loading.js";
import get_controls from "./controls.js";
import MyGameMap from "./MyGameMap.js";
import EventHandler from "./EventHandler.js";

Object.prototype.compare = function (other) {
    return JSON.stringify(this) === JSON.stringify(other);
}

function start(){
    const canvas = document.querySelector("canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    camera.sizes.width = camera.sizes.height * canvas.width / canvas.height;
    const scale = canvas.height / camera.sizes.height;
    const ctx = canvas.getContext("2d");
    
    const game_map = new MyGameMap({
        context: ctx,
        canvas: canvas,
        global_scale: scale
    });

    // game_map.chunks_manager.chunk_size = camera.sizes.width;

    // const socket = new WebSocket('ws://localhost:8080');
    const socket = new WebSocket('ws://localhost:8080');
    const roomListSocket = new WebSocket('ws://localhost:8081');

    const Player = generatePlayer({context: ctx}, socket);
    const Man = generateMan({context: ctx});
    const Dog = generateDog({context: ctx});

    Player.animation_controller.setAnimationByName('idle');
    
    test_level.addEntity(Player);
    test_level.addEntity(Man);
    test_level.addEntity(Dog);
    
    console.log(test_level);
    
    game_map.addLevel(test_level);
    camera.setTarget(Player);
    game_map.addCamera(camera);

    const handler = new EventHandler({
        player: Player,
        map: game_map,
        man: Man,
        dog: Dog
    });

    const controls = get_controls(Player, socket);

    socket.onopen = function(){
        console.log("connected");
        console.log(socket)
        socket.send(JSON.stringify({
            event: 'get_rooms',
        }));
    }

    socket.onmessage = function(data){
        let d = JSON.parse(data.data);
        console.log(d)
        if(d.event === 'rooms'){
            if(d.payload.length === 0 || true){
                socket.send(JSON.stringify({
                    event: 'create_game',
                }))
            } else {
                socket.send(JSON.stringify({
                    event: 'join_game',
                    id: d.payload[0]
                }))
            }
        }
        // console.log(JSON.parse(data.data))
        handler.handle(d);
    }
    
    roomListSocket.onmessage = function(data){
        console.log(JSON.parse(data.data));
    }

    game_map.start_loop({
        controls
    });
}

load(start);

// console.log(Player)
// Player.context = ctx;