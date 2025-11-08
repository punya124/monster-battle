'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import Link from 'next/link';


export default function HomePage() {
  const { connected, publicKey } = useWallet();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <nav className="flex justify-between items-center mb-12">
          <h1 className="text-3xl font-bold">🐉 Monster Draw Battle</h1>
          <WalletMultiButton />
        </nav>

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-6xl font-extrabold mb-6">
            Draw Your Monster.<br />
            Mint It as NFT.<br />
            Battle!
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Create hand-drawn monsters on paper, scan them with your phone,
            and watch AI turn them into playable NFT trading cards on Solana.
          </p>

          {connected ? (
            <div className="space-x-4">
              <Link
                href="/upload"
                className="inline-block bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-lg text-lg transition"
              >
                ✨ Create Monster
              </Link>
              <Link
                href="/collection"
                className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-8 rounded-lg text-lg transition"
              >
                📚 My Collection
              </Link>
            </div>
          ) : (
            <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-6">
              <p className="text-lg mb-4">👆 Connect your Solana wallet to start</p>
              <WalletMultiButton />
            </div>
          )}
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white/10 backdrop-blur rounded-lg p-6 text-center">
            <div className="text-5xl mb-4">🎨</div>
            <h3 className="text-xl font-bold mb-2">Draw on Paper</h3>
            <p className="text-gray-300">Sketch your monster with pen and paper</p>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-lg p-6 text-center">
            <div className="text-5xl mb-4">🤖</div>
            <h3 className="text-xl font-bold mb-2">AI Analysis</h3>
            <p className="text-gray-300">Gemini AI generates balanced stats</p>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-lg p-6 text-center">
            <div className="text-5xl mb-4">⚔️</div>
            <h3 className="text-xl font-bold mb-2">PvP Battles</h3>
            <p className="text-gray-300">Fight other players in real-time</p>
          </div>
        </div>

        {/* Stats */}
        {connected && (
          <div className="mt-12 text-center">
            <p className="text-sm text-gray-400">
              Connected: {publicKey?.toString().slice(0, 8)}...{publicKey?.toString().slice(-8)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
