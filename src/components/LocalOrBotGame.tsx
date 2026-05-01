import React, { useState, useEffect } from 'react';
import { Chess, Square } from 'chess.js';
import { ChessBoard3D } from './ChessBoard3D';
import { ChessBoard2D } from './ChessBoard2D';
import { getBotMove } from '../utils/chessAI';
import { soundManager } from '../utils/soundManager';

interface LocalOrBotGameProps {
  mode: 'bot' | 'local';
  botLevel: number;
  initialTime: number;
  increment: number;
  onExit: () => void;
}

export const LocalOrBotGame: React.FC<LocalOrBotGameProps> = ({
  mode,
  botLevel,
  initialTime,
  increment,
  onExit,
}) => {
  const [game, setGame] = useState<Chess>(new Chess());
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);

  // Time controls (seconds)
  const [whiteTime, setWhiteTime] = useState<number>(initialTime);
  const [blackTime, setBlackTime] = useState<number>(initialTime);
  const [gameResult, setGameResult] = useState<string | null>(null);

  // Auto AI response trigger
  useEffect(() => {
    if (gameResult) return;
    if (mode === 'bot' && game.turn() === 'b') {
      const timer = setTimeout(() => {
        const botMoveSan = getBotMove(game, botLevel);
        if (botMoveSan) {
          const gameCopy = new Chess(game.fen());
          const moveResult = gameCopy.move(botMoveSan);

          if (moveResult) {
            setBlackTime((t) => t + increment);
            setGame(gameCopy);
            setSelectedSquare(null);

            // Handle sounds
            if (gameCopy.isCheckmate() || gameCopy.isDraw()) {
              soundManager.playWin();
            } else if (gameCopy.inCheck()) {
              soundManager.playCheck();
            } else if (moveResult.captured) {
              soundManager.playCapture();
            } else {
              soundManager.playMove();
            }

            checkGameOver(gameCopy);
          }
        }
      }, 700); // realistic delay for human look

      return () => clearTimeout(timer);
    }
  }, [game, mode, botLevel, increment, gameResult]);

  // Timers trigger effect
  useEffect(() => {
    if (gameResult) return;

    const timer = setInterval(() => {
      const activeColor = game.turn();
      if (activeColor === 'w') {
        setWhiteTime((prev) => {
          if (prev <= 1) {
            setGameResult('Beyaz süre dolduğu için kaybetti!');
            soundManager.playWin();
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      } else {
        setBlackTime((prev) => {
          if (prev <= 1) {
            setGameResult('Siyah süre dolduğu için kaybetti!');
            soundManager.playWin();
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [game, gameResult]);

  const checkGameOver = (g: Chess) => {
    if (g.isGameOver()) {
      if (g.isCheckmate()) {
        const winner = g.turn() === 'w' ? 'Siyah' : 'Beyaz';
        setGameResult(`Şah mat! Kazanan: ${winner}`);
      } else if (g.isStalemate()) {
        setGameResult('Pat! Berabere.');
      } else if (g.isThreefoldRepetition()) {
        setGameResult('Üçlü tekrar! Berabere.');
      } else if (g.isInsufficientMaterial()) {
        setGameResult('Yetersiz taş! Berabere.');
      } else {
        setGameResult('Oyun sona erdi (Berabere).');
      }
      soundManager.playWin();
    }
  };

  const handleMove = (from: string, to: string) => {
    if (gameResult) return;

    // In bot mode, only white makes manual moves
    if (mode === 'bot' && game.turn() === 'b') return;

    const gameCopy = new Chess(game.fen());
    try {
      const moveResult = gameCopy.move({
        from: from as Square,
        to: to as Square,
        promotion: 'q',
      });

      if (moveResult) {
        // Adjust time increment
        if (game.turn() === 'w') {
          setWhiteTime((t) => t + increment);
        } else {
          setBlackTime((t) => t + increment);
        }

        setGame(gameCopy);
        setSelectedSquare(null);

        // Movement Sounds
        if (gameCopy.isCheckmate() || gameCopy.isDraw()) {
          soundManager.playWin();
        } else if (gameCopy.inCheck()) {
          soundManager.playCheck();
        } else if (moveResult.captured) {
          soundManager.playCapture();
        } else {
          soundManager.playMove();
        }

        checkGameOver(gameCopy);
      }
    } catch (e) {
      console.error('Invalid move made:', e);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col max-w-4xl mx-auto bg-slate-900 border border-slate-700/50 p-4 md:p-6 rounded-2xl shadow-2xl backdrop-blur-md gap-6 text-slate-100">
      {/* Top action bar */}
      <div className="flex flex-wrap items-center justify-between bg-slate-800/40 border border-slate-700/50 p-3 rounded-xl gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold bg-gradient-to-r from-teal-400 to-sky-400 bg-clip-text text-transparent">
            {mode === 'bot' ? `Bot'a Karşı (Seviye ${botLevel})` : 'Aynı Cihazdan Karşılıklı'}
          </span>
          <span className="text-xs bg-slate-700 text-slate-200 px-2 py-1 rounded">
            Yerel Oyun Modu
          </span>
        </div>
        <button
          onClick={onExit}
          className="px-4 py-2 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-300 font-semibold text-xs rounded-xl transition"
        >
          Çıkış Yap / Menüye Dön
        </button>
      </div>

      {/* Grid containing timers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Timer White */}
        <div className={`p-4 rounded-xl border flex items-center justify-between transition ${
          game.turn() === 'w' ? 'bg-amber-500/10 border-amber-500/40 ring-1 ring-amber-500/20' : 'bg-slate-800/20 border-slate-800'
        }`}>
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider block">Beyazın Süresi</span>
            <span className="text-xl md:text-2xl font-black text-slate-100 font-mono tracking-wider">
              {formatTime(whiteTime)}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-slate-400 block">Renk</span>
            <span className="text-xs font-bold text-amber-100 bg-slate-800 px-2 py-0.5 rounded border border-slate-700 select-none">
              BEYAZ
            </span>
          </div>
        </div>

        {/* Timer Black */}
        <div className={`p-4 rounded-xl border flex items-center justify-between transition ${
          game.turn() === 'b' ? 'bg-sky-500/10 border-sky-500/40 ring-1 ring-sky-500/20' : 'bg-slate-800/20 border-slate-800'
        }`}>
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider block">Siyahın Süresi</span>
            <span className="text-xl md:text-2xl font-black text-slate-100 font-mono tracking-wider">
              {formatTime(blackTime)}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-slate-400 block">Renk</span>
            <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 select-none">
              SİYAH
            </span>
          </div>
        </div>
      </div>

      {/* Main Board display area */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <ChessBoard3D
            game={game}
            onMove={handleMove}
            selectedSquare={selectedSquare}
            setSelectedSquare={setSelectedSquare}
            playerColor={game.turn() === 'w' || mode === 'bot' ? 'w' : 'b'}
          />
        </div>
        <div className="lg:col-span-2 flex flex-col gap-4">
          <ChessBoard2D
            game={game}
            onMove={handleMove}
            selectedSquare={selectedSquare}
            setSelectedSquare={setSelectedSquare}
            playerColor={game.turn() === 'w' || mode === 'bot' ? 'w' : 'b'}
          />
        </div>
      </div>

      {/* Dynamic game status footer */}
      <div className="flex items-center justify-center p-3 bg-slate-800/50 border border-slate-700/40 rounded-xl">
        {gameResult ? (
          <span className="text-sm font-bold text-emerald-400 tracking-wide text-center uppercase animate-bounce select-none">
            {gameResult}
          </span>
        ) : (
          <span className="text-xs font-semibold text-slate-300">
            Sıra:{' '}
            <strong className="text-emerald-400">
              {game.turn() === 'w' ? 'Beyazda!' : 'Siyah' + (mode === 'bot' ? ' (Bot Hamle Yapıyor...)' : 'da!')}
            </strong>
          </span>
        )}
      </div>
    </div>
  );
};
