import Animation from './Animation.js';
import { DIRECTIONS } from './GameEntity.js';

class AnimationController{
    constructor({entity, frequency}){
        this.entity = entity || null;
        this.frequency = frequency;
        /**
         * @type {Animation | null}
         */
        this.current_animation = null;
        this.max_frame = 0;
        this.current_frame = 0;
        /**
         * @type {Animation[]}
         */
        this.animations = [];
        this._timer = {value: 0, max: frequency}
    }

    setEntity(entity){
        this.entity = entity;
    }

    addAnimation(animation){
        this.animations.push(animation);
        if(this.current_animation == null){
            this.setAnimation(animation);
        }
    }

    setAnimation(animation){
        if(this.current_animation == animation){
            return;
        }
        this.current_animation = animation;
        this.max_frame = animation.frames_count;
        // console.log(this.max_frame, animation);
        this.current_frame = 0;
    }

    setAnimationByName(name){
        let anim = this.animations.find(animation => animation.name == name);
        if(!anim){
            console.error(`Animation ${name} not found`);
            return;
        }
        this.setAnimation(anim);
    }

    getCurrentAnimation(){
        return this.current_animation.name;
    }

    getCurrentFrame(){
        if(this.entity?.direction === DIRECTIONS.left){
            return this.max_frame - this.current_frame - 1;
        }
        return this.current_frame;
    }

    hasAnimation(name){
        return this.animations.some(animation => animation.name == name);
    }

    /**
     * 
     * @param {string[]} animations 
     * @returns 
     */
    currentAnimationIn(animations){
        return animations.includes(this.getCurrentAnimation());
    }

    update(deltaTime){
        this._timer.value += deltaTime;
        if(this._timer.value >= this._timer.max){
            this._timer.value = 0;
            this.current_frame++;
            if(this.current_frame >= this.max_frame){
                this.current_animation.onEnd(this.entity);
                this.current_frame = 0;
            }
            if(this.entity){
                this.current_animation.onEachFrame(this.entity, this.current_frame);
            }
        }
        if(this.entity){
            this.current_animation.onRender(this.entity, deltaTime);
        }
    }
}

export default AnimationController;