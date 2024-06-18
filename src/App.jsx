import { useState } from 'react';
import './App.css';

function App() {
  // Tablero inicial para jugador y CPU
  const initialBoard = [
    [1, 1, 1, 1, 1, 0, 0, 0, 0, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 1, 1, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 0, 0, 0, 0, 0, 0]
  ];

  // Estados
  const [playerBoard, setPlayerBoard] = useState(initialBoard); // Estado del tablero del jugador
  const [cpuBoard, setCpuBoard] = useState(initialBoard.map(row => row.slice())); // Clon del tablero inicial para la CPU
  const [showShips, setShowShips] = useState(false); // Estado para mostrar los barcos
  const [turn, setTurn] = useState('Player'); // Estado para el turno actual (Player o CPU)

  // Función para manejar el disparo de torpedos
  const handleFireTorpedo = (board, setBoard, rowIndex, cellIndex) => {
    // Crear un nuevo tablero basado en el estado actual
    const newBoard = board.map((row, rIdx) =>
      row.map((cell, cIdx) => {
        // Verificar si se está disparando en la celda actual
        if (rIdx === rowIndex && cIdx === cellIndex) {
          // Si la celda es 1 (barco), se marca como hit (2), si es agua (0), se marca como miss (3)
          if (cell === 1) {
            return 2; // Hit
          } else if (cell === 0) {
            return 3; // Miss
          }
        }
        return cell; // Devolver la celda sin cambios si no es la celda objetivo
      })
    );
    setBoard(newBoard); // Actualizar el estado del tablero
  };

  // Función para manejar el movimiento del jugador
  const handlePlayerMove = (rowIndex, cellIndex) => {
    // Verificar si es el turno del jugador
    if (turn === 'Player') {
      // Verificar si la celda seleccionada no es un hit (2) ni un miss (3)
      if (cpuBoard[rowIndex][cellIndex] !== 2 && cpuBoard[rowIndex][cellIndex] !== 3) {
        // Llamar a la función para disparar un torpedo al tablero de la CPU
        handleFireTorpedo(cpuBoard, setCpuBoard, rowIndex, cellIndex);

        // Cambiar el turno a la CPU después de que el jugador haya realizado su movimiento
        setTurn('CPU');
      }
    }
  };

  // Función para manejar el movimiento de la CPU
  const handleCpuMove = () => {
    // Obtener todas las posibles jugadas disponibles para la CPU
    const availableMoves = [];
    playerBoard.forEach((row, rowIndex) => {
      row.forEach((cell, cellIndex) => {
        if (cell === 0 || cell === 1) {
          availableMoves.push([rowIndex, cellIndex]); // Agregar las celdas vacías o con barcos como jugadas disponibles
        }
      });
    });

    // Elegir una jugada aleatoria entre las disponibles
    const [rowIndex, cellIndex] = availableMoves[Math.floor(Math.random() * availableMoves.length)];
    handleFireTorpedo(playerBoard, setPlayerBoard, rowIndex, cellIndex); // Disparar al tablero del jugador
    setTurn('Player'); // Cambiar turno al jugador después del movimiento de la CPU
  };

  // Si es el turno de la CPU, realizar el movimiento después de un breve retraso
  if (turn === 'CPU') {
    setTimeout(handleCpuMove, 1000); // Retraso para simular el tiempo de respuesta de la CPU
  }

  // Función para mostrar u ocultar los barcos en el tablero
  const handleShowShips = () => {
    setShowShips(!showShips); // Alternar el estado de mostrar barcos
  };

  // Renderizado del componente de la aplicación
  return (
    <>
      <div className='battleship-container'>
        <h2>Turn: {turn}</h2> {/* Mostrar el turno actual (Player o CPU) */}
        <div className='battleship-game'>
          <div className='battleship-player'>
            <h2>Player Board</h2>
            {playerBoard.map((row, indexRow) => (
              <div key={indexRow} className="column">
                {row.map((cell, indexCell) => (
                  <div
                    key={indexCell}
                    className={`cell ${cell === 2 ? 'hit' : // Si la celda es un hit, aplicar clase 'hit'
                      cell === 3 ? 'miss' : // Si la celda es un miss, aplicar clase 'miss'
                        showShips && cell === 1 ? 'revealed' : '' // Si se muestran los barcos y la celda es un barco, aplicar clase 'revealed'
                      }`}
                    onClick={() => { }} // Jugador no puede hacer clic en su propio tablero
                  ></div>
                ))}
              </div>
            ))}
          </div>
          <div className='battleship-cpu'>
            <h2>CPU Board</h2>
            {cpuBoard.map((row, indexRow) => (
              <div key={indexRow} className="column">
                {row.map((cell, indexCell) => (
                  <div
                    key={indexCell}
                    className={`cell ${cell === 2 ? 'hit' : // Si la celda es un hit, aplicar clase 'hit'
                      cell === 3 ? 'miss' : // Si la celda es un miss, aplicar clase 'miss'
                        showShips && cell === 1 ? 'revealed' : '' // Si se muestran los barcos y la celda es un barco, aplicar clase 'revealed'
                      }`}
                    onClick={() => handlePlayerMove(indexRow, indexCell)} // Manejar el clic en la celda de la CPU (disparo del jugador)
                  ></div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      <button onClick={handleShowShips}>Show Ships</button> {/* Botón para mostrar u ocultar los barcos */}
    </>
  );
}

export default App;