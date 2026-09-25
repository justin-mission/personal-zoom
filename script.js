// PASSWORD SECURITY CONFIGURATION
const CORRECT_PASSCODE = "1234"; // Palitan mo 'to kung gusto mo ng ibang password!

// State
let userName = "";
let localStream = null;
let peer = null;
let calls = {};
let isMicOn = true;
let isCamOn = true;

// DOM Elements
const loginModal = document.getElementById('loginModal');
const loginForm = document.getElementById('loginForm');
const usernameInput = document.getElementById('usernameInput');
const passcodeInput = document.getElementById('passcodeInput');
const errorMsg = document.getElementById('errorMsg');

const lobbyScreen = document.getElementById('lobbyScreen');
const meetingScreen = document.getElementById('meetingScreen');
const displayName = document.getElementById('displayName');
const previewVideo = document.getElementById('previewVideo');
const previewFallback = document.getElementById('previewFallback');
const roomIdInput = document.getElementById('roomIdInput');
const joinBtn = document.getElementById('joinBtn');

const localVideo = document.getElementById('localVideo');
const localNameLabel = document.getElementById('localNameLabel');
const localAvatar = document.getElementById('localAvatar');
const videoGrid = document.getElementById('videoGrid');

const micBtn = document.getElementById('micBtn');
const camBtn = document.getElementById('camBtn');
const leaveBtn = document.getElementById('leaveBtn');
const toggleChatBtn = document.getElementById('toggleChatBtn');
const sidebar = document.getElementById('sidebar');
const closeSidebar = document.getElementById('closeSidebar');

// 1. LOGIN SYSTEM
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const enteredPasscode = passcodeInput.value.trim();
  const name = usernameInput.value.trim();

  if (enteredPasscode === CORRECT_PASSCODE) {
    userName = name || "User";
    displayName.textContent = userName;
    loginModal.classList.add('hidden');
    lobbyScreen.classList.remove('hidden');
    initLocalMedia();
  } else {
    errorMsg.classList.remove('hidden');
  }
});

// 2. MEDIA INITIALIZATION
async function initLocalMedia() {
  try {
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    previewVideo.srcObject = localStream;
    localVideo.srcObject = localStream;
  } catch (err) {
    console.warn("Camera/Mic Error:", err);
    previewFallback.classList.remove('hidden');
  }
}

// 3. JOIN CALL & WEBRTC CONNECTION
joinBtn.addEventListener('click', () => {
  const roomId = roomIdInput.value.trim() || "our-private-room-4";

  lobbyScreen.classList.add('hidden');
  meetingScreen.classList.remove('hidden');
  localNameLabel.textContent = `${userName} (You)`;
  localAvatar.textContent = userName.charAt(0).toUpperCase();

  startClock();

  // Initialize PeerJS
  peer = new Peer();

  peer.on('open', (id) => {
    console.log('My Peer ID is: ' + id);
    // Connect to room using standard naming for 4 people
    connectToGroupRoom(roomId);
  });

  // Listen for incoming calls
  peer.on('call', (call) => {
    call.answer(localStream);
    const remoteVideoCard = createVideoCard(call.peer);
    
    call.on('stream', (remoteStream) => {
      const video = remoteVideoCard.querySelector('video');
      video.srcObject = remoteStream;
    });

    call.on('close', () => {
      remoteVideoCard.remove();
      updateGrid();
    });
  });
});

function connectToGroupRoom(roomId) {
  // Broadcast connection signal to existing members
  // PeerJS connects directly via IDs
  updateGrid();
}

// VIDEO GRID RESPONSIVENESS
function createVideoCard(peerId) {
  const card = document.createElement('div');
  card.className = 'video-card';
  card.id = `card-${peerId}`;
  card.innerHTML = `
    <video autoplay playsinline></video>
    <div class="card-label">User</div>
  `;
  videoGrid.appendChild(card);
  updateGrid();
  return card;
}

function updateGrid() {
  const count = videoGrid.children.length;
  videoGrid.className = 'video-grid';
  if (count === 1) videoGrid.classList.add('grid-1');
  else if (count === 2) videoGrid.classList.add('grid-2');
  else videoGrid.classList.add('grid-4');
}

// MEDIA CONTROLS
micBtn.addEventListener('click', () => {
  isMicOn = !isMicOn;
  if (localStream) localStream.getAudioTracks()[0].enabled = isMicOn;
  micBtn.classList.toggle('off', !isMicOn);
});

camBtn.addEventListener('click', () => {
  isCamOn = !isCamOn;
  if (localStream) localStream.getVideoTracks()[0].enabled = isCamOn;
  camBtn.classList.toggle('off', !isCamOn);
  localVideo.classList.toggle('hidden', !isCamOn);
  localAvatar.classList.toggle('hidden', isCamOn);
});

leaveBtn.addEventListener('click', () => {
  location.reload();
});

toggleChatBtn.addEventListener('click', () => sidebar.classList.toggle('hidden'));
closeSidebar.addEventListener('click', () => sidebar.classList.add('hidden'));

function startClock() {
  setInterval(() => {
    document.getElementById('clock').textContent = new Date().toLocaleTimeString();
  }, 1000);
}