import React from 'react';
import pieceImages from './pieceImages';

interface SquareProps {
    piece: string;
    isSelected: boolean;
    isValidMove: boolean;
    onClick: () => void;
    onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
    onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
    onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
    isWhite: boolean;
    isGameOver: boolean;
}

export const Square: React.FC<SquareProps> = ({ 
    piece, 
    isSelected, 
    isValidMove, 
    onClick, 
    onDragStart,
    onDragOver,
    onDrop,
    isWhite, 
    isGameOver 
}) => {
    const pieceImage = piece ? pieceImages[piece] || '' : '';
    return (
        <div 
            className={`square ${isWhite ? 'white' : 'black'} ${isSelected ? 'selected' : ''} ${isValidMove ? 'valid-move' : ''} ${isGameOver ? 'game-over' : ''}`}
            onClick={onClick}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDrop={onDrop}
            draggable={!!piece}
        >
            {pieceImage && <img src={pieceImage} alt={piece} className="piece" draggable="false" />}
        </div>
    );
};

