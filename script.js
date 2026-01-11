const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / (window.innerHeight * 0.7), 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight * 0.7);
document.getElementById('dice-container').appendChild(renderer.domElement);

const geometry = new THREE.IcosahedronGeometry(2, 0); 
const material = new THREE.MeshPhongMaterial({ 
    color: 0x591723,
    flatShading: true,
    shininess: 50
});
const dice = new THREE.Mesh(geometry, material);
scene.add(dice);

const wireframe = new THREE.LineSegments(
    new THREE.EdgesGeometry(geometry),
    new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 })
);
dice.add(wireframe);

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5);
scene.add(light);
scene.add(new THREE.AmbientLight(0x404040));

camera.position.z = 6;

let isRolling = false;
let faceVectors = [];
let targetQuaternion = new THREE.Quaternion();

function animate() {
    requestAnimationFrame(animate);
    
    if (isRolling) {
        dice.rotation.x += 0.2;
        dice.rotation.y += 0.2;
        
        dice.quaternion.setFromEuler(dice.rotation);
    } else {
        dice.quaternion.slerp(targetQuaternion, 0.1);
    }
    
    renderer.render(scene, camera);
}
animate();

document.getElementById('rollBtn').onclick = () => {
    if (isRolling) return;

    isRolling = true;
    document.getElementById('result-display').innerText = "...";

    const result = Math.floor(Math.random() * 20) + 1;

    setTimeout(() => {
        isRolling = false;
        document.getElementById('result-display').innerText = result;

        const targetFaceVector = faceVectors[result - 1].clone();
     
        const cameraDirection = new THREE.Vector3(0, 0, 1);
       
        targetQuaternion.setFromUnitVectors(targetFaceVector.normalize(), cameraDirection);

    }, 1000);
};

window.onresize = () => {
    camera.aspect = window.innerWidth / (window.innerHeight * 0.7);
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight * 0.7);
};

function addNumbersToDice(diceMesh) {
    const geom = diceMesh.geometry;
    
    if (!geom.index) {
        const positions = geom.attributes.position.array;
        const indices = [];
        for (let i = 0; i < positions.length / 3; i++) {
            indices.push(i);
        }
        geom.setIndex(indices);
    }

    const posAttribute = geom.attributes.position;
    const indexAttribute = geom.index;

    function createNumberTexture(number) {
        const canvas = document.createElement('canvas');
        canvas.width = 128; 
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = 'rgba(0,0,0,0)';
        ctx.clearRect(0, 0, 128, 128);
        
        ctx.fillStyle = 'white';
        ctx.font = 'bold 80px Arial'; 
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(number, 64, 64);
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        return texture;
    }

    console.log("เริ่มสร้างตัวเลขและคำนวณตำแหน่ง..."); 

    const faceCount = indexAttribute.count / 3;
    
    faceVectors = [];

    for (let i = 0; i < faceCount; i++) {
        const a = indexAttribute.getX(i * 3 + 0);
        const b = indexAttribute.getX(i * 3 + 1);
        const c = indexAttribute.getX(i * 3 + 2);

        const vA = new THREE.Vector3().fromBufferAttribute(posAttribute, a);
        const vB = new THREE.Vector3().fromBufferAttribute(posAttribute, b);
        const vC = new THREE.Vector3().fromBufferAttribute(posAttribute, c);

        const center = new THREE.Vector3();
        center.add(vA).add(vB).add(vC).divideScalar(3);

        faceVectors.push(center.clone().normalize());

        const texture = createNumberTexture(i + 1);
        const planeGeom = new THREE.PlaneGeometry(0.7, 0.7);
        const planeMat = new THREE.MeshBasicMaterial({ 
            map: texture, 
            transparent: true, 
            side: THREE.DoubleSide,
            depthTest: true
        });
        
        const label = new THREE.Mesh(planeGeom, planeMat);
        label.position.copy(center).multiplyScalar(1.03); 
        label.lookAt(center.clone().multiplyScalar(2));
        diceMesh.add(label);
    }
}

addNumbersToDice(dice);
