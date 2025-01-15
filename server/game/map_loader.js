export default function load(map_config, game_map){
    const GAME_MAP_SIZE = {width: game_map.sizes.width, height: game_map.sizes.height};
    for(let layer of map_config.layers){
        if(layer.name === 'collision'){
            let wall_id = 0;
            for(let chunk of layer.chunks){
                const {x, y, width, height, data} = chunk;
                for(let i = 0; i < width; i++){
                    for(let j = 0; j < height; j++){
                        if(data[j * width + i] === 0) continue;
                        let _x = x + i;
                        let _y = y + j;
                        let coordinates = get_coordinates(_x, _y);
                        // console.log(`got coordinates`, coordinates);
                        if(coordinates){

                            if(coordinates.y >= GAME_MAP_SIZE.height) continue;
                            if(coordinates.x >= GAME_MAP_SIZE.width) continue;
                            game_map.add(coordinates.x, coordinates.y, {name: 'wall', id: wall_id++});
                        }
                    }
                }
            }
        }
        if(layer.name === 'teleports'){
            let wall_id = 0;
            for(let chunk of layer.chunks){
                const {x, y, width, height, data} = chunk;
                for(let i = 0; i < width; i++){
                    for(let j = 0; j < height; j++){
                        if(data[j * width + i] === 0) continue;
                        let _x = x + i;
                        let _y = y + j;
                        let coordinates = get_coordinates(_x, _y);
                        // console.log(`got coordinates`, coordinates);
                        if(coordinates){

                            if(coordinates.y >= GAME_MAP_SIZE.height) continue;
                            if(coordinates.x >= GAME_MAP_SIZE.width) continue;
                            game_map.add(coordinates.x, coordinates.y, {name: 'teleport', id: wall_id++});
                        }
                    }
                }
            }
        }
    }
}

function get_coordinates(x, y){
    if(x % 2 === y % 2){
        return {
            y,
            x: Math.floor(x / 2)
        }
    }

    return undefined;
}