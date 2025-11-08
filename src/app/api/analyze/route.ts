import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
    try {
        // Get the uploaded image from form data
        const formData = await request.formData();
        const imageFile = formData.get('image') as File;

        if (!imageFile) {
            return NextResponse.json(
                { error: 'No image file provided' },
                { status: 400 }
            );
        }

        // Convert file to base64
        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64Image = buffer.toString('base64');

        // Prepare the image for Gemini
        const imagePart = {
            inlineData: {
                data: base64Image,
                mimeType: imageFile.type
            }
        };

        // Create the prompt for monster analysis
        const prompt = `Analyze this hand-drawn monster for a trading card game. Generate balanced game statistics.

Your task:
1. Analyze visual characteristics (complexity, size, aggressive vs defensive features)
2. Generate balanced game statistics
3. Create a creative monster name and description

Return ONLY a valid JSON object with this exact structure (no markdown, no code blocks):
{
  "name": "creative monster name",
  "type": <choice between 'Fight', 'Fright' or 'Fairy'>,
  "attack": <number between 1-10>,
  "defense": <number between 1-10>,
  "speed": <number between 1-10>,
  "health": <number between 10-100>,
  "description": "brief 1-2 sentence description of the monster"
}

Balance rules:
- Attack stat: Based on aggressive features, sharp elements, weapons (1-10)
- Defense stat: Based on armor, shields, bulk, protective features (1-10)
- Speed stat: Based on aerodynammics and small size (1-10)
- Health stat: Based on overall size and sturdiness (10-100)
- Total stat budget: attack + defense + (health/10) should be between 12-18
- Monsters with high attack should have lower defense
- Monsters with high defense should have lower attack`;

        // Call Gemini API
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text();

        // Parse the JSON response
        // Remove any markdown code blocks if present
        const jsonText = text.replace(/``````\n?/g, '').trim();
        const monsterData = JSON.parse(jsonText);

        // Validate and ensure stats are within bounds
        let validatedData = {
            name: monsterData.name || 'Mystery Monster',
            type: monsterData.type || "Unknown",
            attack: Math.min(10, Math.max(1, Math.round(monsterData.attack))),
            defense: Math.min(10, Math.max(1, Math.round(monsterData.defense))),
            speed: Math.min(10, Math.max(1, Math.round(monsterData.speed))),
            health: Math.min(100, Math.max(10, Math.round(monsterData.health))),
            description: monsterData.description || 'A mysterious creature from the void.'
        };

        // Enforce stat budget balance (adjust if the parsed data exceeds)
        const totalBudget = validatedData.attack + validatedData.defense + (validatedData.health / 10);
        if (totalBudget > 18) {
            // Scale down proportionally (simple adjustment; customize as needed)
            const scaleFactor = 18 / totalBudget;
            validatedData.attack = Math.round(validatedData.attack * scaleFactor);
            validatedData.defense = Math.round(validatedData.defense * scaleFactor);
            validatedData.health = Math.round(validatedData.health * scaleFactor);
            // Re-clamp
            validatedData.attack = Math.min(10, Math.max(1, validatedData.attack));
            validatedData.defense = Math.min(10, Math.max(1, validatedData.defense));
            validatedData.health = Math.min(100, Math.max(10, validatedData.health));
        } else if (totalBudget < 12) {
            // Scale up similarly
            const scaleFactor = 12 / totalBudget;
            validatedData.attack = Math.round(validatedData.attack * scaleFactor);
            validatedData.defense = Math.round(validatedData.defense * scaleFactor);
            validatedData.health = Math.round(validatedData.health * scaleFactor);
            // Re-clamp
            validatedData.attack = Math.min(10, Math.max(1, validatedData.attack));
            validatedData.defense = Math.min(10, Math.max(1, validatedData.defense));
            validatedData.health = Math.min(100, Math.max(10, validatedData.health));
        }

        console.log('Analyzed monster:', validatedData);

        // ... (previous code for validation and budget enforcement)

        // NEW: Smart feature mapping based on stats
        // Enhanced: Pokémon-style feature mapping based on stats
        // Adds more animal-inspired, elemental, and whimsical traits for variety
        const statFeatures: Record<string, string[]> = {
            attack: [
                // Aggressive, predatory, weaponized traits like Charizard or Garchomp
                'sharp claws and fangs like a dragon', 'spiked armor plating with razor edges', 'glowing red eyes full of fury',
                'muscular limbs bulging with power', 'barbed tail whipping through air', 'fiery breath aura from maw',
                'tattered wings for aerial strikes', 'venomous stingers on tail or horns', 'jagged rock spikes protruding from back',
                'electric crackling claws', 'massive horned forehead for charging', 'serpentine coils ready to strike'
            ],
            defense: [
                // Tough, armored, resilient traits like Onix or Bastiodon
                'thick armored hide of steel scales', 'heavy plated shell like a fortress', 'shield-like bone structures',
                'regenerative thorny exterior that hardens', 'impenetrable rock-like skin with embedded gems',
                'crystalline barriers shimmering defensively', 'massive bulky frame with layered plating',
                'spiky carapace deflecting blows', 'earthen mossy armor blending with ground', 'icy frost coating for barriers',
                'woody bark shielding vital areas', 'metallic exoskeleton with riveted joints'
            ],
            health: [
                // Vital, enduring, growth-oriented traits like Snorlax or Venusaur
                'enormous towering size with sturdy legs', 'robust build overflowing with energy',
                'dense muscular body pulsing with life', 'glowing vitality runes on skin or leaves',
                'ancient weathered but enduring form like an elder tree', 'regenerating tendrils or vines',
                'colossal mass rooted deeply into earth', 'blooming flower bulbs storing power',
                'hearty fur coat for warmth and protection', 'bioluminescent veins showing inner strength',
                'mushroom caps sprouting from back for healing', 'shell with embedded healing crystals'
            ],
            speed: [
                // Agile, swift, evasive traits like Jolteon or Pidgeot
                'sleek aerodynamic form like a cheetah', 'elongated agile limbs for quick dashes',
                'feathered wings flapping rapidly', 'streamlined body with fin-like appendages',
                'blurred motion trails from speed', 'lightweight ethereal wisps trailing behind',
                'nimble tentacle arrays for grabbing', 'wind-swept fur or scales for aerodynamics',
                'lightning-fast leg muscles like a rabbit', 'hovering levitation orbs for flight',
                'slimy trail for slippery escapes', 'bird-like talons for perching and leaping'
            ]
        };


        // Determine dominant stat (highest value, tiebreak by order: attack > defense > health > speed)
        const stats = {
            attack: validatedData.attack,
            defense: validatedData.defense,
            health: validatedData.health,
            speed: validatedData.speed
        };
        const sortedStats = Object.entries(stats)
            .sort(([, a], [, b]) => b - a)
            .map(([key]) => key);
        const dominantStat = sortedStats[0];  // e.g., 'attack' if highest
        const secondaryStat = sortedStats[1] || dominantStat;  // For subtle secondary traits

        // Select 3-5 features: 2-3 from dominant, 1 from secondary, 1 from type
        const dominantFeatures = statFeatures[dominantStat].slice(0, Math.min(3, statFeatures[dominantStat].length));
        const secondaryFeature = statFeatures[secondaryStat][Math.floor(Math.random() * statFeatures[secondaryStat].length)];
        const typeFeatures: Record<'Fight' | 'Fright' | 'Fairy', string> = {
            Fight: 'aggressive stance, battle scars, weapon-like appendages',
            Fright: 'scary ghost-like features, exaggerated teeth, blood, unsettling look',  // Assuming 'fright' is a type variant (e.g., heavy-duty)
            Fairy: 'ethereal glowing aura, delicate wings, magical particle effects'
        };

        // Combine features into a dynamic description
        const featureDescription = [
            ...dominantFeatures,
            secondaryFeature,
            typeFeatures
        ].join(', ');

        // Generate the smart prompt
        const imagePrompt = `Transform this hand-drawn sketch into a vibrant Pokémon-style creature illustration, full of personality and elemental magic. Name: ${validatedData.name}, a ${validatedData.type}-type monster with high ${dominantStat} stats. Core traits: ${featureDescription}. Incorporate moderate ${secondaryStat} elements for balance. Style: Bold outlines, saturated colors, glossy textures like official Pokémon art, dynamic pose with subtle energy effects—no background, isolated on white. Don't make it overly muscular and humanoid, take more inspiration from animal bodies`;


        // NEW: Call the internal /api/enhance-sketch endpoint with form data (sketch + prompt)
        // Create a new FormData for the internal request
        const enhanceFormData = new FormData();
        const sketchBlob = new Blob([buffer], { type: imageFile.type });  // Reuse the original buffer as Blob
        enhanceFormData.append('sketch', sketchBlob, imageFile.name || 'sketch.png');
        enhanceFormData.append('prompt', imagePrompt);

        const enhanceResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/enhance-sketch`, {
            method: 'POST',
            body: enhanceFormData,
        });

        let generatedImage = null;
        if (enhanceResponse.ok) {
            const imageData = await enhanceResponse.json();
            generatedImage = {
                url: imageData.enhancedImageUrl || null,
                fileName: imageData.fileName || null,
                promptUsed: imagePrompt
            };
        } else {
            console.warn('Image enhancement failed:', enhanceResponse.statusText);
            // Proceed without image data
        }

        // Include image results in response
        const finalResponse = {
            ...validatedData,
            generatedImage
        };

        return NextResponse.json(finalResponse, { status: 200 });

    } catch (error) {
        console.error('Error analyzing monster:', error);

        // Return a fallback monster on error
        return NextResponse.json(
            {
                name: 'Glitch Beast',
                type: 'Fight',
                attack: 5,
                defense: 5,
                speed: 5,
                health: 50,
                description: 'A creature born from analysis errors.',
                error: 'Analysis failed, using default stats',
                generatedImage: null
            },
            { status: 200 } // Still return 200 so the flow continues
        );
    }
}

// Optional: Add a GET handler for testing
export async function GET() {
    return NextResponse.json({
        message: 'Monster analysis API is running. POST an image to analyze.',
        endpoint: '/api/analyze',
        method: 'POST',
        expects: 'multipart/form-data with "image" field'
    });
}
