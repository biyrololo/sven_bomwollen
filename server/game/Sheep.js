import Entity from "./Entity.js";

export default class Sheep extends Entity{
    satifying_timeout = null;
    constructor(position) {
        super('sheep', position, 0);
        this.satisfy_level = 0;
        this.max_satisfy_level = 5;
        this.current_satisfy_level = 2;
        this.satisty_speed = 0.5;
        this.is_satisfying = false;
        this.angry_level = 0;
        this.max_angry_level = 5;
        this.checked_by_dog = false;
        this.checked_by_oldman = false;
        this.satisfying_by = null;
    }

    startSatisfying(){
        this.is_satisfying = true;
        this.satisfy();
    }

    satisfy(){
        this.satifying_timeout = setTimeout(()=>{
            this.current_satisfy_level-=this.satisty_speed;
            // console.log('satisfy level', this.current_satisfy_level);
            if(this.current_satisfy_level === 0){
                this.completeSatisfying();
                return;
            } else {
                this.game.stopSatisfyingByTime(this);
            }
            // this.satisfy();
        }, this.satisty_speed * 1000)
    }

    completeSatisfying(){
        clearTimeout(this.satifying_timeout);
        this.satifying_timeout = null;
        this.is_satisfying = false;
        this.game.completeSatisfying(this);
    }

    stopSatisfying(){
        clearTimeout(this.satifying_timeout);
        this.satifying_timeout = null;
        this.is_satisfying = false;
        this.game.stopSatisfying(this);
    }

    update(dt){
    }
}