'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import Link from 'next/link';

import {
  DraggableCardBody,
  DraggableCardContainer,
} from "@/components/ui/draggable-card";


export default function HomePage() {
  const { connected, publicKey } = useWallet();

  const items = [
    {
      title: "Grimnaw",
      image:
        "https://wpvztcbkqizfzsrmkfaw.supabase.co/storage/v1/object/public/monster-images/public/enhanced-monster-1762625288128-bg1tapadg.png",
      className: "absolute top-10 left-[20%] rotate-[-5deg]",
    },

    {
      title: "Glare Shard",
      image:
        "https://wpvztcbkqizfzsrmkfaw.supabase.co/storage/v1/object/public/monster-images/public/enhanced-monster-1762630214109-eua1wdnl4.png",
      className: "absolute top-5 left-[40%] rotate-[8deg]",
    },
    {
      title: "Ruffianne",
      image: "https://wpvztcbkqizfzsrmkfaw.supabase.co/storage/v1/object/public/monster-images/public/enhanced-monster-1762637094307-buiocpdwo.png",
      className: "absolute top-5 left-[40%] rotate-[8deg]",
    },
    {
      title: "Pestergeist",
      image: "https://wpvztcbkqizfzsrmkfaw.supabase.co/storage/v1/object/public/monster-images/public/enhanced-monster-1762637730777-hdwrn8x89.png",
      className: "absolute top-5 left-[40%] rotate-[8deg]",
    }

  ];

  return (
    <div className="min-h-screen bg-gradient-to-br  text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <nav className="flex justify-between items-center mb-12">
          <h1 className="text-3xl font-bold">Monster Draw Battle</h1>
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
                Create Monster
              </Link>
              <Link
                href="/collection"
                className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-8 rounded-lg text-lg transition"
              >
                My Collection
              </Link>
            </div>
          ) : (
            <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-6">
              <p className="text-lg mb-4">👆 Connect your Solana wallet to start</p>
              <WalletMultiButton />
            </div>
          )}
        </div>

        {/* Before & After Section */}
        <div className="mt-20 max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-bold mb-6">From Sketch to NFT</h3>
          <p className="text-gray-300 mb-8">
            Watch your scribbles come to life through the power of Gemini, NFTs, and more.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/10 p-4 rounded-lg">
              <h4 className="text-lg font-semibold mb-2">Original Drawing</h4>
              <img
                src="/monsterIMGs/drawn.jpeg"
                alt="Drawn Monster"
                height="600"
                width="600"
                className="rounded-lg"
              />
            </div>

            <div className="bg-white/10 p-4 rounded-lg">
              <h4 className="text-lg font-semibold mb-2">AI Enhanced</h4>
              <img
                src="/monsterIMGs/generated.png"
                alt="AI Enhanced Monster"
                height="400"
                width="400"
                className="rounded-lg"
              />
            </div>
          </div>
        </div>


        <DraggableCardContainer className="relative flex min-h-screen w-full items-center justify-center overflow-clip">
          <p className="absolute top-1/2 mx-auto max-w-sm -translate-y-3/4 text-center text-2xl font-black text-neutral-400 md:text-4xl dark:text-neutral-800">
            These are a couple of the different monster we have created
          </p>
          {items.map((item) => (

            <DraggableCardBody className={item.className} key={item.image}>
              <img
                src={item.image}
                alt={item.title}
                className="pointer-events-none relative z-10 h-80 w-80 object-cover"
              />
              <h3 className="mt-4 text-center text-2xl font-bold text-neutral-700 dark:text-neutral-300">
                {item.title}
              </h3>
            </DraggableCardBody>
          ))}
        </DraggableCardContainer>

        {/* Features */}
        <div className="mt-20 grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white/10 backdrop-blur rounded-lg p-6 text-center">
            <h3 className="text-xl font-bold mb-2">Draw on Paper</h3>
            <p className="text-gray-300">Sketch your monster with pen and paper</p>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-lg p-6 text-center">
            <h3 className="text-xl font-bold mb-2">AI Analysis</h3>
            <p className="text-gray-300">Gemini AI generates balanced stats</p>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-lg p-6 text-center">
            <h3 className="text-xl font-bold mb-2">PvP Battles</h3>
            <p className="text-gray-300">Fight other players in real-time</p>
          </div>
        </div>

        {/* Stats */}
        {connected && (
          <div className="mt-12 text-center">
            <p className="text-sm text-gray-400">
              Connected: {publicKey?.toString().slice(0, 8)}...
              {publicKey?.toString().slice(-8)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
