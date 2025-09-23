module.exports = {
  apps : [{
    name: 'my-fresh-app', // The same name as before
    script: 'server.js',
    cwd: '/var/www/FOXNET/', // The crucial setting
    watch: false, // We are restarting manually on deploy
    env: {
      NODE_ENV: 'production',
    }
  }]
};
