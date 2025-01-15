class Controls{
    constructor(){
        this.keys = {};
        this.pressed_keys = new Set();
        document.addEventListener('keydown', (e) => {
            if(!this.keys[e.code]) return;
            if(this.pressed_keys.has(e.code)) return;
            this.pressed_keys.add(e.code);
            if(!this.keys[e.code].down) return;
            if(this.keys[e.code].rule())
                this.keys[e.code].down();
        })
        document.addEventListener('keyup', (e) => {
            if(!this.keys[e.code]) return;
            this.pressed_keys.delete(e.code);
            if(!this.keys[e.code].up) return;
            if(this.keys[e.code].rule())
                this.keys[e.code].up();
        })
    }

    update(){
        for(let key in this.keys){
            if(this.pressed_keys.has(key)){
                if(this.keys[key].pressed === undefined) continue;
                if(this.keys[key].rule())
                    this.keys[key].pressed();
            }
        }
    }

    /**
     * 
     * @param {string} key 
     * @param {{down: () => void, up: () => void, pressed: () => void, rule: () => void}} actions 
     */
    addKey(key, actions){
        this.keys[key] = actions;
        if(!actions.rule){
            this.keys[key].rule = () => {return true};
        }
    }

    removeKey(key){
        delete this.keys[key];
    }
}

export default Controls;