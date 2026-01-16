// Test script to discover available GitHub Models
const fetch = require('node-fetch');

async function listGitHubModels() {
  const token = process.env.GITHUB_TOKEN;
  
  if (!token) {
    console.error('❌ GITHUB_TOKEN not set in environment');
    process.exit(1);
  }

  console.log('🔍 Testing GitHub Models API...\n');

  // Test different DeepSeek model names
  const modelsToTest = [
    'DeepSeek-R1',
    'DeepSeek-V3',
    'deepseek-r1',
    'deepseek-v3',
    'DeepSeek-Coder-V2',
    'DeepSeek-V2.5',
    'ai21-jamba-1-5-large',
    'Mistral-large-2411'
  ];

  for (const modelName of modelsToTest) {
    try {
      console.log(`\n📝 Testing: ${modelName}`);
      
      const response = await fetch('https://models.inference.ai.azure.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'test' }],
          model: modelName,
          max_tokens: 10
        })
      });

      const data = await response.json();

      if (response.ok) {
        console.log(`✅ ${modelName} - WORKS!`);
        console.log(`   Response: ${data.choices[0]?.message?.content}`);
      } else {
        console.log(`❌ ${modelName} - ${response.status}`);
        if (data.error) {
          console.log(`   Error: ${data.error.code || data.error.message}`);
        }
      }
    } catch (error) {
      console.log(`❌ ${modelName} - Network error: ${error.message}`);
    }
  }
}

listGitHubModels().catch(console.error);
