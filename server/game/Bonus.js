export default class Bouns{
    timeout = null;
    outer_timeout = null;
    constructor(pos, name, onTake, onTimeout, time){
        this.name = name;
        this.position = pos;
        this.onTake = onTake;
        this.onTimeout = onTimeout;
        this.time = time;
    }

    take(player){
        this.onTake(player);
    }

    break(){
        clearTimeout(this.timeout);
    }

    json(){
        return {
            position: this.position,
            name: this.name
        }
    }
}

export const SpeedBonus = (pos)=>(
    new Bouns(pos,'speed', (player) => {
        if(!player.speed_bonus){
            player._last_speed = player.speed;
            player.speed*=2;
            player.speed_bonus = true;
            player.game.broadcast({
                event: 'change_speed',
                payload: {
                    player: {
                        x: player.position.x,
                        y: player.position.y,
                        id: player.id,
                        speed: player.speed
                    }
                }
            })
        }
    }, (player) => {
        player.speed = player._last_speed;
        player.speed_bonus = false;
        player.game.broadcast({
            event: 'change_speed',
            payload: {
                player: {
                    x: player.position.x,
                    y: player.position.y,
                    id: player.id,
                    speed: player.speed
                }
            }
        })
    }, 20)
)

export const DogBonus = (pos)=>(
    new Bouns(pos, 'dog', (player) => {
        const dog = player.game.dog;
        dog.sleeping = true;
        dog.stop_all();
        console.log('dog sleep');
    }, (player) => {
        console.log('dog wake up');
        const dog = player.game.dog;
        dog.sleeping = false;
        dog.start();
    }, 20)
)

export const OldmanBonus = (pos)=>(
    new Bouns(pos, 'oldman', (player) => {
        const oldman = player.game.oldman;
        oldman.sleeping = true;
        oldman.stop_all();
    }, (player) => {
        const oldman = player.game.oldman;
        oldman.sleeping = false;
        oldman.start();
    }, 20)
)