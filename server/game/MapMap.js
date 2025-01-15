class MapMap {
    constructor(sizes){
        this.$map = new Array(sizes.height);
        for(let i = 0; i < sizes.height; i++){
            this.$map[i] = new Array(sizes.width).fill(null);
        }
    }

    get sizes(){
        return {
            width: this.$map[0].length,
            height: this.$map.length
        }
    }

    get(x, y){
        return this.$map[y][x];
    }

    get_free(){
        let free_positions = [];
        for(let y = 0; y < this.$map.length; y++){
            for(let x = 0; x < this.$map[y].length; x++){
                if(this.$map[y][x] === null){
                    free_positions.push({x, y});
                }
            }
        }
        free_positions.shuffle();
        if(free_positions.length > 0){
            return free_positions[0];
        }
        return null;
    }

    position_of(value){
        for(let y = 0; y < this.$map.length; y++){
            for(let x = 0; x < this.$map[y].length; x++){
                if(this.$map[y][x]?._id === value._id){
                    return {x, y};
                }
            }
        }
        return null;
    }

    has(x, y){
        if(x < 0 || y < 0 || x >= this.$map[0].length || y >= this.$map.length){
            return false;
        }
        return this.$map[y][x] !== null;
    }

    add(x, y, value){
        // console.log(`set ${value} at ${x}, ${y}`);
        this.$map[y][x] = value;
    }

    remove(x, y){
        this.$map[y][x] = null;
    }

    move(x1, y1, x2, y2){
        const value = this.$map[y1][x1];
        this.$map[y1] = this.$map[y1].map((_, i) => i === x1 ? null : this.$map[y1][i]);
        this.$map[y2] = this.$map[y2].map((_, i) => i === x2 ? value : this.$map[y2][i]);
    }

    json(){
        let conv_map = [];
        for(let y = 0; y < this.$map.length; y++){
            conv_map[y] = [];
            for(let x = 0; x < this.$map[y].length; x++){
                conv_map[y][x] = this.$map[y][x]?.name || null;
            }
        }
        return {
            width: this.$map[0].length,
            height: this.$map.length,
            map: conv_map
        }
    }
}

export default MapMap;