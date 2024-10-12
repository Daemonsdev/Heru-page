const fs = require('fs');
const path = require('path');
const { sendMessage } = require('./sendMessage');

const commands = new Map();

const commandFiles = fs.readdirSync(path.join(__dirname, '../commands')).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`../commands/${file}`);
  commands.set(command.name.toLowerCase(), command);
}

async function handleMessage(event, pageAccessToken) {
  const senderId = event.sender.id;
  const messageText = event.message.text ? event.message.text.trim() : null;
  const payload = event.message.quick_reply ? event.message.quick_reply.payload : null;

  // Handle command-based messages
  if (messageText) {
    const args = messageText.split(' ');
    const commandName = args.shift().toLowerCase();

    if (commands.has(commandName)) {
      const command = commands.get(commandName);
      try {
        await command.execute(senderId, args, pageAccessToken, sendMessage);
      } catch (error) {
        console.error(`Error executing command ${commandName}:`, error);
        sendMessage(senderId, { text: 'There was an error executing that command.' }, pageAccessToken);
      }
      return;
    }

    const aiCommand = commands.get('ai');
    if (aiCommand) {
      try {
        await aiCommand.execute(senderId, messageText, pageAccessToken, sendMessage);
      } catch (error) {
        console.error('Error executing Ai command:', error);
        sendMessage(senderId, { text: 'There was an error processing your request.' }, pageAccessToken);
      }
    }
  }

  // Handle payload button interactions
  if (payload) {
    try {
      const payloadArgs = payload.split(' ');
      const payloadCommandName = payloadArgs.shift().toLowerCase();

      if (commands.has(payloadCommandName)) {
        const payloadCommand = commands.get(payloadCommandName);
        await payloadCommand.execute(senderId, payloadArgs, pageAccessToken, sendMessage);
      } else {
        sendMessage(senderId, { text: 'Unknown payload action received.' }, pageAccessToken);
      }
    } catch (error) {
      console.error('Error handling payload button interaction:', error);
      sendMessage(senderId, { text: 'There was an error processing your request.' }, pageAccessToken);
    }
  }
}

module.exports = { handleMessage };
        
