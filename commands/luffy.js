const axios = require('axios');

module.exports = {
  name: 'luffy',
  description: 'Conversational AI with Luffy model',
  author: 'Jay',

  async execute(senderId, args, pageAccessToken, sendMessage, clearConversation) {
    const command = args.join(' ').trim().toLowerCase();

    // Check for 'clear' command to clear conversation
    if (command === 'clear') {
      try {
        clearConversation(senderId);
        sendMessage(senderId, { text: '🌟 Conversation history cleared!' }, pageAccessToken);
      } catch (error) {
        console.error('Error clearing conversation:', error);
        sendMessage(senderId, { text: 'Sorry, there was an error clearing the conversation.' }, pageAccessToken);
      }
      return;
    }

    const prompt = args.join(' ');
    if (!prompt) {
      sendMessage(senderId, { text: '🌟 Hello, I\'m Luffy im gonna king of pirate!. How may I assist you today?' }, pageAccessToken);
      return;
    }

    try {
      const apiUrl = `https://deku-rest-apis.ooguy.com/pai/luffy?q=${encodeURIComponent(prompt)}&uid=${senderId}`;
      const response = await axios.get(apiUrl);

      const text = response.data.result || 'No response received from Luffy. Please try again later.';

      sendMessage(senderId, { text }, pageAccessToken);

    } catch (error) {
      console.error('Error calling Luffy API:', error);
      sendMessage(senderId, { text: 'Sorry, there was an error processing your request.' }, pageAccessToken);
    }
  }
};
        
