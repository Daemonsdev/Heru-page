const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const axios = require('axios');
const { handleMessage } = require('./handles/handleMessage');
const { handlePostback } = require('./handles/handlePostback');

const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = 'pagebot';
const PAGE_ACCESS_TOKEN = fs.readFileSync('token.txt', 'utf8').trim();

app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

app.post('/webhook', async (req, res) => {
  const body = req.body;

  if (body.object === 'page') {
    for (const entry of body.entry) {
      const webhookEvent = entry.messaging[0];
      const senderId = webhookEvent.sender.id;

      if (webhookEvent.message) {
        handleMessage(webhookEvent, PAGE_ACCESS_TOKEN);
      } else if (webhookEvent.postback) {
        handlePostback(webhookEvent, PAGE_ACCESS_TOKEN);

        // Fix: Handle "GET_STARTED" properly
        if (webhookEvent.postback.payload === "GET_STARTED" || webhookEvent.postback.payload === "GET_STARTED_PAYLOAD") {
          await sendMessage(senderId, { text: "Welcome! How can I assist you today?" }, PAGE_ACCESS_TOKEN);
          await sendQuickReplies(senderId);  // Send quick replies after welcome message
        }
      }
    }
    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

async function sendMessage(senderId, message, pageAccessToken) {
  try {
    await axios.post('https://graph.facebook.com/v13.0/me/messages', {
      recipient: { id: senderId },
      message: message,
    }, {
      params: { access_token: pageAccessToken },
    });
    console.log(`Message sent to ${senderId}`);
  } catch (error) {
    console.error('Error sending message:', error.message);
  }
}

// Quick replies function
async function sendQuickReplies(senderId) {
  const quickReplies = [
    {
      content_type: "text",
      title: "Get Help",
      payload: "GET_HELP",
    },
    {
      content_type: "text",
      title: "Ask AI",
      payload: "ASK_AI",
    },
  ];

  await sendMessage(senderId, {
    text: "What would you like to do?",
    quick_replies: quickReplies,
  }, PAGE_ACCESS_TOKEN);
}

const loadMenuCommands = async () => {
  try {
    const loadCmd = await axios.post(`https://graph.facebook.com/v21.0/me/messenger_profile?access_token=${PAGE_ACCESS_TOKEN}`, {
      commands: [
        {
          locale: "default",
          commands: [
            { name: "ai", description: "Interact with AI models" },
            { name: "boxai", description: "Advanced AI in a box" },
            { name: "deepseek", description: "Deep search AI" },
            { name: "gemini", description: "Gemini AI assistant" },
            { name: "gpt", description: "Chat with GPT-3" },
            { name: "gpt4", description: "Chat with GPT-4" },
            { name: "gpt4o", description: "Optimized GPT-4 version" },
            { name: "guide", description: "Bot usage guide" },
            { name: "luffy", description: "Special AI assistant Luffy" },
            { name: "lyrics", description: "Fetch song lyrics" },
            { name: "mixtral", description: "AI-powered multi-model assistant" },
            { name: "openai", description: "Interact with OpenAI models" },
            { name: "qwen", description: "Qwen AI assistant" },
            { name: "help", description: "Get a list of available commands" },
            { name: "poli", description: "Generate image on Poli Ai" },
            { name: "pinterest", description: "Search image" }
          ]
        }
      ]
    }, {
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (loadCmd.data.result === "success") {
      console.log("Commands loaded!");
    } else {
      console.log("Failed to load commands");
    }
  } catch (error) {
    console.error('Error loading commands:', error);
  }
};

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  loadMenuCommands();
});
      
