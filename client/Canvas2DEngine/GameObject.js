let last_id = 0;

class GameObject{
    /**
     * Game Object
     * @param {position: {x: number, y: number}, sizes: {width: number, height: number}} param0 
     */
    constructor({position, sizes}){
        this._position = position;
        this.sizes = sizes;
        this._id = ++last_id;
        this.event_listeners = {
            'move': []
        };
    }

    get position(){
        return this._position;
    }

    set position(position){
        this._position = position;
        for(const listener of this.event_listeners['move']){
            listener(this);
        }
    }

    get position_x(){
        return this._position.x;
    }

    set position_x(x){
        this._position.x = x;
        for(const listener of this.event_listeners['move']){
            listener(this);
        }
    }

    get position_y(){
        return this._position.y;
    }

    set position_y(y){
        this._position.y = y;
        for(const listener of this.event_listeners['move']){
            listener(this);
        }
    }

    /**
     * Add a listener to an event
     * @param {string} event name of the event
     * @param {(entity: GameObject) => void} listener 
     */
    addEventListener(event, listener){
        if(this.event_listeners[event] === undefined){
            this.event_listeners[event] = [];
        }
        this.event_listeners[event].push(listener);
        return this.event_listeners[event].length - 1;
    }

    removeEventListener(event, index){
        if(this.event_listeners[event] === undefined){
            return;
        }
        this.event_listeners[event].splice(index, 1);
    }

    get box(){
        return {
            x: this.position.x,
            y: this.position.y,
            x2: this.position.x + this.sizes.width,
            y2: this.position.y + this.sizes.height,
            width: this.sizes.width,
            height: this.sizes.height,
            center_x: this.position.x + this.sizes.width / 2,
            center_y: this.position.y + this.sizes.height / 2
        }
    }

    distance_to(game_object){
        let box1 = this.box;
        let box2 = game_object.box;
        let dx = box1.center_x - box2.center_x;
        let dy = box1.center_y - box2.center_y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    draw(){
        throw new Error('Not implemented');
    }
}

export default GameObject;