export class Btn{
    constructor({img, sizes={width: 100, height: 100}, position={x: 0, y: 0}, onClick=()=>{}, global_scale}){
        this.img = new Image();
        this.img.src = img;
        this.global_scale = global_scale;
        this.sizes = sizes;
        this.position = position;
        this.onClick = onClick;
        this.handle_click = (e)=>{
            e.preventDefault();
            e.stopPropagation();
            // check if click inside button
            if(e.offsetX >= this.position.x * this.global_scale && e.offsetX <= (this.position.x + this.sizes.width) * this.global_scale && e.offsetY >= this.position.y * this.global_scale && e.offsetY <= (this.position.y + this.sizes.height) * this.global_scale){
                this.onClick();
                console.log('clicked');
            }
        }

        document.addEventListener('click', this.handle_click.bind(this));
    }

    draw(context){
        if(!context || !this.img.complete) return;
        context.drawImage(this.img, this.position.x * this.global_scale, this.position.y * this.global_scale, this.sizes.width * this.global_scale, this.sizes.height * this.global_scale);
    }
}