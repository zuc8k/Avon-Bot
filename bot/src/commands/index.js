const fs = require('fs');
const path = require('path');

module.exports = () => {
  const commands = [];
  const commandsPath = __dirname;

  for (const file of fs.readdirSync(commandsPath)) {
    if (file === 'index.js' || !file.endsWith('.js')) continue;

    const command = require(path.join(commandsPath, file));
    if (command.data && command.execute) {
      commands.push(command);
    }
  }
  return commands;
};