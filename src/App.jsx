import { useState } from 'react'
import './App.css'

function App() {
  const initialBoard = [
    [1,1,1,1,1,0,0,0,0,1],
    [0,0,0,0,0,0,0,0,0,1],
    [0,0,0,0,0,0,0,0,0,1],
    [0,0,0,0,0,0,0,0,0,1],
    [0,0,0,0,0,0,0,0,0,0],
    [1,0,0,1,1,0,0,0,0,0],
    [1,0,0,0,0,0,0,0,0,0],
    [1,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [1,1,1,1,0,0,0,0,0,0]
  ];

  const [board, setBoard] = useState(initialBoard);
  const [showShips, setShowShips] = useState(false);

  const handleFireTorpedo = (rowIndex, cellIndex) => {
    const newBoard = board.map((row, rIdx) =>
      row.map((cell, cIdx) => {
        if (rIdx === rowIndex && cIdx === cellIndex) {
          if (cell === 1) {
            return 2;
          } else if (cell === 0) {
            return 3;
          }
        }
        return cell;
      })
    );
    setBoard(newBoard);
  };

  const handleShowShips = () => {
    setShowShips(!showShips);
  };

  return (
    <>
      <div className='battleship-container'>
        <div className='battleship-game'>
          {board.map((row, indexRow) => (
            <div key={indexRow} className="column">
              {row.map((cell, indexCell) => (
                <div key={indexCell} className={`cell ${
                  cell === 2 ? 'hit' : 
                  cell === 3 ? 'miss' : 
                  showShips && cell === 1 ? 'revealed' : ''
                }`}
                onClick={() => handleFireTorpedo(indexRow, indexCell)}></div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <button onClick={handleShowShips}>Show Ships</button>
    </>
  )
}

export default App