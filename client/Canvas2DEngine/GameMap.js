import GameEntity from "./GameEntity.js";
import GameLevel from "./GameLevel.js";
import GameObject from "./GameObject.js";
import GameCamera from "./GameCamera.js";
import ChunksManager from "./ChunksManager.js";

class GameMap{
    /**
     * 
     * @param {{context: CanvasRenderingContext2D}} param0 
     */
    constructor({context, canvas, global_scale}){
        /**
         * @type {GameLevel[]}
         */
        this.levels = [];
        /* 
         * @type {GameLevel | null}
         */
        this.current_level = null;
        /**
         * @type {GameEntity | null}
         */
        this.player = null;
        /**
         * @type {GameCamera | null}
         */
        this.camera = null;
        /**
         * @type {CanvasRenderingContext2D}
         */
        this.context = context;
        /**
         * @type {HTMLCanvasElement}
         */
        this.canvas = canvas;
        this.closest_entities_distance = 100;
        this.global_scale = global_scale || 1;

        this.performance = performance.now();

        this.chunks_manager = new ChunksManager();
    }

    addLevel(level){
        this.levels.push(level);
        for(let entity of level.entities){
            entity._map = this;
            entity.context = this.context;
        }
        if(!this.current_level){
            this.current_level = level;
        }
    }

    setCurrentLevel(level_name){
        this.current_level = this.levels.find(level => level.name === level_name) || null;
    }

    /**
     * 
     * @param {GameObject} target 
     * @param {number} distance 
     */    
    get_closest_entities(target, distance=this.closest_entities_distance){
        if(!target){
            throw new Error('Target cannot be empty');
        }

        if(!this.current_level){
            throw new Error('Current level is empty');
        }

        /**
         * @type {GameEntity[]}
         */
        let entities = this.current_level.entities;
        return entities.filter(entity => {
            if(entity._id === target._id) return false;
            return target.distance_to(entity) <= distance;
        })        

    }

    check_collision(entity, distance=this.closest_entities_distance){
        if(!entity.collision){
            return false;
        }
        if(entity.collision.type !== "box"){
            return false;
        }
        /**
         * @type {GameEntity[]}
         */
        let entities;
        if(this.chunks_manager.chunk_size === null){
            entities = this.get_closest_entities(entity, distance);
        } else {
            let chunk = this.chunks_manager.getChunkNumberByObject(entity);
            entities = [...this.chunks_manager.getChunk(chunk), ...this.chunks_manager.getChunk(chunk + 1), ...this.chunks_manager.getChunk(chunk - 1)];
            entities = entities.filter(e => e._id !== entity._id);
        }
        for(let i = 0; i < entities.length; i++){
            let e = entities[i];
            if(e.collision && e.collision.type === "box"){
                let res = entity.interact(e);
                if(res){
                    return e;
                }
            }
        }
        return false;
    }

    addCamera(camera){
        this.camera = camera;
        this.camera._map = this;
        this.camera.context = this.context;
    }

    update(deltaTime){
        if(this.chunks_manager.chunk_size === null){
            this.camera.update(this.current_level?.entities || [], deltaTime);
        } else {
            let chunk = this.chunks_manager.getChunkNumberByObject(this.camera.target);
            let entities = [...this.chunks_manager.getChunk(chunk), ...this.chunks_manager.getChunk(chunk + 1), ...this.chunks_manager.getChunk(chunk - 1)];
            this.camera.update(entities, deltaTime);
        }
    }

    draw(){
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.current_level?.draw_background(this.context, this.global_scale, this.camera);
        if(this.chunks_manager.chunk_size === null){
            this.camera.draw(this.current_level?.entities || [], this.global_scale);
        } else {
            let chunk = this.chunks_manager.getChunkNumberByObject(this.camera.target);
            let entities = [...this.chunks_manager.getChunk(chunk), ...this.chunks_manager.getChunk(chunk + 1), ...this.chunks_manager.getChunk(chunk - 1)];
            this.camera.draw(entities, this.global_scale);
        }
        this.current_level?.draw_foreground(this.context, this.global_scale, this.camera);
    }

    loop(){
        const now = performance.now();
        const delta = (now - this.performance) / 1000;
        this.performance = now;
        if(this.controls){
            this.controls.update();
        }
        this.update(delta);
        this.draw();
        // requestAnimationFrame(this.loop.bind(this));
        setTimeout(this.loop.bind(this));
    }

    start_loop(props){
        if(props?.controls){
            this.controls = props.controls;
        }
        this.start_current_level();
        this.loop();
    }

    render_before_update(){
    }

    render_before_draw(){
    }

    render_afrer_draw(){
    }

    start_current_level(){
        if(!this.current_level){
            throw new Error('Current level is empty');
        }
        this.chunks_manager.clear();
        for(let entity of this.current_level.entities){
            this.chunks_manager.add(entity);
        }
        this.camera.target.position = this.current_level.start_position;
    }
}

export default GameMap;