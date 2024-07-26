const fs = require('fs/promises');

(async () => {
  const commandFilePath = './command.txt';
  const commandFileHandler = await fs.open(commandFilePath, 'r');
  const watcher = await fs.watch(commandFilePath);

  for await (const event of watcher) {
    if (event.eventType === 'change') {
      console.log('File changed');

      const size = (await commandFileHandler.stat()).size;
      const buff = Buffer.alloc(size);
      const offset = 0;
      const length = buff.byteLength;
      const position = 0; // always read from the first character

      const content = await commandFileHandler.read(buff, offset, length, position);
      console.log(content);
    }
  }
})();