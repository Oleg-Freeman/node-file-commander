const fs = require('fs/promises');

(async () => {
  const watcher = await fs.watch('./command.txt');

  for await (const event of watcher) {
    if (event.eventType === 'change') {
      console.log('File changed');
    }
  }
})();