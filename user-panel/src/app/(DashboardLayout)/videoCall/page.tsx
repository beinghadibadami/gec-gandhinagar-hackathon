"use client";
import React, { useEffect, useRef, useState } from 'react';
import { Phone, PhoneOff, Video, VideoOff, PhoneIncoming, Check, X, Monitor, MonitorOff, FlipHorizontal, Bell, Maximize2, Minimize2, Mic, MicOff } from 'lucide-react';
import Peer from 'peerjs';

const videoCall = () => {
  const [myId, setMyId] = useState<string>('');
  const [peerId, setPeerId] = useState<string>('');
  const [peer, setPeer] = useState<Peer | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [incomingCall, setIncomingCall] = useState<{ call: any; caller: string } | null>(null);
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [hasPing, setHasPing] = useState(false);
  const [maximizedVideo, setMaximizedVideo] = useState<'local' | 'remote' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const myVideo = useRef<HTMLVideoElement>(null);
  const remoteVideo = useRef<HTMLVideoElement>(null);
  const myStream = useRef<MediaStream | null>(null);
  const screenStream = useRef<MediaStream | null>(null);
  const currentCall = useRef<any>(null);
  const dataConnection = useRef<any>(null);
  const audioContext = useRef<AudioContext | null>(null);

  useEffect(() => {
    const newPeer = new Peer({
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:global.stun.twilio.com:3478' }
        ]
      }
    });
    
    newPeer.on('open', (id) => {
      setMyId(id);
      setPeer(newPeer);
      setError(null);
    });

    newPeer.on('error', (err) => {
      console.error('Peer error:', err);
      setError('Connection error. Please try again.');
    });

    newPeer.on('call', async (call) => {
      setIncomingCall({ call, caller: call.peer });
    });

    newPeer.on('connection', (conn) => {
      dataConnection.current = conn;
      conn.on('data', (data: any) => {
        if (data.type === 'ping') {
          setHasPing(true);
          const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
          audio.play().catch(console.error);
          setTimeout(() => setHasPing(false), 2000);
        }
      });
    });

    return () => {
      newPeer.destroy();
      myStream.current?.getTracks().forEach(track => track.stop());
      screenStream.current?.getTracks().forEach(track => track.stop());
      audioContext.current?.close();
    };
  }, []);

  const startCall = async () => {
    if (!peer || !peerId.trim()) {
      setError('Please enter a valid Peer ID');
      return;
    }

    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: isFrontCamera ? 'user' : 'environment' },
        audio: true
      });
      myStream.current = stream;
      if (myVideo.current) {
        myVideo.current.srcObject = stream;
      }

      const call = peer.call(peerId, stream);
      currentCall.current = call;
      
      call.on('stream', (remoteStream) => {
        if (remoteVideo.current) {
          remoteVideo.current.srcObject = remoteStream;
        }
      });

      call.on('error', (err) => {
        console.error('Call error:', err);
        setError('Call failed. Please try again.');
        endCall();
      });

      const conn = peer.connect(peerId);
      dataConnection.current = conn;

      setIsConnected(true);
    } catch (err) {
      console.error('Failed to get media devices:', err);
      setError('Failed to access camera/microphone. Please check permissions.');
    }
  };

  const switchCamera = async () => {
    if (!myStream.current || !currentCall.current) return;

    try {
      setError(null);
      myStream.current.getTracks().forEach(track => track.stop());

      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: isFrontCamera ? 'environment' : 'user' },
        audio: true
      });

      if (myVideo.current) {
        myVideo.current.srcObject = newStream;
      }

      const videoTrack = newStream.getVideoTracks()[0];
      const sender = currentCall.current.peerConnection.getSenders().find((s: any) => 
        s.track.kind === 'video'
      );
      if (sender) {
        sender.replaceTrack(videoTrack);
      }

      myStream.current = newStream;
      setIsFrontCamera(!isFrontCamera);
    } catch (err) {
      console.error('Error switching camera:', err);
      setError('Failed to switch camera. Please try again.');
    }
  };

  const toggleMute = () => {
    if (myStream.current) {
      const audioTrack = myStream.current.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsMuted(!isMuted);
    }
  };

  const sendPing = () => {
    if (dataConnection.current) {
      dataConnection.current.send({ type: 'ping' });
    }
  };

  const acceptCall = async () => {
    if (!incomingCall) return;

    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      myStream.current = stream;
      if (myVideo.current) {
        myVideo.current.srcObject = stream;
      }

      incomingCall.call.answer(stream);
      currentCall.current = incomingCall.call;
      incomingCall.call.on('stream', (remoteStream: MediaStream) => {
        if (remoteVideo.current) {
          remoteVideo.current.srcObject = remoteStream;
        }
      });

      setIsConnected(true);
      setIncomingCall(null);
    } catch (err) {
      console.error('Failed to get media devices:', err);
      setError('Failed to access camera/microphone. Please check permissions.');
    }
  };

  const rejectCall = () => {
    if (incomingCall) {
      incomingCall.call.close();
      setIncomingCall(null);
    }
  };

  const toggleCamera = () => {
    if (myStream.current) {
      const videoTrack = myStream.current.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setIsCameraOn(!isCameraOn);
    }
  };

  const toggleScreenShare = async () => {
    if (!currentCall.current) return;

    try {
      setError(null);
      if (isScreenSharing) {
        screenStream.current?.getTracks().forEach(track => track.stop());
        
        if (myStream.current) {
          if (myVideo.current) {
            myVideo.current.srcObject = myStream.current;
          }
          
          // Replace both video and audio tracks
          const senders = currentCall.current.peerConnection.getSenders();
          const videoTrack = myStream.current.getVideoTracks()[0];
          const audioTrack = myStream.current.getAudioTracks()[0];
          
          const videoSender = senders.find((s: any) => s.track?.kind === 'video');
          const audioSender = senders.find((s: any) => s.track?.kind === 'audio');
          
          if (videoSender && videoTrack) {
            videoSender.replaceTrack(videoTrack);
          }
          if (audioSender && audioTrack) {
            audioSender.replaceTrack(audioTrack);
          }
        }
      } else {
        // Request screen sharing with audio
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            sampleRate: 44100
          }
        });
        
        screenStream.current = stream;
        
        if (myVideo.current) {
          myVideo.current.srcObject = stream;
        }

        // Replace both video and audio tracks if available
        const senders = currentCall.current.peerConnection.getSenders();
        const videoTrack = stream.getVideoTracks()[0];
        const audioTrack = stream.getAudioTracks()[0];
        
        const videoSender = senders.find((s: any) => s.track?.kind === 'video');
        const audioSender = senders.find((s: any) => s.track?.kind === 'audio');
        
        if (videoSender && videoTrack) {
          videoSender.replaceTrack(videoTrack);
        }
        if (audioSender && audioTrack) {
          audioSender.replaceTrack(audioTrack);
        }

        // Handle screen sharing stop
        stream.getVideoTracks()[0].onended = () => {
          toggleScreenShare();
        };
      }
      setIsScreenSharing(!isScreenSharing);
    } catch (err) {
      console.error('Error toggling screen share:', err);
      setError('Failed to share screen. Please try again.');
    }
  };

  const endCall = () => {
    if (myStream.current) {
      myStream.current.getTracks().forEach(track => track.stop());
    }
    if (screenStream.current) {
      screenStream.current.getTracks().forEach(track => track.stop());
    }
    if (currentCall.current) {
      currentCall.current.close();
    }
    if (myVideo.current) {
      myVideo.current.srcObject = null;
    }
    if (remoteVideo.current) {
      remoteVideo.current.srcObject = null;
    }
    setIsConnected(false);
    setIsScreenSharing(false);
    setPeerId('');
    setMaximizedVideo(null);
    setError(null);
  };

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 md:p-8 text-gray-100">
      <div className="max-w-6xl mx-auto">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-6 border border-gray-700">
          <h1 className="text-3xl font-bold mb-4 text-white">Video Call</h1>
          <p className="mb-2">Your ID: <span className="font-mono bg-gray-900/50 px-3 py-1 rounded-lg text-emerald-400">{myId}</span></p>
          
          {error && (
            <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200">
              {error}
            </div>
          )}
          
          {!isConnected && !incomingCall && (
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <input
                type="text"
                value={peerId}
                onChange={(e) => setPeerId(e.target.value)}
                placeholder="Enter Peer ID to call"
                className="flex-1 px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white placeholder-gray-400"
              />
              <button
                onClick={startCall}
                className="bg-emerald-600 text-white px-8 py-3 rounded-xl hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20"
              >
                <Phone size={20} /> Start Call
              </button>
            </div>
          )}

          {incomingCall && (
            <div className="flex items-center justify-between bg-gray-900/50 p-6 rounded-xl mb-6 border border-gray-700">
              <div className="flex items-center gap-3">
                <PhoneIncoming className="text-emerald-400" size={24} />
                <span>Incoming call from: <span className="font-mono bg-gray-800/50 px-2 py-1 rounded-lg text-emerald-400">{incomingCall.caller}</span></span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={acceptCall}
                  className="bg-emerald-600 text-white px-6 py-2 rounded-xl hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-lg"
                >
                  <Check size={20} /> Accept
                </button>
                <button
                  onClick={rejectCall}
                  className="bg-red-600 text-white px-6 py-2 rounded-xl hover:bg-red-700 transition-colors flex items-center gap-2 shadow-lg"
                >
                  <X size={20} /> Reject
                </button>
              </div>
            </div>
          )}
        </div>

        <div className={`grid ${hasPing ? 'animate-pulse' : ''} ${maximizedVideo ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'} gap-6`}>
          {(!maximizedVideo || maximizedVideo === 'local') && (
            <div className="relative group">
              <video
                ref={myVideo}
                autoPlay
                muted
                playsInline
                className={`w-full rounded-2xl bg-gray-900 shadow-lg ${maximizedVideo === 'local' ? 'h-[80vh] object-contain' : 'aspect-video'}`}
              />
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setMaximizedVideo(maximizedVideo === 'local' ? null : 'local')}
                  className="p-2 rounded-lg bg-black/70 text-white hover:bg-black/90 transition-colors"
                >
                  {maximizedVideo === 'local' ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                </button>
              </div>
              <p className="mt-2 text-center font-medium text-emerald-400">Your Video {isScreenSharing && '(Screen Sharing)'}</p>
            </div>
          )}
          {(!maximizedVideo || maximizedVideo === 'remote') && (
            <div className="relative group">
              <video
                ref={remoteVideo}
                autoPlay
                playsInline
                className={`w-full rounded-2xl bg-gray-900 shadow-lg ${maximizedVideo === 'remote' ? 'h-[80vh] object-contain' : 'aspect-video'}`}
              />
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setMaximizedVideo(maximizedVideo === 'remote' ? null : 'remote')}
                  className="p-2 rounded-lg bg-black/70 text-white hover:bg-black/90 transition-colors"
                >
                  {maximizedVideo === 'remote' ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                </button>
              </div>
              <p className="mt-2 text-center font-medium text-emerald-400">Remote Video</p>
            </div>
          )}
        </div>

        {isConnected && (
          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={toggleCamera}
              className={`p-4 rounded-full ${isCameraOn ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'} text-white hover:opacity-90 transition-all shadow-lg`}
              title={isCameraOn ? 'Turn off camera' : 'Turn on camera'}
            >
              {isCameraOn ? <Video size={24} /> : <VideoOff size={24} />}
            </button>
            <button
              onClick={toggleMute}
              className={`p-4 rounded-full ${!isMuted ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'} text-white hover:opacity-90 transition-all shadow-lg`}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
            </button>
            {isMobile && (
              <button
                onClick={switchCamera}
                className="p-4 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white hover:opacity-90 transition-all shadow-lg"
                title="Switch camera"
              >
                <FlipHorizontal size={24} />
              </button>
            )}
            <button
              onClick={toggleScreenShare}
              className={`p-4 rounded-full ${isScreenSharing ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-gray-600 hover:bg-gray-700'} text-white hover:opacity-90 transition-all shadow-lg`}
              title={isScreenSharing ? 'Stop sharing screen' : 'Share screen'}
            >
              {isScreenSharing ? <MonitorOff size={24} /> : <Monitor size={24} />}
            </button>
            <button
              onClick={sendPing}
              className="p-4 rounded-full bg-amber-600 hover:bg-amber-700 text-white hover:opacity-90 transition-all shadow-lg"
              title="Ping other user"
            >
              <Bell size={24} />
            </button>
            <button
              onClick={endCall}
              className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white hover:opacity-90 transition-all shadow-lg"
              title="End call"
            >
              <PhoneOff size={24} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default videoCall;