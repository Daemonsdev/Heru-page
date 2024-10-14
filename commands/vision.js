const axios = require('axios');

module.exports = {
  name: 'vision',
  description: 'Can recognize the photo',
  author: 'Jay',

  async execute(senderId, args, pageAccessToken, sendMessage) {
    const prompt = args.slice(0, -1).join(' ');
    const imageUrl = args[args.length - 1];

    if (!prompt || !imageUrl) {
      sendMessage(senderId, { text: '🌟 Please provide a prompt and image to recognize.' }, pageAccessToken);
      return;
    }

    try {
      const apiUrl = `https://www.geo-sevent-tooldph.site/api/llamavision?prompt=${encodeURIComponent(prompt)}&imageUrl=${encodeURIComponent(imageUrl)}`;
      const response = await axios.get(apiUrl);

      const text = response.data.response || 'No recognition result from LlamaVision. Please try again later.';

      sendMessage(senderId, { text: `🔍 Recognition result for the image: ${text}` }, pageAccessToken);

    } catch (error) {
      console.error('Error calling LlamaVision API:', error);
      sendMessage(senderId, { text: 'Sorry, there was an error processing your request.' }, pageAccessToken);
    }
  }
};
        
