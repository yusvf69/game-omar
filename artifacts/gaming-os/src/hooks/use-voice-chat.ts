import { useEffect, useRef, useState, useCallback } from "react";

const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
  ],
};

interface Peer {
  userId: number;
  username: string;
  connection: RTCPeerConnection;
  stream?: MediaStream;
}

interface UseVoiceChatOptions {
  roomId: number | null;
  userId: number;
  username: string;
  onError?: (err: string) => void;
}

export function useVoiceChat({ roomId, userId, username, onError }: UseVoiceChatOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const peersRef = useRef<Map<number, Peer>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);
  const [peers, setPeers] = useState<Peer[]>([]);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const updatePeers = useCallback(() => {
    setPeers(Array.from(peersRef.current.values()));
  }, []);

  useEffect(() => {
    if (!roomId) return;
    const protocol = location.protocol === "https:" ? "wss:" : "ws:";
    const host = location.host;
    const ws = new WebSocket(`${protocol}//${host}/ws/voice`);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "join-room", roomId, userId, username }));
    };

    ws.onclose = () => setIsConnected(false);

    ws.onmessage = async (event) => {
      let msg: any;
      try {
        msg = JSON.parse(event.data);
      } catch {
        return;
      }

      switch (msg.type) {
        case "room-joined": {
          setIsConnected(true);
          for (const peerId of msg.peers) {
            await createPeerConnection(peerId, true);
          }
          break;
        }
        case "peer-joined": {
          await createPeerConnection(msg.userId, true);
          break;
        }
        case "peer-left": {
          const peer = peersRef.current.get(msg.userId);
          if (peer) {
            peer.connection.close();
            peersRef.current.delete(msg.userId);
            updatePeers();
          }
          break;
        }
        case "offer": {
          if (msg.to === userId) {
            await createPeerConnection(msg.from, false, msg.sdp);
          }
          break;
        }
        case "answer": {
          if (msg.to === userId) {
            const peer = peersRef.current.get(msg.from);
            if (peer) {
              await peer.connection.setRemoteDescription(new RTCSessionDescription(JSON.parse(msg.sdp)));
            }
          }
          break;
        }
        case "ice-candidate": {
          if (msg.to === userId) {
            const peer = peersRef.current.get(msg.from);
            if (peer) {
              await peer.connection.addIceCandidate(new RTCIceCandidate(JSON.parse(msg.candidate)));
            }
          }
          break;
        }
      }
    };

    async function createPeerConnection(peerId: number, initiator: boolean, offerSdp?: string) {
      if (peersRef.current.has(peerId)) return;

      const pc = new RTCPeerConnection(RTC_CONFIG);
      const peer: Peer = { userId: peerId, username: `User ${peerId}`, connection: pc };
      peersRef.current.set(peerId, peer);

      pc.onicecandidate = (e) => {
        if (e.candidate && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: "ice-candidate", roomId, userId, to: peerId,
            candidate: JSON.stringify(e.candidate.toJSON()),
          }));
        }
      };

      pc.ontrack = (e) => {
        peer.stream = e.streams[0];
        updatePeers();
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "failed" || pc.connectionState === "disconnected") {
          pc.close();
          peersRef.current.delete(peerId);
          updatePeers();
        }
      };

      const s = localStreamRef.current;
      if (s) {
        for (const track of s.getTracks()) {
          pc.addTrack(track, s);
        }
      }

      updatePeers();

      if (initiator) {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        ws.send(JSON.stringify({
          type: "offer", roomId, userId, to: peerId,
          sdp: JSON.stringify(pc.localDescription),
        }));
      } else if (offerSdp) {
        await pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(offerSdp)));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        ws.send(JSON.stringify({
          type: "answer", roomId, userId, to: peerId,
          sdp: JSON.stringify(pc.localDescription),
        }));
      }
    }

    return () => {
      ws.send(JSON.stringify({ type: "leave-room", roomId, userId }));
      ws.close();
      wsRef.current = null;
    };
  }, [roomId, userId, username, updatePeers]);

  useEffect(() => {
    if (!roomId) return;
    let cancelled = false;
    let rafId = 0;
    const ctx = new AudioContext();

    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
      localStreamRef.current = stream;
      setLocalStream(stream);

      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      src.connect(analyser);
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const checkSpeaking = () => {
        if (cancelled) return;
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        if (avg > 20) {
          wsRef.current?.send(JSON.stringify({ type: "speaking", roomId, userId, speaking: true }));
        }
        rafId = requestAnimationFrame(checkSpeaking);
      };
      checkSpeaking();
    }).catch(() => {
      onError?.("Microphone access denied");
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      ctx.close();
      const s = localStreamRef.current;
      if (s) { s.getTracks().forEach(t => t.stop()); }
      localStreamRef.current = null;
      setLocalStream(null);
    };
  }, [roomId]);

  const toggleMute = useCallback(() => {
    const s = localStreamRef.current;
    if (s) {
      s.getAudioTracks().forEach(t => { t.enabled = isMuted; });
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  const leave = useCallback(() => {
    for (const [, peer] of peersRef.current) {
      peer.connection.close();
    }
    peersRef.current.clear();
    setPeers([]);
    const s = localStreamRef.current;
    if (s) { s.getTracks().forEach(t => t.stop()); }
    localStreamRef.current = null;
    setLocalStream(null);
    wsRef.current?.send(JSON.stringify({ type: "leave-room", roomId, userId }));
    wsRef.current?.close();
    setIsConnected(false);
  }, [roomId, userId]);

  return { peers, localStream, isMuted, isConnected, toggleMute, leave };
}
