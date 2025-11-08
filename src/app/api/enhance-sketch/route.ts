// app/api/enhance-sketch/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import multer from 'multer';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Configure Multer for memory storage (no disk writes needed for Gemini)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    // ✅ CORRECT - Proper Multer fileFilter signature
    fileFilter: (req, file, cb) => {
        if (file.mimetype && file.mimetype.startsWith('image/')) {
            cb(null, true);  // Accept image files
        } else {
            cb(null, false);  // Reject non-image files (no error needed)
        }
    },
});

// Helper to convert Web Request to Multer-compatible format
async function parseMultipart(request: NextRequest) {
    const formData = await request.formData();
    const file = formData.get('sketch') as File;
    const prompt = formData.get('prompt') as File | string;

    if (!file) {
        throw new Error('No sketch file uploaded');
    }

    // Convert File to Multer File object
    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = file.name || 'sketch.png';
    const mimetype = file.type || 'image/png';

    return {
        file: {
            originalname: filename,
            mimetype,
            buffer,
            size: buffer.length,
        },
        prompt: typeof prompt === 'string' ? prompt : 'Enhance this hand-drawn monster sketch into a high-detail digital illustration with clean lines, vibrant colors, fantasy style, and professional NFT quality. Add textures and lighting while preserving the original pose and features.'
    };
}

export async function POST(request: NextRequest) {
    try {
        // Parse multipart form data
        const { file: sketchFile, prompt: userPrompt } = await parseMultipart(request);

        // Base64 encode sketch for Gemini
        const base64Sketch = sketchFile.buffer.toString('base64');
        const mimeType = sketchFile.mimetype;

        // Generate enhanced image with Gemini Nano Banana
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-image' });
        const genPrompt = [
            {
                inlineData: {
                    data: base64Sketch,
                    mimeType: mimeType,
                },
            },
            { text: userPrompt },
        ];

        const result = await model.generateContent(genPrompt);
        const response = await result.response;
        const generatedImagePart = response.candidates?.[0]?.content?.parts?.find((part: any) => part.inlineData)?.inlineData;

        if (!generatedImagePart) {
            return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 });
        }

        // Decode base64 generated image
        const generatedBuffer = Buffer.from(generatedImagePart.data, 'base64');

        // Generate unique filename
        const fileName = `enhanced-monster-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.png`;
        const filePath = `public/${fileName}`;

        // Upload to Supabase storage
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('monster-images')
            .upload(filePath, generatedBuffer, {
                contentType: 'image/png',
                upsert: false,
            });

        if (uploadError) {
            console.error('Supabase upload error:', uploadError);
            return NextResponse.json({ error: 'Failed to save image to storage' }, { status: 500 });
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('monster-images')
            .getPublicUrl(filePath);

        return NextResponse.json({
            success: true,
            enhancedImageUrl: publicUrl,
            fileName,
            originalPrompt: userPrompt,
        });
    } catch (error: any) {
        console.error('Enhance sketch error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({ message: 'POST to upload sketch and generate enhanced version' });
}
