import MapMap from "./MapMap.js";

export function comparePosition(pos1, pos2){
    return pos1.x === pos2.x && pos1.y === pos2.y;
}

/**
 * 
 * @param {{x: number, y: number}} start 
 * @param {{x: number, y: number}} end 
 * @param {MapMap} map 
 * @param {boolean} through_walls
 */
export default function find_shortest_path(start, end, map, through_walls=false){

    const height = map.$map.length;
    const width = map.$map[0].length;
    const target_entity = map.get(end.x, end.y);
    const player = map.get(start.x, start.y);
    if(start.x < 0 || start.y < 0 || start.x >= width || start.y >= height){
        return [];
    }
    if(end.x < 0 || end.y < 0 || end.x >= width || end.y >= height){
        return [];
    }
    const DIST = new Array(height).fill(null).map(() => new Array(width).fill({from: null, length: Number.MAX_SAFE_INTEGER - 1}));

    if(comparePosition(start, end)){
        return [];
    }

    DIST[start.y][start.x] = {
        from: null,
        length: 0
    }

    dfs(start, end, map, DIST, null, 0, player, target_entity);

    let current = DIST[end.y][end.x];
    // console.table(DIST.map(row => row.map(cell => cell.length)));
    if(current === null){
        return [];
    }
    const path = [];
    if(!map.has(end.x, end.y) || through_walls){
        path.push(end);
    }
    while(current.from !== null){
        // console.log(current);
        path.push(current.from);
        current = DIST[current.from.y][current.from.x];
    }
    return path.reverse().slice(1);
}

function dfs(start, end, map, dist, from, length, Player, entity_target){
    
    if(start.x < 0 || start.y < 0 || start.x >= map.$map[0].length || start.y >= map.$map.length){
        return;
    }

    if(map.has(start.x, start.y) && !(map.get(start.x, start.y) === Player || map.get(start.x, start.y) === entity_target)){
        return;
    }

    else {
        if(dist[start.y][start.x].length > length){
            dist[start.y][start.x] = {
                from,
                length: length
            }
        } else {
            if((map.get(start.x, start.y) !== Player) || (map.get(start.x, start.y) === Player && length !== 0)){
                return;
            }
        }
    }


    if(comparePosition(start, end)){
        return;
    }

    for(const [x, y] of get_possible_directions(start.x, start.y)){
        dfs({x, y}, end, map, dist, start, length + 1, Player, entity_target);
    }
}

function get_possible_directions(point_x, point_y){
    const paths = get_directions(point_x, point_y).map(([x, y]) => [point_x + x, point_y + y]);
    return paths;
}

export function get_directions(x, y){
    if(y % 2 == 0){
        return [
            [0, -1],
            [-1, -1],
            [-1, 1],
            [0, 1]
        ]
    }
    return [
        [1, -1],
        [0, -1],
        [0, 1],
        [1, 1]
    ]
}