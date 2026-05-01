import React, { useState, useEffect } from 'react';
import Peer, { DataConnection } from 'peerjs';

interface OnlineLobbyProps {
  onStartGame: (role: 'host' | 'guest', peer: Peer, conn: DataConnection, side: 'w' | 'b', initialTime: number, increment: number) => void;
}

export const OnlineLobby: React.FC<OnlineLobbyProps> = ({ onStartGame }) => {
  const [peerId, setPeerId] = useState<string>('');
  const [targetId, setTargetId] = useState<string>('');
  const [timeControl, setTimeControl] = useState<number>(300); // 5 mins in seconds
  const [increment, setIncrement] = useState<number>(3); // 3 seconds
  const [peer, setPeer] = useState<Peer | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>('');
  const [isCopying, setIsCopying] = useState<boolean>(false);

  useEffect(() => {
    // Generate room code instantly when the component mounts
    const newPeer = new Peer();
    setPeer(newPeer);

    newPeer.on('open', (id) => {
      setPeerId(id);
    });

    newPeer.on('connection', (conn) => {
      setConnectionStatus('Misafir bağlandı! Oyun başlatılıyor...');
      // Wait for incoming configuration message from host if needed or auto start
      // Host automatically starts game as 'w'
      conn.on('open', () => {
        conn.send({
          type: 'init',
          time: timeControl,
          inc: increment,
          color: 'b' // guest gets black
        });
        onStartGame('host', newPeer, conn, 'w', timeControl, increment);
      });
    });

    newPeer.on('error', (err) => {
      console.error(err);
      setConnectionStatus(`Hata oluştu: ${err.message || err.type}`);
    });

    return () => {
      newPeer.destroy();
    };
  }, []);

  const handleJoin = () => {
    if (!peer || !targetId.trim()) {
      setConnectionStatus('Geçerli bir Oda Kodu giriniz.');
      return;
    }

    setConnectionStatus('Bağlanılıyor...');
    const conn = peer.connect(targetId.trim());

    conn.on('open', () => {
      setConnectionStatus('Sunucuya bağlandı! Konfigürasyon bekleniyor...');
      // Receive init from host
      conn.on('data', (data: any) => {
        if (data && data.type === 'init') {
          onStartGame('guest', peer, conn, data.color, data.time, data.inc);
        }
      });
    });

    conn.on('error', (err) => {
      setConnectionStatus(`Bağlantı hatası: ${err.message}`);
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(peerId);
    setIsCopying(true);
    setTimeout(() => setIsCopying(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-700/50 p-5 rounded-2xl shadow-xl max-w-xl mx-auto backdrop-blur-md text-slate-100 flex flex-col gap-6">
      <div className="text-center">
        <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-sky-400 bg-clip-text text-transparent">
          Online Satranç Modu
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Arkadaşınızla Peer-to-Peer üzerinden direkt olarak bağlantı kurun.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Host Game section */}
        <div className="p-4 bg-slate-800/40 border border-slate-700/50 rounded-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-emerald-400 mb-2">1. Oda Kur (Siz Başlatın)</h3>
            <p className="text-xs text-slate-300 mb-3">
              Bir oda kodu oluşturun ve arkadaşınıza göndererek onun bağlanmasını bekleyin.
            </p>

            <div className="mb-3">
              <label className="text-xs text-slate-400 block mb-1">Oda Kodunuz:</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={peerId || 'Kod oluşturuluyor...'}
                  className="flex-1 bg-slate-950 border border-slate-800 text-slate-200 text-xs px-3 py-2 rounded-lg select-all focus:outline-none focus:border-emerald-500/50"
                />
                <button
                  onClick={handleCopy}
                  disabled={!peerId}
                  className="px-3 py-2 text-xs bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg transition disabled:opacity-50"
                >
                  {isCopying ? 'Kopyalandı' : 'Kopyala'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Oyun Süresi:</label>
                <select
                  value={timeControl}
                  onChange={(e) => setTimeControl(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs px-3 py-1.5 rounded-lg focus:outline-none"
                >
                  <option value={180}>3 Dakika</option>
                  <option value={300}>5 Dakika</option>
                  <option value={600}>10 Dakika</option>
                  <option value={900}>15 Dakika</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Ekleme Süresi (sn):</label>
                <select
                  value={increment}
                  onChange={(e) => setIncrement(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs px-3 py-1.5 rounded-lg focus:outline-none"
                >
                  <option value={0}>0 sn</option>
                  <option value={1}>1 sn</option>
                  <option value={2}>2 sn</option>
                  <option value={3}>3 sn</option>
                  <option value={5}>5 sn</option>
                </select>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 italic mt-2">
            Arkadaşınız odaya katıldığında oyun otomatik başlar.
          </p>
        </div>

        {/* Join Game section */}
        <div className="p-4 bg-slate-800/40 border border-slate-700/50 rounded-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-sky-400 mb-2">2. Mevcut Odaya Katıl</h3>
            <p className="text-xs text-slate-300 mb-3">
              Arkadaşınızın oluşturduğu Oda Kodunu yapıştırarak oyuna katılın.
            </p>

            <div className="mb-3">
              <label className="text-xs text-slate-400 block mb-1">Oda Kodu Girin:</label>
              <input
                type="text"
                placeholder="Örn: 9a785d-8b4..."
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-sky-500/50"
              />
            </div>
          </div>

          <button
            onClick={handleJoin}
            disabled={!targetId.trim()}
            className="w-full mt-4 py-2 bg-sky-500 hover:bg-sky-600 text-slate-950 font-bold rounded-lg text-xs transition disabled:opacity-40"
          >
            Odaya Bağlan
          </button>
        </div>
      </div>

      {connectionStatus && (
        <div className="bg-slate-800 border border-slate-700/60 p-3 rounded-xl text-center text-xs font-semibold text-emerald-400 tracking-wide animate-pulse">
          {connectionStatus}
        </div>
      )}
    </div>
  );
};
