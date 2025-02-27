import Directions from "./game/Directions.js";
import Dog from "./game/Dog.js";
import load from "./game/map_loader.js";
import MapMap from "./game/MapMap.js";
import Oldman from "./game/Oldman.js";
import Sheep from "./game/Sheep.js";
import { winter_map } from "./maps/winter.js";
import { SpeedBonus, DogBonus, OldmanBonus } from './game/Bonus.js';
import Token from "./game/Token.js";
const bonuses = [SpeedBonus, DogBonus, OldmanBonus];

let last_id = 0;
export default class Game {
    constructor(delete_game) {
        this.delete_game = delete_game;
        this._id = ++last_id;
        this.players = [];
        this.entites = [];
        this.sheeps = [];
        this.tokens = [];
        this.bonus = null;
        this.oldman = null;
        this.dog = null;
        this.intervalId = null;
        this.timeIntervalId = null;
        this.map = new MapMap({width: 14, height: 13});
        this.time = 180;
        load(winter_map, this.map);
        // console.table(this.map.json().map);
        for(let i = 0; i < 10; i++){
            this.addEntity(new Sheep({x: 0, y: 0}), undefined, true);
        }
        this.addEntity(new Oldman({x: 0, y: 0}), undefined, true);
        this.addEntity(new Dog({x: 0, y: 0}), undefined, true);
        this.perf = performance.now();
        this.fight_time = 1;
    }

    player_leave(player_id){
        this.players = this.players.filter(p => p.entity.id !== player_id);
        if(this.players.length === 0){
            this.stopUpdating();
            this.delete_game(this);
        }
    }

    clear_all(){
        clearInterval(this.intervalId);
        clearInterval(this.timeIntervalId);
        for(let p of this.players){
            clearTimeout(p.moveTimeout);
            p.autoplay = false;
        }
        for(let s of this.sheeps){
            clearTimeout(s.satifying_timeout);
            clearInterval(s.mood_interval);
            s.autoplay = false;
        }
        this.dog.state = -1;
        this.oldman.state = -1;
        clearTimeout(this.dog.moveTimeout);
        clearTimeout(this.dog.waitTimeout);
        clearTimeout(this.oldman.moveTimeout);
        clearTimeout(this.oldman.waitTimeout);
        this.dog.stop_all();
        this.oldman.stop_all();
        this.players = [];
        this.entites = [];
        this.sheeps = [];
        this.tokens = [];
    }

    get_closest_sheep(entity){
        return this.sheeps.sort((a, b) => {
            return a.distance_to2(entity) - b.distance_to2(entity);
        })[0];
    }

    get_next_closes_sheep(entity, check){
        let filtered_sheeps = this.sheeps.filter(s => !s[`checked_by_${check}`]);
        if(filtered_sheeps.length === 0){
            // console.log(`all sheeps checked by ${check}`);
            this.sheeps.forEach(s => s[`checked_by_${check}`] = false);
            filtered_sheeps = this.sheeps;
        }
        // console.log(`filtered by check ${check}`, filtered_sheeps.map(s => s.id));
        return filtered_sheeps.sort((a, b) => {
            return a.distance_to2(entity) - b.distance_to2(entity);
        })[0] || null;
    }

    addEntity(entity, ws=undefined, free_position=false){
        if(free_position){
            const pos = this.map.get_free();
            if(pos){
                entity.position = pos;
            } else {
                throw new Error(`no free position on map (game ${this.id})`);
            }
        }
        if(ws){
            ws.on('message', (message) => {
                const data = JSON.parse(message);
                this.handle_message(data, entity, ws);
            })
            ws.on('close', () => {
                console.log(`Player ${entity.id} disconnected`);
                this.removeEntity(entity);
                if(this.players.length === 0){
                    this.delete_game(this);
                }
            })
        }
        entity.map = this.map;
        entity.game = this;
        entity.destroy = () => this.removeEntity(entity);
        this.entites.push(entity);
        this.map.add(entity.position.x, entity.position.y, entity);
        if(entity.name === 'player' && ws){
            this.players.push(
                {
                    entity: entity,
                    ws: ws
                }
            );
            this.broadcast({
                event: 'game_config',
                payload: this.json()}, entity.id);
        }
        if(entity.name === 'sheep'){
            this.sheeps.push(entity);
        }
        if(entity.name === 'oldman'){
            this.oldman = entity;
        }
        if(entity.name === 'dog'){
            this.dog = entity;
        }
        return entity.id;
    }

    removeEntity(entity){
        this.map.remove(entity.position.x, entity.position.y);
        this.entites = this.entites.filter(e => e.id !== entity.id);
        if(entity.name === 'player'){
            this.players = this.players.filter(p => p.entity.id !== entity.id);
        }
        if(entity.name === 'sheep'){
            this.sheeps = this.sheeps.filter(s => s.id !== entity.id);
        }
        if(entity.name === 'oldman'){
            this.oldman = null;
        }
        if(entity.name === 'dog'){
            this.dog = null;
        }
    }

    broadcast(data, exclude_player_id=null){
        // console.warn('broadcast', data);
        if(exclude_player_id !== null){
            const players = this.players.filter(p => p.entity.id !== exclude_player_id);
            players.forEach(p => p.ws.send(JSON.stringify(data)));
            return;
        }
        this.players.forEach(p => p.ws.send(JSON.stringify(data)));
    }

    stopSatisfyingByTime(sheep){
        let player = sheep.satisfying_by;
        player.satisfying_sheep = null;
        sheep.satisfying_by = null;
        sheep.is_satisfying = false;
        this.broadcast({
            event: 'stop_satisfying',
            payload: {
                sheep: {
                    x: sheep.position.x,
                    y: sheep.position.y,
                    id: sheep.id
                },
                player: {
                    x: player.position.x,
                    y: player.position.y,
                    id: player.id
                }
            }
        })
        sheep.start_mood_update();
    }

    handle_message(data, entity, ws){
        console.log('received', data, 'from', entity.id);
        const player_id = entity.id;
        if(!('event' in data)){
            ws.send(JSON.stringify({error: 'unknown_data'}));
            return;
        }

        if(data.event === 'change_autoplay'){
            if(entity.autoplay){
                this.stopAutoplay(entity);
                console.log('stop autoplay');
            } else {
                this.makeAutoplay(entity);
                console.log('start autoplay');
            }
        }

        if(entity.autoplay){
            return;
        }

        if(data.event === 'move_player'){
            const dir = data.payload?.direction;
            if(!dir){
                ws.send(JSON.stringify({error: 'no_direction'}));
                return;
            }
            if(entity.move_time !== 0){
                ws.send(JSON.stringify({error: 'already_moving'}));
                return;
            }
            const delta = Directions.get_delta(entity.position.y)[dir];
            if(!delta){
                ws.send(JSON.stringify({error: 'invalid_direction'}));
                return;
            }
            const new_x = entity.position.x + delta[0];
            const new_y = entity.position.y + delta[1];
            if(new_x < 0 || new_x >= this.map.sizes.width || new_y < 0 || new_y >= this.map.sizes.height){
                ws.send(JSON.stringify({error: 'invalid_move'}));
                return;
            }
            // console.log({new_x, new_y});
            // console.log(this.map.get(new_x, new_y));
            if(this.map.has(new_x, new_y) && this.map.get(new_x, new_y).name !== 'teleport'){
                ws.send(JSON.stringify({error: 'invalid_move'}));
                return;
            }
            if(entity.satisfying_sheep){
                this.broadcast({
                    event: 'stop_satisfying',
                    payload: {
                        sheep: {
                            x: entity.satisfying_sheep.position.x,
                            y: entity.satisfying_sheep.position.y,
                            id: entity.satisfying_sheep.id
                        },
                        player: {
                            x: entity.position.x,
                            y: entity.position.y,
                            id: entity.id
                        }
                    }
                })
                entity.satisfying_sheep.stopSatisfying();
            }
            entity.move(dir);
        }

        if(data.event === 'satisfy_sheep'){
            const sheep_params = data.payload;
            if(!sheep_params){
                ws.send(JSON.stringify({error: 'unresponsible sheep'}));
                return;
            }
            let sheep = this.map.get(sheep_params.x, sheep_params.y);
            if(!sheep){
                ws.send(JSON.stringify({error: 'invalid move'}));
                return;
            }
            if(sheep.id !== sheep_params.id){
                ws.send(JSON.stringify({error: 'incorrect payload'}));
                return;
            }
            let deltas = Directions.get_delta_from(entity.position.x, entity.position.y);
            let flag = false;
            for(const delta of deltas){
                if(this.map.has(delta.x, delta.y)){
                    flag = true;
                    break;
                }
            }
            if(!flag){
                ws.send(JSON.stringify({error: 'player too far'}));
                return;
            }
            if(entity.satisfying_sheep){
                ws.send(JSON.stringify({
                    error: 'player already satisfying sheep'
                }))
                return;
            }
            if(sheep.is_satisfying){
                ws.send(JSON.stringify({
                    error: 'sheep already satisfying player'
                }))
                return;
            }
            entity.satisfying_sheep = sheep;
            sheep.is_satisfying = true;
            sheep.satisfying_by = entity;
            this.dog.start_follow_player(entity);
            this.oldman.start_follow_player(entity);
            this.broadcast({
                event: 'satisfy_sheep',
                payload: {
                    player: {
                        x: entity.position.x,
                        y: entity.position.y,
                        id: player_id
                    },
                    sheep: {
                        x: sheep.position.x,
                        y: sheep.position.y,
                        id: sheep.id
                    }
                }
            })
            sheep.startSatisfying();
        }
    }

    completeSatisfying(sheep){
        let player = sheep.satisfying_by;
        this.broadcast({
            event: 'complete_satisfying',
            payload: {
                sheep: {
                    x: sheep.position.x,
                    y: sheep.position.y,
                    id: sheep.id
                },
                player: {
                    x: player.position.x,
                    y: player.position.y,
                    id: player.id
                }
            }
        })
        sheep.destroy();
        player.satisfying_sheep = null;
        player.score++;
        const pos = this.map.get_free();
        if(pos){
            let token = new Token(pos, 'coin', (player) => {
                this.takeToken(player, token);
            })
            this.tokens.push(token);
            this.broadcast({
                event: 'spawn_token',
                payload: {
                    token: {
                        x: token.position.x,
                        y: token.position.y,
                        id: token.id
                    }
                }
            })
        }
        if(this.sheeps.length === 0){
            this.endGame();
        }
    }

    takeToken(player, token){
        this.tokens = this.tokens.filter(t => t.id !== token.id);
        this.broadcast({
            event: 'take_token',
            payload: {
                player: {
                    x: player.position.x,
                    y: player.position.y,
                    id: player.id
                },
                token: {
                    x: token.position.x,
                    y: token.position.y,
                    id: token.id
                }
            }
        })
    }

    endGame(){
        let win_player = this.players.sort((a, b) => b.entity.score - a.entity.score)[0]?.entity;
        if(!win_player){
            this.broadcast({
                event: 'INTERNAL_ERROR',
                payload: {
                    error: 'no winner'
                }
            })
            // console.error('no winner');
            return;
        }
        this.broadcast({
            event: 'win_game',
            payload: {
                player: {
                    id: win_player.id
                }
            }
        })
        this.stopUpdating();
        this.delete_game(this);
    }

    stopSatisfying(sheep){
        let player = sheep.satisfying_by;
        this.broadcast({
            event: 'stop_satisfying',
            payload: {
                sheep: {
                    x: sheep.position.x,
                    y: sheep.position.y,
                    id: sheep.id
                },
                player: {
                    x: player.position.x,
                    y: player.position.y,
                    id: player.id
                }
            }
        })
        sheep.start_mood_update();
        player.satisfying_sheep = null;
    }

    looseGame(player, caught_by){
        if(player.satisfying_sheep !== null){
            player.satisfying_sheep.stopSatisfying();
        }
        player.healths--;
        this.broadcast({
            event: 'fight',
            payload: {
                player: {
                    x: player.position.x,
                    y: player.position.y,
                    id: player.id
                },
                caught_by: {
                    x: caught_by.position.x,
                    y: caught_by.position.y,
                    id: caught_by.id,
                    name: caught_by.name
                }
            }
        })
        setTimeout(() => {
            if(player.healths === 0){
                if(this.dog.target.active && this.dog.target.abs_target === player){
                    this.dog.stop_follow_player();
                }
                if(this.oldman.target.active && this.oldman.target.abs_target === player){
                    this.oldman.stop_follow_player();
                }
                this.broadcast({
                    event: 'loose_game',
                    payload: {
                        player: {
                            x: player.position.x,
                            y: player.position.y,
                            id: player.id
                        },
                        caught_by: {
                            x: caught_by.position.x,
                            y: caught_by.position.y,
                            id: caught_by.id,
                            name: caught_by.name
                        }
                    }
                })
                this.delete_game(this);
                this.stopUpdating();
            } else {
                this.broadcast({
                    event: 'fight_end',
                    payload: {
                        player: {
                            x: player.position.x,
                            y: player.position.y,
                            id: player.id,
                            healths: player.healths 
                        },
                        caught_by: {
                            x: caught_by.position.x,
                            y: caught_by.position.y,
                            id: caught_by.id,
                            name: caught_by.name
                        }
                    }
                })
                this.teleportPlayer(player, player.position, true);
            }
        }, this.fight_time * 1000)
    }

    teleportPlayer(player, from_pos, spawn=false){
        // console.log('teleport player', player.id);
        const pos = this.map.get_free();
        // console.log(pos);
        if(pos){
            player.position = pos;
            if(this.dog.target.active && this.dog.target.abs_target === player){
                this.dog.stop_follow_player();
            }
            if(this.oldman.target.active && this.oldman.target.abs_target === player){
                this.oldman.stop_follow_player();
            }
            this.broadcast({
                event: spawn ? 'player_spawn' : `player_teleport`,
                payload: {
                    player: {
                        x: pos.x,
                        y: pos.y,
                        id: player.id,
                        old_x: from_pos.x,
                        old_y: from_pos.y
                    }
                }
            })
        }
    }

    update(){
        let dt = performance.now() - this.perf;
        this.perf = performance.now();
        // console.log(`dt: ${dt}`);
        this.entites.forEach(e => e.update(dt / 1000));
    }

    startUpdating(){
        this.entites.forEach(e => e.start());
        this.create_random_bonus();
        this.intervalId = setInterval(() => {
            this.update();
        }, 1000 / 2);
        this.timeIntervalId = setInterval(() => {
            this.broadcastTime();
        }, 1000);
    }

    broadcastTime(){
        if(this.time === 0){
            this.broadcast({
                event: 'timeout'
            })
            this.endGame();
            return;
        }
        this.broadcast({
            event: 'time',
            payload: {
                time: this.time
            }
        })
        this.time--;
    }

    create_random_bonus(){
        const bonus = bonuses[Math.floor(Math.random() * bonuses.length)];
        const free_pos = this.map.get_free();
        if(!free_pos) return;
        this.bonus = bonus(free_pos);
        this.broadcast({
            event: 'bonus_appear',
            payload: this.bonus.json()
        })
        this.bonus.outer_timeout = setTimeout(() => {
            this.broadcast({
                event: 'bonus_disappear',
                payload: this.bonus.json()
            })
            this.bonus = null;
            setTimeout(() => {
                this.create_random_bonus();
            }, 5000);
        }, 15000);
    }

    takeBonus(player){
        this.broadcast({
            event: 'take_bonus',
            payload: {
                player: {
                    x: player.position.x,
                    y: player.position.y,
                    id: player.id
                },
                bonus: this.bonus.json()
            }
        })
        clearTimeout(this.bonus.outer_timeout);
        this.bonus.take(player);
        const callback = this.bonus.onTimeout;
        setTimeout(() => {
            callback(player);
        }, this.bonus.time * 1000);
        this.bonus = null;
        setTimeout(() => {
            this.create_random_bonus();
        }, 5000);
    }

    stopUpdating(){
        this.dog?.stop_all();
        this.oldman?.stop_all();
        this.players.splice(this.players.length);
        clearInterval(this.intervalId);
        clearInterval(this.timeIntervalId);
    }

    makeAutoplay(player){
        player.startAutoplay();
    }

    stopAutoplay(player){
        player.stopAutoplay();
    }

    json(){
        return {
            players: this.players.map(p => p.entity.json()),
            sheeps: this.sheeps.map(s => s.json()),
            oldman: this.oldman.json(),
            dog: this.dog.json(),
            map: this.map.json(),
            bonus: this.bonus === null ? null : this.bonus.json()
        }
    }

    get id(){
        return this._id;
    }
}