
// use this for prod ssr

export const environment = {
  production: true,
  hmr: false,
  host: 'peerbuds.com',
  apiUrl: 'https://peerbuds.com:3000',
  searchUrl: 'https://peerbuds.com:4000',
  clientUrl: 'https://peerbuds.com',
  one0xUrl: 'https://protocol.peerbuds.com/v1',
  uniqueDeveloperCode: 'dev',
  stripeClientId: 'ca_AlhagrA2ZiFcVY4JdezzWre4sjxAmat8',
  stripePublishableKey: 'pk_live_ENfRpF7KnjQPBrDxBxcDeoii',
  karmaRate: 1000
};

// use this for dev ssr

// export const environment = {
//   production: true,
//   hmr: false,
//   host: 'localhost',
//   apiUrl: 'http://localhost:3000',
//   searchUrl: 'https://localhost:4000',
//   clientUrl: 'http://localhost:8080',
//   one0xUrl: 'http://localhost:5000/v1',
//   uniqueDeveloperCode: 'aakash',
//   stripeClientId: 'ca_AlhauL6d5gJ66yM3RaXBHIwt0R8qeb9q',
//   stripePublishableKey: 'pk_test_i9RmJ8HN4UygSzCchZMEGgwn',
//   karmaRate: 1000
// };
