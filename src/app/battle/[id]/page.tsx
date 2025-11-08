'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function BattlePage() {
  const router = useRouter();
  const { publicKey, connected } = useWallet();
  const { id: battleId } = useParams();

  const [battle, setBattle] = useState<any>(null);
  const [stage, setStage] = useState<'loading' | 'waiting' | 'battle'>('loading');
  const [copied, setCopied] = useState(false);

  // === Fetch battle once ===
//   useEffect(() => {
//     if (!battleId) return;
//     console.log('🧩 Fetching battle with ID:', battleId);

//     const fetchBattle = async () => {
//       console.log("");
//       const { data, error } = await supabase
//         .from('battles')
//         .select('*')
//         .eq('id', battleId)
//         .single();

//       if (error) {
//         console.error('❌ Error fetching battle:', error);
//       } else {
//         console.log('✅ Battle fetched:', data);

//         setBattle(data);
//       }
//     };

//     fetchBattle();
//   }, [battleId]);

  // === Subscribe to realtime updates ===
  useEffect(() => {
    if (!battleId) return;

    const channel = supabase
      .channel(`battle:${battleId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'battles',
          filter: `id=eq.${battleId}`,
        },
        async (payload) => {
          console.log('🔔 Realtime battle update:', payload);
          const { data } = await supabase
            .from('battles')
            .select('*')
            .eq('id', battleId)
            .single();
          setBattle(data);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [battleId]);

  // === Handle player joining ===
  useEffect(() => {
    if (!battle || !connected || !publicKey) return;

    const userWallet = publicKey.toBase58();
    console.log('⚡ Wallet connected:', userWallet);

    // If joining as second player
    if (!battle.player2_wallet && battle.player1_wallet !== userWallet) {
      console.log('🎮 Joining battle as Player 2...');
      supabase
        .from('battles')
        .update({ player2_wallet: userWallet })
        .eq('id', battle.id)
        .then(() => console.log('✅ Player 2 joined.'));
    }
  }, [battle, connected, publicKey]);

  // === Stage management ===
  useEffect(() => {
    if (!battle) return;

    if (!battle.player2_wallet) {
      setStage('waiting');
    } else {
      setStage('battle');
    }
  }, [battle]);

  // === Copy join link ===
  const copyToClipboard = () => {
    const joinUrl = `${window.location.origin}/battle/${battleId}`;
    navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // === Loading screen ===
  if (stage === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <p>Loading battle data...</p>
      </div>
    );
  }

  // === Waiting room ===
  if (stage === 'waiting') {
    const joinUrl = typeof window !== 'undefined' ? `${window.location.origin}/battle/${battleId}` : '';

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white text-center p-6">
        <h1 className="text-3xl font-bold mb-4">⚔️ Waiting Room</h1>
        <p className="text-gray-300 mb-2">Share this link with your friend:</p>

        <div className="bg-white/10 rounded-lg p-4 mb-4 w-full max-w-md break-all">
          {joinUrl}
        </div>

        <button
          onClick={copyToClipboard}
          className="bg-blue-500 hover:bg-blue-600 px-6 py-2 rounded-lg mb-4"
        >
          {copied ? '✅ Copied!' : 'Copy Link'}
        </button>

        <p className="text-gray-400">
          {!battle?.player2_wallet ? 'Waiting for another player to join...' : 'Both players joined!'}
        </p>
      </div>
    );
  }

  

  return null;
}
