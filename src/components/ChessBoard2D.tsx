import React from 'react';
import { Chess, Square } from 'chess.js';

interface ChessBoard2DProps {
  game: Chess;
  onMove: (from: string, to: string) => void;
  selectedSquare: string | null;
  setSelectedSquare: (sq: string | null) => void;
  playerColor: 'w' | 'b';
}

export const ChessBoard2D: React.FC<ChessBoard2DProps> = ({
  game,
  onMove,
  selectedSquare,
  setSelectedSquare,
  playerColor,
}) => {
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = playerColor === 'w' ? [8, 7, 6, 5, 4, 3, 2, 1] : [1, 2, 3, 4, 5, 6, 7, 8];
  const renderedFiles = playerColor === 'w' ? files : [...files].reverse();

  // Legal moves from the selected square
  const validMoves = selectedSquare
    ? game.moves({ square: selectedSquare as Square, verbose: true }).map((m) => m.to)
    : [];

  const handleSquareClick = (sq: string) => {
    if (selectedSquare) {
      if (validMoves.includes(sq as Square)) {
        onMove(selectedSquare, sq);
      } else {
        const piece = game.get(sq as Square);
        if (piece && piece.color === playerColor) {
          setSelectedSquare(sq);
        } else {
          setSelectedSquare(null);
        }
      }
    } else {
      const piece = game.get(sq as Square);
      if (piece && piece.color === playerColor) {
        setSelectedSquare(sq);
      }
    }
  };

  // Maps piece types to visually distinctive text / emojis
  const getPieceSymbol = (type: string, color: string) => {
    const isWhite = color === 'w';
    switch (type) {
      case 'p': return isWhite ? '♙' : '♟';
      case 'r': return isWhite ? '♖' : '♜';
      case 'n': return isWhite ? '♘' : '♞';
      case 'b': return isWhite ? '♗' : '♝';
      case 'q': return isWhite ? '♕' : '♛';
      case 'k': return isWhite ? '♔' : '♚';
      default: return '';
    }
  };

  return (
    <div className="flex flex-col items-center bg-slate-900 border border-slate-700/50 p-4 rounded-2xl shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between w-full mb-3 px-1">
        <span className="text-sm font-semibold text-slate-300">
          Hızlı Seçim & Koordinat Rehberi (2D)
        </span>
        <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
          {playerColor === 'w' ? 'Beyaz Perspektifi' : 'Siyah Perspektifi'}
        </span>
      </div>

      <div className="relative aspect-square w-full max-w-[320px] bg-slate-800 p-2 rounded-xl grid grid-cols-8 grid-rows-8 border border-slate-700 shadow-inner">
        {ranks.map((rank) =>
          renderedFiles.map((file) => {
            const sq = `${file}${rank}`;
            const isSelected = sq === selectedSquare;
            const isValidTarget = validMoves.includes(sq as Square);
            const isDark = (rank + files.indexOf(file)) % 2 === 0;

            const piece = game.get(sq as Square);

            return (
              <button
                key={sq}
                onClick={() => handleSquareClick(sq)}
                className={`relative flex items-center justify-center font-serif text-2xl select-none transition-all duration-150 ${
                  isDark ? 'bg-slate-700/50' : 'bg-slate-300/10'
                } ${
                  isSelected ? 'ring-2 ring-emerald-500 bg-emerald-500/30' : ''
                } ${
                  isValidTarget ? 'ring-2 ring-sky-500 bg-sky-500/25 animate-pulse' : ''
                } hover:bg-slate-600/50`}
              >
                {/* Visual coordinate overlays */}
                {rank === ranks[7] && (
                  <span className="absolute bottom-0 right-0.5 text-[9px] text-slate-500 uppercase leading-none select-none">
                    {file}
                  </span>
                )}
                {file === renderedFiles[0] && (
                  <span className="absolute top-0.5 left-0.5 text-[9px] text-slate-500 uppercase leading-none select-none">
                    {rank}
                  </span>
                )}

                {piece && (
                  <span
                    className={`font-bold transition-all transform hover:scale-110 active:scale-95 ${
                      piece.color === 'w' ? 'text-amber-100 drop-shadow' : 'text-slate-900 drop-shadow-[0_1px_1px_rgba(255,255,255,0.4)]'
                    }`}
                  >
                    {getPieceSymbol(piece.type, piece.color)}
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>

      <div className="mt-3 text-center text-xs text-slate-400 max-w-[280px]">
        Hem 3D ekrandan hem de yukarıdaki 2D mini rehberden taşları tıklayarak doğrudan kontrol edebilirsiniz.
      </div>
    </div>
  );
};
