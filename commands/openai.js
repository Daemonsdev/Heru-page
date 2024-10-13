const axios = require('axios');

module.exports = {
  name: 'openai',
  description: 'Inteact to OpenAi Assistant',
  author: 'Jay',

  async execute(senderId, args, pageAccessToken, sendMessage) {
    const prompt = args.join(' ');
    if (!prompt) {
      sendMessage(senderId, { text: '🤖 Hey there! I m openai how can i assist you to day?.' }, pageAccessToken);
      return;
    }

    try {
      const apiUrl = `https://tools.betabotz.eu.org/tools/openai?q=${encodeURIComponent(prompt)}`;
      const response = await axios.get(apiUrl);

      const text = response.data.result || 'No response received from OpenAI. Please try again later.';

      sendMessage(senderId, { text }, pageAccessToken);
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      sendMessage(senderId, { text: 'Sorry, there was an error processing your request.' }, pageAccessToken);
    }
  }
};
    
