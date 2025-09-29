// generateEmbeddings.js
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { pipeline } from '@xenova/transformers';
import fs from 'fs';

// Load environment variables from .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env') });

// Set the cache directory to use local models folder
const modelCacheDir = resolve(__dirname, 'models');
process.env.TRANSFORMERS_CACHE = modelCacheDir;

// Create models directory if it doesn't exist
if (!fs.existsSync(modelCacheDir)) {
  fs.mkdirSync(modelCacheDir, { recursive: true });
}

console.log('📁 Using model cache directory:', modelCacheDir);

// Initialize Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Hugging Face Embedding function
async function generateHuggingFaceEmbedding(text) {
  try {
    const API_KEY = process.env.HUGGING_FACE_API_KEY;
    
    if (!API_KEY) {
      throw new Error('Hugging Face API key not found. Set HUGGING_FACE_API_KEY environment variable.');
    }

    const response = await axios.post(
      'https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2',
      {
        inputs: text,
        options: {
          wait_for_model: true
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 second timeout
      }
    );

    return response.data;
  } catch (error) {
    console.error('Hugging Face API error:', error.response?.data || error.message);
    throw error;
  }
}

// Local fallback embedding (no API needed)
let localEmbeddingPipeline = null;

async function generateLocalEmbedding(text) {
  try {
    if (!localEmbeddingPipeline) {
      console.log('🔄 Loading local embedding model...');
      localEmbeddingPipeline = await pipeline(
        'feature-extraction', 
        'Xenova/all-MiniLM-L6-v2'
      );
    }

    const output = await localEmbeddingPipeline(text, {
      pooling: 'mean',
      normalize: true
    });
    
    return Array.from(output.data);
  } catch (error) {
    console.error('Local embedding error:', error.message);
    throw error;
  }
}

// Main embedding function with fallback
async function generateEmbedding(text) {
  // Skip if text is too short
  if (!text || text.trim().length < 10) {
    throw new Error('Text too short for embedding');
  }

  // Try Hugging Face API first, fallback to local
  try {
    console.log('🌐 Using Hugging Face API...');
    return await generateHuggingFaceEmbedding(text);
  } catch (apiError) {
    console.log('🔧 Falling back to local embedding...');
    return await generateLocalEmbedding(text);
  }
}

// Enhanced batch processing function for both tables
async function processBatch(batch, tableName) {
  const embeddings = [];
  
  for (const row of batch) {
    try {
      // Handle different table structures
      let content = '';
      let rowIdentifier = '';
      
      if (tableName === 'uploaded_policies') {
        content = row.content || row.description || row.extracted_text || '';
        rowIdentifier = `Policy: ${row.title || row.id}`;
      } else if (tableName === 'framework_controls') {
        // Framework controls have different field names
        content = row.control_text || row.control_name || row.description || '';
        rowIdentifier = `Control: ${row.control_ref || row.id}`;
        
        // Include control_ref and guidance for better context
        if (row.control_ref) {
          content = `Control ${row.control_ref}: ${row.control_name}. ${content}`;
        }
        if (row.guidance) {
          content += ` Guidance: ${row.guidance}`;
        }
      }
      
      // Skip empty or very short content
      if (!content || content.trim().length < 10) {
        console.log(`⏩ Skipping ${rowIdentifier} - content too short (${content.length} chars)`);
        continue;
      }

      console.log(`🔄 Generating embedding for ${rowIdentifier}`);
      console.log(`📝 Content preview: ${content.substring(0, 150)}...`);
      
      const embedding = await generateEmbedding(content);
      
      embeddings.push({
        id: row.id,
        embedding: embedding
      });
      
      // Add delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 200));
      
    } catch (error) {
      console.error(`❌ Error processing row ${row.id}:`, error.message);
    }
  }
  
  return embeddings;
}

// Update embeddings in database
async function updateEmbeddingsInDatabase(embeddings, tableName) {
  let successCount = 0;
  let errorCount = 0;
  
  for (const item of embeddings) {
    try {
      const { error } = await supabase
        .from(tableName)
        .update({ 
          embedding: item.embedding,
          updated_at: new Date().toISOString()
        })
        .eq('id', item.id);

      if (error) {
        console.error(`❌ Error updating embedding for ${item.id}:`, error.message);
        errorCount++;
      } else {
        console.log(`✅ Updated embedding for ${item.id}`);
        successCount++;
      }
    } catch (error) {
      console.error(`❌ Database update error for ${item.id}:`, error.message);
      errorCount++;
    }
  }
  
  console.log(`📊 ${tableName}: ${successCount} successful, ${errorCount} errors`);
  return successCount;
}

// Check if embedding column exists
async function checkEmbeddingColumn(tableName) {
  try {
    // Try to select the embedding column
    const { data, error } = await supabase
      .from(tableName)
      .select('embedding')
      .limit(1);

    if (error) {
      console.error(`❌ Error checking embedding column in ${tableName}:`, error.message);
      return false;
    }
    
    console.log(`✅ Embedding column exists in ${tableName}`);
    return true;
  } catch (error) {
    console.error(`❌ Exception checking embedding column:`, error.message);
    return false;
  }
}

// Clean up empty records
async function cleanupEmptyRecords() {
  try {
    const { count, error } = await supabase
      .from('uploaded_policies')
      .delete()
      .or('content.is.null,content.eq.,content.lt.20');

    if (error) {
      console.error('❌ Error cleaning up records:', error);
    } else if (count > 0) {
      console.log(`🧹 Cleaned up ${count} empty records`);
    }
  } catch (error) {
    console.error('Cleanup error:', error);
  }
}

// Main function
async function generateEmbeddings() {
  console.log('🚀 Starting embedding generation for all tables...');
  
  console.log('🔍 Environment check:');
  console.log('VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL ? '✅ Set' : '❌ Not set');
  console.log('HUGGING_FACE_API_KEY:', process.env.HUGGING_FACE_API_KEY ? '✅ Set' : '❌ Not set (will use local fallback)');
  console.log('VITE_SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Not set');

  try {
    // Check if embedding columns exist
    const policiesHasEmbedding = await checkEmbeddingColumn('uploaded_policies');
    const controlsHasEmbedding = await checkEmbeddingColumn('framework_controls');
    
    if (!policiesHasEmbedding || !controlsHasEmbedding) {
      console.log('⚠️ Please run the SQL setup script first to add embedding columns');
      return;
    }

    // Clean up empty records first
    await cleanupEmptyRecords();

    // Process uploaded_policies table
    console.log('\n📊 Processing table: uploaded_policies');
    
    const { data: policies, error: policiesError } = await supabase
      .from('uploaded_policies')
      .select('*')
      .is('embedding', null);

    if (policiesError) {
      console.error('❌ Error fetching policies:', policiesError);
    } else {
      console.log(`📦 Found ${policies?.length || 0} policies with null embeddings`);

      if (policies && policies.length > 0) {
        console.log('🔄 Processing policies batch...');
        const embeddings = await processBatch(policies, 'uploaded_policies');
        
        if (embeddings.length > 0) {
          const successCount = await updateEmbeddingsInDatabase(embeddings, 'uploaded_policies');
          console.log(`✅ Updated ${successCount}/${embeddings.length} embeddings in uploaded_policies`);
        } else {
          console.log('⚠️ No valid policy embeddings generated');
        }
      } else {
        console.log('✅ All policies already have embeddings');
      }
    }

    // Process framework_controls table
    console.log('\n📊 Processing table: framework_controls');
    
    const { data: controls, error: controlsError } = await supabase
      .from('framework_controls')
      .select('*')
      .is('embedding', null);

    if (controlsError) {
      console.error('❌ Error fetching controls:', controlsError);
    } else {
      console.log(`📦 Found ${controls?.length || 0} controls with null embeddings`);

      if (controls && controls.length > 0) {
        console.log('🔄 Processing controls batch...');
        const embeddings = await processBatch(controls, 'framework_controls');
        
        if (embeddings.length > 0) {
          const successCount = await updateEmbeddingsInDatabase(embeddings, 'framework_controls');
          console.log(`✅ Updated ${successCount}/${embeddings.length} embeddings in framework_controls`);
        } else {
          console.log('⚠️ No valid control embeddings generated');
        }
      } else {
        console.log('✅ All controls already have embeddings');
      }
    }

    console.log('\n🎉 Embedding generation completed!');

    // Final counts
    console.log('\n📊 Final Status:');
    const finalPolicies = await supabase.from('uploaded_policies').select('id').is('embedding', null);
    const finalControls = await supabase.from('framework_controls').select('id').is('embedding', null);
    
    console.log(`Policies without embeddings: ${finalPolicies.data?.length || 0}`);
    console.log(`Controls without embeddings: ${finalControls.data?.length || 0}`);

  } catch (error) {
    console.error('❌ Critical error:', error);
  }
}

// Run the script
generateEmbeddings();