const path = require('path');

module.exports = {
  entry: './conection/conexao.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  mode: 'development'
};
