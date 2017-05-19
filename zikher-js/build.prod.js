var webpack = require('webpack');
var fse = require('fs-extra');
var clientConfig = require('./webpack.config.prod');



fse.emptyDirSync(__dirname + '/public');
fse.copySync(__dirname + '/index.html', __dirname + '/public/index.html');

//build
webpack(clientConfig, function(err, stats) {
  if(err) {
    console.log("Some error occured while compiling client bundle.");
    console.log(err);
  }
  console.log("Client bundle compiled.");
});
