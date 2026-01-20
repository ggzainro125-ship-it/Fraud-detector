import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function LiveDetection({ onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const socketRef = useRef(null);
  const intervalRef = useRef(null);
  const [prediction, setPrediction] = useState(null);
  const [status, setStatus] = useState('idle');
  const [consent, setConsent] = useState(false);

  useEffect(() => {
    // Connect socket with optional auth token and multiple transport fallbacks
    const options = {
      transports: ['websocket', 'polling'], // fallback to polling if websocket fails
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    };
    const token = process.env.REACT_APP_API_TOKEN;
    if (token) {
      options.auth = { token };
    }
    socketRef.current = io(SOCKET_URL, options);

    socketRef.current.on('connect', () => {
      console.log('Socket connected', socketRef.current.id);
      setStatus('idle');
    });

    socketRef.current.on('prediction', (msg) => {
      setPrediction(msg);
    });

    socketRef.current.on('disconnect', () => {
      console.log('Socket disconnected');
      setStatus('disconnected');
    });

    socketRef.current.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      setStatus('error');
    });

    socketRef.current.on('error', (err) => {
      console.error('Socket error:', err);
      setStatus('error');
    });

    return () => {
      stopCapture();
      if (socketRef.current) socketRef.current.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startCapture = async () => {
    if (!consent) {
      alert('Please grant consent to stream camera frames for live detection.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640 }, audio: false });
      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      // Prepare offscreen canvas
      canvasRef.current = document.createElement('canvas');
      canvasRef.current.width = 320; // reduce size for bandwidth
      canvasRef.current.height = 240;

      // Send frames at ~3 FPS
      intervalRef.current = setInterval(sendFrame, 333);
      setStatus('streaming');
    } catch (err) {
      console.error('Could not start camera', err);
      alert('Unable to access camera. Check permissions.');
      setStatus('error');
    }
  };

  const stopCapture = () => {
    setStatus('stopped');
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
  };

  const sendFrame = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    try {
      ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
      // Use toBlob to reduce memory and specify JPEG quality
      canvasRef.current.toBlob(async (blob) => {
        if (!blob) return;
        const reader = new FileReader();
        reader.onloadend = () => {
          const dataUrl = reader.result; // data:image/jpeg;base64,...
          if (socketRef.current && socketRef.current.connected) {
            socketRef.current.emit('frame', { image: dataUrl });
          }
        };
        reader.readAsDataURL(blob);
      }, 'image/jpeg', 0.7);
    } catch (e) {
      console.error('Error sending frame', e);
    }
  };

  return (
    <div className="live-detection-panel p-4 glass-enhanced rounded-xl">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-semibold">Live Camera Detection</h3>
        <div className="flex gap-2">
          <button onClick={onClose} className="px-3 py-1 bg-gray-700 rounded">Close</button>
        </div>
      </div>

      <div className="mb-3 text-sm text-white/80">
        <label className="inline-flex items-center space-x-2">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
          <span>Consent to stream camera frames (no storage)</span>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <video ref={videoRef} muted playsInline className="w-full rounded bg-black" style={{height:240}} />
          {prediction && (
            <div className="absolute top-2 left-2 bg-black/70 text-white p-2 rounded text-xs">
              <div>Fraud: {prediction.is_fraud ? 'Yes' : 'No'}</div>
              <div>Score: {Math.round((prediction.confidence || 0) * 100)}%</div>
              <div>Risk: {prediction.risk_level || 'n/a'}</div>
            </div>
          )}
        </div>

        <div className="p-2 bg-white/5 rounded">
          <div className="mb-2">
            <strong className="text-white">Status: </strong><span className="text-white/80">{status}</span>
          </div>

          <div className="flex gap-2 mb-3">
            <button onClick={startCapture} className="px-3 py-2 bg-emerald-500 rounded text-white">Start</button>
            <button onClick={stopCapture} className="px-3 py-2 bg-red-500 rounded text-white">Stop</button>
          </div>

          <div className="text-xs text-white/70 overflow-auto max-h-40">
            <pre className="whitespace-pre-wrap">{prediction ? JSON.stringify(prediction, null, 2) : 'No predictions yet'}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
