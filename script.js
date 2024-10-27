let animationFrameId;
let gameTimer;
const gameDuration = 120000; 
let remainingTime = gameDuration / 1000; 
let musicPlaying = false;
let audio = new Audio('https://www.bensound.com/bensound-music/bensound-anewbeginning.mp3');

function startGame() {
    document.getElementById('home').style.display = 'none';
    document.getElementById('game').style.display = 'block';
    score = 0;
    remainingTime = gameDuration / 1000; 
    scoreElement.innerHTML = `Punteggio: ${score}`;
    timerElement.innerHTML = `Tempo rimasto: ${remainingTime}s`;
    gameTimer = setInterval(updateTimer, 1000);
    setTimeout(endGame, gameDuration);
    animate();
    setupControls();
}

function returnHome() {
    document.getElementById('game').style.display = 'none';
    document.getElementById('home').style.display = 'block';
    cancelAnimationFrame(animationFrameId);
    clearInterval(gameTimer);
    resetTouchControls();
}

function showLeaderboard() {
    document.getElementById('leaderboard').style.display = 'block';
}

function hideLeaderboard() {
    document.getElementById('leaderboard').style.display = 'none';
}

function endGame() {
    cancelAnimationFrame(animationFrameId);
    clearInterval(gameTimer);
    alert(`Tempo scaduto! Il tuo punteggio finale è: ${score}`);
    returnHome();
}

function updateTimer() {
    remainingTime--;
    timerElement.innerHTML = `Tempo rimasto: ${remainingTime}s`;
    if (remainingTime <= 0) {
        clearInterval(gameTimer);
    }
}

function toggleMusic() {
    if (musicPlaying) {
        audio.pause();
        document.getElementById('musicButton').innerText = 'Musica On';
    } else {
        audio.play();
        document.getElementById('musicButton').innerText = 'Musica Off';
    }
    musicPlaying = !musicPlaying;
}

const leaderboard = [
    { name: 'Player1', score: 100 },
    { name: 'Player2', score: 90 },
    { name: 'Player3', score: 80 }
];

const leaderboardElement = document.getElementById('leaderboardList');
leaderboard.forEach(player => {
    const li = document.createElement('li');
    li.textContent = `${player.name}: ${player.score} punti`;
    leaderboardElement.appendChild(li);
});

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('game').appendChild(renderer.domElement);

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(1, 1, 1).normalize();
scene.add(light);

const wizardMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const dogMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const hunterMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });

const wizardGeometry = new THREE.SphereGeometry(0.5, 32, 32);
const wizard = new THREE.Mesh(wizardGeometry, wizardMaterial);
wizard.position.set(0, 0, 0);
scene.add(wizard);

const dogGeometry = new THREE.SphereGeometry(0.3, 32, 32);
const hunterGeometry = new THREE.SphereGeometry(0.3, 32, 32);
const dogs = [];
const hunters = [];

function addDog() {
    let dog;
    do {
        dog = new THREE.Mesh(dogGeometry, dogMaterial);
        dog.position.set(Math.random() * 8 - 4, Math.random() * 8 - 4, 0);
    } while (isTooCloseToExisting(dog, dogs.concat(hunters)));
    dogs.push(dog);
    scene.add(dog);
}

function addHunter() {
    let hunter;
    do {
        hunter = new THREE.Mesh(hunterGeometry, hunterMaterial);
        hunter.position.set(Math.random() * 8 - 4, Math.random() * 8 - 4, 0);
    } while (isTooCloseToExisting(hunter, dogs.concat(hunters)));
    hunters.push(hunter);
    scene.add(hunter);
}

function isTooCloseToExisting(newObject, existingObjects) {
    for (const obj of existingObjects) {
        if (newObject.position.distanceTo(obj.position) < 1) {
            return true; // Troppo vicino
        }
    }
    return false; // Distanza accettabile
}

for (let i = 0; i < 3; i++) {
    addDog();
    addHunter();
}

let score = 0;
const scoreElement = document.getElementById('score');
const timerElement = document.getElementById('timer');
camera.position.z = 5;

const keyboard = {};
window.addEventListener('keydown', (event) => { keyboard[event.keyCode] = true; });
window.addEventListener('keyup', (event) => { keyboard[event.keyCode] = false; });

const leftJoystick = document.getElementById('leftJoystick');
const leftStick = document.getElementById('leftStick');

function setupControls() {
    if (window.innerWidth <= 800) {
        leftJoystick.style.display = 'block'; // Mostra i controlli analogici
    } else {
        leftJoystick.style.display = 'none'; // Nascondi i controlli analogici
    }

    leftJoystick.addEventListener('touchstart', startDrag);
    leftJoystick.addEventListener('touchmove', drag);
    leftJoystick.addEventListener('touchend', endDrag);
}

function resetTouchControls() {
    leftJoystick.style.display = 'none'; // Nascondi i controlli analogici quando si torna alla home
    endDrag(); // Resetta la posizione del joystick
}

let stickOffsetX = 0;
let stickOffsetY = 0;

function startDrag(event) {
    event.preventDefault(); // Previene lo scrolling della pagina
    const rect = leftJoystick.getBoundingClientRect();
    stickOffsetX = event.touches[0].clientX - rect.left - 25;
    stickOffsetY = event.touches[0].clientY - rect.top - 25;
    moveStick();
}

function moveStick() {
    leftStick.style.transform = `translate(${stickOffsetX}px, ${stickOffsetY}px)`;
    handleTouchInput(stickOffsetX / 25, stickOffsetY / 25); // Normalizza
}

function drag(event) {
    const rect = leftJoystick.getBoundingClientRect();
    const dx = event.touches[0].clientX - rect.left - 25;
    const dy = event.touches[0].clientY - rect.top - 25;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxDistance = 25;

    if (distance > maxDistance) {
        const angle = Math.atan2(dy, dx);
        stickOffsetX = Math.cos(angle) * maxDistance;
        stickOffsetY = Math.sin(angle) * maxDistance;
    } else {
        stickOffsetX = dx;
        stickOffsetY = dy;
    }

    moveStick();
}

function endDrag() {
    stickOffsetX = 0;
    stickOffsetY = 0;
    leftStick.style.transform = `translate(0, 0)`;
}

function handleTouchInput(x, y) {
    const speed = 0.2;
    wizard.position.x += x * speed;
    wizard.position.y -= y * speed; // Inverti Y per il movimento
    wizard.position.x = Math.max(Math.min(wizard.position.x, 4), -4);
    wizard.position.y = Math.max(Math.min(wizard.position.y, 4), -4);
}

function detectCollisions() {
    for (let i = dogs.length - 1; i >= 0; i--) {
        if (wizard.position.distanceTo(dogs[i].position) < 0.8) {
            scene.remove(dogs[i]);
            dogs.splice(i, 1);
            addDog();
            score += 10;
            scoreElement.innerHTML = `Punteggio: ${score}`;
        }
    }
    for (let i = hunters.length - 1; i >= 0; i--) {
        if (wizard.position.distanceTo(hunters[i].position) < 0.8) {
            scene.remove(hunters[i]);
            hunters.splice(i, 1);
            addHunter();
            score += 20;
            scoreElement.innerHTML = `Punteggio: ${score}`;
        }
    }
}

function animate() {
    detectCollisions();
    handleInput();
    renderer.render(scene, camera);
    animationFrameId = requestAnimationFrame(animate);
}

function handleInput() {
    const speed = 0.2;
    if (keyboard[87]) wizard.position.y = Math.min(wizard.position.y + speed, 4); // W
    if (keyboard[83]) wizard.position.y = Math.max(wizard.position.y - speed, -4); // S
    if (keyboard[65]) wizard.position.x = Math.max(wizard.position.x - speed, -4); // A
    if (keyboard[68]) wizard.position.x = Math.min(wizard.position.x + speed, 4); // D
}

window.addEventListener('resize', setupControls);
