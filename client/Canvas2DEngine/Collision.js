class Collision{
    constructor(){
        this.type = null;
        this.points = [];
    }

    setCollisionPoints(points){
        this.points = points;
    }
}

class BoxCollision extends Collision{
    constructor({x1,y1,x2,y2}){
        super();
        this.type = "box";
        this.setCollisionPoints(
            [   
                {x: x1, y: y1},
                {x: x2, y: y1},
                {x: x2, y: y2},
                {x: x1, y: y2}
            ]
        )
    }

    getBox(){
        if(this.points.length < 4){
            throw new Error("Empty collision points");
        }
        return {
            x1: this.points[0].x,
            y1: this.points[0].y,
            x2: this.points[2].x,
            y2: this.points[2].y
        }
    }

    /**
     * Check if two boxes are colliding
     * @typedef {{x1: number, y1: number, x2: number, y2: number}} Box
     * @param {Box} box1 
     * @param {Box} box2 
     * @returns {boolean}
     */
    static box_interact(box1, box2){
        for(let i of ['x1', 'x2', 'y1', 'y2']){
            box1[i] = Math.round(box1[i] * 100) / 100;
            box2[i] = Math.round(box2[i] * 100) / 100;
        }
        return !(
            box1.x2 < box2.x1 ||
            box1.x1 > box2.x2 ||
            box1.y2 < box2.y1 ||
            box1.y1 > box2.y2
        )
    }
}

export {Collision, BoxCollision};