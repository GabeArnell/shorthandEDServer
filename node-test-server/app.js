var http = require('http');
var fs = require('fs');
var path = require('path');

/*
node C:\Users\gabrielarnell\node-test-server\app.js
*/

var nestedClassDataForStudent = {
	classid: 1,
	emojis:[],
};

var testStudentAlphaArray = {
	name:"Albert",
	id:1,
	classes:[nestedClassDataForStudent]
};

var server = http.createServer(function(req, res){
  console.log('Request was made: ' + req.url);
  //API Check
  if (req.url === '/api.json'){
    console.log('Serving API');
    res.writeHead(200,{'Content-Type': 'application/json'});
    res.end(JSON.stringify(testStudentAlphaArray));
  };
  // Returning static web pages/files

  let filePath = __dirname+'/public'+req.url;
  switch (req.url) {
    case "/":
      res.writeHead(200,{'Content-Type': 'text/html'});
      fs.createReadStream(__dirname + '/public/index.html').pipe(res);
      break
    case "/favicon.ico":
      res.writeHead(200,{'Content-Type': 'image/x-icon'});
      fs.createReadStream(__dirname + '/public/favicon.ico').pipe(res);
      break
    default:

      if (fs.existsSync(filePath)) {
        // TEXT FILES
        if(path.extname(filePath) === '.css' || path.extname(filePath) === '.html' || path.extname(filePath) === '.js'){
          let fileExtension = path.extname(filePath).slice(1,path.extname(filePath).length);
          res.writeHead(200,{'Content-Type': 'text/'+fileExtension});
          fs.createReadStream(filePath).pipe(res);
        }
        //Images
        if(path.extname(filePath) === '.gif' || path.extname(filePath) === '.png' || path.extname(filePath) === '.jpg'){
          let fileExtension = path.extname(filePath).slice(1,path.extname(filePath).length);
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

console.log('Opened port: 3000');

// Accessing mysql server

 /* var mysql = require('mysql');

 var con = mysql.createConnection({
	 user: "root",
	 password: "Every time I access this I cry",
	 database: 'testdatabase'
 });

con.connect(function(err){
	 if (err) throw err;
	 console.log('hAcKeR voIcE: iM In!')
});
*/
