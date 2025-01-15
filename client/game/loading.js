const RESOURCES = [
    'src/images/svan/Walk.png',
    'src/images/svan/Walk_Left.png',
    'src/images/svan/Idle.png',
    'src/images/svan/Idle_Left.png',
    'src/images/fon1_winter.png',
]

function load(onLoad){
    let loaded = 0;
    const total = RESOURCES.length;
    RESOURCES.forEach((resource) => {
        const image = new Image();
        image.src = resource;
        image.onload = () => {
            loaded++;
            if(loaded === total){
                onLoad();
            }
        }
    })
}

export default load;