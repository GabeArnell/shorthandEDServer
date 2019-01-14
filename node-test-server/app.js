var http = require('http');
var fs = require('fs');
var path = require('path');

/*
node C:\Users\gabrielarnell\node-test-server\app.js
*/
var server = http.createServer(function(req, res){
  console.log('Request was made: ' + req.url);

  let filePath = __dirname+'/public'+req.url;

  switch (req.url) {
    case "/":
      console.log('Returning index page')
      res.writeHead(200,{'Content-Type': 'text/html'});
      fs.createReadStream(__dirname + '/public/index.html').pipe(res);
      break
    case "/favicon.ico":
      console.log("SEARCHING FOR FAVICON");
      res.writeHead(200,{'Content-Type': 'image/x-icon'});
      fs.createReadStream(__dirname + '/public/favicon.ico').pipe(res);
      break
    default:
      console.log('searching for filepath: ' + filePath);

      if (fs.existsSync(filePath)) {
        console.log('Found File');
        // TEXT FILES
        if(path.extname(filePath) === '.css' || path.extname(filePath) === '.html' || path.extname(filePath) === '.js'){
          let fileExtension = path.extname(filePath).slice(1,path.extname(filePath).length);
          console.log('Extension:'+fileExtension);
          res.writeHead(200,{'Content-Type': 'text/'+fileExtension});
          fs.createReadStream(filePath).pipe(res);
        }
        //Images
        if(path.extname(filePath) === '.gif' || path.extname(filePath) === '.png' || path.extname(filePath) === '.jpg'){
          let fileExtension = path.extname(filePath).slice(1,path.extname(filePath).length);
          console.log('Extension:'+fileExtension);
          res.writeHead(200,{'Content-Type': 'image/'+fileExtension});
          fs.createReadStream(filePath).pipe(res);
        }
      }else{
        res.writeHead(404,{'Content-Type': 'text/html'});
        fs.createReadStream(__dirname + '/404.html').pipe(res);
      }

  }
});


server.listen(3000, '127.0.0.1');
console.log('now listening to port 3000');
