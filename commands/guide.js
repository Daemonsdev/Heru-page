const axios = require('axios');

module.exports = {
  name: 'guide',
  description: 'Show a guide on how to use the bot, handle errors, and provide buttons for interaction.',
  author: 'Jay',

  async execute(senderId, args, pageAccessToken, sendMessage) {
    try {
      const guideText = `🌟 Welcome to the User Guide! This bot is designed to assist you with various tasks and engage in conversations. Here’s how to make the most of it:
      
1. Commands: To interact with the bot, simply type a command followed by your query. For example, type 'luffy your query' to get a response from AI.
2. Clear Conversation: If you wish to clear the conversation history at any time, just type 'clear', and the conversation will be reset.
3. Error Handling: In the event of an error during processing, the bot will promptly notify you with an error message and the api or cause of ddos attack.
4. Help: If you need further assistance, just type 'help' to receive guidance on available commands and features.
5. Cool Features: This bot offers a range of functionalities, including conversational AI, image generation, and much more!
6. If PageBot not replying to your message Please try question again if not maybe maintenance.

How can I assist you today? Designed by Heru.`;

      const buttons = [
        {
          type: 'postback',
          title: 'Learn More',
          payload: 'LEARN_MORE_PAYLOAD'
        },
        {
          type: 'postback',
          title: 'Clear Conversation',
          payload: 'CLEAR_CONVERSATION_PAYLOAD'
        }
      ];

      sendMessage(senderId, {
        text: guideText,
        buttons
      }, pageAccessToken);

    } catch (error) {
      console.error('Error in guide command:', error);
      sendMessage(senderId, { text: '⚠️ Sorry, there was an error showing the guide. Please try again later.' }, pageAccessToken);
    }
  }
};
