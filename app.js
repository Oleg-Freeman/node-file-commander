const fs = require('fs/promises');

(async () => {
  const createFile = async (path) => {
    try {
      const existingFileHandler = await fs.open(path, 'r');
      await existingFileHandler.close();
      // If there is no error - file already exists
      return console.log(`File already exists at ${path}`)
    } catch (error) {
      const newFileHandler = await fs.open(path, 'w');
      console.log(`File created at ${path}`);
      await newFileHandler.close();
    }
  };
  const commands = {
    CREATE_FILE: 'create file',
  };
  const commandFilePath = './command.txt';
  const commandFileHandler = await fs.open(commandFilePath, 'r');

  commandFileHandler.on('change', async () => {
    const size = (await commandFileHandler.stat()).size;
    const buff = Buffer.alloc(size);
    const offset = 0; // the location at which we want to start filling our buffer
    const length = buff.byteLength; // How many bytes we want to read
    const position = 0; // always read from the first character

    await commandFileHandler.read(buff, offset, length, position);
    const command = buff.toString('utf-8');

    if (command.includes(commands.CREATE_FILE)) {
      const filePath = command.substring(commands.CREATE_FILE.length + 1);

      await createFile(filePath);
    }
  })

  const watcher = await fs.watch(commandFilePath);

  for await (const event of watcher) {
    if (event.eventType === 'change') {
      commandFileHandler.emit('change');
    }
  }
})();