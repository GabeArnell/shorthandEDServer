const http = require('http');
const fs = require('fs-extra');
const path = require('path');

/*
node C:\Users\gabrielarnell\node-test-server\app.js
*/


function returnDefaultData(name){
	var testClass = {
		name:"Test Class",
		studentids:[1],
		classid:0,
	};
	var nestedClassDataForStudent = {
		classid: 0,
		emojis:[],
	};

	var testStudentAlphaArray = {
		name:"Albert",
		id:1,
		classes:[nestedClassDataForStudent]
	};

	let RegisteredStudents = [testStudentAlphaArray];
	let RegisteredClasses = [testClass];

	return([RegisteredStudents, RegisteredClasses]);
}


// API
function createNewUserData(name){
	console.log('CREATING NEW DATA FOR: '+name);

	let dataPath = __dirname+'/data';
	let dataFolderName = dataPath+'/'+name;
	if (fs.existsSync(dataFolderName)){
		console.log("DATA ALREADY EXISTS");
		fs.removeSync(dataFolderName);
		console.log("Removed previous data folder");
	};

	console.log("Making new folder");
	fs.mkdirSync(dataFolderName);
	var newDefaultData =  returnDefaultData(name);
	var RegisteredStudents = newDefaultData[0], RegisteredClasses = newDefaultData[1];
	// Creating sub directories for data and profile information of user

	fs.mkdirSync(dataFolderName+'/data');
	fs.mkdirSync(dataFolderName+'/profile');

	var strRegStudents = JSON.stringify(RegisteredStudents);
	var strRegClasses = JSON.stringify(RegisteredClasses);


	fs.appendFile(dataFolderName +'/data' + '/RegisteredStudents.txt', strRegStudents, function (err) {
	  if (err) throw err;
	  console.log('Saved RegisteredStudents');
	});

	fs.appendFile(dataFolderName +'/data' + '/RegisteredClasses.txt', strRegClasses, function (err) {
		if (err) throw err;
		console.log('Saved RegisteredClasses');
	});

	return(newDefaultData);


}

function giveStudentEmoji(datapacket){
 	datapacket = decodeURIComponent(datapacket);
	datapacket = JSON.parse(datapacket);

	let dataPath = __dirname+'/data'+'/'+datapacket.username+'/data/RegisteredStudents.txt';
	if (fs.existsSync(dataPath)){
		var strRegStudents = fs.readFileSync(__dirname+'/data'+'/'+datapacket.username+'/data/RegisteredStudents.txt');
		var jsonRegStudents = JSON.parse(strRegStudents);

		var targetStudent;
		for (let i =0;i<jsonRegStudents.length;i++){
			let indexedStudent = jsonRegStudents[i];
			if (indexedStudent.id === datapacket.studentid){
				targetStudent = indexedStudent;
			}
		}

		if(targetStudent != null){
			for (let i =0;i<targetStudent.classes.length;i++){
				let indexedClass = targetStudent.classes[i];
				if (indexedClass.classid === datapacket.classid){
					targetStudent.classes[i].emojis.push(datapacket.emojidata);

					// Writing new data to
					fs.writeFile(dataPath, JSON.stringify(jsonRegStudents), function(err) {
				    if(err) {
				        return console.log(err);
				    }

						return({result: 'success'});
				});

				return({result: 'failure'});
				}
			}
		}
		return({result: 'failure'});
	}else{
		return({result: 'failure'});
	}

}

function runAPIRequest(apiRequest){
	console.log('received: ' + apiRequest);
	if (apiRequest.substring(0,18) ==='createNewUserData-'){
		return(createNewUserData(apiRequest.substring(18,apiRequest.length)));
	}
	if (apiRequest.substring(0,19) ==='pushEmojiToStudent-'){
		return(giveStudentEmoji(apiRequest.substring(19,apiRequest.length)));
	}
}


var server = http.createServer(function(req, res){
  console.log('Request was made: ' + req.url);
  //API Check, responseData always JSON
  if (req.url.substring(1,4) === 'api'){
    var responseData = runAPIRequest((req.url.substring(5,req.url.length)));
		res.writeHead(200,{'Content-Type': 'text/plain'});
		res.write(JSON.stringify(responseData));
		res.end();
  }

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


server.listen(80, '127.0.0.1');

console.log('Opened port: 80');
