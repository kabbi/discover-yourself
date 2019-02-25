const { createAnnouncer } = require('..');

const announcer = createAnnouncer({
  privateKeyPath: 'example.key',
});

const [tag, port] = process.argv.slice(2);
announcer.start(tag, port);
