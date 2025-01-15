export default class Directions {

    static DELTA_EVEN = {
        UP_RIGHT: [0, -1],
        UP_LEFT: [-1, -1],
        DOWN_LEFT: [-1, 1],
        DOWN_RIGHT: [0, 1]
    }

    static DELTA_ODD = {
        UP_RIGHT: [1, -1],
        UP_LEFT: [0, -1],
        DOWN_LEFT: [0, 1],
        DOWN_RIGHT: [1, 1]
    }

    static get_delta_from(x, y){
        let delta = Directions.get_delta(y);
        const pos = [];

        for(const key in delta){
            pos.push({x: x + delta[key][0], y: y + delta[key][1]});
        }

        return pos;
    }

    static get_delta(y){
        if(y % 2 == 0){
            return Directions.DELTA_EVEN;
        }
        return Directions.DELTA_ODD;
    }

    static is_near(x1, y1, x2, y2){
        const delta = Directions.get_delta_from(x1, y1);
        for(const pos of delta){
            if(pos.x === x2 && pos.y === y2){
                return true;
            }
        }
        return false;
    }
}