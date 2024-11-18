import React, { useState, useEffect } from 'react'
import './App.css';

function MineField(){
  const [board, setBoard] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [mineCount, setMineCount] = useState(0);
  const [flagCount, setFlagCount] = useState(0);

  const createBoard = (rows, cols, mines) => {
    const board = Array(rows)
      .fill(null)
      .map(()=>
        Array(cols)
          .fill(null)
          .map(() => ({mine: false, revealed: false, flag: false}))
      );
    let mineCount = 0;
    while (mineCount < mines) {
      const row = Math.floor(Math.random() * rows);
      const col = Math.floor(Math.random() * cols);
      if (!board[row][col].mine) {
        board[row][col].mine = true;
        mineCount++;
      }
    }
    setBoard(board);
    setMineCount(mineCount);   
  };

  const handleCellClick = (row, col) => {
    if(gameOver || gameWon) {
      return;
    }
    const cell = board[row][col];
    if (cell.flag) {
      return;
    }
    if (cell.mine) {
      setGameOver(true);
    } else{
      const newBoard = [...board];
      newBoard[row][col].revealed = true;
      setBoard(newBoard);
      if (checkWin(newBoard)) {
        setGameWon(true);
      }
    }
  };

  const handleCellRightClick = (event, row, col) => {
    event.preventDefault();
    if (gameOver || gameWon) {
      return;
    }
    const cell = board[row][col];
    if (!cell.revealed) {
      const newBoard = [...board];
      newBoard[row][col].flag = !cell.flag;
      setBoard(newBoard);
      setFlagCount(flagCount + (cell.flag ? -1 : 1));
    }
  }

  const checkWin = (board) => {
    let revealedCount = 0;
    let flaggedCount = 0;
    for (let row = 0; row < board.length; row++) {
      for (let col = 0; col < board[0].length; col++) {
        if (board[row][col].revealed) {
          revealedCount++;
        } else if (board[row][col].flag) {
          flaggedCount++;
        }
      }
    }
    return revealedCount + flaggedCount === board.length * board[0].length && flaggedCount === mineCount;
  };

  useEffect(() => {
    createBoard(10, 10, 10);
  }, []);

    const renderCell = (row, col) => {
      const cell = board[row][col];
      let content;
      if (gameOver && cell.mine) {
        content = '💣';
      } else if (cell.flag) {
        content = '⚑';
      } else if (cell.revealed && cell.mine) {
        content = '💣';
      } else if (cell.revealed) {
        const adjacentMines = getAdjacentMines(row, col, board);
        content = adjacentMines === 0 ? null : adjacentMines;
      } else {
        content = null;
      }

      return (
        <div
          className={`cell ${cell.revealed ? ' revealed' : ''} ${cell.flag ? ' flagged' : ''}`}
          onClick = {() => handleCellClick(row, col)}
          onContextMenu = {(event) => handleCellRightClick(event, row, col)}
        >
          {content}
        </div>
      );
    };

    const getAdjacentMines = (row, col, board) => {
      let count = 0;
      for (let i = Math.max(row -1, 0); i <= Math.min(row + 1, board.length -1); i++) {
        for (let j = Math.max(col -1, 0); j<= Math.min(col + 1, board[0].length -1); j++) {
          if (board[i][j].mine) {
            count++;
          }
        }
      }
      return count;
    };

  const resetGame = () => {
    createBoard(10, 10, 10);
    setGameOver(false);
    setGameWon(false);
    setFlagCount(0);
  };

  return(
    <div>

      <div className='game'>
        <h1>Campo Minato</h1>
      

      <div className='board'>
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className='row'>
            {row.map((_, colIndex) => (
              <React.Fragment  key= {colIndex}>{renderCell(rowIndex, colIndex)}</React.Fragment>
            ))}
          </div>
        ))}
      </div>
      {gameOver && (
        <div className="message">
          hai perso! {' '}
          <button onClick={resetGame}>Gioca di nuovo</button>
        </div>
      )}
      {gameWon && (
        <div className="message">
          Hai vinto! {' '}
          <button onClick={resetGame}>Gioca di nuovo</button>
        </div>
      )}
      {!gameOver && !gameWon && (
        <div className="message">
          Mine rimanenti: {mineCount - flagCount}
        </div>
      )}
    </div>
    </div>
  );
}

export default MineField;
