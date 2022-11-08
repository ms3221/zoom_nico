const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute")
const cameraBtn = document.getElementById("camera")
let camerasSelect = document.getElementById("cameras")


const call = document.getElementById("call")
call.hidden = true

let myStream;
let muted = false;
let cameraOff = false;
let roomName;
let myPeerConnection;

async function getCameras(){
    try{
        const devics = await navigator.mediaDevices.enumerateDevices(); 
        const cameras = devics.filter(device => device.kind === "videoinput")
        const currentCamera = myStream.getVideoTracks()[0];
        cameras.forEach(camera => {
            const option = document.createElement("option")
            option.value = camera.deviceId;
            option.innerText = camera.label
            if(currentCamera.label == camera.label){
                option.selected = true
            }
            camerasSelect.appendChild(option)
        })
    }catch(e){ 
        console.log(e);
    }
}

async function getMedia(deviceId){
    const initialConstrains = {
        audio: true,
        video: {facingMode: "user"}
    }
    const cameraConstraints = {
        audio: true,
        video:{deviceId: { exact: deviceId}}
    }
  try{
    myStream = await navigator.mediaDevices.getUserMedia(
     deviceId ? cameraConstraints : initialConstrains
    );
   myFace.srcObject = myStream;
   if(!deviceId){
    await getCameras()
   }
  }catch(e){
    console.log(e);
  }
}

function handleMuteClick(){
    myStream.getAudioTracks().forEach((track)=>(track.enabled = !track.enabled))
    if(!muted){
        muteBtn.innerText = "Unmute"
        muted = true
    }else {
        muteBtn.innerText = "Mute"
        muted = false
    }
}

function handleCameraClick(){
    myStream.getVideoTracks().forEach((track)=>(track.enabled = !track.enabled))
    if(cameraOff){
        cameraBtn.innerText = "Turn Camera Off"
        cameraOff = false;
    }else {
        cameraBtn.innerText = "Turn Camera On"
        cameraOff = true;
    }
}

async function handleCameraChange(){
await getMedia(camerasSelect.value);
}
muteBtn.addEventListener("click",handleMuteClick)
cameraBtn.addEventListener("click",handleCameraClick)
camerasSelect.addEventListener("input",handleCameraChange)


//  Welcome Form (join a room )

const welcome = document.getElementById("welcome")
welcomeForm = welcome.querySelector("form")

async function initCall(){
    welcome.hidden = true;
    call.hidden = false
    await getMedia()
    makeConnection()
}
async function handleWelcomeSubmit(event){
    event.preventDefault()
    const input = welcomeForm.querySelector("input")
    await initCall()
    socket.emit("join_room", input.value)
    roomName = input.value;
    input.value = "";
    
}
welcomeForm.addEventListener("submit",handleWelcomeSubmit)

//Socket code 
// chrome
socket.on("welcome",async ()=>{
    const offer = await myPeerConnection.createOffer()
    myPeerConnection.setLocalDescription(offer)
    socket.emit("offer",offer,roomName); 
})

//safari  
socket.on("offer",async (offer)=>{
    console.log("received the offer");
    myPeerConnection.setRemoteDescription(offer);
    const answer = await myPeerConnection.createAnswer();
    myPeerConnection.setLocalDescription(answer)
    socket.emit("answer",answer, roomName)
    console.log("sent the answer");
})

socket.on("answer",(answer)=>{
    console.log("received the answer");
    myPeerConnection.setRemoteDescription(answer);
})


socket.on("ice",(ice)=>{
  console.log("received candidate");
  myPeerConnection.addIceCandidate(ice);
})


//RTC code 
function makeConnection(){
     myPeerConnection = new RTCPeerConnection();
     myPeerConnection.addEventListener("icecandidate", handleIce);
     myPeerConnection.addEventListener("addstream", handleAddStream)
     myStream.getTracks().forEach(track=> myPeerConnection.addTrack(track, myStream));
}

function handleIce(data){
    console.log("sent candidate");
  socket.emit("ice", data.candidate, roomName)
}

function handleAddStream(data){
    console.log("got an event from my peer ")
    const peerFace = document.getElementById("peerFace")
    peerFace.srcObject = data.stream;
}

/**
 * part1 - webSocke
 */
// const messageList = document.querySelector("ul");
// const messageForm = document.querySelector("#message");
// const nicknameForm = document.querySelector("#nickname");

// const socket = new WebSocket(`ws://${window.location.host}`);

// function makeMessage(type, payload) {
//   const msg = { type, payload };
//   return JSON.stringify(msg);
// }
// socket.addEventListener("open", () => {
//   console.log("Connected to Server 🤙");
// });

// socket.addEventListener("message", (message) => {
//   const li = document.createElement("li");
//   li.innerText = message.data;
//   messageList.append(li);
// });

// socket.addEventListener("close", () => {
//   console.log("Connected from Server X");
// });
// function handleSubmit(event) {
//   event.preventDefault();
//   const input = messageForm.querySelector("input");
//   socket.send(makeMessage("new_message", input.value));

//   const li = document.createElement("li");
//   li.innerText = `you: ${input.value}`;
//   messageList.append(li);
//   input.value = "";
// }
// function handleNickSubmit(event) {
//   event.preventDefault();
//   const input = nicknameForm.querySelector("input");
//   socket.send(makeMessage("nickname", input.value));
//   input.value = "";
// }
// messageForm.addEventListener("submit", handleSubmit);
// nicknameForm.addEventListener("submit", handleNickSubmit);


/**
 *  part2 - socke.io
 *  기능 chat
 *  socket.io vs webSocket
 *  1. 개선사항 내가원하는 이벤트명을 사용해서  보낼 수 있다.
 *  2. object를 보낼수없었는데 보낼 수 있게 됬다.
 */

// const welcome = document.getElementById("welcome");
// const form = welcome.querySelector("form");
// const room = document.getElementById("room");
// const changeNickname = room.querySelector('#changeNickname')
// room.hidden = true;

// let roomName;
// let nickName;

// const backendDone = (msg) => {
//   console.log(msg);
// };
// function handleMessageSubmit(event) {
//   event.preventDefault();
//   const input = room.querySelector("#msg input");
//   const value = input.value;
//   socket.emit("new_message", value, roomName, () => {
//     addMessage(`You: ${value} `);
//   });
//   input.value = "";
//   return;
// }

// function handleNickNameSubmit(event) {
//   event.preventDefault();
//   const input = welcome.querySelector("#nickName");
//   const value = input.value;
//   socket.emit("nickname", input.value);
//   input.value = "";

// }

// function showRoom() {
//   welcome.hidden = true;
//   room.hidden = false;
//   const h2 = room.querySelector("h2");
//   const h4 = room.querySelector("h4")
//   h2.innerText = `Room [${roomName}]`;
//   h4.innerText = `NickName [${nickName}]`;
//   const messageForm = room.querySelector("#msg");
//   messageForm.addEventListener(
//     "submit",
//     handleMessageSubmit,
//     handleNickNameSubmit
//   );
// }

// function handleRoomSubmit(event) {
//   event.preventDefault();
//   const roomname = welcome.querySelector("#roomName");
//   const nickname = welcome.querySelector("#nickName");
//   socket.emit("nickname", nickname.value);
//   socket.emit("enter_room", roomname.value, showRoom);
//   roomName = roomname.value;
//   nickName = nickname.value
//   roomname.value = "";
// }

// function handleChangeNickname(event){
//   event.preventDefault()
//   const h4 = room.querySelector("h4")
//   const changeNickname = room.querySelector("#changeNickname input");
//   if(changeNickname.value !== nickName) {
//   socket.emit("change_nickname",roomName, nickName, changeNickname.value, ()=>{
//     h4.innerText = `NickName [${changeNickname.value}]`
//     nickName = changeNickname.value;
//   })
//   changeNickname.value = ""
// }
// }

// function addMessage(message) {
//   const ul = room.querySelector("ul");
//   const li = document.createElement("li");
//   li.innerText = message;
//   ul.append(li);
// }

// form.addEventListener("submit", handleRoomSubmit);
// changeNickname.addEventListener("submit",handleChangeNickname)
// socket.on("welcome", (user, newCount) => {
//   const h3 = room.querySelector("h3");
//   h3.innerText = `Room ${roomName} (${newCount})`;
//   addMessage(`user:${user} arrived!`);
// });

// socket.on("bye", (left) => {
//   addMessage(left + "someone left ㅠㅠ");
// });

// socket.on("new_message", (msg) => {
//   addMessage(msg);
// });

// socket.on("change_nickname",(msg)=>{
//   addMessage(msg)
// })

// socket.on("room_change", (rooms) => {
//   const roomList = welcome.querySelector("ul");
//   roomList.innerText = "";
//   if (rooms.length === 0) {
//     return;
//   }
//   rooms.forEach((room) => {
//     const li = document.createElement("li");
//     li.innerText = room;
//     roomList.append(li);
//   });
// });
