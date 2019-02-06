var express = require('express');
var app = require('express')();
app.use(express.static(__dirname + "/public"));
var http = require('http');
var mysql = require('mysql');
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set("view engine","jade")
var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "vote"
});

            ////////views/////////////

app.get('/home',function(req,res){

res.sendFile(__dirname+('/views/home.html'))
});


app.get('/login',function(req,res){

res.sendFile(__dirname+('/views/login.html'))
});
app.get('/register',function(req,res){

res.sendFile(__dirname+('/views/register.html'))
});

app.get('/end_election',function(req,res){
    con.query('select e_id,e_name from election where is_end=\'false\'', function (err, election_details) {
                //console.log(election_details);
                if (err){
                    //console.log(err)
                    }
                else{
                 res.render('end_election', { election_details: election_details });
                }
    });

});
app.get('/result',function(req,res){
    con.query('select e_id,e_name from election where is_end=\'true\'', function (err, election_details) {
                //console.log(election_details);
                if (err){
                    //console.log(err)
                    }
                else{
                 res.render('result', { election_details: election_details });
                }
    });
});
app.get('/user_result',function(req,res){
    con.query('select e_id,e_name from election where is_end=\'true\'', function (err, election_details) {
                //console.log(election_details);
                if (err){
                    //console.log(err)
                    }
                else{
                 res.render('user_result', { election_details: election_details });
                }
    });
});

app.get('/vote_election',function(req,res){
var user_id=req.body.user_id;
con.query('select e_id,e_name from election where is_end=\'false\'', function (err, election_details) {
                //console.log(election_details);
                if (err){
                    //console.log(err)
                    }
                else{
                 res.render('vote_election', { election_details: election_details,user_id:user_id });
                }
    });



});

app.get('/addcandidate',function(req,res){

res.sendFile(__dirname+('/views/addcandidate.html'))
});
app.get('/new_election',function(req,res){

    con.query('select user_id,name from user where type=\'voter\'', function (err, voter_details_result) {
                //console.log(voter_details_result);
                if (err){
                    //console.log(err)
                    }
                else{
                 res.render('new_election', { voter_details: voter_details_result });
                }
    });
});

//////controller///////
app.post('/validate_login',function(req,res){

    var username= req.body.username;
    var password = req.body.password;

    con.query('SELECT * FROM user WHERE name = ?',[username], function (error, results, fields) {
    if (error) {
        //console.log("error occurred",error);
        res.sendFile(__dirname+'/views/login.html');
    }
    else{
          //console.log('The solution is: ', results);

          if(results.length >0){
              if(results[0].password == password){
                   con.query('select user_id,name from user where type=\'voter\'', function (err, voter_details_result) {
                //console.log(voter_details_result);
                if (err){
                    //console.log(err)
                    }
                else{
                    if(results[0].type=='admin'){
                        res.render('new_election', { voter_details: voter_details_result });
                     }
                     else{
                        con.query('select e_id,e_name from election where is_end=\'false\'', function (err, election_details) {
                                    //console.log(election_details);
                                    if (err){
                                        //console.log(err)
                                        }
                                    else{
                                     res.render('vote_election', { election_details: election_details,user_id:results[0].user_id });
                                    }
                        });
                    }
                }
              });
                  }
                  else{
                     res.render('login',{login_failed:true});
                  }
          }
          else{
            //console.log("error");

            res.render('login',{login_failed:true});

            }

    }
});

});


app.post('/validate_register',function(req,res){
            //console.log("Hi");
            var name=req.body.name;
            //console.log(req.body.name);
            var address=req.body.address;
            var mobile=req.body.mobile;
            var radio=req.body.radio;
            var details=req.body.details;
            var voterid=req.body.voterid;
            var password=req.body.password;
            //console.log(req.body);
                //console.log('You sent the name "' + name+'".\n');
                var sql = "INSERT INTO user (name , address,mobile,gender,details,voterid,password,type ) VALUES ('"+name+"', '"+address+"','"+mobile+"','"+radio+"','"+details+"','"+voterid+"','"+password+"','voter')";
                con.query(sql, function (err, result) {
                 if (err) throw err;
                 //console.log("1 row inserted");
         });

    res.sendFile(__dirname + ('/views/login.html'))
    });


app.post('/add_new_election',function(req,res)  {
    // get values new_election
    var name=req.body.name;
    var topic=req.body.topic;
    var candidate=req.body.candidate;
    //console.log(candidate);
    var sql = "insert into election(e_name,e_topic,is_end) values('"+name+"','"+topic+"','false')";
         // insert election table
    var result_status=true;
    con.query(sql, function (err, result) {
            if (err) {
                result_status=false;
            }

            // insert election_candidate
            if (result_status==true){
                // insertId -> election id
                election_id_inserted=result.insertId;
                //console.log(election_id_inserted);
                for(var i=0;i<candidate.length;i++){
                    var sql = "insert into election_candidate(e_id,c_id) values('"+election_id_inserted+"','"+candidate[i]+"')";
                         // insert election table
                    con.query(sql, function (err, result) {
                            if (err) {
                                result_status=false;
                            }

                    });
                }

            }

            con.query('select user_id,name from user where type=\'voter\'', function (err, voter_details_result) {
            //console.log(voter_details_result);
            if (err){
                    //console.log(err)
                    }
            else{
                 res.render('new_election', { voter_details: voter_details_result,result_status:result_status ,election_created:true });

                }
            });


    });
});


app.post('/controller_end_election',function(req,res){

            var selected_election_id=req.body.selected_election_id;
                var sql = "update election set is_end='true' where e_id='"+selected_election_id+"'";
                con.query(sql, function (err, result) {
                 if (err) throw err;
                 con.query('select e_id,e_name from election where is_end=\'false\'', function (err, election_details) {
                        //console.log(election_details);
                        if (err){
                            //console.log(err)
                            }
                        else{
                         res.render('end_election', { election_details: election_details,election_end:true });
                        }
                 });

         });


    });


app.post('/show_election_candidates',function(req,res){
    var selected_election_id=req.body.selected_election_id;
    var user_id=req.body.user_id;
    var selected_candidate_vote=req.body.selected_candidate_vote;
    console.log(selected_candidate_vote)
    console.log(selected_election_id)
    console.log(user_id)
    if (typeof selected_candidate_vote == 'undefined' && selected_candidate_vote == null){
         console.log("======================");
            var selected_election_id=req.body.selected_election_id;
            var user_id=req.body.user_id;
                var sql = "select u.user_id,u.name,u.address,u.gender,u.details from user as u, election_candidate as ec where ec.e_id='"+selected_election_id+"' and ec.c_id=u.user_id";
                con.query(sql, function (err, candidate_list) {
                console.log(candidate_list);
                 if (err) throw err;
                 con.query('select e_id,e_name from election where is_end=\'false\'', function (err, election_details) {

                        if (err){
                            //console.log(err)
                            }
                        else{
                         res.render('vote_election', { election_details: election_details,candidate_list:candidate_list,selected_election_id:selected_election_id,user_id:user_id});

                        }
                 });

         });
    }
    else{
        vote_result_status=true
        already_exist=false
        var sql = "insert into voter(voterid,e_id,c_id,time) values('"+user_id+"','"+selected_election_id+"','"+selected_candidate_vote+"',now())";
                         // insert election table
        con.query(sql, function (err, result) {
            if (err) {
                 console.log(err)
                 if(err.errno==1062){
                    already_exist=true;
                    vote_result_status=false
                 }else{
                 vote_result_status=false
                 }

            }
            con.query('select e_id,e_name from election where is_end=\'false\'', function (err, election_details) {
                        if (err){

                            console.log(err)
                        }

                        res.render('vote_election', { election_details: election_details,user_id:user_id,already_exist:already_exist,user_id:user_id,vote_result_status:vote_result_status });

                        });
        });
    }


    });

app.post('/show_result',function(req,res){
    var selected_election_id=req.body.selected_election_id;
    var user_id=req.body.user_id;
    var selected_candidate_vote=req.body.selected_candidate_vote;
    if (typeof selected_candidate_vote == 'undefined' && selected_candidate_vote == null){
            var selected_election_id=req.body.selected_election_id;
            var user_id=req.body.user_id;

                var sql = "SELECT v.c_id,u.name,u.address,u.details,count(v.voterid) as vote FROM vote.voter as v,vote.user as u where v.e_id='"+selected_election_id+"' and u.user_id=v.c_id group by v.c_id ;";

                con.query(sql, function (err, candidate_list) {
                console.log(candidate_list);
                 if (err) throw err;
                 con.query('select e_id,e_name from election where is_end=\'true\'', function (err, election_details) {

                        if (err){
                            //console.log(err)
                            }
                        else{
                         res.render('result', {election_details:election_details, candidate_list:candidate_list,selected_election_id:selected_election_id,user_id:user_id });

                        }
});

         });
    }



    });

app.post('/user_show_result',function(req,res){
    var selected_election_id=req.body.selected_election_id;
    var user_id=req.body.user_id;
    var selected_candidate_vote=req.body.selected_candidate_vote;
    if (typeof selected_candidate_vote == 'undefined' && selected_candidate_vote == null){
            var selected_election_id=req.body.selected_election_id;
            var user_id=req.body.user_id;

                var sql = "SELECT v.c_id,u.name,u.address,u.details,count(v.voterid) as vote FROM vote.voter as v,vote.user as u where v.e_id='"+selected_election_id+"' and u.user_id=v.c_id group by v.c_id ;";

                con.query(sql, function (err, candidate_list) {
                console.log(candidate_list);
                 if (err) throw err;
                 con.query('select e_id,e_name from election where is_end=\'true\'', function (err, election_details) {

                        if (err){
                            //console.log(err)
                            }
                        else{
                         res.render('user_result', {election_details:election_details, candidate_list:candidate_list,selected_election_id:selected_election_id,user_id:user_id });

                        }
});

         });
    }



    });
app.listen(3000);
