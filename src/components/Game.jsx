import React, { useState, useEffect } from 'react';

const Game = () => {
    // Inicializa un tablero vacío de 10x10, llenando cada celda con 0.
    const emptyBoard = Array(10).fill().map(() => Array(10).fill(0));

    // Estados para el tablero del jugador, el de la CPU y otros necesarios para el juego.
    const [playerBoard, setPlayerBoard] = useState(emptyBoard);
    const [cpuBoard, setCpuBoard] = useState(emptyBoard);
    const [selectedPositions, setSelectedPositions] = useState([]);
    const [orientation, setOrientation] = useState(null);
    const [extremes, setExtremes] = useState({ start: null, end: null });
    const [currentShipIndex, setCurrentShipIndex] = useState(0);
    const [allShipsPlaced, setAllShipsPlaced] = useState(false);
    const [revealCpuBoard, setRevealCpuBoard] = useState(false);
    const [playerTurn, setPlayerTurn] = useState(true);
    const [playerHits, setPlayerHits] = useState(0);
    const [cpuHits, setCpuHits] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [winner, setWinner] = useState('');

    // Longitudes de los barcos que se van a colocar.
    const shipLengths = [5, 4, 4, 3, 2];

    // Efecto que se ejecuta cuando todos los barcos han sido colocados para la CPU.
    useEffect(() => {
        if (allShipsPlaced) {
            placeCpuShips();
        }
    }, [allShipsPlaced]); // Dependencia: se ejecuta cuando allShipsPlaced cambia.

    // Efecto que se ejecuta para que la CPU ataque cuando es su turno.
    useEffect(() => {
        if (allShipsPlaced && !playerTurn) {
            setTimeout(cpuAttack, 1000); // Retrasa el ataque de la CPU por 1 segundo.
        }
    }, [playerTurn, allShipsPlaced]); // Dependencias: se ejecuta cuando playerTurn o allShipsPlaced cambian.

    // Genera un número entero aleatorio entre min y max.
    const getRandomInt = (min, max) => {
        return Math.floor(Math.random() * (max - min + 1)) + min; // Genera un número aleatorio entre min y max.
    };

    // Verifica si la colocación de los barcos es válida en el tablero.
    const isValidPlacement = (board, positions) => {
        return positions.every(([row, col]) =>
            row >= 0 && row < 10 && col >= 0 && col < 10 && board[row][col] === 0); // Verifica que todas las posiciones están dentro del tablero y están vacías.
    };

    // Genera una posición aleatoria para un barco de una longitud dada para la CPU.
    const generateCpuShip = (length) => {
        let valid = false; // Bandera para indicar si la posición generada es válida.
        let positions = [];

        while (!valid) {
            // Determina aleatoriamente la orientación del barco.
            const orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';
            // Genera una posición de inicio aleatoria.
            const startRow = getRandomInt(0, 9);
            const startCol = getRandomInt(0, 9);

            positions = [];
            // Genera las posiciones del barco basado en su longitud y orientación.
            for (let i = 0; i < length; i++) {
                if (orientation === 'horizontal') {
                    positions.push([startRow, startCol + i]);
                } else {
                    positions.push([startRow + i, startCol]);
                }
            }

            // Verifica si las posiciones generadas son válidas en el tablero.
            valid = isValidPlacement(cpuBoard, positions);
        }

        return positions; // Retorna las posiciones válidas para el barco.
    };

    // Coloca los barcos de la CPU en el tablero.
    const placeCpuShips = () => {
        let newCpuBoard = cpuBoard.slice(); // Crea una copia del tablero de la CPU.

        // Para cada longitud de barco, genera posiciones válidas y actualiza el tablero.
        shipLengths.forEach((length) => {
            const shipPositions = generateCpuShip(length); // Genera posiciones para el barco.
            shipPositions.forEach(([row, col]) => {
                newCpuBoard[row][col] = 1; // Marca las posiciones del barco en el tablero.
            });
        });

        setCpuBoard(newCpuBoard); // Actualiza el estado del tablero de la CPU.
    };

    // Obtiene los posibles movimientos siguientes para colocar un barco.
    const getNextMoves = (orientation, extremes) => {
        const nextMoves = [];
        // Determina las posiciones válidas adyacentes al barco basado en su orientación.
        if (orientation === 'horizontal') {
            if (extremes.start[1] > 0) nextMoves.push([extremes.start[0], extremes.start[1] - 1]);
            if (extremes.end[1] < 9) nextMoves.push([extremes.end[0], extremes.end[1] + 1]);
        } else if (orientation === 'vertical') {
            if (extremes.start[0] > 0) nextMoves.push([extremes.start[0] - 1, extremes.start[1]]);
            if (extremes.end[0] < 9) nextMoves.push([extremes.end[0] + 1, extremes.end[1]]);
        }
        // Filtra las posiciones para que solo queden las válidas.
        return nextMoves.filter(pos => playerBoard[pos[0]][pos[1]] === 0);
    };

    // Obtiene los movimientos adyacentes iniciales para el primer barco colocado.
    const getInitialAdjacentMoves = (position) => {
        const [row, col] = position;
        const adjacentMoves = [];
        // Genera posiciones adyacentes a la posición inicial.
        if (row > 0) adjacentMoves.push([row - 1, col]);
        if (row < 9) adjacentMoves.push([row + 1, col]);
        if (col > 0) adjacentMoves.push([row, col - 1]);
        if (col < 9) adjacentMoves.push([row, col + 1]);
        // Filtra las posiciones para que solo queden las válidas.
        return adjacentMoves.filter(pos => playerBoard[pos[0]][pos[1]] === 0);
    };

    // Verifica si dos posiciones son adyacentes.
    const isAdjacent = (first, second) => {
        const [firstRow, firstCol] = first;
        const [secondRow, secondCol] = second;
        // Verifica si las posiciones están en la misma fila o columna y son adyacentes.
        return (
            (firstRow === secondRow && Math.abs(firstCol - secondCol) === 1) ||
            (firstCol === secondCol && Math.abs(firstRow - secondRow) === 1)
        );
    };

    // Maneja los clics en el tablero del jugador para colocar los barcos.
    const handlePlayerBoardClick = (rowIndex, cellIndex) => {
        if (allShipsPlaced) return; // Si todos los barcos han sido colocados, no hace nada.

        if (selectedPositions.length === shipLengths[currentShipIndex]) return; // Si ya se han seleccionado suficientes posiciones para el barco actual, no hace nada.

        if (playerBoard[rowIndex][cellIndex] === 1) {
            return; // Si la celda ya está ocupada, no hace nada.
        }

        // Agrega la nueva posición a las posiciones seleccionadas.
        const newPositions = [...selectedPositions, [rowIndex, cellIndex]];

        if (selectedPositions.length === 1 && !isAdjacent(selectedPositions[0], [rowIndex, cellIndex])) {
            return; // Si ya hay una posición seleccionada y la nueva no es adyacente, no hace nada.
        }

        // Obtiene los posibles movimientos siguientes.
        const nextMoves = selectedPositions.length === 1
            ? getInitialAdjacentMoves(selectedPositions[0])
            : getNextMoves(orientation, extremes);

        if (selectedPositions.length > 1 && !nextMoves.some(pos => pos[0] === rowIndex && pos[1] === cellIndex)) {
            return; // Si la nueva posición no es un movimiento siguiente válido, no hace nada.
        }

        setSelectedPositions(newPositions); // Actualiza las posiciones seleccionadas.

        if (newPositions.length === 2) {
            const [firstRow, firstCol] = newPositions[0];
            const [secondRow, secondCol] = newPositions[1];

            // Determina la orientación basada en las dos primeras posiciones.
            const newOrientation = firstRow === secondRow ? 'horizontal' : 'vertical';
            setOrientation(newOrientation);

            // Actualiza los extremos del barco.
            const newExtremes = {
                start: firstRow < secondRow || firstCol < secondCol ? newPositions[0] : newPositions[1],
                end: firstRow > secondRow || firstCol > secondCol ? newPositions[0] : newPositions[1]
            };
            setExtremes(newExtremes);

        } else if (newPositions.length > 2) {
            let newExtremes = { ...extremes };

            if (orientation === 'horizontal') {
                // Actualiza los extremos para orientación horizontal.
                newExtremes = newPositions.reduce((acc, pos) => {
                    if (!acc.start || pos[1] < acc.start[1]) acc.start = pos;
                    if (!acc.end || pos[1] > acc.end[1]) acc.end = pos;
                    return acc;
                }, { start: null, end: null });
            } else if (orientation === 'vertical') {
                // Actualiza los extremos para orientación vertical.
                newExtremes = newPositions.reduce((acc, pos) => {
                    if (!acc.start || pos[0] < acc.start[0]) acc.start = pos;
                    if (!acc.end || pos[0] > acc.end[0]) acc.end = pos;
                    return acc;
                }, { start: null, end: null });
            }
            setExtremes(newExtremes);
        }

        // Actualiza el tablero del jugador con las nuevas posiciones del barco.
        const newBoard = playerBoard.map((row, rIdx) =>
            row.map((cell, cIdx) => {
                if (newPositions.some(pos => pos[0] === rIdx && pos[1] === cIdx)) {
                    return 1;
                }
                return cell;
            })
        );

        setPlayerBoard(newBoard); // Actualiza el estado del tablero del jugador.

        // Si el barco actual está completamente colocado, avanza al siguiente barco.
        if (newPositions.length === shipLengths[currentShipIndex]) {
            if (currentShipIndex + 1 === shipLengths.length) {
                setAllShipsPlaced(true); // Si todos los barcos han sido colocados, marca todos los barcos como colocados.
            }
            setCurrentShipIndex(currentShipIndex + 1); // Avanza al siguiente barco.
            setSelectedPositions([]); // Reinicia las posiciones seleccionadas.
            setOrientation(null); // Reinicia la orientación.
            setExtremes({ start: null, end: null }); // Reinicia los extremos.
        }
    };

    // Maneja los clics en el tablero de la CPU para realizar ataques.
    const handleCpuBoardClick = (rowIndex, cellIndex) => {
        if (!allShipsPlaced || !playerTurn || gameOver) return; // Si no se han colocado todos los barcos, no es el turno del jugador o el juego ha terminado, no hace nada.
        handlePlayerAttack(rowIndex, cellIndex); // Realiza el ataque del jugador.
    };

    // Maneja los ataques del jugador en el tablero de la CPU.
    const handlePlayerAttack = (rowIndex, cellIndex) => {
        if (cpuBoard[rowIndex][cellIndex] === 'hit' || cpuBoard[rowIndex][cellIndex] === 'miss') return; // Si la celda ya ha sido atacada, no hace nada.

        const newCpuBoard = cpuBoard.slice(); // Crea una copia del tablero de la CPU.
        if (cpuBoard[rowIndex][cellIndex] === 1) {
            // Marca la posición como golpeada.
            newCpuBoard[rowIndex][cellIndex] = 'hit';
            setPlayerHits(playerHits + 1); // Incrementa el contador de golpes del jugador.
            // Verifica si el jugador ha ganado.
            if (playerHits + 1 === shipLengths.reduce((a, b) => a + b, 0)) {
                setGameOver(true); // Marca el juego como terminado.
                setWinner('Player'); // Establece al jugador como ganador.
                return;
            }
        } else {
            // Marca la posición como fallo.
            newCpuBoard[rowIndex][cellIndex] = 'miss';
        }

        setCpuBoard(newCpuBoard); // Actualiza el estado del tablero de la CPU.
        setPlayerTurn(false); // Cambia el turno a la CPU.
    };

    // Función para que la CPU ataque al jugador.
    const cpuAttack = () => {
        let validAttack = false;
        let rowIndex, cellIndex;

        while (!validAttack) {
            // Genera posiciones aleatorias hasta encontrar una válida.
            rowIndex = getRandomInt(0, 9);
            cellIndex = getRandomInt(0, 9);
            if (playerBoard[rowIndex][cellIndex] !== 'hit' && playerBoard[rowIndex][cellIndex] !== 'miss') {
                validAttack = true; // Encuentra una posición válida.
            }
        }

        const newPlayerBoard = playerBoard.slice(); // Crea una copia del tablero del jugador.
        if (playerBoard[rowIndex][cellIndex] === 1) {
            // Marca la posición como golpeada.
            newPlayerBoard[rowIndex][cellIndex] = 'hit';
            setCpuHits(cpuHits + 1); // Incrementa el contador de golpes de la CPU.
            // Verifica si la CPU ha ganado.
            if (cpuHits + 1 === shipLengths.reduce((a, b) => a + b, 0)) {
                setGameOver(true); // Marca el juego como terminado.
                setWinner('CPU'); // Establece a la CPU como ganadora.
                return;
            }
        } else {
            // Marca la posición como fallo.
            newPlayerBoard[rowIndex][cellIndex] = 'miss';
        }

        setPlayerBoard(newPlayerBoard); // Actualiza el estado del tablero del jugador.
        setPlayerTurn(true); // Cambia el turno al jugador.
    };

    // Movimientos posibles basados en las posiciones seleccionadas.
    const nextMoves = selectedPositions.length === 1
        ? getInitialAdjacentMoves(selectedPositions[0])
        : selectedPositions.length > 1 && selectedPositions.length < shipLengths[currentShipIndex]
            ? getNextMoves(orientation, extremes)
            : [];

    // Maneja la revelación del tablero de la CPU.
    const handleRevealCpuBoard = () => {
        setRevealCpuBoard(prevState => !prevState);
    };

    // Reinicia el juego.
    const handleResetGame = () => {
        setPlayerBoard(emptyBoard);
        setCpuBoard(emptyBoard);
        setSelectedPositions([]);
        setOrientation(null);
        setExtremes({ start: null, end: null });
        setCurrentShipIndex(0);
        setAllShipsPlaced(false);
        setRevealCpuBoard(false);
        setPlayerTurn(true);
        setPlayerHits(0);
        setCpuHits(0);
        setGameOver(false);
        setWinner('');
    };

    // Devuelve el mensaje de estado actual del juego.
    const getStatusMessage = () => {
        if (!allShipsPlaced) {
            return `Placing ship ${currentShipIndex + 1}/5 of ${shipLengths[currentShipIndex]} spaces`; // Mensaje durante la colocación de los barcos.
        } else if (gameOver) {
            return `Game Over: Winner ${winner}`; // Mensaje cuando el juego ha terminado.
        } else {
            return `Turn: ${playerTurn ? 'Player' : 'CPU'}`; // Mensaje indicando el turno actual.
        }
    };

    return (
        <div className='battleship-container'>
            <h2>{getStatusMessage()}</h2>
            <div className='battleship-game'>
                <div className='battleship-player'>
                    <h3>Player Board</h3>
                    <div className='board'>
                        {playerBoard.map((row, indexRow) => (
                            <div key={indexRow} className="column">
                                {row.map((cell, indexCell) => (
                                    <div
                                        key={indexCell}
                                        className={`cell ${cell === 1 ? 'revealed' : ''} ${cell === 'hit' ? 'hit' : ''} ${cell === 'miss' ? 'miss' : ''} ${nextMoves.some(pos => pos[0] === indexRow && pos[1] === indexCell) ? 'next' : ''}`}
                                        onClick={() => handlePlayerBoardClick(indexRow, indexCell)}
                                    ></div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
                <div className='battleship-cpu'>
                    <h3>CPU Board</h3>
                    <div className='board'>
                        {cpuBoard.map((row, indexRow) => (
                            <div key={indexRow} className="column">
                                {row.map((cell, indexCell) => (
                                    <div
                                        key={indexCell}
                                        className={`cell ${revealCpuBoard && cell === 1 ? 'revealed' : ''} ${cell === 'hit' ? 'hit' : ''} ${cell === 'miss' ? 'miss' : ''}`}
                                        onClick={() => handleCpuBoardClick(indexRow, indexCell)}
                                    ></div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className='buttons'>
                <button className='button' onClick={handleRevealCpuBoard}>Reveal CPU Positions</button>
                <button className='button' onClick={handleResetGame}>Reset Game</button>
            </div>
        </div>
    );
}

export default Game;