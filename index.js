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

app.post('/webhook', (req, res) => {
  const body = req.body;

  if (body.object === 'page') {
    body.entry.forEach(entry => {
      entry.messaging.forEach(event => {
        if (event.message) {
          handleMessage(event, PAGE_ACCESS_TOKEN);
        } else if (event.postback) {
          handlePostback(event, PAGE_ACCESS_TOKEN);

          // Handle the specific postback event for "GET_STARTED"
          if (event.postback.payload === "GET_STARTED") {
            axios.post(`https://graph.facebook.com/v11.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
              recipient: { id: event.sender.id },
              message: { text: "Welcome" }
            }).then(response => {
              console.log('Welcome message sent:', response.data);
            }).catch(error => {
              console.error('Error sending welcome message:', error);
            });
          }
        }
      });
    });

    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

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
            { name: "contact", description: "Contact the owner for assistance" }
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

const sendContactMessage = (senderId) => {
  const messageData = {
    attachment: {
      type: 'template',
      payload: {
        template_type: 'button',
        text: `Any problem or encounter errors please contact admin to Facebook, if command not working please use another command. This is for educational purposes only. Thank you!`,
        buttons: [
          {
            type: 'web_url',
            url: `https://www.facebook.com/jaymar.dev.00`,
            title: 'Contact Owner'
          }
        ]
      }
    }
  };

  axios.post(`https://graph.facebook.com/v11.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
    recipient: { id: senderId },
    message: messageData
  }).then(response => {
    console.log('Contact message sent:', response.data);
  }).catch(error => {
    console.error('Error sending contact message:', error);
  });
};

app.listen(3000, () => {
  console.log(`Server is running on port ${PORT}`);
  loadMenuCommands();
});
