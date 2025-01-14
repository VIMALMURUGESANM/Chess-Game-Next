export type Piece = 'p' | 'r' | 'n' | 'b' | 'q' | 'k' | 'P' | 'R' | 'N' | 'B' | 'Q' | 'K' | '';
export type Board = Piece[][];

export function getValidMoves(
    board: Board,
    row: number,
    col: number,
    considerPin: boolean = true,
    canCastleKingside: boolean = false,
    canCastleQueenside: boolean = false
): [number, number][] {
    const piece = board[row][col];
    const isWhite = piece === piece.toUpperCase();
    let moves: [number, number][] = [];

    switch (piece.toLowerCase()) {
        case 'p': moves = getPawnMoves(board, row, col, isWhite); break;
        case 'r': moves = getRookMoves(board, row, col, isWhite); break;
        case 'n': moves = getKnightMoves(board, row, col, isWhite); break;
        case 'b': moves = getBishopMoves(board, row, col, isWhite); break;
        case 'q': moves = getQueenMoves(board, row, col, isWhite); break;
        case 'k': moves = getKingMoves(board, row, col, isWhite, canCastleKingside, canCastleQueenside); break;
    }

    if (considerPin) {
        moves = moves.filter(([newRow, newCol]) => !movePutsOwnKingInCheck(board, row, col, newRow, newCol, isWhite));
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

function getKingMoves(board: Board, row: number, col: number, isWhite: boolean, canCastleKingside: boolean, canCastleQueenside: boolean): [number, number][] {
    const moves: [number, number][] = [];
    const kingMoves = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];

    for (const [dr, dc] of kingMoves) {
        const newRow = row + dr;
        const newCol = col + dc;
        if (isValidPosition(newRow, newCol) && (board[newRow][newCol] === '' || isOpponentPiece(board[newRow][newCol], isWhite))) {
            moves.push([newRow, newCol]);
        }
    }

    moves.push(...getCastlingMoves(board, row, col, isWhite, canCastleKingside, canCastleQueenside));

    return moves;
}

function getCastlingMoves(board: Board, row: number, col: number, isWhite: boolean, canCastleKingside: boolean, canCastleQueenside: boolean): [number, number][] {
    const castlingMoves: [number, number][] = [];
    
    if (isCheck(board, isWhite)) return castlingMoves;

    const backRank = isWhite ? 7 : 0;
    
    if (canCastleKingside && board[backRank][5] === '' && board[backRank][6] === '') {
        if (!isSquareUnderAttack(board, backRank, 4, isWhite) &&
            !isSquareUnderAttack(board, backRank, 5, isWhite) &&
            !isSquareUnderAttack(board, backRank, 6, isWhite)) {
            castlingMoves.push([backRank, 6]);
        }
    }
    
    if (canCastleQueenside && board[backRank][1] === '' && board[backRank][2] === '' && board[backRank][3] === '') {
        if (!isSquareUnderAttack(board, backRank, 4, isWhite) &&
            !isSquareUnderAttack(board, backRank, 3, isWhite) &&
            !isSquareUnderAttack(board, backRank, 2, isWhite)) {
            castlingMoves.push([backRank, 2]);
        }
    }
    
    return castlingMoves;
}

function isSquareUnderAttack(board: Board, row: number, col: number, isWhite: boolean): boolean {
    const opponentColor = isWhite ? 'b' : 'w';
    const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1],  [1, 0],  [1, 1]
    ];
    
    // Check for pawn attacks
    const pawnDirection = isWhite ? 1 : -1;
    if (isValidPosition(row + pawnDirection, col - 1) && board[row + pawnDirection][col - 1].toLowerCase() === 'p' && isOpponentPiece(board[row + pawnDirection][col - 1], isWhite)) return true;
    if (isValidPosition(row + pawnDirection, col + 1) && board[row + pawnDirection][col + 1].toLowerCase() === 'p' && isOpponentPiece(board[row + pawnDirection][col + 1], isWhite)) return true;

    // Check for knight attacks
    const knightMoves = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
    for (const [dr, dc] of knightMoves) {
        const newRow = row + dr;
        const newCol = col + dc;
        if (isValidPosition(newRow, newCol) && board[newRow][newCol].toLowerCase() === 'n' && isOpponentPiece(board[newRow][newCol], isWhite)) return true;
    }

    // Check for attacks from other pieces (rook, bishop, queen, king)
    for (const [dr, dc] of directions) {
        let newRow = row + dr;
        let newCol = col + dc;
        let distance = 1;
        
        while (isValidPosition(newRow, newCol)) {
            const piece = board[newRow][newCol].toLowerCase();
            if (piece !== '') {
                if (isOpponentPiece(board[newRow][newCol], isWhite)) {
                    if (piece === 'q' || 
                        (piece === 'r' && (dr === 0 || dc === 0)) ||
                        (piece === 'b' && dr !== 0 && dc !== 0) ||
                        (piece === 'k' && distance === 1)) {
                        return true;
                    }
                }
                break;
            }
            newRow += dr;
            newCol += dc;
            distance++;
        }
    }

    return false;
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
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            if (board[row][col] === kingPiece) {
                return isSquareUnderAttack(board, row, col, isWhiteKing);
            }
        }
    }
    return false; // This should never happen in a valid chess position
}

export function isCheckmate(board: Board, isWhiteKing: boolean): boolean {
    if (!isCheck(board, isWhiteKing)) return false;

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (piece !== '' && (isWhiteKing ? piece === piece.toUpperCase() : piece === piece.toLowerCase())) {
                const moves = getValidMoves(board, row, col, true, false, false);
                if (moves.length > 0) {
                    return false;
                }
            }
        }
    }

    return true;
}

function movePutsOwnKingInCheck(board: Board, fromRow: number, fromCol: number, toRow: number, toCol: number, isWhite: boolean): boolean {
    const newBoard = board.map(row => [...row]);
    newBoard[toRow][toCol] = newBoard[fromRow][fromCol];
    newBoard[fromRow][fromCol] = '';
    return isCheck(newBoard, isWhite);
}

