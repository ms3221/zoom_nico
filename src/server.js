import http from "http";
import express from "express";
import path, { parse } from "path";
import { WebSocketServer } from "ws";
import { Server } from "socket.io";

const __dirname = path.resolve();
const app = express();
app.set("view engine", "pug");
app.set("views", __dirname + "/src/views");
app.use("/public", express.static(__dirname + "/src/public"));
app.get("/", (req, res) => {
  res.render("home");
});

const handleListen = () => console.log(`Listening on http://localhost:3000`);
const httpServer = http.createServer(app);
const wsServer = new Server(httpServer);
wsServer.on("connection",(socket)=>{
  socket.onAny((event) => {
        console.log(`socket event: ${event}`);
      });

  socket.on("join_room", (roomName)=>{
    socket.join(roomName)
    socket.to(roomName).emit("welcome")
  })

  socket.on("offer",(offer, roomName)=>{
    socket.to(roomName).emit("offer",offer)
  })

  socket.on("answer",(answer, roomName)=>{
    socket.to(roomName).emit("answer",answer)
  })
  
  socket.on("ice",(ice, roomName)=>{
    socket.to(roomName).emit("ice",ice)
  })
})
httpServer.listen(process.env.PORT || 3000, handleListen);

/**
 * 11/01 webSocket을 이용해서 real-time chat기능을 구현
 * 앞으로는 socke.io를 이용해서 구현할 예정
 * part1 webSocket
 */
// const wss = new WebSocketServer({ server: server });
// const sockets = [];
// wss.on("connection", (socket) => {
//   sockets.push(socket);
//   socket["nickname"] = "Anon";
//   console.log("connected to Browser");
//   socket.on("close", () => console.log("Disconnected from the browser"));
//   socket.on("message", (msg) => {
//     const message = JSON.parse(msg.toString("utf-8"));
//     switch (message.type) {
//       case "new_message":
//         sockets.forEach((aSocket) =>
//           aSocket.send(`${socket.nickname}: ${message.payload}`)
//         );
//         break;
//       case "nickname":
//         socket["nickname"] = message.payload;
//         break;
//     }
//   });
// });


/**
 * part2 socket.io
 * 기능 chat 
 */


//  function publicRooms() {
//   const {
//     sockets: {
//       adapter: { sids, rooms },
//     },
//   } = wsServer;
//   // const sids = wsServer.sockets.adapter.sids;
//   // const rooms = wsServer.sockets.adapter.rooms;
//   const publicRooms = [];
//   rooms.forEach((_, key) => {
//     if (sids.get(key) === undefined) {
//       publicRooms.push(key);
//     }
//   });
//   return publicRooms;
// }

// function countRoom(roomName) {
//   return wsServer.sockets.adapter.rooms.get(roomName)?.size;
// }
// wsServer.on("connection", (socket) => {
//   socket["nickname"] = "Anon";
//   socket.onAny((event) => {
//     console.log(`socket event: ${event}`);
//   });

//   socket.on("enter_room", (roomName, done) => {
//     socket.join(roomName);
//     done();
//     socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName));
//     wsServer.sockets.emit("room_change", publicRooms());
//   });

//   socket.on("disconnecting", () => {
//     socket.rooms.forEach((room) =>
//       socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1)
//     );
//   });

//   socket.on("disconnect", () => {
//     wsServer.sockets.emit("room_change", publicRooms());
//   });

//   socket.on("new_message", (message, roomName, done) => {
//     socket.to(roomName).emit("new_message", `${socket.nickname}: ${message}`);
//     done();
//   });
//   socket.on("nickname", (nickname) => {
//     socket["nickname"] = nickname;
//   });
  
//   socket.on("change_nickname", (roomName,orignalNickName, changeNickName, done)=>{
//     socket["nickname"] = changeNickName;
//     socket.to(roomName).emit("change_nickname", `${orignalNickName} chagne nickname to ${changeNickName}`);
//     done()
//   })
// });

