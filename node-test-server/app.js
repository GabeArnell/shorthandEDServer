const http = require("http");
const fs = require("fs-extra");
const path = require("path");

/*
node C:\Users\gabrielarnell\node-test-server\app.js
*/


function returnDefaultData(name){
	/*
	var testClass = {
		name:"Test Class",
		studentids:[],
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
	};*/

	let RegisteredStudents = [];
	let RegisteredClasses = [];

	return([RegisteredStudents, RegisteredClasses]);
}


// API
function createNewUserData(name){
	console.log("CREATING NEW DATA FOR: "+name);

	let dataFolderName = 	 __dirname+"/data"+"/"+name;
	if (fs.existsSync(dataFolderName)){
		console.log("Data already exists; returning current data");
		//fs.removeSync(dataFolderName);
		var strRegStudents = fs.readFileSync(dataFolderName+"/data/RegisteredStudents.txt");
		var jsonRegStudents = JSON.parse(strRegStudents);

		var strRegClasses = fs.readFileSync(dataFolderName+"/data/RegisteredClasses.txt");
		var jsonRegClasses = JSON.parse(strRegClasses);
		console.log('returning old data');

		return([jsonRegStudents,jsonRegClasses]);
	};

	console.log("Making new folder");
	fs.mkdirSync(dataFolderName);
	var newDefaultData =  returnDefaultData(name);
	var RegisteredStudents = newDefaultData[0], RegisteredClasses = newDefaultData[1];
	// Creating sub directories for data and profile information of user

	fs.mkdirSync(dataFolderName+"/data");
	fs.mkdirSync(dataFolderName+"/profile");

	var strRegStudents = JSON.stringify(RegisteredStudents);
	var strRegClasses = JSON.stringify(RegisteredClasses);


	fs.appendFileSync(dataFolderName +"/data" + "/RegisteredStudents.txt", strRegStudents, function (err) {
	  if (err) throw err;
	  console.log("Saved RegisteredStudents");
	});

	fs.appendFileSync(dataFolderName +"/data" + "/RegisteredClasses.txt", strRegClasses, function (err) {
		if (err) throw err;
		console.log("Saved RegisteredClasses");
	});

	return(newDefaultData);


}

function giveStudentEmoji(datapacket){
 	datapacket = decodeURIComponent(datapacket);
	datapacket = JSON.parse(datapacket);

	let dataPath = __dirname+"/data"+"/"+datapacket.username+"/data/RegisteredStudents.txt";
	if (fs.existsSync(dataPath)){
		var strRegStudents = fs.readFileSync(__dirname+"/data"+"/"+datapacket.username+"/data/RegisteredStudents.txt");
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

						return({result: "success"});
				});

				return({result: "failure"});
				}
			}
		}
		return({result: "failure"});
	}else{
		return({result: "failure"});
	}

}

function createStudentData(datap){
	/* Datapacket format
	{
		name: string,
		studentname: string,
		classes: [int classId,int classId...],
	}
	classes can be empty
	*/
var newdata = datap.split("+");
	var datapaco = {
		name: newdata[1],
		studentname: newdata[0],
		classes: [0],
	}
	var datapacket= JSON.stringify(datapaco);
	datapacket = decodeURIComponent(datapacket);
	datapacket = JSON.parse(datapacket);
	let dataFolderName = 	 __dirname+"/data"+"/"+datapacket.name;
	if (fs.existsSync(dataFolderName+"/data/RegisteredStudents.txt")){
		var strRegStudents = fs.readFileSync(dataFolderName+"/data/RegisteredStudents.txt");
	 	var jsonRegStudents = JSON.parse(strRegStudents);
		console.log(jsonRegStudents);
		var studentData = {
			name: datapacket.studentname,
			id: jsonRegStudents.length,
			classes: [],
		}
		// Adding nestedClassData in students if any were there
		for (let i = 0; i< datapacket.classes.length; i++){
			var nestedClassData = {
				classid: datapacket.classes[i],
				emojis: []
			}
			studentData.classes.push(nestedClassData);
		}
		// Saving New Student Directory Data
		jsonRegStudents.push(studentData);
		strRegStudents = JSON.stringify(jsonRegStudents);


		fs.writeFileSync(dataFolderName +"/data" + "/RegisteredStudents.txt", strRegStudents, function (err) {
		  if (err) throw err;
		});
		// Adding student to classes if any were added
		var strRegClasses = fs.readFileSync(dataFolderName+"/data/RegisteredClasses.txt");
	 	var jsonRegClasses = JSON.parse(strRegClasses);

		for (let i = 0; i< datapacket.classes.length; i++){
			var classData = jsonRegClasses[datapacket.classes[i]]
			if (classData){
				classData.studentids.push(studentData.id);
			}
		}

		strRegClasses = JSON.stringify(jsonRegClasses);

		fs.writeFileSync(dataFolderName +"/data" + "/RegisteredClasses.txt", strRegClasses, function (err) {
			if (err) throw err;
		});

		console.log(datapacket.name+' created new student: '+datapacket.studentname);
	}else{

		console.log('could not find data for: '+datapacket.name);
	}
}
function createClassData(datapacket){
	/* Datapacket format
	{
		name: string,
		className: string,
		addedStudents: [int studnetid,int studentid...],
	}
	classes can be empty
	*/
	datapacket = decodeURIComponent(datapacket);
	datapacket = JSON.parse(datapacket);
	let dataFolderName = 	 __dirname+"/data"+"/"+datapacket.name;
	if (fs.existsSync(dataFolderName+"/data/RegisteredClasses.txt")){
		var strRegStudents = fs.readFileSync(dataFolderName+"/data/RegisteredStudents.txt");
	 	var jsonRegStudents = JSON.parse(strRegStudents);

		var strRegClasses = fs.readFileSync(dataFolderName+"/data/RegisteredClasses.txt");
		var jsonRegClasses = JSON.parse(strRegClasses);
		if (jsonRegClasses.length >= maximumClassesPerUser){
			return({result: "failure", msg: "Too many classes"});
		}
		var classData = {
			name: datapacket.classname,
			studentids: datapacket.addedStudents,
			classid: jsonRegClasses.length
		}
		// Adding nestedClassData to students who were added to the class
		for (let i = 0; i< datapacket.addedStudents.length; i++){
			var studentData = jsonRegStudents[datapacket.addedStudents[i]];
			var nestedClassData = {
				classid: classData.classid,
				emojis: []
			}
			studentData.classes.push(nestedClassData);
		}
		jsonRegClasses.push(classData);
		// Saving New Student Directory Data
		strRegStudents = JSON.stringify(jsonRegStudents);
		fs.writeFileSync(dataFolderName +"/data" + "/RegisteredStudents.txt", strRegStudents, function (err) {
		  if (err) throw err;
		});

		strRegClasses = JSON.stringify(jsonRegClasses);
		fs.writeFileSync(dataFolderName +"/data" + "/RegisteredClasses.txt", strRegClasses, function (err) {
			if (err) throw err;
		});

		console.log(datapacket.name+' created new class: '+datapacket.classname);
	}else{

		console.log('could not find data for: '+datapacket.name);
	}
}


var testNewStudentDataPacket = {
	name: "101444500244575304742",
	studentname: "Robby Guu",
	classes: [0],
}
/*
var testNewClassDataPacket = {
	name: "dude",
	classname: "Cool Class",
	addedStudents: [1],
}
createNewUserData('dude');
createStudentData(JSON.stringify(testNewStudentDataPacket));
createClassData(JSON.stringify(testNewClassDataPacket));*/
//createStudentData(JSON.stringify(testNewStudentDataPacket));
function runAPIRequest(apiRequest){
	console.log("received api req");
	if (apiRequest.substring(0,18) ==="createNewUserData-"){
		return(createNewUserData(apiRequest.substring(18,apiRequest.length)));
	}
	if (apiRequest.substring(0,21) ==="createNewStudentData-"){
		return(createStudentData(apiRequest.substring(21,apiRequest.length)));
	}
	if (apiRequest.substring(0,19) ==="createNewClassData-"){
		return(createStudentData(apiRequest.substring(19,apiRequest.length)));
	}
	if (apiRequest.substring(0,19) ==="pushEmojiToStudent-"){
		return(giveStudentEmoji(apiRequest.substring(19,apiRequest.length)));
	}
}



var server = http.createServer(function(req, res){
  console.log("Request was made: " + req.url);
  //API Check, responseData always JSON
  if (req.url.substring(1,4) === "api"){
    var responseData = runAPIRequest((req.url.substring(5,req.url.length)));
		console.log(responseData);
		if (responseData){
		res.writeHead(200,{"Content-Type": "text/plain"});
		res.write(JSON.stringify(responseData));
		res.end();
	}
  }

  // Returning static web pages/files
  let filePath = __dirname+"/public"+req.url;
  switch (req.url) {
    case "/":
      res.writeHead(200,{"Content-Type": "text/html"});
      fs.createReadStream(__dirname + "/public/homeindex.html").pipe(res);
      break
    case "/favicon.ico":
      res.writeHead(200,{"Content-Type": "image/x-icon"});
      fs.createReadStream(__dirname + "/public/favicon.ico").pipe(res);
      break
    default:

      if (fs.existsSync(filePath)) {
        // TEXT FILES
        if(path.extname(filePath) === ".css" || path.extname(filePath) === ".html" || path.extname(filePath) === ".js"){
          let fileExtension = path.extname(filePath).slice(1,path.extname(filePath).length);
          res.writeHead(200,{"Content-Type": "text/"+fileExtension});
          fs.createReadStream(filePath).pipe(res);
        }
        //Images
        if(path.extname(filePath) === ".gif" || path.extname(filePath) === ".png" || path.extname(filePath) === ".jpg"){
          let fileExtension = path.extname(filePath).slice(1,path.extname(filePath).length);
          res.writeHead(200,{"Content-Type": "image/"+fileExtension});
          fs.createReadStream(filePath).pipe(res);
        }
      }else{
        res.writeHead(404,{"Content-Type": "text/html"});
        fs.createReadStream(__dirname + "/public/homeindex.html").pipe(res);
      }

  }
});


server.listen(8080, "127.0.0.1");

console.log("Opened port: 8080");
