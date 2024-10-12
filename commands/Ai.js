const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: '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' });

const messageHistory = new Map();
const maxMessageLength = 2000;

// Function to split a message into chunks of specified length
function splitMessageIntoChunks(text, maxLength) {
  const messages = [];
  for (let i = 0; i < text.length; i += maxLength) {
    messages.push(text.slice(i, i + maxLength));
  }
  return messages;
}

module.exports = {
  name: 'ai',
  description: 'response within seconds',
  author: 'Jay',

  async execute(senderId, messageText, pageAccessToken, sendMessage) {
    try {
      console.log("User Message:", messageText);

      // Send an empty message to indicate processing
      sendMessage(senderId, { text: '' }, pageAccessToken);

      let userHistory = messageHistory.get(senderId) || [];
      if (userHistory.length === 0) {
        userHistory.push({ role: 'system', content: 'Your name is HeruDev, created by Jay Mar.' });
      }
      userHistory.push({ role: 'user', content: messageText });

      const chatCompletion = await groq.chat.completions.create({
        messages: userHistory,
        model: 'llama3-8b-8192',
        temperature: 1,
        max_tokens: 1025, // You can increase this limit if necessary
        top_p: 1,
        stream: true,
        stop: null
      });

      let responseMessage = '';
      
      for await (const chunk of chatCompletion) {
        const chunkContent = chunk.choices[0]?.delta?.content || '';
        responseMessage += chunkContent; // Compile the complete response
        
        // Check if the current response message exceeds the max length
        if (responseMessage.length >= maxMessageLength) {
          const messages = splitMessageIntoChunks(responseMessage, maxMessageLength);
          for (const message of messages) {
            sendMessage(senderId, { text: message }, pageAccessToken); // Send each chunk
          }
          responseMessage = ''; // Reset responseMessage after sending
        }
      }

      // Log the raw response from the API
      console.log("Raw API Response:", responseMessage);

      // Append the guide message to the final response
      const guideMessage = `\n\n◉ Guide: type "/help" to see all commands, Please follow my developer\n◉ Facebook: https://www.facebook.com/jaymar.dev.00`;

      // Send any remaining part of the response with the guide message included
      if (responseMessage) {
        responseMessage += guideMessage;
        userHistory.push({ role: 'assistant', content: responseMessage });
        messageHistory.set(senderId, userHistory);

        const finalMessages = splitMessageIntoChunks(responseMessage, maxMessageLength);
        for (const message of finalMessages) {
          sendMessage(senderId, { text: message }, pageAccessToken); // Send each chunk
        }
      } else {
        throw new Error("Received empty response from Groq.");
      }

    } catch (error) {
      console.error('Error communicating with Groq:', error.message);
      sendMessage(senderId, { text: "I'm busy right now, please try again later." }, pageAccessToken);
    }
  }
};
          
