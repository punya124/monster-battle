'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import io from 'socket.io-client';

let socket: any;

export default function BattlePage() {
    const { connected, publicKey } = useWallet();
    const params = useParams();
    const battleId = params.id as string;

    const [gameState, setGameState] = useState<any>(null);
    const [myHand, setMyHand] = useState<any[]>([]);
    const [selectedCard, setSelectedCard] = useState<number | null>(null);
    const [battleLog, setBattleLog] = useState<string[]>([]);

    useEffect(() => {
        if (!connected || !publicKey) return;

        // Connect to WebSocket server
        socket = io('ws://localhost:3001');

        socket.on('connect', () => {
            console.log('Connected to battle server');
            socket.emit('joinBattle', {
                battleId,
                wallet: publicKey.toString()
            });
        });

        socket.on('gameState', (state: any) => {
            setGameState(state);
            setBattleLog(prev => [...prev, 'Game state updated']);
        });

        socket.on('battleLog', (message: string) => {
            setBattleLog(prev => [...prev, message]);
        });

        return () => {
            socket?.disconnect();
        };
    }, [connected, publicKey, battleId]);

    const playCard = (cardIndex: number) => {
        if (!socket) return;
        socket.emit('playCard', { cardIndex });
        setBattleLog(prev => [...prev, 'Played a card']);
    };

    const attack = (targetIndex: number) => {
        if (!socket || selectedCard === null) return;
        socket.emit('attack', { attackerIndex: selectedCard, targetIndex });
        setBattleLog(prev => [...prev, `Attacked target ${targetIndex}`]);
        setSelectedCard(null);
    };

    const endTurn = () => {
        if (!socket) return;
        socket.emit('endTurn');
        setBattleLog(prev => [...prev, 'Ended turn']);
    };

    if (!connected) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-3xl font-bold mb-4">🔒 Wallet Not Connected</h1>
                    <Link href="/" className="bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-lg">
                        Go Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white">
            <div className="container mx-auto px-4 py-4">
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <Link href="/collection" className="text-lg">← Back</Link>
                    <h1 className="text-2xl font-bold">⚔️ Battle Arena</h1>
                    <div className="text-sm">Room: {battleId}</div>
                </div>

                {!gameState ? (
                    <div className="text-center py-20">
                        <div className="text-4xl mb-4">⏳</div>
                        <p className="text-xl">Waiting for opponent...</p>
                        <p className="text-sm text-gray-400 mt-2">Share this URL with a friend!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Opponent Field */}
                        <div className="bg-red-500/20 border border-red-500 rounded-lg p-4">
                            <div className="flex justify-between items-center mb-2">
                                <h2 className="font-bold">🔴 Opponent</h2>
                                <div className="text-xl">❤️ {gameState.opponentHP || 100} HP</div>
                            </div>
                            <div className="flex gap-2">
                                {[1, 2, 3].map((i) => (
                                    <div
                                        key={i}
                                        className="w-24 h-32 bg-red-900/50 rounded-lg flex items-center justify-center text-3xl cursor-pointer hover:bg-red-900/70"
                                        onClick={() => attack(i)}
                                    >
                                        🐉
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Battle Info */}
                        <div className="bg-white/10 rounded-lg p-4 text-center">
                            <div className="text-lg">
                                {gameState.isMyTurn ? '✨ Your Turn' : '⏳ Opponent\'s Turn'}
                            </div>
                            <div className="text-sm text-gray-400">Energy: {gameState.energy || 3}/10</div>
                        </div>

                        {/* Your Field */}
                        <div className="bg-blue-500/20 border border-blue-500 rounded-lg p-4">
                            <div className="flex justify-between items-center mb-2">
                                <h2 className="font-bold">🔵 Your Monsters</h2>
                                <div className="text-xl">❤️ {gameState.myHP || 100} HP</div>
                            </div>
                            <div className="flex gap-2">
                                {[1, 2, 3].map((i) => (
                                    <div
                                        key={i}
                                        className={`w-24 h-32 bg-blue-900/50 rounded-lg flex items-center justify-center text-3xl cursor-pointer hover:bg-blue-900/70 ${selectedCard === i ? 'ring-4 ring-yellow-400' : ''
                                            }`}
                                        onClick={() => setSelectedCard(i)}
                                    >
                                        🐲
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Your Hand */}
                        <div className="bg-green-500/20 border border-green-500 rounded-lg p-4">
                            <h2 className="font-bold mb-2">🃏 Your Hand</h2>
                            <div className="flex gap-2 mb-4">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div
                                        key={i}
                                        className="w-20 h-28 bg-green-900/50 rounded-lg flex items-center justify-center text-2xl cursor-pointer hover:bg-green-900/70"
                                        onClick={() => playCard(i)}
                                    >
                                        🎴
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={endTurn}
                                disabled={!gameState.isMyTurn}
                                className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-500 text-black font-bold py-3 rounded-lg"
                            >
                                🏁 End Turn
                            </button>
                        </div>

                        {/* Battle Log */}
                        <div className="bg-black/50 rounded-lg p-4 max-h-32 overflow-y-auto">
                            <h3 className="font-bold mb-2">📜 Battle Log</h3>
                            {battleLog.slice(-5).map((log, i) => (
                                <div key={i} className="text-sm text-gray-400">• {log}</div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
