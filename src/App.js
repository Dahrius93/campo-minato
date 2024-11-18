import React, { useState, useEffect } from 'react'
import './App.css';

function MineField(){
  // Definizione degli stati necessari per il gioco
  const [board, setBoard] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [mineCount, setMineCount] = useState(0);
  const [flagCount, setFlagCount] = useState(0);

  // Funzione per creare la board con numero di righe, colonne e mine specificato
  const createBoard = (rows, cols, mines) => {
    // Creazione della matrice di gioco con celle inizializzate senza mine, non rivelate e senza bandiera
    const board = Array(rows)
      .fill(null)
      .map(()=>
        Array(cols)
          .fill(null)
          .map(() => ({mine: false, revealed: false, flag: false}))
      );
    // Posizionamento casuale delle mine sulla matrice
    let mineCount = 0;
    while (mineCount < mines) {
      const row = Math.floor(Math.random() * rows);
      const col = Math.floor(Math.random() * cols);
      if (!board[row][col].mine) {
        board[row][col].mine = true;
        mineCount++;
      }
    }
    // Aggiornamento della board e del conteggio delle mine nello stato
    setBoard(board);
    setMineCount(mineCount);   
  };

  // Funzione per gestire il click sinistro su una cella
  const handleCellClick = (row, col) => {
    // Se il gioco è terminato o vinto, il click non ha effetto
    if(gameOver || gameWon) {
      return;
    }
    const cell = board[row][col];
    // Se la cella è contrassegnata con una bandiera, non si può rivelare
    if (cell.flag) {
      return;
    }
    // Se si clicca su una mina, il gioco termina
    if (cell.mine) {
      setGameOver(true);
    } else{
      // Altrimenti la cella viene rivelata
      const newBoard = [...board];
      newBoard[row][col].revealed = true;
      setBoard(newBoard);
      // Controlla se tutte le celle rivelate/contrassegnate corrispondono alla vittoria
      if (checkWin(newBoard)) {
        setGameWon(true);
      }
    }
  };

  // Funzione per gestire il click destro su una cella (posizionamento/rimozione bandiera)
  const handleCellRightClick = (event, row, col) => {
    event.preventDefault(); // Prevenzione del comportamento predefinito del tasto destro
    if (gameOver || gameWon) {
      return;
    }
    const cell = board[row][col];
    // Se la cella non è rivelata, si può mettere o rimuovere la bandiera
    if (!cell.revealed) {
      const newBoard = [...board];
      newBoard[row][col].flag = !cell.flag;
      setBoard(newBoard);
      // Aggiornamento del conteggio delle bandiere
      setFlagCount(flagCount + (cell.flag ? -1 : 1));
    }
  }

  // Funzione per controllare se il giocatore ha vinto
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
    // La vittoria avviene se tutte le celle sono o rivelate o contrassegnate e le bandiere sono corrette
    return revealedCount + flaggedCount === board.length * board[0].length && flaggedCount === mineCount;
  };

  // useEffect per creare la board quando il componente viene montato
  useEffect(() => {
    createBoard(10, 10, 10);
  }, []);

  // Funzione per renderizzare ogni singola cella
  const renderCell = (row, col) => {
    const cell = board[row][col];
    let content;
    // Contenuto della cella in base allo stato di gioco (game over, flag, mina, o conteggio mine vicine)
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

  // Funzione per contare il numero di mine adiacenti a una cella
  const getAdjacentMines = (row, col, board) => {
    let count = 0;
    // Loop per verificare tutte le celle adiacenti
    for (let i = Math.max(row -1, 0); i <= Math.min(row + 1, board.length -1); i++) {
      for (let j = Math.max(col -1, 0); j<= Math.min(col + 1, board[0].length -1); j++) {
        if (board[i][j].mine) {
          count++;
        }
      }
    }
    return count;
  };

  // Funzione per resettare il gioco
  const resetGame = () => {
    createBoard(10, 10, 10);
    setGameOver(false);
    setGameWon(false);
    setFlagCount(0);
  };

  return(
    <>
      <div className='game'>
        <h1>Campo Minato</h1>
        <div className='board'>
          {/* Ciclo per rendere la board */}
          {board.map((row, rowIndex) => (
            <div key={rowIndex} className='row'>
              {row.map((_, colIndex) => (
                <React.Fragment  key= {colIndex}>{renderCell(rowIndex, colIndex)}</React.Fragment>
              ))}
            </div>
          ))}
        </div>
        {/* Messaggio di gioco perso e pulsante per ricominciare */}
        {gameOver && (
          <div className="message">
            hai perso! {' '}
            <button onClick={resetGame}>Gioca di nuovo</button>
          </div>
        )}
        {/* Messaggio di gioco vinto e pulsante per ricominciare */}
        {gameWon && (
          <div className="message">
            Hai vinto! {' '}
            <button onClick={resetGame}>Gioca di nuovo</button>
          </div>
        )}
        {/* Mostra il numero di mine rimanenti */}
        {!gameOver && !gameWon && (
          <div className="message">
            Mine rimanenti: {mineCount - flagCount}
          </div>
        )}
      </div>
    </>
  );
}

export default MineField;
