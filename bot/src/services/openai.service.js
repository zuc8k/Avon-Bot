const OpenAI = require('openai');
const config = require('../config/openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function askGPT(prompt) {
  const response = await openai.chat.completions.create({
    model: config.model,
    messages: [
      {
        role: 'system',
        content: 'You are AVON GPT. You understand Arabic and Egyptian dialect very well.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: config.temperature,
    max_tokens: config.maxTokens
  });

  return response.choices[0].message.content;
}

module.exports = { askGPT };