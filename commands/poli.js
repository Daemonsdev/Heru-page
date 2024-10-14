const axios = require('axios');
const fs = require('fs-extra');

module.exports = {
  name: 'poli',
  description: 'Generate image from Pollination AI.',
  version: '1.0.0',
  author: 'Jay',

  async execute(senderId, args, pageAccessToken, sendMessage) {
    try {
      const query = args.join(' ');
      const time = new Date();
      const timestamp = time.toISOString().replace(/[:.]/g, '-');
      const path = __dirname + '/cache/' + `${timestamp}_image.png`;

      if (!query) {
        sendMessage(senderId, { text: '🤖 Hi, I am Pollination AI. How can I assist you today?' }, pageAccessToken);
        return;
      }

      sendMessage(senderId, { text: `Searching for ${query}` }, pageAccessToken);

      // Fetch image from Pollination AI
      const response = await axios.get(`https://image.pollinations.ai/prompt/${encodeURIComponent(query)}`, {
        responseType: 'arraybuffer',
      });

      // Save image to local path
      fs.writeFileSync(path, Buffer.from(response.data, 'binary'));

      // Send image to user
      sendMessage(senderId, {
        attachment: {
          type: 'image',
          payload: {
            is_reusable: true,
            url: `file://${path}`
          }
        }
      }, pageAccessToken);

      // Clean up the file after sending
      setTimeout(() => {
        fs.unlinkSync(path);
        console.log('Image file deleted:', path);
      }, 5000);

    } catch (error) {
      console.error('Error generating image:', error);
      sendMessage(senderId, { text: error.message }, pageAccessToken);
    }
  }
};
