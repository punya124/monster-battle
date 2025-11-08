'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function UploadPage() {
    const { connected, publicKey } = useWallet();
    const router = useRouter();

    const [image, setImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);  // Original sketch preview
    const [enhancedImage, setEnhancedImage] = useState<string | null>(null);  // AI enhanced image
    const [analyzing, setAnalyzing] = useState(false);
    const [minting, setMinting] = useState(false);
    const [monsterData, setMonsterData] = useState<any>(null);
    const [mintResult, setMintResult] = useState<any>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            const url = URL.createObjectURL(file);
            setPreview(url);
            setEnhancedImage(null);
            setMonsterData(null);
            setMintResult(null);
        }
    };

    // Cleanup original preview URL on unmount
    useEffect(() => {
        return () => {
            if (preview) {
                URL.revokeObjectURL(preview);
            }
        };
    }, [preview]);

    const analyzeMonster = async () => {
        if (!image) return;

        setAnalyzing(true);
        const formData = new FormData();
        formData.append('image', image);

        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`Analysis failed: ${response.statusText}`);
            }

            const data = await response.json();
            setMonsterData(data);

            // Store the enhanced image URL for display
            if (data.generatedImage?.url) {
                setEnhancedImage(data.generatedImage.url);
            }
        } catch (error) {
            console.error('Analysis failed:', error);
            alert('Failed to analyze monster. Please try again.');
        } finally {
            setAnalyzing(false);
        }
    };

    const mintNFT = async () => {
        if (!monsterData || !publicKey) return;

        setMinting(true);

        try {
            const response = await fetch('/api/mint', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: monsterData.name,
                    type: monsterData.type,
                    attack: monsterData.attack,
                    defense: monsterData.defense,
                    speed: monsterData.speed,
                    health: monsterData.health,
                    description: monsterData.description,
                    ownerWallet: publicKey.toString(),
                    imageUrl: enhancedImage  // Pass enhanced image for NFT
                })
            });

            const result = await response.json();

            if (result.success) {
                setMintResult(result);
                alert('🎉 NFT Minted Successfully!');
            } else {
                alert('Minting failed: ' + result.error);
            }
        } catch (error) {
            console.error('Mint failed:', error);
            alert('Failed to mint NFT. Please try again.');
        } finally {
            setMinting(false);
        }
    };

    if (!connected) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-3xl font-bold mb-4">🔒 Wallet Not Connected</h1>
                    <p className="text-gray-300 mb-6">Please connect your wallet to create monsters</p>
                    <Link href="/" className="bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-lg">
                        Go Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white">
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <Link href="/" className="text-2xl font-bold">← Back</Link>
                    <h1 className="text-3xl font-bold">Create Monster</h1>
                    <div className="w-20"></div>
                </div>

                <div className="max-w-2xl mx-auto">
                    {/* Step 1: Upload Original Sketch */}
                    <div className="bg-white/10 backdrop-blur rounded-lg p-6 mb-6">
                        <h2 className="text-2xl font-bold mb-4">📸 Step 1: Scan Your Drawing</h2>
                        <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={handleImageChange}
                            className="block w-full text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-500 file:text-white hover:file:bg-blue-600"
                        />

                        {preview && (
                            <div className="mt-4">
                                <div className="text-center mb-3">
                                    <p className="text-sm text-gray-300">Original Sketch Preview</p>
                                </div>
                                <img
                                    src={preview}
                                    alt="Original sketch"
                                    className="w-full max-h-64 object-contain rounded-lg border-2 border-white/20"
                                />
                                <button
                                    onClick={analyzeMonster}
                                    disabled={analyzing || !!monsterData}
                                    className="w-full mt-4 bg-green-500 hover:bg-green-600 disabled:bg-gray-500 text-white font-bold py-3 rounded-lg"
                                >
                                    {analyzing ? '🤖 Analyzing...' : monsterData ? '✅ Analyzed!' : '🔍 Analyze Monster'}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Step 1.5: Enhanced AI Image */}
                    {enhancedImage && (
                        <div className="bg-white/10 backdrop-blur rounded-lg p-6 mb-6">
                            <h2 className="text-2xl font-bold mb-4">🎨 AI Enhanced Monster</h2>
                            <div className="text-center mb-4">
                                <p className="text-sm text-gray-300">Generated by AI from your sketch</p>
                            </div>
                            <img
                                src={enhancedImage}
                                alt="AI enhanced monster"
                                className="w-full max-h-80 object-contain rounded-lg border-2 border-green-400/30 shadow-lg"
                            />
                        </div>
                    )}

                    {/* Step 2: Review Stats */}
                    {monsterData && (
                        <div className="bg-white/10 backdrop-blur rounded-lg p-6 mb-6">
                            <h2 className="text-2xl font-bold mb-4">⚡ Step 2: Monster Stats</h2>
                            <div className="bg-black/30 rounded-lg p-6">
                                <h3 className="text-3xl font-bold text-center mb-2">{monsterData.name} ({monsterData.type})</h3>
                                <p className="text-gray-300 text-center mb-6">{monsterData.description}</p>

                                <div className="grid grid-cols-4 gap-4">
                                    <div className="text-center">
                                        <div className="text-4xl font-bold text-red-400">{monsterData.attack}</div>
                                        <div className="text-sm text-gray-400">Attack</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-4xl font-bold text-blue-400">{monsterData.defense}</div>
                                        <div className="text-sm text-gray-400">Defense</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-4xl font-bold text-red-400">{monsterData.speed}</div>
                                        <div className="text-sm text-gray-400">Speed</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-4xl font-bold text-green-400">{monsterData.health}</div>
                                        <div className="text-sm text-gray-400">Health</div>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={mintNFT}
                                disabled={minting || !!mintResult}
                                className="w-full mt-4 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-500 text-white font-bold py-3 rounded-lg"
                            >
                                {minting ? '⏳ Minting...' : mintResult ? '✅ Minted!' : '💎 Mint as NFT'}
                            </button>
                        </div>
                    )}

                    {/* Step 3: Success */}
                    {mintResult && (
                        <div className="bg-green-500/20 border border-green-500 rounded-lg p-6">
                            <h2 className="text-2xl font-bold mb-4">🎉 NFT Minted Successfully!</h2>
                            <p className="mb-2"><strong>Mint Address:</strong> {mintResult.mintAddress}</p>
                            <p className="mb-4 text-sm text-gray-300 break-all">{mintResult.signature}</p>

                            <div className="space-y-2">
                                <a
                                    href={mintResult.explorerUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg text-center"
                                >
                                    View on Solana Explorer
                                </a>
                                <Link
                                    href="/collection"
                                    className="block w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg text-center"
                                >
                                    Go to Collection
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
