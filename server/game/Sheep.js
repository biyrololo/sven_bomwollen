import Entity from "./Entity.js";

export default class Sheep extends Entity{
    satifying_timeout = null;
    mood_interval = null;
    constructor(position) {
        super('sheep', position, 0);
        this.satisfy_level = 0;
        this.max_satisfy_level = 7;
        this.current_satisfy_level = 2;
        this.satisty_speed = 1;
        this.is_satisfying = false;
        this.angry_level = 0;
        this.max_angry_level = 5;
        this.checked_by_dog = false;
        this.checked_by_oldman = false;
        this.satisfying_by = null;
    }

    start(){
        this.start_mood_update();
    }

    start_mood_update(){
        this.mood_interval = setInterval(()=>{
            if(this.current_satisfy_level < this.max_satisfy_level){
                this.current_satisfy_level++;
                if(this.current_satisfy_level > this.max_satisfy_level) this.current_satisfy_level = this.max_satisfy_level;
                this.game.broadcast({
                    event: 'update_sheep_mood',
                    payload: {
                        id: this.id,
                        mood: this.current_satisfy_level
                    }
                })
            }
        }, 20000)
    }

    stop_mood_update(){
        clearInterval(this.mood_interval);
    }

    startSatisfying(){
        this.stop_mood_update();
        this.is_satisfying = true;
        this.satisfy();
    }

    satisfy(){
        this.satifying_timeout = setTimeout(()=>{
            const k = this.satisfying_by?.speed_bonus ? 2 : 1;
            this.current_satisfy_level-=this.satisty_speed * k;
            this.game.broadcast({
                event: 'update_sheep_mood',
                payload: {
                    id: this.id,
                    mood: this.current_satisfy_level
                }
            })
            // console.log('satisfy level', this.current_satisfy_level);
            if(this.current_satisfy_level <= 0){
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