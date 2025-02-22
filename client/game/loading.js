const RESOURCES = [
    'src/images/svan/Walk.png',
    'src/images/svan/Walk_Left.png',
    'src/images/svan/Idle.png',
    'src/images/svan/Idle_Left.png',
    'src/images/fon1_winter.png',
    'src/images/mood0.png',
    'src/images/mood1.png',
    'src/images/mood2.png',
    'src/images/mood3.png',
    'src/images/mood4.png',
    'src/images/mood5.png',
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