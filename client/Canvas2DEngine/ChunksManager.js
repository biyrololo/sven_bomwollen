import GameObject from "./GameObject.js";

class ChunksManager {
    constructor(){
        this.chunks = {};
        this._listeners = {};
        this.chunk_size = null;
    }
    /**
     * 
     * @param {GameObject} object 
     */
    add(object){
        if(this.chunk_size === null){
            console.error('Chunk size is not set');
            return;
        }

        let chunk = Math.floor(object.position_x / this.chunk_size);
        if(this.chunks[chunk] === undefined){
            this.chunks[chunk] = [];
        }
        this.chunks[chunk].push(object);
        object.__chunk = chunk;

        this._listeners[object._id] = object.addEventListener('move', (e) => {
            this.chunks[e.__chunk].splice(this.chunks[e.__chunk].indexOf(e), 1);
            let _chunk = Math.floor(e.position_x / this.chunk_size);
            if(this.chunks[_chunk] === undefined){
                this.chunks[_chunk] = [];
            }
            this.chunks[_chunk].push(e);
            e.__chunk = _chunk;
        });
    }

    remove(object){
        let chunk = this.getByObject(object);
        let index = chunk.indexOf(object);
        if(index !== -1){
            chunk.splice(index, 1);
        }
    }

    clear(){
        return;
        for(let chunk in this.chunks){
            for(let object of this.chunks[chunk]){
                object.removeEventListener('move', this._listeners[object._id]);
            }
        }
        this._listeners = {};
        this.chunks = {};
    }

    getChunk(chunk){
        return this.chunks[chunk] || [];
    }

    /**
     * 
     * @param {GameObject} object 
     */
    getByObject(object){
        let chunk = Math.floor(object.position_x / this.chunk_size);
        return this.getChunk(chunk);
    }

    getChunkNumberByObject(object){
        if(object.__chunk !== undefined){
            return object.__chunk;
        }
        return Math.floor(object.position_x / this.chunk_size);
    }
}

export default ChunksManager;