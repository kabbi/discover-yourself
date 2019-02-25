const { createListener } = require('..');

const listener = createListener({
  publicKeyPath: 'example.key.pub',
});

listener.on('listening', client => {
  const { address, port } = client.address();
  console.log('-', 'listening', `udp://${address}:${port}`);
});

listener.on('announcement', ({ tag, port, address }) => {
  console.log('+', `${tag}://${address}:${port}`);
});
