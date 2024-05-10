require('ts-node').register({ transpileOnly: true, cwd: __dirname });

const { defineConfig } = require('./defineConfig');

module.exports = { defineConfig };
