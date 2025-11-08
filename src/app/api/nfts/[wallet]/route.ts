import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient'; // Your supabase client instance

interface Move {
    id: number;
    name: string;
    type: string;
    energy_cost: number;
    attack_multiplier: number;
    defense_multiplier: number;
    speed_multiplier: number;
    is_defense: boolean;
}

interface Monster {
    id: number;
    mint_address: string;
    owner_wallet: string;
    name: string;
    type: string;
    attack: number;
    defense: number;
    speed: number;
    health: number;
    energy: number;
    image_url: string | null;
    moves: Move[];
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const wallet = searchParams.get('wallet');

        if (!wallet) {
            return NextResponse.json({ error: 'Missing wallet parameter' }, { status: 400 });
        }

        // Fetch all monsters owned by wallet
        let { data: monsters, error } = await supabase
            .from('monsters')
            .select('id, mint_address, owner_wallet, name, type, attack, defense, speed, health, energy, image_url')
            .eq('owner_wallet', wallet);

        if (error) {
            throw error;
        }

        if (!monsters || monsters.length === 0) {
            return NextResponse.json({ success: true, count: 0, nfts: [] }, { status: 200 });
        }

        // For each monster, fetch their moves and attach
        const withMoves: Monster[] = [];

        for (const monster of monsters) {
            // Join monster_moves with moves table to get full move data for monster
            const { data: monsterMoves, error: movesError } = await supabase
                .from('monster_moves')
                .select(`moves(id, name, type, energy_cost, attack_multiplier, defense_multiplier, speed_multiplier, is_defense)`)
                .eq('monster_id', monster.id);

            if (movesError) {
                throw movesError;
            }

            const moves = monsterMoves?.map((mm) => mm.moves).flat() || [];


            withMoves.push({
                ...monster,
                moves
            });
        }

        return NextResponse.json({ success: true, count: withMoves.length, nfts: withMoves }, { status: 200 });
    } catch (error: any) {
        console.error('Error fetching NFTs:', error);
        return NextResponse.json({ error: error.message || 'Failed to fetch NFTs' }, { status: 500 });
    }
}
