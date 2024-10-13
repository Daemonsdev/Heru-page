const axios = require('axios');

module.exports = {
  name: 'gpt4',
  description: 'Interact with GPT-4 Model Assist',
  author: 'Jay',

  async execute(senderId, args, pageAccessToken, sendMessage) {
    const prompt = args.join(' ');
    if (!prompt) {
      sendMessage(senderId, { text: '🌟 Hello, I\'m GPT-4. How may I assist you today?' }, pageAccessToken);
      return;
    }

    try {
      const apiUrl = `https://markdevs69.vercel.app/api/v2/gpt4?query=${encodeURIComponent(prompt)}`;
      const response = await axios.get(apiUrl);

      const text = response.data.respond || 'No response received from GPT-4. Please try again later.';

      sendMessage(senderId, { text }, pageAccessToken);
    } catch (error) {
      console.error('Error calling GPT-4 API:', error);
      sendMessage(senderId, { text: 'Sorry, there was an error processing your request.' }, pageAccessToken);
    }
  }
};
