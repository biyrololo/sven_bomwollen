import { GameEntity } from "../Canvas2DEngine/index.js";
import { generate as generateSheep } from "./sheep/entity.js";
import { generate as generatePlayer } from "./svan/entity.js";
import MyGameMap from "./MyGameMap.js";
import { DIRECTIONS } from "../Canvas2DEngine/GameEntity.js";
import { MyGameEntity } from "./MyGameEntity.js";
import { get_direction } from "./controls.js";
import { SPEED_K } from "./constants.js";
import generate_fight from "./fight/index.js";
import { generateSpeedBonus } from "./boosts/speedBonus.js";
import { generateDogBonus } from "./boosts/dogBonus.js";
import { generateOldmanBonus } from "./boosts/oldmanBonus.js";

class EventHandler {
    /**
     * 
     * @param {{player: MyGameEntity, map: MyGameMap, man: MyGameEntity, dog: MyGameEntity}} props 
     */
    constructor (props){
        this.player = props.player;
        this.player.$origin = true;
        this.players = [this.player];
        this.sheeps = [];
        this.bonus = null;
        this.man = props.man;
        this.dog = props.dog;
        this.map = props.map;
        this.fights = [generate_fight({context: this.player.context})];
    }

    handle(event){
        const payload = event.payload;
        // console.log(event);
        switch (event.event) {
            case "connected":
                this.player._id = payload.player_id;
                break;
            case "game_config":
                for(let sheep of this.sheeps){
                    this.map.removeEntityFromCurrentLevel(sheep);
                }
                this.sheeps = [];
                this.players = [this.player];
                this.fights = [generate_fight({context: this.player.context})];
                this.map.setMapMap(
                    {
                        width: payload.map.width,
                        height: payload.map.height
                    }
                )

                for(let p of payload.players){
                    let pos = this.map.get_posiiton(p.position.x, p.position.y);
                    if(p.id === this.player._id){
                        this.player.position_x = pos.x;
                        this.player.position_y = pos.y;
                        this.player._speed = SPEED_K * p.speed;
                        console.log(`calculated move_time: ${100*Math.sqrt(2)/this.player._speed}`);
                        this.map.mapMap.add(p.position.x, p.position.y, this.player);
                    } else {
                        const pl = generatePlayer({
                            context: this.player.context,
                            position: pos
                        });
                        pl._id = p.id;
                        pl.speed = SPEED_K * p.speed;
                        this.players.push(pl);
                        this.map.addEntityToCurrentLevel(pl);
                        this.map.mapMap.add(p.position.x, p.position.y, pl);
                        this.fights.push(generate_fight({context: this.player.context}));
                    }
                }

                for(let fight of this.fights){
                    this.map.addEntityToCurrentLevel(fight);
                    fight.is_hidden = true;
                }

                let dog_pos = this.map.get_posiiton(payload.dog.position.x, payload.dog.position.y);
                this.dog.position.x = dog_pos.x;
                this.dog.position.y = dog_pos.y;
                this.dog.speed = SPEED_K * payload.dog.speed;
                this.dog._id = payload.dog.id;
                this.map.mapMap.add(payload.dog.position.x, payload.dog.position.y, this.dog);

                let man_pos = this.map.get_posiiton(payload.oldman.position.x, payload.oldman.position.y);
                this.man._id = payload.oldman.id;
                this.man.position.x = man_pos.x;
                this.man.position.y = man_pos.y;
                this.man.speed = SPEED_K * payload.oldman.speed;
                this.map.mapMap.add(payload.oldman.position.x, payload.oldman.position.y, this.man);

                for(let s of payload.sheeps){
                    let pos = this.map.get_posiiton(s.position.x, s.position.y);
                    const sheep = generateSheep({
                        context: this.player.context,
                        position: pos
                    });
                    sheep._id = s.id;
                    this.sheeps.push(sheep);
                    this.map.addEntityToCurrentLevel(sheep);
                    this.map.mapMap.add(s.position.x, s.position.y, sheep);
                }

                const WallObject = {
                    name: 'wall'
                }

                const TeleportObject = {
                    name: 'teleport'
                }

                for(let y = 0; y < payload.map.height; y++){
                    for(let x = 0; x < payload.map.width; x++){
                        if(payload.map.map[y][x] === 'wall'){
                            this.map.mapMap.add(x, y, WallObject);
                        }
                        if(payload.map.map[y][x] === 'teleport'){
                            this.map.mapMap.add(x, y, TeleportObject);
                        }
                    }
                }

                const bonus = payload.bonus
                if(bonus){
                    const name = bonus.name;
                    const pos = this.map.get_posiiton(bonus.position.x, bonus.position.y);
                    if(name === 'speed'){
                        this.bonus = generateSpeedBonus({
                            context: this.player.context,
                            position: pos
                        })
                    }
                    if(name === 'dog'){
                        this.bonus = generateDogBonus({
                            context: this.player.context,
                            position: pos
                        })
                    }
                    if(name === 'oldman'){
                        this.bonus = generateOldmanBonus({
                            context: this.player.context,
                            position: pos
                        })
                    }
                    this.map.addEntityToCurrentLevel(this.bonus);
                }
                
                break;

            case "bonus_appear":{
                const name = payload.name;
                const pos = this.map.get_posiiton(payload.position.x, payload.position.y);
                if(name === 'speed'){
                    this.bonus = generateSpeedBonus({
                        context: this.player.context,
                        position: pos
                    })
                }
                if(name === 'dog'){
                    this.bonus = generateDogBonus({
                        context: this.player.context,
                        position: pos
                    })
                }
                if(name === 'oldman'){
                    this.bonus = generateOldmanBonus({
                        context: this.player.context,
                        position: pos
                    })
                }
                this.map.addEntityToCurrentLevel(this.bonus);
                break;
            }

            case "bonus_disappear":
            case "take_bonus":{
                this.map.removeEntityFromCurrentLevel(this.bonus);
                break;
            }

            case "change_speed":{
                const p = this.players.find(p => p._id === payload.player.id);
                p.speed = SPEED_K * payload.player.speed;
                break;
            }

            case "dog_move":{
                let new_pos = this.map.get_posiiton(payload.new_pos.x, payload.new_pos.y);
                const dir = get_direction(new_pos.x, new_pos.y, this.dog.position_x, this.dog.position_y);
                this.map.mapMap.move(payload.old_pos.x, payload.old_pos.y, payload.new_pos.x, payload.new_pos.y);
                this.dog.setTarget(
                    {
                        x: new_pos.x,
                        y: new_pos.y
                    }
                )
                if(dir.includes('UP')){
                    this.dog.animation_controller.setAnimationByName('walk_back');
                } else {
                    this.dog.animation_controller.setAnimationByName('walk');
                }
                break;
            }

            case "oldman_move":{
                let new_pos = this.map.get_posiiton(payload.new_pos.x, payload.new_pos.y);
                const dir = get_direction(new_pos.x, new_pos.y, this.man.position_x, this.man.position_y);
                this.map.mapMap.move(payload.old_pos.x, payload.old_pos.y, payload.new_pos.x, payload.new_pos.y);
                this.man.setTarget(
                    {
                        x: new_pos.x,
                        y: new_pos.y
                    }
                )
                if(dir.includes('UP')){
                    this.man.animation_controller.setAnimationByName('walk_back');
                } else {
                    this.man.animation_controller.setAnimationByName('walk');
                }
                break;
            }

            case "player_move":{
                let id = payload.id;
                let pl = this.players.find(p => p._id === id);
                console.log(pl);
                console.log('PLAYER LIST', this.players);
                console.log(this.map.mapMap.get(payload.old_pos.x, payload.old_pos.y));
                let new_pos = this.map.get_posiiton(payload.new_pos.x, payload.new_pos.y);
                console.warn(new_pos, payload.new_pos, pl._position);
                const dir = get_direction(new_pos.x, new_pos.y, pl.position_x, pl.position_y);
                console.warn(dir);
                // this.map.mapMap.move(payload.old_pos.x, payload.old_pos.y, payload.new_pos.x, payload.new_pos.y);
                this.map.mapMap.remove_item(pl);
                this.map.mapMap.add(payload.new_pos.x, payload.new_pos.y, pl);
                pl.setTarget(
                    {
                        x: new_pos.x,
                        y: new_pos.y
                    }
                )
                if(dir.includes('UP')){
                    pl.animation_controller.setAnimationByName('walk_back');
                } else {
                    pl.animation_controller.setAnimationByName('walk');
                }
                break;
            }

            case "satisfy_sheep": {
                let pl = this.players.find(p => p._id === payload.player.id);
                let s = this.sheeps.find(s => s._id === payload.sheep.id);
                pl.is_hidden = true;
                s.animation_controller.setAnimationByName('satisfy');
                let dir = get_direction(s.position_x, s.position_y, pl.position_x, pl.position_y);
                if(dir.includes('LEFT')){
                    s.direction = DIRECTIONS.left;
                } else {
                    s.direction = DIRECTIONS.right;
                }
                if(dir.includes('UP')){
                    s.animation_controller.setAnimationByName('satisfy_back');
                }
                break;
            }

            case "stop_satisfying": {
                let pl = this.players.find(p => p._id === payload.player.id);
                pl.is_hidden = false;
                let s = this.sheeps.find(s => s._id === payload.sheep.id);
                s.animation_controller.setAnimationByName('idle');
                s.direction = DIRECTIONS.right;
                break;
            }
                
            case "complete_satisfying":{
                this.map.removeEntityFromCurrentLevel(this.sheeps.find(s => s._id === payload.sheep.id));
                let pl = this.players.find(p => p._id === payload.player.id);
                pl.is_hidden = false;
                break;
            }

            case "fight": {
                let id = payload.player.id;
                let pl = this.players.find(p => p._id === id);
                let index = this.players.indexOf(pl);
                let fight = this.fights[index];
                fight.is_hidden = false;
                fight.position_x = pl.position_x;
                fight.position_y = pl.position_y;
                break;
            }

            case "fight_end": {
                let id = payload.player.id;
                let pl = this.players.find(p => p._id === id);
                let index = this.players.indexOf(pl);
                let fight = this.fights[index];
                fight.is_hidden = true;
                fight.position_x = -1000;
                fight.position_y = -1000;
                break;
            }

            case "loose_game": {
                let id = payload.player.id;
                alert(`PLAYER ${id} LOOSE`)
                break;
            }

            case "win_game": {
                let id = payload.player.id;
                alert(`PLAYER ${id} WIN`)
                break;
            }

            case "player_spawn": {
                let id = payload.player.id;
                let pl = this.players.find(p => p._id === id);
                let {x, y} = payload.player;
                let new_pos = this.map.get_posiiton(x, y);
                this.map.mapMap.remove_item(pl);
                this.map.mapMap.add(x, y, pl);
                pl.position_x = new_pos.x;
                pl.position_y = new_pos.y;
                pl.animation_controller.setAnimationByName('idle');
                pl.target.active = false;
                break;
            }
            case "player_teleport": {
                let id = payload.player.id;
                let pl = this.players.find(p => p._id === id);
                let {old_x, old_y} = payload.player;
                console.log({old_x, old_y});
                console.log(this.map.mapMap.get(old_x, old_y));
                let {x, y} = payload.player;
                let new_pos = this.map.get_posiiton(x, y);
                this.map.mapMap.remove_item(pl);
                this.map.mapMap.add(x, y, pl);
                pl.position_x = new_pos.x;
                pl.position_y = new_pos.y;
                pl.animation_controller.setAnimationByName('idle');
                pl.target.active = false;
                break;
            }

            default:
                break;
        }
    }
}

export default EventHandler;