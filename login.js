var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');

var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : '',
	database : 'login'
});

var app = express();
app.set('view engine', 'ejs'); 
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

app.get('/', function(request, response) {
	//response.sendFile(path.join(__dirname + '/login.html'));
	response.render('login'); 
});

app.post('/nxt_pg', function(request, response) {
    response.render('selection');
});

app.post('/ok', function(request, response) {
    var pid;
    var did;
    var room=request.body.room;
    var dr=request.body.dr_name;
    console.log(request.session.username);
    connection.query("SELECT PID FROM patient WHERE name = ' "+request.session.username+" ' ", function (err, result, fields) {
    			if (err) throw err;
    			console.log(result);
			 pid=result[0].PID;
            console.log("pid is " + pid);
            
                
                
			         
			         connection.query("SELECT DID FROM doctor WHERE Name= '"+dr+"'  ", function (err, result, fields) {
                
                                
                console.log("after did from dr" + result);
    			did=result[0].DID;
                 console.log("did is " + did);   
                    connection.query("UPDATE patient SET room = ' "+room+" ' ,sup_doctor=' "+dr+"',DID='"+did+"' WHERE PID = '"+pid+"' ", function (err, result, fields) {
    			console.log("after update ");
                console.log(result);
 		         });
        
            });
        
        
			
    });
    
    
    response.send('okk');
});


app.post('/auth', function(request, response) {
	console.log("req in login");
	console.log(request);
	var username = request.body.username;
	var password = request.body.password;
	if (username && password) {
		connection.query('SELECT * FROM login WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
			if (results.length > 0) {
				console.log(results);
				request.session.loggedin = true;
				request.session.username = username;
				response.redirect('/home');
			} else {
				response.send('Incorrect Username and/or Password!');
			}	
			console.log("hi");		
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});

app.get('/home', function(request, response) {
	if (request.session.loggedin) {
		console.log("works");
		response.sendFile(path.join(__dirname + '/selection.html'));
	} else {
		response.send('Please login to view this page!');
		response.end();
	}
	
});

app.get('/addpatient.html', function(request, response) {
	
		response.sendFile(path.join(__dirname + '/addpatient.html'));
	
	
});

app.get('/bill.html', function(request, response) {
	
		response.sendFile(path.join(__dirname + '/bill.html'));
	
	
});
app.post('/bill', function(request, response) {
	var pid=request.body.pid;
    var name;
    var ad;
    var dd;
    var dr;
    
    var doc_fee;
    var room_fee;
//    connection.query("SELECT fee from doctor where DID IN (SELECT DID from patient where PID = ' "+pid+" ')", function(error, results, fields) {
//				doc_fee=results[0].fee;
//		});
//    connection.query("SELECT * from patient WHERE PID=' "+pid+" ' ",function(error, results, fields) {
//				    
//                name=results[0].Name;
//                ad=results[0].DOB;
//                dd="29/10/19";
//                dr=results[0].sup_doctor;
//        console.log(name);
//        
//        
//        
//    
//        response.render('generate_bill',{
//        pid:pid,
//        name:name,
//        ad:ad,
//        dd:dd,
//        dr:dr,
//        dr_fee:doc_fee,
//        
//    });
//		});
// 
    connection.query("SELECT * FROM(SELECT * FROM ((SELECT patient.* , doctor.fee FROM patient INNER JOIN doctor ON patient.DID=doctor.DID)as my) INNER JOIN room ON my.room=room.RID )as sec WHERE PID=' "+pid+" ' ", function(error, results, fields) {
				name=results[0].Name;
                ad=results[0].DOB;
                dd="29/10/19";
                dr=results[0].sup_doctor;
                doc_fee=results[0].fee;
                room_fee=results[0].roomcost;
        
                response.render('generate_bill',{
                    pid:pid,
                    name:name,
                    ad:ad,
                    dd:dd,
                    dr:dr,
                    dr_fee:doc_fee,
                    room_fee:room_fee,
		});
	
});
    
});
app.post('/auth1', function(request, response) {
	var phone_no = request.body.phone_no;
	var address = request.body.address;
	var DOB = request.body.DOB;
	var name = request.body.name;
	var blood_grp = request.body.blood_grp;
	var type_of = request.body.type_of;
        
    
		connection.query("INSERT INTO patient (phone_no, address,DOB,Name,Blood_grp,type) VALUES (' "+phone_no+" ',' "+address+" ',' "+DOB+" ',' "+name+" ',' "+blood_grp+" ',' "+type_of+" ')", function(error, results, fields) {
				
			
		});
        request.session.username=name;
        if(type_of=="admit")
            {   
                
                response.render('room_doctor',{name:request.body.name});
                
            }
        else{
                connection.query("SELECT PID FROM patient WHERE name = ' "+name+" ' ", function (err, result, fields) {
    			if (err) throw err;
    			console.log(result);
			
			response.render('show', {name:name,id:result[0].PID});
 		 });
        }
		
        
	
});

app.get('/patientformfinal', function(request, response) {
	response.send("hello");
    console.log(request);
	
});




app.listen(8080);