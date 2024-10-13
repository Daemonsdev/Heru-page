const axios = require('axios');

module.exports = {
  name: 'gpt',
  description: 'Ask a question to GPT model',
  author: 'System',
  
  async execute(senderId, args, pageAccessToken, sendMessage) {
    const prompt = args.join(' ').trim();
    if (!prompt) {
      sendMessage(senderId, { text: '🌟 Hello there! I m you virtual assistant, how can i assist you today?.' }, pageAccessToken);
      return;
    }

    try {
      const apiUrl = `https://rest-api-production-5054.up.railway.app/gpt4om?prompt=${encodeURIComponent(prompt)}&uid=${senderId}`;
      const response = await axios.get(apiUrl);

      const text = response.data.message || 'Sorry, no valid response was received from GPT-4 API.';
      const maxMessageLength = 2000;

      if (text.length > maxMessageLength) {
        const messages = splitMessageIntoChunks(text, maxMessageLength);
        for (const message of messages) {
          sendMessage(senderId, { text: message }, pageAccessToken);
        }
      } else {
        sendMessage(senderId, { text }, pageAccessToken);
      }
    } catch (error) {
      console.error('Error calling GPT-4 API:', error);
      sendMessage(senderId, { text: 'Sorry, there was an error processing your request.' }, pageAccessToken);
    }
  }
};

function splitMessageIntoChunks(message, chunkSize) {
  const chunks = [];
  for (let i = 0; i < message.length; i += chunkSize) {
    chunks.push(message.slice(i, i + chunkSize));
  }
  return chunks;
          }
  
