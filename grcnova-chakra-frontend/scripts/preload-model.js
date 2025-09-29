import { pipeline } from '@xenova/transformers';
import fs from 'fs';
import path from 'path';

// Set cache directory to local folder
process.env.TRANSFORMERS_CACHE = './models';

async function preloadModel() {
    console.log('🔄 Pre-loading embedding model...');
    try {
        // Create models directory if it doesn't exist
        if (!fs.existsSync('./models')) {
            fs.mkdirSync('./models', { recursive: true });
        }

        // This will download and cache the model
        const embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
            progress_callback: (data) => {
                if (data.status === 'progress') {
                    console.log(`📥 Downloading: ${data.file} - ${(data.progress * 100).toFixed(1)}%`);
                }
            }
        });
        
        console.log('✅ Model loaded successfully');
        return embedder;
    } catch (error) {
        console.error('❌ Failed to load model:', error.message);
        throw error;
    }
}

// Run the pre-load
preloadModel()
    .then(() => console.log('🎉 Model pre-load complete!'))
    .catch(console.error);