Discover Yourself
=================

Have you ever wondered, how could your react-native app find out about your dev server, without re-entering your dynamic IP every time? Or how can your self-balancing deadly robot fetch firmware updates over local network from your development machine? Or maybe you want to discover your raspberry pi in every network you connect to?

Well, you should just `discover-yourself`. It's using simple broadcast udp with ssh public key crypto, to make sure it's really you (via `sshpk`).

Somewhere:

```js
const { createListener } = require('discover-yourself');

const listener = createListener({
  publicKeyPath: 'key.pub',
});

listener.on('announcement', ({ tag, port, address }) => {
  console.log('dev server is', `${tag}://${address}:${port}`);
});
```

Somewhere else:

```js
const { createAnnouncer } = require('discover-yourself');

const announcer = createAnnouncer({
  privateKeyPath: 'example.key',
});

announcer.start('http', 8081);
```

Voilà.