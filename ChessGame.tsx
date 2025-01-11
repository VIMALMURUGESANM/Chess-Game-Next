import React, { useState, useEffect } from 'react';
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

    useEffect(() => {
        const isWhiteKing = currentPlayer === 'white';
        if (isCheckmate(board, isWhiteKing)) {
            setGameStatus(`Checkmate! ${currentPlayer === 'white' ? 'Black' : 'White'} wins!`);
            setIsGameOver(true);
        } else if (isCheck(board, isWhiteKing)) {
            setGameStatus(`${currentPlayer} is in check!`);
        } else {
            setGameStatus(`${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)}'s turn`);
        }
    }, [board, currentPlayer]);

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
                setValidMoves(getValidMoves(board, row, col));
            }
        }
    };

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, row: number, col: number) => {
        const piece = board[row][col];
        if (piece && ((currentPlayer === 'white' && piece === piece.toUpperCase()) ||
                      (currentPlayer === 'black' && piece === piece.toLowerCase()))) {
            e.dataTransfer.setData('text/plain', `${row},${col}`);
            setSelectedPiece([row, col]);
            setValidMoves(getValidMoves(board, row, col));
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
        newBoard[endRow][endCol] = newBoard[startRow][startCol];
        newBoard[startRow][startCol] = '';
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

