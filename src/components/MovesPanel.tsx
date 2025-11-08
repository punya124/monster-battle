'use client';
import { useState } from 'react';

interface Monster {
    name: string;
    moves: string[];
    // Add other props if needed, e.g., hp for state updates
}

interface MovesPanelProps {
    monster: Monster;
}

export default function MovesPanel({ monster }: MovesPanelProps) {
    const [turnMessage, setTurnMessage] = useState('What will your monster do?');
    const [opponentHp, setOpponentHp] = useState(90); // Placeholder opponent state

    const handleMove = (move: string) => {
        setTurnMessage(`${monster.name} used ${move}!`); // Update turn message
        // Add battle logic: e.g., calculate damage, update HP
        setOpponentHp(prev => Math.max(0, prev - 20)); // Example: subtract 20 HP
    };

    const handleRun = () => {
        setTurnMessage('You ran away from battle!');
        // Add run logic: e.g., redirect or reset state
    };

    const handleCatch = () => {
        setTurnMessage('You attempted to catch the opponent!');
        // Add catch logic
    };

    return (
        <div className="w-64 bg-black/50 backdrop-blur-md rounded-lg p-4 text-white">
            <h3 className="text-lg font-bold mb-4 text-center">Moves</h3>
            <div className="space-y-2 mb-4">
                {/* {monster.moves.map((move, index) => (
                    <button
                        key={index}
                        className="w-full bg-gray-700 hover:bg-gray-600 active:bg-gray-800 rounded px-3 py-2 text-center transition-all duration-200 transform hover:scale-105 shadow-md" // Pokémon-style with subtle scale
                        onClick={() => handleMove(move)}
                    >
                        {move}
                    </button>
                ))} */}
            </div>
            {/* Display turn message or battle feedback */}
            <p className="mt-4 text-sm text-center font-mono">{turnMessage}</p>
            <p className="text-xs text-center mt-1">Opponent HP: {opponentHp}</p>
        </div>
    );
}
