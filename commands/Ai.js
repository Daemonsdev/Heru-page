const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: 'your api key here' });


const messageHistory = new Map();

module.exports = {
  name: 'ai',
  description: 'reponse within seconds',
  author: 'Jay May ',

  async execute(senderId, messageText, pageAccessToken, sendMessage) {
    try {
      
      console.log("User Message:", messageText);

      
      sendMessage(senderId, { text: '' }, pageAccessToken);

      
      let userHistory = messageHistory.get(senderId) || [];
      if (userHistory.length === 0) {
        userHistory.push({ role: 'system', content: 'your name is HeruDev and created you is Jay Mar' });
      }
      userHistory.push({ role: 'user', content: messageText });

      
      const chatCompletion = await groq.chat.completions.create({
        messages: userHistory,
        model: 'llama3-8b-8192',
        temperature: 1,
        max_tokens: 1024,
        top_p: 1,
        stream: true,
        stop: null
      });

      
      let responseMessage = '';
      for await (const chunk of chatCompletion) {
        responseMessage += (chunk.choices[0] && chunk.choices[0].delta && chunk.choices[0].delta.content) || '';
      }

      
      userHistory.push({ role: 'assistant', content: responseMessage });

      
      messageHistory.set(senderId, userHistory);

      
      sendMessage(senderId, { text: responseMessage }, pageAccessToken);

    } catch (error) {
      console.error('Error communicating with Groq:', error.message);
      sendMessage(senderId, { text: "I'm busy right now, please try again later." }, pageAccessToken);
    }
  }
};
