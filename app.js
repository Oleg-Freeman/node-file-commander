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
  const deleteFile = async (path) => {
    try {
      await fs.unlink(path);
      console.log(`Deleted file at ${path}`);
    } catch (error) {
      console.log(`File does not exist at ${path}`);
    }
  };
  const renameFile = async (oldPath, newPath) => {
    try {
      await fs.rename(oldPath, newPath);
      console.log(`Renamed ${oldPath} to ${newPath}`)
    } catch (error) {
      console.log(`File does not exist at ${oldPath}`)
    }
  };
  const addToFile = async (path, data) => {
    try {
      const existingFileHandler = await fs.open(path, 'a');
      await existingFileHandler.appendFile(data);
      await existingFileHandler.close();
      console.log(`Added to ${path} content: ${data}`);
    } catch (error) {
        console.log(`File does not exist at ${path}`);
    }
  };

  const commands = {
    CREATE_FILE: 'create file',
    DELETE_FILE: 'delete file',
    RENAME_FILE: 'rename file',
    ADD_TO_FILE: 'add to file',
  };
  const commandFilePath = './command.txt';
  let commandFileHandler;

  try {
    commandFileHandler = await fs.open(commandFilePath, 'r');
  } catch (error) {
    await fs.writeFile(commandFilePath, '');
    console.log('Command file created');

    commandFileHandler = await fs.open(commandFilePath, 'r');
  }

  commandFileHandler.on('change', async () => {
    const size = (await commandFileHandler.stat()).size;
    const buff = Buffer.alloc(size);
    const offset = 0; // the location at which we want to start filling our buffer
    const length = buff.byteLength; // How many bytes we want to read
    const position = 0; // always read from the first character

    await commandFileHandler.read(buff, offset, length, position);
    const command = buff.toString('utf-8');

    // create file <path>
    if (command.includes(commands.CREATE_FILE)) {
      const filePath = command.substring(commands.CREATE_FILE.length + 1);

      await createFile(filePath);
    }

    // delete file <path>
    if (command.includes(commands.DELETE_FILE)) {
        const filePath = command.substring(commands.DELETE_FILE.length + 1);

        await deleteFile(filePath);
    }

    // rename file <oldPath> <newPath>
    if (command.includes(commands.RENAME_FILE)) {
        const _idx = command.indexOf(' to ');
        const oldFilePath = command.substring(commands.RENAME_FILE.length + 1, _idx);
        const newFilePath = command.substring(_idx + 4);

        await renameFile(oldFilePath, newFilePath);
    }

    // add to file <path> this content: <content>
    if (command.includes(commands.ADD_TO_FILE)) {
        const _idx = command.indexOf(' this content: ');
        const filePath = command.substring(commands.ADD_TO_FILE.length + 1, _idx);
        const content = command.substring(_idx + 15);

        await addToFile(filePath, content);
    }
  })

  const watcher = await fs.watch(commandFilePath);

  for await (const event of watcher) {
    if (event.eventType === 'change') {
      commandFileHandler.emit('change');
    }
  }
})();