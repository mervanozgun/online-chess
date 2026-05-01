import { Chess } from 'chess.js';

// Standard Chess Piece-Square Tables (PST)
const pawnEvalWhite = [
  [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
  [5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0],
  [1.0, 1.0, 2.0, 3.0, 3.0, 2.0, 1.0, 1.0],
  [0.5, 0.5, 1.0, 2.5, 2.5, 1.0, 0.5, 0.5],
  [0.0, 0.0, 0.0, 2.0, 2.0, 0.0, 0.0, 0.0],
  [0.5, -0.5, -1.0, 0.0, 0.0, -1.0, -0.5, 0.5],
  [0.5, 1.0, 1.0, -2.0, -2.0, 1.0, 1.0, 0.5],
  [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
];

const knightEval = [
  [-5.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, -5.0],
  [-4.0, -2.0, 0.0, 0.0, 0.0, 0.0, -2.0, -4.0],
  [-3.0, 0.0, 1.0, 1.5, 1.5, 1.0, 0.0, -3.0],
  [-3.0, 0.5, 1.5, 2.0, 2.0, 1.5, 0.5, -3.0],
  [-3.0, 0.0, 1.5, 2.0, 2.0, 1.5, 0.0, -3.0],
  [-3.0, 0.5, 1.0, 1.5, 1.5, 1.0, 0.5, -3.0],
  [-4.0, -2.0, 0.0, 0.5, 0.5, 0.0, -2.0, -4.0],
  [-5.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, -5.0]
];

const bishopEvalWhite = [
  [-2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0],
  [-1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -1.0],
  [-1.0, 0.0, 0.5, 1.0, 1.0, 0.5, 0.0, -1.0],
  [-1.0, 0.5, 0.5, 1.0, 1.0, 0.5, 0.5, -1.0],
  [-1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0, -1.0],
  [-1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0],
  [-1.0, 0.5, 0.0, 0.0, 0.0, 0.0, 0.5, -1.0],
  [-2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0]
];

const rookEvalWhite = [
  [0.0, 0.0, 0.0, 0.5, 0.5, 0.0, 0.0, 0.0],
  [0.5, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.5],
  [-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
  [-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
  [-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
  [-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
  [-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
  [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
];

const queenEval = [
  [-2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0],
  [-1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -1.0],
  [-1.0, 0.0, 0.5, 0.5, 0.5, 0.5, 0.0, -1.0],
  [-0.5, 0.0, 0.5, 0.5, 0.5, 0.5, 0.0, -0.5],
  [0.0, 0.0, 0.5, 0.5, 0.5, 0.5, 0.0, -0.5],
  [-1.0, 0.5, 0.5, 0.5, 0.5, 0.5, 0.0, -1.0],
  [-1.0, 0.0, 0.5, 0.0, 0.0, 0.0, 0.0, -1.0],
  [-2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0]
];

const kingEvalWhite = [
  [-3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
  [-3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
  [-3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
  [-3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
  [-2.0, -3.0, -3.0, -4.0, -4.0, -3.0, -3.0, -2.0],
  [-1.0, -2.0, -2.0, -2.0, -2.0, -2.0, -2.0, -1.0],
  [2.0, 2.0, 0.0, 0.0, 0.0, 0.0, 2.0, 2.0],
  [2.0, 3.0, 1.0, 0.0, 0.0, 1.0, 3.0, 2.0]
];

// Flip tables for black perspective
const reverseArray = (array: number[][]) => [...array].reverse();

const pawnEvalBlack = reverseArray(pawnEvalWhite);
const bishopEvalBlack = reverseArray(bishopEvalWhite);
const rookEvalBlack = reverseArray(rookEvalWhite);
const kingEvalBlack = reverseArray(kingEvalWhite);

export function evaluateBoard(game: Chess): number {
  let totalEvaluation = 0;
  const board = game.board();

  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const piece = board[i][j];
      if (piece) {
        let value = 0;
        const color = piece.color;
        const type = piece.type;

        if (type === 'p') {
          value = 100 + (color === 'w' ? pawnEvalWhite[i][j] : pawnEvalBlack[i][j]) * 10;
        } else if (type === 'n') {
          value = 320 + knightEval[i][j] * 10;
        } else if (type === 'b') {
          value = 330 + (color === 'w' ? bishopEvalWhite[i][j] : bishopEvalBlack[i][j]) * 10;
        } else if (type === 'r') {
          value = 500 + (color === 'w' ? rookEvalWhite[i][j] : rookEvalBlack[i][j]) * 10;
        } else if (type === 'q') {
          value = 900 + queenEval[i][j] * 10;
        } else if (type === 'k') {
          value = 20000 + (color === 'w' ? kingEvalWhite[i][j] : kingEvalBlack[i][j]) * 10;
        }

        if (color === 'w') {
          totalEvaluation += value;
        } else {
          totalEvaluation -= value;
        }
      }
    }
  }

  return totalEvaluation;
}

// Alpha-Beta pruning minimax algorithm
export function minimax(
  game: Chess,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizingPlayer: boolean
): [number, any] {
  if (depth === 0 || game.isGameOver()) {
    return [evaluateBoard(game), null];
  }

  const moves = game.moves({ verbose: true });
  if (moves.length === 0) return [evaluateBoard(game), null];

  let bestMove: any = null;

  if (isMaximizingPlayer) {
    let maxEval = -Infinity;
    for (const move of moves) {
      game.move(move.san);
      const [evaluation] = minimax(game, depth - 1, alpha, beta, false);
      game.undo();

      if (evaluation > maxEval) {
        maxEval = evaluation;
        bestMove = move;
      }
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) {
        break;
      }
    }
    return [maxEval, bestMove];
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      game.move(move.san);
      const [evaluation] = minimax(game, depth - 1, alpha, beta, true);
      game.undo();

      if (evaluation < minEval) {
        minEval = evaluation;
        bestMove = move;
      }
      beta = Math.min(beta, evaluation);
      if (beta <= alpha) {
        break;
      }
    }
    return [minEval, bestMove];
  }
}

// Function to find the best move based on 5 different difficulty levels
export function getBotMove(game: Chess, level: number): string | null {
  const possibleMoves = game.moves();
  if (possibleMoves.length === 0) return null;

  // Level 1: Random Bot
  if (level === 1) {
    const randomIndex = Math.floor(Math.random() * possibleMoves.length);
    return possibleMoves[randomIndex];
  }

  // Level 2: Random with a small chance to check standard piece capture
  if (level === 2) {
    // 50% minimax depth 1, 50% random
    if (Math.random() > 0.5) {
      const [, move] = minimax(game, 1, -Infinity, Infinity, game.turn() === 'w');
      return move ? move.san : possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
    }
    return possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
  }

  // Level 3: Minimax depth 2 (Intermediate)
  if (level === 3) {
    const [, move] = minimax(game, 2, -Infinity, Infinity, game.turn() === 'w');
    return move ? move.san : possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
  }

  // Level 4: Minimax depth 3 (Hard)
  if (level === 4) {
    const [, move] = minimax(game, 3, -Infinity, Infinity, game.turn() === 'w');
    return move ? move.san : possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
  }

  // Level 5: Minimax depth 4 (Very Advanced)
  if (level === 5) {
    const [, move] = minimax(game, 4, -Infinity, Infinity, game.turn() === 'w');
    return move ? move.san : possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
  }

  return possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
}
