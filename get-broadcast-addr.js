const os = require('os');

const allInterfaces = os.networkInterfaces();

module.exports = (int = 'en1', address) => {
  if (!allInterfaces[int]) {
    throw new Error(`Unknown network interface (${int}).`);
  }

  let info;
  if (address) {
    info = allInterfaces[int].find(e => e.address === address);
  } else {
    info = allInterfaces[int].find(e => e.family === 'IPv4');
  }

  if (!info) {
    throw new Error('No address info found. Specify a valid address');
  }

  const addr_splitted = info.address.split('.');
  const netmask_splitted = info.netmask.split('.');

  // Bitwise OR over the splitted NAND netmask, then glue them back together with a dot character to form an ip
  // we have to do a NAND operation because of the 2-complements; getting rid of all the 'prepended' 1's with & 0xFF

  return addr_splitted
    .map((e, i) => (~netmask_splitted[i] & 0xff) | e)
    .join('.');
};
