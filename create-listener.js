const { EventEmitter } = require('events');
const dgram = require('dgram');
const sshpk = require('sshpk');
const fs = require('fs');

const DefaultOptions = {
  ignoreUnverified: true,
  port: 12394,
};

class Listener extends EventEmitter {
  constructor(options) {
    super();
    this.options = {
      ...DefaultOptions,
      ...options,
    };
    this.client = dgram.createSocket('udp4');
    this.client.on('listening', () => {
      this.client.setBroadcast(true);
      this.emit('listening', this.client);
    });
    this.client.on('message', (msg, rinfo) => {
      this.handleIncoming(msg, rinfo);
    });
    this.start();
  }

  start() {
    this.client.bind(this.options.port);
  }

  close() {
    this.client.close();
  }

  handleIncoming(msg, rinfo) {
    const parts = msg.toString().split(':');
    if (parts.length !== 3) {
      return;
    }
    const [tag, port, signature] = parts;
    const data = Buffer.from([tag, port].join(':'));
    const verifier = this.options.publicKey.createVerify('sha1');
    verifier.update(data);
    if (!verifier.verify(signature, 'base64')) {
      return;
    }
    this.emit('announcement', {
      address: rinfo.address,
      port,
      tag,
    });
  }
}

module.exports = options => {
  const expandedOptions = { ...options };
  if (!options.publicKey && !options.publicKeyPath) {
    throw new Error('You must specify either `publicKey` or `publicKeyPath`');
  }
  if (options.publicKeyPath) {
    const publicKeyData = fs.readFileSync(options.publicKeyPath);
    expandedOptions.publicKey = sshpk.parseKey(publicKeyData, 'ssh');
  }
  return new Listener(expandedOptions);
};
