const axios = require('axios');

module.exports = {
  name: 'gpt3',
  description: 'Interact to various model GPT-3.5 Turbo Assist',
  author: 'Jay',

  async execute(senderId, args, pageAccessToken, sendMessage) {
    const prompt = args.join(' ');
    if (!prompt) {
      sendMessage(senderId, { text: '🌟 Hello im GPT-3.5 turbo, How may I assist you today?' }, pageAccessToken);
      return;
    }

    try {
      const apiUrl = `https://deku-rest-apis.ooguy.com/new/gpt-3_5-turbo?prompt=${encodeURIComponent(prompt)}`;
      const response = await axios.get(apiUrl);

      const text = response.data.result || 'No response received from GPT-3.5 Turbo. Please try again later.';

      sendMessage(senderId, { text }, pageAccessToken);
    } catch (error) {
      console.error('Error calling GPT-3.5 Turbo API:', error);
      sendMessage(senderId, { text: 'Sorry, there was an error processing your request.' }, pageAccessToken);
    }
  }
};
                  
