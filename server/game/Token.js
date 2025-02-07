export default class Token{
    constructor(pos, name, onTake){
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