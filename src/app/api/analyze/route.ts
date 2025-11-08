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
        const statFeatures: Record<string, string[]> = {
            attack: [
                'sharp claws and fangs', 'spiked armor plating', 'glowing red eyes', 'muscular limbs with veins', 'barbed tail or horns',
                'fiery breath aura', 'tattered wings for predatory swoops'
            ],
            defense: [
                'thick armored hide or scales', 'heavy plated shell', 'shield-like bone structures', 'regenerative thorny exterior',
                'impenetrable rock-like skin', 'crystalline barriers', 'massive bulky frame'
            ],
            health: [
                'enormous towering size', 'robust and sturdy build', 'dense muscular body', 'glowing vitality runes',
                'ancient weathered but enduring form', 'regenerating tendrils', 'colossal mass with deep roots'
            ],
            speed: [
                'sleek aerodynamic form', 'elongated agile limbs', 'feathered or finned wings', 'streamlined body with minimal bulk',
                'blurred motion trails', 'lightweight ethereal wisps', 'nimble tentacle arrays'
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
        const imagePrompt = `Enhance this hand-drawn monster into a dynamic, high-detail fantasy illustration. Name: ${validatedData.name}, a ${validatedData.type} type creature. Description: ${validatedData.description}. Key visual stats: High ${dominantStat} emphasized with ${featureDescription}. Balance with moderate ${secondaryStat} traits. Overall: Vibrant colors, clean lines, intricate textures, dramatic lighting, and subtle particle effects. Preserve original pose, proportions, and core features while adding depth and realism—no background, focus on the monster.`;


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
