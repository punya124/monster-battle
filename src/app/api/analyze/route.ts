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
  "type": <choice between 'Fight', 'Freight' or 'Fairy'>
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
        const validatedData = {
            name: monsterData.name || 'Mystery Monster',
            type: monsterData.type || "Unknown",
            attack: Math.min(10, Math.max(1, Math.round(monsterData.attack))),
            defense: Math.min(10, Math.max(1, Math.round(monsterData.defense))),
            speed: Math.min(10, Math.max(1, Math.round(monsterData.speed))),
            health: Math.min(100, Math.max(10, Math.round(monsterData.health))),
            description: monsterData.description || 'A mysterious creature from the void.'
        };

        console.log('Analyzed monster:', validatedData);

        return NextResponse.json(validatedData, { status: 200 });

    } catch (error) {
        console.error('Error analyzing monster:', error);

        // Return a fallback monster on error
        return NextResponse.json(
            {
                name: 'Glitch Beast',
                attack: 5,
                defense: 5,
                health: 50,
                description: 'A creature born from analysis errors.',
                error: 'Analysis failed, using default stats'
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
