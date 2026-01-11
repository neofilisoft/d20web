document.addEventListener('DOMContentLoaded', () => {
    const rollBtn = document.getElementById('rollBtn');
    rollBtn.addEventListener('click', rollDice);
});

let currentRotateX = 0;
let currentRotateY = 0;

function rollDice() {
    const cube = document.getElementById('cube');
    const btn = document.getElementById('rollBtn');
    
    btn.disabled = true;

    const result = Math.floor(Math.random() * 6) + 1;

    let targetX = 0;
    let targetY = 0;
    
    switch(result) {
        case 1: targetX = 0;   targetY = 0;   break; // Front
        case 6: targetX = 0;   targetY = 180; break; // Back
        case 3: targetX = 0;   targetY = -90; break; // Right
        case 4: targetX = 0;   targetY = 90;  break; // Left
        case 2: targetX = -90; targetY = 0;   break; // Top
        case 5: targetX = 90;  targetY = 0;   break; // Bottom
    }

    const spins = 720;
   
    const xOffset = targetX - (currentRotateX % 360);
    const yOffset = targetY - (currentRotateY % 360);

    currentRotateX += spins + xOffset;
    currentRotateY += spins + yOffset;

    cube.style.transform = `translateZ(-50px) rotateX(${currentRotateX}deg) rotateY(${currentRotateY}deg)`;

    setTimeout(() => {
        btn.disabled = false;
        console.log(`Roll result: ${result}`);
    }, 1000);
}
