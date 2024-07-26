const fs = require('fs/promises');

(async () => {
  const commandFilePath = './command.txt';
  const commandFileHandler = await fs.open(commandFilePath, 'r');

  commandFileHandler.on('change', async () => {
    const size = (await commandFileHandler.stat()).size;
    const buff = Buffer.alloc(size);
    const offset = 0; // the location at which we want to start filling our buffer
    const length = buff.byteLength; // How many bytes we want to read
    const position = 0; // always read from the first character

    const content = await commandFileHandler.read(buff, offset, length, position);
    console.log(buff.toString('utf-8'));
  })

  const watcher = await fs.watch(commandFilePath);

  for await (const event of watcher) {
    if (event.eventType === 'change') {
      commandFileHandler.emit('change');
    }
  }
})();