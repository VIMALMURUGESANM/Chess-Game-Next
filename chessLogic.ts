export type Piece = 'p' | 'r' | 'n' | 'b' | 'q' | 'k' | 'P' | 'R' | 'N' | 'B' | 'Q' | 'K' | '';
export type Board = Piece[][];

export function getValidMoves(board: Board, row: number, col: number, considerPin: boolean = true): [number, number][] {
    const piece = board[row][col];
    const isWhite = piece === piece.toUpperCase();
    let moves: [number, number][] = [];

    switch (piece.toLowerCase()) {
        case 'p': moves = getPawnMoves(board, row, col, isWhite); break;
        case 'r': moves = getRookMoves(board, row, col, isWhite); break;
        case 'n': moves = getKnightMoves(board, row, col, isWhite); break;
        case 'b': moves = getBishopMoves(board, row, col, isWhite); break;
        case 'q': moves = getQueenMoves(board, row, col, isWhite); break;
        case 'k': moves = getKingMoves(board, row, col, isWhite); break;
    }

    if (considerPin) {
        moves = moves.filter(([newRow, newCol]) => !movePutsOwnKingInCheck(board, row, col, newRow, newCol));
    }

    return moves;
}

function getPawnMoves(board: Board, row: number, col: number, isWhite: boolean): [number, number][] {
    const moves: [number, number][] = [];
    const direction = isWhite ? -1 : 1;
    const startRow = isWhite ? 6 : 1;

    if (board[row + direction]?.[col] === '') {
        moves.push([row + direction, col]);
        if (row === startRow && board[row + 2 * direction]?.[col] === '') {
            moves.push([row + 2 * direction, col]);
        }
    }

    for (const dcol of [-1, 1]) {
        if (board[row + direction]?.[col + dcol] && isOpponentPiece(board[row + direction][col + dcol], isWhite)) {
            moves.push([row + direction, col + dcol]);
        }
    }

    return moves;
}

function getRookMoves(board: Board, row: number, col: number, isWhite: boolean): [number, number][] {
    return getStraightMoves(board, row, col, isWhite);
}

function getKnightMoves(board: Board, row: number, col: number, isWhite: boolean): [number, number][] {
    const moves: [number, number][] = [];
    const knightMoves = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];

    for (const [dr, dc] of knightMoves) {
        const newRow = row + dr;
        const newCol = col + dc;
        if (isValidPosition(newRow, newCol) && (board[newRow][newCol] === '' || isOpponentPiece(board[newRow][newCol], isWhite))) {
            moves.push([newRow, newCol]);
        }
    }

    return moves;
}

function getBishopMoves(board: Board, row: number, col: number, isWhite: boolean): [number, number][] {
    return getDiagonalMoves(board, row, col, isWhite);
}

function getQueenMoves(board: Board, row: number, col: number, isWhite: boolean): [number, number][] {
    return [...getStraightMoves(board, row, col, isWhite), ...getDiagonalMoves(board, row, col, isWhite)];
}

function getKingMoves(board: Board, row: number, col: number, isWhite: boolean): [number, number][] {
    const moves: [number, number][] = [];
    const kingMoves = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];

    for (const [dr, dc] of kingMoves) {
        const newRow = row + dr;
        const newCol = col + dc;
        if (isValidPosition(newRow, newCol) && (board[newRow][newCol] === '' || isOpponentPiece(board[newRow][newCol], isWhite))) {
            moves.push([newRow, newCol]);
        }
    }

    return moves;
}

function getStraightMoves(board: Board, row: number, col: number, isWhite: boolean): [number, number][] {
    const moves: [number, number][] = [];
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

    for (const [dr, dc] of directions) {
        let newRow = row + dr;
        let newCol = col + dc;
        while (isValidPosition(newRow, newCol)) {
            if (board[newRow][newCol] === '') {
                moves.push([newRow, newCol]);
            } else if (isOpponentPiece(board[newRow][newCol], isWhite)) {
                moves.push([newRow, newCol]);
                break;
            } else {
                break;
            }
            newRow += dr;
            newCol += dc;
        }
    }

    return moves;
}

function getDiagonalMoves(board: Board, row: number, col: number, isWhite: boolean): [number, number][] {
    const moves: [number, number][] = [];
    const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];

    for (const [dr, dc] of directions) {
        let newRow = row + dr;
        let newCol = col + dc;
        while (isValidPosition(newRow, newCol)) {
            if (board[newRow][newCol] === '') {
                moves.push([newRow, newCol]);
            } else if (isOpponentPiece(board[newRow][newCol], isWhite)) {
                moves.push([newRow, newCol]);
                break;
            } else {
                break;
            }
            newRow += dr;
            newCol += dc;
        }
    }

    return moves;
}

function isValidPosition(row: number, col: number): boolean {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
}

function isOpponentPiece(piece: Piece, isWhite: boolean): boolean {
    return piece !== '' && (isWhite ? piece === piece.toLowerCase() : piece === piece.toUpperCase());
}

export function isCheck(board: Board, isWhiteKing: boolean): boolean {
    const kingPiece = isWhiteKing ? 'K' : 'k';
    let kingRow = -1, kingCol = -1;

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            if (board[row][col] === kingPiece) {
                kingRow = row;
                kingCol = col;
                break;
            }
        }
        if (kingRow !== -1) break;
    }

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            if (board[row][col] !== '' && isOpponentPiece(board[row][col], isWhiteKing)) {
                const moves = getValidMoves(board, row, col, false);
                if (moves.some(([r, c]) => r === kingRow && c === kingCol)) {
                    return true;
                }
            }
        }
    }

    return false;
}

export function isCheckmate(board: Board, isWhiteKing: boolean): boolean {
    if (!isCheck(board, isWhiteKing)) return false;

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (piece !== '' && (isWhiteKing ? piece === piece.toUpperCase() : piece === piece.toLowerCase())) {
                const moves = getValidMoves(board, row, col);
                if (moves.length > 0) {
                    return false;
                }
            }
        }
    }

    return true;
}

function movePutsOwnKingInCheck(board: Board, fromRow: number, fromCol: number, toRow: number, toCol: number): boolean {
    const newBoard = board.map(row => [...row]);
    newBoard[toRow][toCol] = newBoard[fromRow][fromCol];
    newBoard[fromRow][fromCol] = '';
    return isCheck(newBoard, newBoard[toRow][toCol] === newBoard[toRow][toCol].toUpperCase());
}

