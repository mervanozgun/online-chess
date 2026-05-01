import { useState, useEffect } from 'react';
import Peer, { DataConnection } from 'peerjs';
import { OnlineLobby } from './components/OnlineLobby';
import { OnlineGame } from './components/OnlineGame';
import { LocalOrBotGame } from './components/LocalOrBotGame';
import { soundManager } from './utils/soundManager';

type GameMode = 'menu' | 'bot' | 'local' | 'online_lobby' | 'online_game';

export default function App() {
  const [mode, setMode] = useState<GameMode>('menu');
  const [botLevel, setBotLevel] = useState<number>(1);
  const [initialTime, setInitialTime] = useState<number>(300); // in seconds
  const [increment, setIncrement] = useState<number>(3); // in seconds
  const [isMusicOn, setIsMusicOn] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.2);

  // Online connection objects
  const [peerObj, setPeerObj] = useState<Peer | null>(null);
  const [connObj, setConnObj] = useState<DataConnection | null>(null);
  const [onlineRole, setOnlineRole] = useState<'host' | 'guest'>('host');
  const [onlineColor, setOnlineColor] = useState<'w' | 'b'>('w');

  // Interactive Chess rules overlay toggle
  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);

  useEffect(() => {
    soundManager.setVolume(volume);
  }, [volume]);

  const toggleMusic = () => {
    if (isMusicOn) {
      soundManager.stopMusic();
      setIsMusicOn(false);
    } else {
      soundManager.startMusic();
      setIsMusicOn(true);
    }
  };

  const startOnlineGame = (
    role: 'host' | 'guest',
    peer: Peer,
    conn: DataConnection,
    side: 'w' | 'b',
    t: number,
    inc: number
  ) => {
    setPeerObj(peer);
    setConnObj(conn);
    setOnlineRole(role);
    setOnlineColor(side);
    setInitialTime(t);
    setIncrement(inc);
    setMode('online_game');
  };

  const handleExit = () => {
    if (connObj) {
      connObj.close();
    }
    if (peerObj) {
      peerObj.destroy();
    }
    setMode('menu');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none antialiased">
      {/* Background radial gradient decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-900/15 via-slate-950 to-slate-950 pointer-events-none" />

      {/* Modern Header Nav */}
      <header className="relative z-10 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-lg px-4 md:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-sky-500 text-slate-950 font-black text-xl shadow-lg select-none">
            3D
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-black bg-gradient-to-r from-emerald-400 via-teal-400 to-sky-400 bg-clip-text text-transparent leading-tight tracking-tight">
              OLYMPICS 3D CHESS
            </h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
              Gerçekçi 3D Tahta ve Kurallar
            </p>
          </div>
        </div>

        {/* Action Controls Toolbar (Music/Volume/Rules) */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={() => setShowRulesModal(true)}
            className="px-3.5 py-1.5 bg-slate-800/60 border border-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition"
          >
            Satranç Kuralları 🛈
          </button>

          <button
            onClick={toggleMusic}
            className={`px-3.5 py-1.5 border font-semibold text-xs rounded-xl transition flex items-center gap-1.5 ${
              isMusicOn
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {isMusicOn ? '🔊 Fon Müziği Açık' : '🔇 Fon Müziği Kapalı'}
          </button>

          {/* Slider volume control */}
          <div className="flex items-center bg-slate-800/60 border border-slate-700/60 rounded-xl px-3 py-1.5 gap-2 select-none">
            <span className="text-[10px] text-slate-400">Ses:</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-16 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>
        </div>
      </header>

      {/* Main interactive area */}
      <main className="relative z-10 flex-1 w-full max-w-6xl mx-auto px-4 py-6 flex flex-col justify-center">
        {mode === 'menu' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Visual Intro Panel */}
            <div className="flex flex-col gap-4 text-center md:text-left pr-0 md:pr-4">
              <span className="text-xs font-black uppercase text-emerald-400 tracking-wider">
                Resmi Olimpiyat Kuralları Geçerli
              </span>
              <h2 className="text-3xl md:text-5xl font-black text-slate-100 tracking-tight leading-none">
                Gelişmiş <span className="bg-gradient-to-r from-emerald-400 to-sky-400 bg-clip-text text-transparent">3D Satranç</span> Deneyimi
              </h2>
              <p className="text-xs md:text-sm text-slate-400 max-w-md mx-auto md:mx-0 font-medium">
                Süreli veya eklemeli oyunlarla, 5 farklı zorluk seviyesindeki yapay zekaya karşı, arkadaşınızla aynı ekrandan veya online olarak bağlantı kurup yarışın.
              </p>

              {/* Time Selection */}
              <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl flex flex-wrap gap-4 mt-2">
                <div className="flex-1 min-w-[120px]">
                  <label className="text-[11px] text-slate-400 block mb-1">Dakika Seviyesi:</label>
                  <select
                    value={initialTime}
                    onChange={(e) => setInitialTime(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800/80 text-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500/50"
                  >
                    <option value={180}>3 Dakika</option>
                    <option value={300}>5 Dakika</option>
                    <option value={600}>10 Dakika</option>
                    <option value={900}>15 Dakika</option>
                  </select>
                </div>
                <div className="flex-1 min-w-[120px]">
                  <label className="text-[11px] text-slate-400 block mb-1">Saniye Ekleme (Increment):</label>
                  <select
                    value={increment}
                    onChange={(e) => setIncrement(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800/80 text-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500/50"
                  >
                    <option value={0}>0 Saniye</option>
                    <option value={1}>1 Saniye</option>
                    <option value={2}>2 Saniye</option>
                    <option value={3}>3 Saniye</option>
                    <option value={5}>5 Saniye</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Selection modes panel */}
            <div className="flex flex-col gap-4 bg-slate-900/40 border border-slate-800 p-5 rounded-3xl shadow-xl backdrop-blur-sm">
              <h3 className="text-sm font-black text-slate-300 uppercase tracking-widest px-1">
                Oyun Modunu Seçin
              </h3>

              {/* Option 1: Bot (5 Levels) */}
              <div className="p-4 bg-slate-800/30 border border-slate-700/40 hover:border-slate-600/70 rounded-2xl flex flex-col gap-3 transition">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                      🤖 Yapay Zekaya Karşı (5 Seviye)
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      5 farklı zorluk seviyesinde bilgisayara karşı yarışın.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <select
                      value={botLevel}
                      onChange={(e) => setBotLevel(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none"
                    >
                      <option value={1}>Seviye 1: Rastgele Bot (Başlangıç)</option>
                      <option value={2}>Seviye 2: Kolay Bot</option>
                      <option value={3}>Seviye 3: Orta Seviye Bot</option>
                      <option value={4}>Seviye 4: Zor Bot</option>
                      <option value={5}>Seviye 5: Profesyonel Bot</option>
                    </select>
                  </div>
                  <button
                    onClick={() => setMode('bot')}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black rounded-xl text-xs transition"
                  >
                    Başlat
                  </button>
                </div>
              </div>

              {/* Option 2: Local Game */}
              <button
                onClick={() => setMode('local')}
                className="p-4 bg-slate-800/30 border border-slate-700/40 hover:border-slate-600/70 hover:bg-slate-800/50 rounded-2xl flex items-center justify-between transition group text-left"
              >
                <div>
                  <h4 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                    👥 Aynı Cihazdan 2 Kişilik
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Bir arkadaşınızla yan yana karşılıklı (Local) oynayın.
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-300 group-hover:text-white group-hover:translate-x-0.5 transition">
                  Başlat →
                </span>
              </button>

              {/* Option 3: Online multiplayer */}
              <button
                onClick={() => setMode('online_lobby')}
                className="p-4 bg-gradient-to-r from-emerald-500/10 via-sky-500/10 to-transparent border border-sky-500/30 hover:border-sky-500/50 rounded-2xl flex items-center justify-between transition group text-left"
              >
                <div>
                  <h4 className="text-sm font-bold text-sky-300 flex items-center gap-1.5">
                    🌐 Online Karşılıklı
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Arkadaşınızla uzak mesafeden online bağlanıp oynayın.
                  </p>
                </div>
                <span className="text-xs font-bold text-sky-400 group-hover:text-white group-hover:translate-x-0.5 transition">
                  Bağlan →
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Component for Local or Bot Game */}
        {(mode === 'bot' || mode === 'local') && (
          <LocalOrBotGame
            mode={mode}
            botLevel={botLevel}
            initialTime={initialTime}
            increment={increment}
            onExit={handleExit}
          />
        )}

        {/* Lobby for online matchmaking */}
        {mode === 'online_lobby' && <OnlineLobby onStartGame={startOnlineGame} />}

        {/* Live connected online gameplay */}
        {mode === 'online_game' && peerObj && connObj && (
          <OnlineGame
            role={onlineRole}
            peer={peerObj}
            conn={connObj}
            playerColor={onlineColor}
            initialTime={initialTime}
            increment={increment}
            onExit={handleExit}
          />
        )}
      </main>

      {/* Footer bar */}
      <footer className="relative z-10 border-t border-slate-800/80 bg-slate-900/30 backdrop-blur-lg px-4 py-3.5 text-center text-[10px] md:text-xs text-slate-500 select-none flex flex-wrap justify-between gap-2 max-w-6xl mx-auto w-full">
        <span>© 2026 Olympics 3D Chess. Tüm hakları saklıdır.</span>
        <span className="flex items-center gap-1.5">
          Resmi Olimpiyat Standartlarında ve Kurallarında Geliştirilmiştir.
        </span>
      </footer>

      {/* Complete Chess rules Modal */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 max-w-xl w-full max-h-[85vh] overflow-y-auto p-5 rounded-2xl shadow-2xl flex flex-col gap-4 text-slate-200">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h3 className="text-base font-bold text-emerald-400 flex items-center gap-2 select-none">
                Olimpiyat Satranç Kuralları
              </h3>
              <button
                onClick={() => setShowRulesModal(false)}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition"
              >
                Kapat
              </button>
            </div>

            <div className="text-xs flex flex-col gap-3.5 text-slate-300 leading-relaxed font-normal">
              <p>
                Oyunlarımız tamamen resmi <strong>FIDE (Olimpiyat) Satranç Kuralları</strong> çerçevesinde oynanmaktadır.
              </p>
              <div>
                <h4 className="text-sm font-semibold text-sky-400 mb-1">
                  1. Taş Hareketleri ve Özel Kurallar
                </h4>
                <ul className="list-disc list-inside flex flex-col gap-1.5 pl-1">
                  <li>
                    <strong>En Passant (Geçerken Alma):</strong> Piyon iki kare ileri hareket ettiğinde, rakip piyon tarafından normal tek kare çapraz hamleyle alınabilir. Sadece ilk hamlede uygulanabilir.
                  </li>
                  <li>
                    <strong>Rok (Castling):</strong> Şah ve kale arasında herhangi bir taş yoksa ve şah/kale daha önce hiç oynamadıysa gerçekleştirilir. Şah tehdit altındayken rok yapılamaz.
                  </li>
                  <li>
                    <strong>Terfi (Promotion):</strong> Piyon rakip tarafın son karesine ulaştığında otomatik olarak <strong>Vezir</strong>e terfi edilir.
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-sky-400 mb-1">
                  2. Beraberlik & Galibiyet Durumları
                </h4>
                <ul className="list-disc list-inside flex flex-col gap-1.5 pl-1">
                  <li>
                    <strong>Şah Mat (Checkmate):</strong> Rakip şah tehdit altındayken kaçacak geçerli hamlesi kalmadığında oyun biter.
                  </li>
                  <li>
                    <strong>Pat (Stalemate):</strong> Sırası gelen oyuncunun şahı tehdit altında olmadığı halde geçerli hiçbir hamlesi kalmadığında oyun berabere biter.
                  </li>
                  <li>
                    <strong>Süre Sınırı:</strong> Süresi ilk sıfırlanan oyuncu oyunu doğrudan kaybeder.
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-sky-400 mb-1">
                  3. Süre Kontrolleri (Sudden Death + Increment)
                </h4>
                <p>
                  Olimpiyat standartlarındaki eklemeli saat kuralı geçerlidir. Oyuncular her hamle yaptıklarında ayarlanan ekleme süresi saatlerine otomatik olarak yansıtılır.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
