import React, { useState, useEffect, useCallback } from 'react';
import { Square } from './Square';
import { getValidMoves, isCheck, isCheckmate, Board } from './chessLogic';
import './ChessGame.css';

const initialBoard: Board = [
    ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
    ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
    ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
];

const ChessGame: React.FC = () => {
    const [board, setBoard] = useState<Board>(initialBoard);
    const [selectedPiece, setSelectedPiece] = useState<[number, number] | null>(null);
    const [currentPlayer, setCurrentPlayer] = useState<'white' | 'black'>('white');
    const [validMoves, setValidMoves] = useState<[number, number][]>([]);
    const [gameStatus, setGameStatus] = useState<string>('');
    const [isGameOver, setIsGameOver] = useState<boolean>(false);
    const [canWhiteCastleKingside, setCanWhiteCastleKingside] = useState<boolean>(true);
    const [canWhiteCastleQueenside, setCanWhiteCastleQueenside] = useState<boolean>(true);
    const [canBlackCastleKingside, setCanBlackCastleKingside] = useState<boolean>(true);
    const [canBlackCastleQueenside, setCanBlackCastleQueenside] = useState<boolean>(true);

    const updateGameStatus = useCallback(() => {
        const isWhiteKing = currentPlayer === 'white';
        if (isCheckmate(board, isWhiteKing)) {
            setGameStatus(`Checkmate! ${currentPlayer === 'white' ? 'Black' : 'White'} wins!`);
            setIsGameOver(true);
        } else if (isCheck(board, isWhiteKing)) {
            setGameStatus(`${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)} is in check!`);
        } else {
            setGameStatus(`${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)}'s turn`);
        }
    }, [board, currentPlayer]);

    useEffect(() => {
        updateGameStatus();
    }, [board, currentPlayer, updateGameStatus]);

    const handleSquareClick = (row: number, col: number) => {
        if (isGameOver) return;

        if (selectedPiece) {
            if (validMoves.some(([r, c]) => r === row && c === col)) {
                movePiece(selectedPiece[0], selectedPiece[1], row, col);
            } else {
                setSelectedPiece(null);
                setValidMoves([]);
            }
        } else {
            const piece = board[row][col];
            if (piece && ((currentPlayer === 'white' && piece === piece.toUpperCase()) ||
                          (currentPlayer === 'black' && piece === piece.toLowerCase()))) {
                setSelectedPiece([row, col]);
                setValidMoves(getValidMoves(board, row, col, true, 
                    currentPlayer === 'white' ? canWhiteCastleKingside : canBlackCastleKingside,
                    currentPlayer === 'white' ? canWhiteCastleQueenside : canBlackCastleQueenside
                ));
            }
        }
    };

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, row: number, col: number) => {
        const piece = board[row][col];
        if (piece && ((currentPlayer === 'white' && piece === piece.toUpperCase()) ||
                      (currentPlayer === 'black' && piece === piece.toLowerCase()))) {
            e.dataTransfer.setData('text/plain', `${row},${col}`);
            setSelectedPiece([row, col]);
            setValidMoves(getValidMoves(board, row, col, true,
                currentPlayer === 'white' ? canWhiteCastleKingside : canBlackCastleKingside,
                currentPlayer === 'white' ? canWhiteCastleQueenside : canBlackCastleQueenside
            ));
        } else {
            e.preventDefault();
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropRow: number, dropCol: number) => {
        e.preventDefault();
        const [startRow, startCol] = e.dataTransfer.getData('text').split(',').map(Number);
        if (validMoves.some(([r, c]) => r === dropRow && c === dropCol)) {
            movePiece(startRow, startCol, dropRow, dropCol);
        }
    };

    const movePiece = (startRow: number, startCol: number, endRow: number, endCol: number) => {
        const newBoard = board.map(row => [...row]);
        const movingPiece = newBoard[startRow][startCol];
        newBoard[endRow][endCol] = movingPiece;
        newBoard[startRow][startCol] = '';

        // Handle castling
        if (movingPiece.toLowerCase() === 'k' && Math.abs(startCol - endCol) === 2) {
            if (endCol === 6) { // Kingside castling
                newBoard[endRow][5] = newBoard[endRow][7];
                newBoard[endRow][7] = '';
            } else if (endCol === 2) { // Queenside castling
                newBoard[endRow][3] = newBoard[endRow][0];
                newBoard[endRow][0] = '';
            }
        }

        // Update castling flags
        if (movingPiece === 'K') {
            setCanWhiteCastleKingside(false);
            setCanWhiteCastleQueenside(false);
        } else if (movingPiece === 'k') {
            setCanBlackCastleKingside(false);
            setCanBlackCastleQueenside(false);
        } else if (movingPiece === 'R') {
            if (startRow === 7 && startCol === 0) setCanWhiteCastleQueenside(false);
            if (startRow === 7 && startCol === 7) setCanWhiteCastleKingside(false);
        } else if (movingPiece === 'r') {
            if (startRow === 0 && startCol === 0) setCanBlackCastleQueenside(false);
            if (startRow === 0 && startCol === 7) setCanBlackCastleKingside(false);
        }

        setBoard(newBoard);
        setSelectedPiece(null);
        setValidMoves([]);
        setCurrentPlayer(currentPlayer === 'white' ? 'black' : 'white');
    };

    return (
        <div className="game-container">
            <div className="board">
                {board.map((row, rowIndex) => (
                    row.map((piece, colIndex) => (
                        <Square
                            key={`${rowIndex}-${colIndex}`}
                            piece={piece}
                            isSelected={selectedPiece?.[0] === rowIndex && selectedPiece?.[1] === colIndex}
                            isValidMove={validMoves.some(([r, c]) => r === rowIndex && c === colIndex)}
                            onClick={() => handleSquareClick(rowIndex, colIndex)}
                            onDragStart={(e) => handleDragStart(e, rowIndex, colIndex)}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, rowIndex, colIndex)}
                            isWhite={(rowIndex + colIndex) % 2 === 0}
                            isGameOver={isGameOver}
                        />
                    ))
                ))}
            </div>
            <div className="status">
                {gameStatus}
            </div>
        </div>
    );
};

export default ChessGame;

