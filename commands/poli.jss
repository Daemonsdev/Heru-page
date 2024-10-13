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

      const response = await axios.get(`https://image.pollinations.ai/prompt/${encodeURIComponent(query)}`, {
        responseType: 'arraybuffer',
      });

      fs.writeFileSync(path, Buffer.from(response.data, 'utf-8'));

      setTimeout(function () {
        sendMessage(senderId, {
          text: 'Download Successfully!',
          attachment: {
            type: 'image',
            payload: {
              is_reusable: true,
              url: path
            }
          }
        }, pageAccessToken, () => fs.unlinkSync(path));
      }, 5000);

    } catch (error) {
      console.error('Error generating image:', error);
      sendMessage(senderId, { text: error.message }, pageAccessToken);
    }
  }
};
