const { EventEmitter } = require('events');
const dgram = require('dgram');
const sshpk = require('sshpk');
const fs = require('fs');

const getBroadcastAddr = require('./get-broadcast-addr');

const DefaultOptions = {
  interval: 60000,
  port: 12394,
};

class Announcer extends EventEmitter {
  constructor(options) {
    super();
    this.options = {
      ...DefaultOptions,
      ...options,
    };
    this.server = dgram.createSocket('udp4');
  }

  start(tag, port) {
    this.server.bind(() => {
      this.server.setBroadcast(true);
      setInterval(
        () => this.sendAnnouncement(tag, port),
        this.options.interval,
      );
      this.sendAnnouncement(tag, port);
    });
  }

  close() {
    this.server.close();
  }

  sendAnnouncement(tag, port) {
    const { privateKey, address, port } = this.options;

    const data = Buffer.from(`${tag}:${port}`);
    const signer = privateKey.createSign('sha1');
    signer.update(data);
    const signature = signer.sign().toBuffer();

    const message = Buffer.concat([
      data,
      Buffer.from(`:${signature.toString('base64')}`),
    ]);

    this.server.send(message, 0, message.length, port, address);
  }
}

module.exports = options => {
  const expandedOptions = { ...options };
  if (!options.privateKey && !options.privateKeyPath) {
    throw new Error('You must specify either `privateKey` or `privateKeyPath`');
  }
  if (options.privateKeyPath) {
    const privateKeyData = fs.readFileSync(options.privateKeyPath);
    expandedOptions.privateKey = sshpk.parsePrivateKey(privateKeyData, 'pem');
  }
  expandedOptions.address = getBroadcastAddr();
  return new Announcer(expandedOptions);
};
