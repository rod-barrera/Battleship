import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const emptyBoard = Array(10).fill().map(() => Array(10).fill(0));

  const [playerBoard, setPlayerBoard] = useState(emptyBoard);
  const [cpuBoard, setCpuBoard] = useState(emptyBoard);
  const [selectedPositions, setSelectedPositions] = useState([]);
  const [orientation, setOrientation] = useState(null);
  const [extremes, setExtremes] = useState({ start: null, end: null });
  const [currentShipIndex, setCurrentShipIndex] = useState(0);
  const [allShipsPlaced, setAllShipsPlaced] = useState(false);
  const [revealCpuBoard, setRevealCpuBoard] = useState(false);

  const shipLengths = [5, 4, 4, 3, 2];

  useEffect(() => {
    if (allShipsPlaced) {
      placeCpuShips();
    }
  }, [allShipsPlaced]);

  const getRandomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const isValidPlacement = (board, positions) => {
    return positions.every(([row, col]) => row >= 0 && row < 10 && col >= 0 && col < 10 && board[row][col] === 0);
  };

  const generateCpuShip = (length) => {
    let valid = false;
    let positions = [];

    while (!valid) {
      const orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';
      const startRow = getRandomInt(0, 9);
      const startCol = getRandomInt(0, 9);

      positions = [];
      for (let i = 0; i < length; i++) {
        if (orientation === 'horizontal') {
          positions.push([startRow, startCol + i]);
        } else {
          positions.push([startRow + i, startCol]);
        }
      }

      valid = isValidPlacement(cpuBoard, positions);
    }

    return positions;
  };

  const placeCpuShips = () => {
    let newCpuBoard = cpuBoard.slice();

    shipLengths.forEach((length) => {
      const shipPositions = generateCpuShip(length);
      shipPositions.forEach(([row, col]) => {
        newCpuBoard[row][col] = 1;
      });
    });

    setCpuBoard(newCpuBoard);
  };

  const getNextMoves = (orientation, extremes) => {
    const nextMoves = [];
    if (orientation === 'horizontal') {
      if (extremes.start[1] > 0) nextMoves.push([extremes.start[0], extremes.start[1] - 1]); // left of start
      if (extremes.end[1] < 9) nextMoves.push([extremes.end[0], extremes.end[1] + 1]); // right of end
    } else if (orientation === 'vertical') {
      if (extremes.start[0] > 0) nextMoves.push([extremes.start[0] - 1, extremes.start[1]]); // above start
      if (extremes.end[0] < 9) nextMoves.push([extremes.end[0] + 1, extremes.end[1]]); // below end
    }
    return nextMoves.filter(pos => playerBoard[pos[0]][pos[1]] === 0);
  };

  const getInitialAdjacentMoves = (position) => {
    const [row, col] = position;
    const adjacentMoves = [];
    if (row > 0) adjacentMoves.push([row - 1, col]); // above
    if (row < 9) adjacentMoves.push([row + 1, col]); // below
    if (col > 0) adjacentMoves.push([row, col - 1]); // left
    if (col < 9) adjacentMoves.push([row, col + 1]); // right
    return adjacentMoves.filter(pos => playerBoard[pos[0]][pos[1]] === 0);
  };

  const isAdjacent = (first, second) => {
    const [firstRow, firstCol] = first;
    const [secondRow, secondCol] = second;
    return (
      (firstRow === secondRow && Math.abs(firstCol - secondCol) === 1) ||
      (firstCol === secondCol && Math.abs(firstRow - secondRow) === 1)
    );
  };

  const handleClick = (rowIndex, cellIndex) => {
    if (allShipsPlaced) return; // No permitir más selecciones si todos los barcos han sido colocados

    if (selectedPositions.length === shipLengths[currentShipIndex]) return;

    if (playerBoard[rowIndex][cellIndex] === 1) {
      return; // Prevent selecting a cell that's already part of a ship
    }

    const newPositions = [...selectedPositions, [rowIndex, cellIndex]];

    if (selectedPositions.length === 1 && !isAdjacent(selectedPositions[0], [rowIndex, cellIndex])) {
      return; // Only allow adjacent cells for the second position
    }

    const nextMoves = selectedPositions.length === 1
      ? getInitialAdjacentMoves(selectedPositions[0])
      : getNextMoves(orientation, extremes);

    if (selectedPositions.length > 1 && !nextMoves.some(pos => pos[0] === rowIndex && pos[1] === cellIndex)) {
      return; // Only allow valid next moves
    }

    setSelectedPositions(newPositions);

    if (newPositions.length === 2) {
      const [firstRow, firstCol] = newPositions[0];
      const [secondRow, secondCol] = newPositions[1];

      const newOrientation = firstRow === secondRow ? 'horizontal' : 'vertical';
      setOrientation(newOrientation);

      const newExtremes = {
        start: firstRow < secondRow || firstCol < secondCol ? newPositions[0] : newPositions[1],
        end: firstRow > secondRow || firstCol > secondCol ? newPositions[0] : newPositions[1]
      };
      setExtremes(newExtremes);

      console.log(`Orientation determined: ${newOrientation}`);
      console.log(`Extremes: Start: Row: ${newExtremes.start[0]}, Column: ${newExtremes.start[1]}`);
      console.log(`End: Row: ${newExtremes.end[0]}, Column: ${newExtremes.end[1]}`);
    } else if (newPositions.length > 2) {
      let newExtremes = { ...extremes };

      if (orientation === 'horizontal') {
        newExtremes = newPositions.reduce((acc, pos) => {
          if (!acc.start || pos[1] < acc.start[1]) acc.start = pos;
          if (!acc.end || pos[1] > acc.end[1]) acc.end = pos;
          return acc;
        }, { start: null, end: null });
      } else if (orientation === 'vertical') {
        newExtremes = newPositions.reduce((acc, pos) => {
          if (!acc.start || pos[0] < acc.start[0]) acc.start = pos;
          if (!acc.end || pos[0] > acc.end[0]) acc.end = pos;
          return acc;
        }, { start: null, end: null });
      }
      setExtremes(newExtremes);

      console.log(`Updated extremes: Start: Row: ${newExtremes.start[0]}, Column: ${newExtremes.start[1]}`);
      console.log(`End: Row: ${newExtremes.end[0]}, Column: ${newExtremes.end[1]}`);
    }

    const newBoard = playerBoard.map((row, rIdx) =>
      row.map((cell, cIdx) => {
        if (newPositions.some(pos => pos[0] === rIdx && pos[1] === cIdx)) {
          return 1;
        }
        return cell;
      })
    );

    setPlayerBoard(newBoard);

    if (newPositions.length === shipLengths[currentShipIndex]) {
      if (currentShipIndex + 1 === shipLengths.length) {
        setAllShipsPlaced(true); // Marcar que todos los barcos han sido colocados
      }
      setCurrentShipIndex(currentShipIndex + 1);
      setSelectedPositions([]);
      setOrientation(null);
      setExtremes({ start: null, end: null });
      console.log('Ship placed successfully.');
    }
  };

  const nextMoves = selectedPositions.length === 1
    ? getInitialAdjacentMoves(selectedPositions[0])
    : selectedPositions.length > 1 && selectedPositions.length < shipLengths[currentShipIndex]
      ? getNextMoves(orientation, extremes)
      : [];

  const handleRevealCpuBoard = () => {
    setRevealCpuBoard(prevState => !prevState); // Alternar el estado de revelación
  };

  return (
    <div className='battleship-container'>
      <h2>Select Positions for Your Ships</h2>
      <div className='battleship-game'>
        <div className='battleship-player'>
          <h2>Player Board</h2>
          <div className='board'>
            {playerBoard.map((row, indexRow) => (
              <div key={indexRow} className="column">
                {row.map((cell, indexCell) => (
                  <div
                    key={indexCell}
                    className={`cell ${cell === 1 ? 'revealed' : ''} ${nextMoves.some(pos => pos[0] === indexRow && pos[1] === indexCell) ? 'next' : ''}`}
                    onClick={() => handleClick(indexRow, indexCell)}
                  ></div>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className='battleship-cpu'>
          <h2>CPU Board</h2>
          <div className='board'>
            {cpuBoard.map((row, indexRow) => (
              <div key={indexRow} className="column">
                {row.map((cell, indexCell) => (
                  <div
                    key={indexCell}
                    className={`cell ${revealCpuBoard && cell === 1 ? 'revealed' : ''}`}
                  ></div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      <br />
      <button onClick={handleRevealCpuBoard}>Reveal CPU Positions</button>
    </div>
  );
}

export default App;