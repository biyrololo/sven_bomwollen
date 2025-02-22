let last_id = 0;

export default class Token{
    constructor(pos, name, onTake){
        this.id = ++last_id;
        this.name = name;
        this.position = pos;
        this.onTake = onTake;
    }

    take(player){
        this.onTake(player);
    }
    json(){
        return {
            position: this.position,
            name: this.name
        }
    }
}