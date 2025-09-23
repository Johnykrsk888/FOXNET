module.exports = {
  apps : [{
    name: 'my-fresh-app',
    script: 'server.js',
    cwd: '/var/www/FOXNET/',
    watch: false,
    env: {
      NODE_ENV: 'production',
    }
  }]
};