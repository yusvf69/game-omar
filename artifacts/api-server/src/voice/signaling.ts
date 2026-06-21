import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";
import { logger } from "../lib/logger";

interface SignalingMessage {
  type: "join-room" | "leave-room" | "offer" | "answer" | "ice-candidate";
  roomId: number;
  userId: number;
  to?: number;
  sdp?: string;
  candidate?: string;
}

const rooms = new Map<number, Map<number, WebSocket>>();

function send(ws: WebSocket, msg: object) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(msg));
  }
}

function broadcast(roomId: number, senderId: number, msg: object) {
  const room = rooms.get(roomId);
  if (!room) return;
  for (const [uid, ws] of room) {
    if (uid !== senderId) {
      send(ws, msg);
    }
  }
}

export function setupVoiceSignaling(server: Server) {
  const wss = new WebSocketServer({ server, path: "/ws/voice" });

  wss.on("connection", (ws, req) => {
    let userId = 0;
    let roomId = 0;

    ws.on("message", (raw) => {
      let msg: SignalingMessage;
      try {
        msg = JSON.parse(raw.toString());
      } catch {
        return;
      }

      switch (msg.type) {
        case "join-room": {
          userId = msg.userId;
          roomId = msg.roomId;
          if (!rooms.has(roomId)) {
            rooms.set(roomId, new Map());
          }
          const room = rooms.get(roomId)!;
          room.set(userId, ws);

          broadcast(roomId, userId, {
            type: "peer-joined",
            userId,
          });

          const otherIds = Array.from(room.keys()).filter((id) => id !== userId);
          send(ws, {
            type: "room-joined",
            roomId,
            userId,
            peers: otherIds,
          });
          break;
        }

        case "leave-room": {
          const room = rooms.get(roomId);
          if (room) {
            room.delete(userId);
            if (room.size === 0) rooms.delete(roomId);
          }
          broadcast(roomId, userId, { type: "peer-left", userId });
          break;
        }

        case "offer":
        case "answer":
        case "ice-candidate": {
          if (msg.to) {
            const room = rooms.get(roomId);
            const target = room?.get(msg.to);
            if (target) {
              send(target, { ...msg, from: userId });
            }
          }
          break;
        }
      }
    });

    ws.on("close", () => {
      const room = rooms.get(roomId);
      if (room) {
        room.delete(userId);
        if (room.size === 0) rooms.delete(roomId);
      }
      broadcast(roomId, userId, { type: "peer-left", userId });
    });
  });

  logger.info("Voice signaling server attached at /ws/voice");
}
