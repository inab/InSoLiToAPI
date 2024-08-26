const express = require('express');
const path = require('path');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackConfig = require('./webpack.config.js');
const fs = require('fs');

const app = express();
const port = 3000;

const compiler = webpack(webpackConfig);

app.use(
  webpackDevMiddleware(compiler, {
    publicPath: webpackConfig.output.publicPath,
  })
);

// Route to handle the GET request and serve the page
app.get('/openebench', (req, res) => {
  res.sendFile(path.join(__dirname,'dist', 'index.html'));
});

// Route to handle the GET request and serve the page
app.get('/listTools', (req, res) => {
  fs.readFile(path.join(__dirname, 'data', 'ToolTopicAutocomplete.json'), 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to read names file' });
    }

    let names = JSON.parse(data);
    const hasTags = 'false';

    names = names.filter( name =>{
      const hasList = Array.isArray(name.labelnode);
      return hasTags ? hasList : !hasList;
    });

      if (req.query.skip) {
        const skip = parseInt(req.query.skip, 10);
        if (!isNaN(skip) && skip > 0) {
          names = names.slice(skip);
        }
      }

    if (req.query.limit) {
      const limit = parseInt(req.query.limit, 10);
      if (!isNaN(limit) && limit > 0) {
        names = names.slice(0, limit);
      }
    }


    res.json(names);
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
