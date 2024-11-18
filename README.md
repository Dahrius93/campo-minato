# Spiegazione del Codice React per Campo Minato

## Introduzione

Il codice in esame implementa una versione semplificata del gioco **Campo Minato** utilizzando **React**. L'applicazione gestisce una griglia di celle, alcune delle quali contengono delle mine. L'obiettivo del gioco è rivelare tutte le celle senza mine e contrassegnare correttamente tutte le celle con mine usando delle bandiere.

Di seguito ti spiego il funzionamento del codice, suddiviso per le principali funzioni e componenti.

## Componenti principali

### Importazioni e Setup degli Stati

```javascript
import React, { useState, useEffect } from "react";
import "./App.css";
```

- `useState` e `useEffect` sono **hook** di React usati per gestire lo stato e gli effetti collaterali.
- La variabile `board` rappresenta la griglia di gioco, mentre `gameOver`, `gameWon`, `mineCount` e `flagCount` tengono traccia dello stato del gioco.

### Stati del Gioco

- `board`: una matrice bidimensionale che rappresenta il campo di gioco, dove ogni cella è un oggetto contenente informazioni come se c'è una mina (`mine`), se è rivelata (`revealed`) o se è contrassegnata da una bandiera (`flag`).
- `gameOver` e `gameWon`: rappresentano lo stato del gioco, se è finito per sconfitta o vittoria.
- `mineCount` e `flagCount`: tengono traccia del numero di mine totali e del numero di bandiere posizionate.

### Funzione `createBoard`

Questa funzione è responsabile della creazione iniziale del tabellone di gioco.

```javascript
const createBoard = (rows, cols, mines) => {
  const board = Array(rows)
    .fill(null)
    .map(() =>
      Array(cols)
        .fill(null)
        .map(() => ({ mine: false, revealed: false, flag: false }))
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
```

- **Matrice di gioco**: `Array(rows).fill(null).map(...)` crea una matrice di dimensioni `rows` x `cols`.
- **Posizionamento delle mine**: Usa un ciclo `while` per posizionare le mine casualmente finché non raggiunge il numero desiderato (`mines`).
- Una volta creata la matrice con le mine, viene salvata nello stato tramite `setBoard()`.

### Funzione `handleCellClick`

Questa funzione gestisce il comportamento quando una cella viene cliccata.

```javascript
const handleCellClick = (row, col) => {
  if (gameOver || gameWon) {
    return;
  }
  const cell = board[row][col];
  if (cell.flag) {
    return;
  }
  if (cell.mine) {
    setGameOver(true);
  } else {
    const newBoard = [...board];
    newBoard[row][col].revealed = true;
    setBoard(newBoard);
    if (checkWin(newBoard)) {
      setGameWon(true);
    }
  }
};
```

- **Clic su mina**: Se la cella cliccata contiene una mina (`cell.mine`), il gioco termina impostando `gameOver` a `true`.
- **Rivelazione cella**: Se la cella non contiene una mina, viene rivelata e aggiornata la board. Se tutte le celle senza mine sono rivelate, `gameWon` diventa `true`.

### Funzione `handleCellRightClick`

Questa funzione gestisce il **click destro** per posizionare o rimuovere una bandiera.

```javascript
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
};
```

- **Click destro per bandiere**: L'uso di `event.preventDefault()` serve per prevenire il comportamento di default del browser sul click destro.
- Se la cella non è già rivelata, il codice cambia lo stato della bandiera (`flag`) e aggiorna il conteggio delle bandiere.

### Funzione `checkWin`

Questa funzione verifica se tutte le celle senza mine sono state rivelate e tutte le mine sono correttamente contrassegnate.

```javascript
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
  return (
    revealedCount + flaggedCount === board.length * board[0].length &&
    flaggedCount === mineCount
  );
};
```

- La funzione scorre tutte le celle e conta quelle rivelate (`revealedCount`) e quelle con bandiera (`flaggedCount`). Se il numero di celle rivelate più quelle flaggate corrisponde al totale delle celle e tutte le bandiere sono posizionate sulle mine, il gioco è stato vinto.

### Funzione `getAdjacentMines`

Questa funzione calcola il numero di mine adiacenti per una determinata cella.

```javascript
const getAdjacentMines = (row, col, board) => {
  let count = 0;
  for (
    let i = Math.max(row - 1, 0);
    i <= Math.min(row + 1, board.length - 1);
    i++
  ) {
    for (
      let j = Math.max(col - 1, 0);
      j <= Math.min(col + 1, board[0].length - 1);
      j++
    ) {
      if (board[i][j].mine) {
        count++;
      }
    }
  }
  return count;
};
```

- Questa funzione scorre tutte le celle adiacenti per contare quante contengono una mina.
- Viene utilizzata per determinare il contenuto da mostrare all'interno di una cella rivelata.

### Renderizzazione del Tabellone

Il codice di renderizzazione della board utilizza la funzione `renderCell` per visualizzare ciascuna cella.

```javascript
const renderCell = (row, col) => {
  const cell = board[row][col];
  let content;
  if (gameOver && cell.mine) {
    content = "💣";
  } else if (cell.flag) {
    content = "⚑";
  } else if (cell.revealed && cell.mine) {
    content = "💣";
  } else if (cell.revealed) {
    const adjacentMines = getAdjacentMines(row, col, board);
    content = adjacentMines === 0 ? null : adjacentMines;
  } else {
    content = null;
  }

  return (
    <div
      className={`cell ${cell.revealed ? " revealed" : ""} ${
        cell.flag ? " flagged" : ""
      }`}
      onClick={() => handleCellClick(row, col)}
      onContextMenu={(event) => handleCellRightClick(event, row, col)}
    >
      {content}
    </div>
  );
};
```

- Ogni cella è rappresentata come un `div` con classi CSS che cambiano in base allo stato (`revealed`, `flagged`).
- A seconda dello stato di gioco e della cella, il contenuto varia tra mina (`💣`), bandiera (`⚑`), o il numero di mine adiacenti.

### Funzione `resetGame`

Questa funzione resetta il gioco riportando tutto allo stato iniziale.

```javascript
const resetGame = () => {
  createBoard(10, 10, 10);
  setGameOver(false);
  setGameWon(false);
  setFlagCount(0);
};
```

## Componente `MineField`

La parte finale del codice è la funzione che gestisce il **render** dell'intera applicazione.

```javascript
return (
  <div>
    <div className="game">
      <h1>Campo Minato</h1>
      <div className="board">
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className="row">
            {row.map((_, colIndex) => (
              <React.Fragment key={colIndex}>
                {renderCell(rowIndex, colIndex)}
              </React.Fragment>
            ))}
          </div>
        ))}
      </div>
      {gameOver && (
        <div className="message">
          hai perso! <button onClick={resetGame}>Gioca di nuovo</button>
        </div>
      )}
      {gameWon && (
        <div className="message">
          Hai vinto! <button onClick={resetGame}>Gioca di nuovo</button>
        </div>
      )}
      {!gameOver && !gameWon && (
        <div className="message">Mine rimanenti: {mineCount - flagCount}</div>
      )}
    </div>
  </div>
);
```

- La board viene renderizzata tramite `map` e ogni cella è rappresentata da `renderCell()`.
- Mostra un messaggio di sconfitta o vittoria quando il gioco termina, insieme a un pulsante per ricominciare.
- Durante il gioco, mostra il numero di mine rimanenti.

## Conclusione

Questo codice React è un'implementazione base del classico gioco Campo Minato. Utilizza React per gestire lo stato dell'applicazione e le interazioni dell'utente, facendo uso di vari hook (`useState`, `useEffect`) per aggiornare il gioco in tempo reale. Ogni funzione gioca un ruolo chiave nel gestire lo stato della board, l'interazione con le celle e il monitoraggio delle condizioni di vittoria e sconfitta.
