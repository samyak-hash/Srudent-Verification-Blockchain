const express = require( 'express' );
const routes = express.Router();
const mongoose = require( 'mongoose' );
const bodyparser = require( 'body-parser' );
const bcrypt = require( 'bcryptjs' );
const admin = require( '../models/adminmodel' );
const student = require( "../models/studentmodel" );
const passport = require( 'passport' );
const session = require( 'express-session' );
const cookieParser = require( 'cookie-parser' );
const flash = require( 'connect-flash' );
const {
    static
} = require( 'express' );
const mongourl = "mongodb+srv://project:project@cluster0.s80ou.mongodb.net/college-side-db?retryWrites=true&w=majority";
require( './passport' )( passport );
const url = require( "url" );
const {
    ObjectID
} = require( 'mongodb' );


const app = express();
// using Bodyparser for getting form data
routes.use( bodyparser.json() );
routes.use( bodyparser.urlencoded( {
    extended: true
} ) );
// using cookie-parser and session 
routes.use( cookieParser( 'secret' ) );
routes.use( session( {
    secret: 'secret',
    maxAge: 3600000,
    resave: true,
    saveUninitialized: true,
} ) );
// using passport for authentications 
routes.use( passport.initialize() );
routes.use( passport.session() );
// using flash for flash messages 
routes.use( flash() );

// MIDDLEWARES
// Global variable
routes.use( function ( req, res, next ) {
    res.locals.error_message = req.flash( 'error_message' );
    res.locals.error = req.flash( 'error' );
    res.locals.invalidprn = req.flash( 'invalidprn' );
    next();
} );

//setting up public for static folder
routes.use( express.static( "./../public" ) );

const checkAuthenticated = function ( req, res, next ) {
    if ( req.isAuthenticated() ) {
        res.set( 'Cache-Control', 'no-cache, private, no-store, must-revalidate, post-check=0, pre-check=0' );
        return next();
    } else {
        res.redirect( '/login' );
    }
};

// Connecting To Database
// using Mongo Atlas as database
mongoose.connect(
    mongourl, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true
    },
    function ( error, link ) {
        if ( link ) {
            console.log( "DB connect success(StudentAcademics)" );
        } else
            console.log( "DB connect fail..!" );
    }
);


// ALL THE ROUTES 




//route for login page
routes.get( '/', ( req, res ) => {
    res.render( 'login' );
} );

routes.post( '/login', ( req, res, next ) => {
    passport.authenticate( 'local', {
        failureRedirect: '/login',
        successRedirect: '/success',
        failureFlash: true,
    } )( req, res, next );
} );

//route for succes or dashboard
routes.get( '/success', checkAuthenticated, ( req, res ) => {
    res.render( 'success', {
        'showEntryPage': false,
        'showStudentData': false,
        'showData': false,
        'showcourse': false,
    } );
} );

//route for logout
routes.get( '/logout', ( req, res ) => {
    req.logout();
    res.redirect( '/login' );
} );

//route for add student
routes.get( '/addstudent', checkAuthenticated, function ( req, res ) {
    res.render( 'success', {
        'showEntryPage': true,
        'addCourseDetails': "no",
        'invalid': '',
        'success': '',
        'showStudentData': false,
        'showData': false,
        'showcourse': false,
    } );
} );
routes.post( '/addstudent', checkAuthenticated, function ( req, res ) {
    let fname = req.body.fname;
    let lname = req.body.lname;
    let prn = req.body.prn;
    let branch = req.body.branch;

    app.set( 'prnfrom_addstudent', prn );
    let reg = /^20[1-9][0-9][B][T][E](CS|IT|EN|CV|EL)(00)[0-1][0-9]{2}$/i;
    let check = reg.test( prn );
    if ( !fname || !lname || !prn || !branch ) {
        res.render( 'success', {
            'showEntryPage': true,
            'addCourseDetails': "no",
            'prn': null,
            'invalid': 'Please Fill All The Fields',
            'success': '',
            'showStudentData': false,
            'showData': false,
            'showcourse': false,
        } );
    } else if ( !check ) {
        res.render( 'success', {
            'showEntryPage': true,
            'addCourseDetails': "no",
            'prn': null,
            'invalid': 'Invalid PRN',
            'success': '',
            'showStudentData': false,
            'showData': false,
            'showcourse': false,
        } );
    } else {
        //setting data in object 
        app.set( 'fname', fname );
        app.set( 'lname', lname );
        app.set( 'prn', prn );
        app.set( 'branch', branch );
        student.findOne( {
            prn_no: prn
        }, function ( err, data ) {
            if ( err ) throw err;
            if ( !data ) {
                student( {
                    fname: fname,
                    lname: lname,
                    prn_no: prn,
                    branch: branch,
                } ).save( function ( err, added ) {
                    if ( err ) {
                        console.log( err );
                        console.log( "Student details not saved" );
                    }
                    if ( added ) {
                        console.log( "student details saved.." );
                        app.set( 'studentID', added._id );
                        res.render( 'success', {
                            'showEntryPage': true,
                            'addCourseDetails': "yes",
                            'prn': prn,
                            'invalid': '',
                            'success': 'Student Added',
                            'showStudentData': false,
                            'showData': false,
                            'showcourse': false,
                        } );

                    }
                } );
            }
            if ( data ) {
                res.render( 'success', {
                    'showEntryPage': true,
                    'addCourseDetails': "yes",
                    'prn': prn,
                    'invalid': '',
                    'success': 'Student Allready Present..! Add Course Details',
                    'showStudentData': false,
                    'showData': false,
                    'showcourse': false,
                } );
            }
        } );



    }

} );

//route for add couser details

routes.get( '/addcourse', checkAuthenticated, function ( req, res ) {
    res.render( 'success', {
        'showEntryPage': true,
        'addCourseDetails': "yes",
        'showStudentData': false,
        'showData': false,
        'showcourse': false,
    } );
} );
routes.post( '/addcourse', checkAuthenticated, function ( req, res ) {
    let course = req.body.course;
    let credit = req.body.credit;
    let grade = req.body.grade;

    let studentID = app.get( 'studentID' );
    let prnfrom_addstudent = app.get( 'prnfrom_addstudent' );
    let reg = /^(AA|AB|BB|BC|CC|CD|DD)$/i;
    let check = reg.test( grade );
    let coursedata = {
        course,
        credit,
        grade
    };
    if ( !course || !credit || !grade ) {
        res.render( 'success', {
            'showEntryPage': true,
            'addCourseDetails': "yes",
            'prn': null,
            'invalid': 'Please Fill All The Fields',
            'success': '',
            'showStudentData': false,
            'showData': false,
            'showcourse': false,
        } );
    } else if ( !check ) {
        res.render( 'success', {
            'showEntryPage': true,
            'addCourseDetails': "yes",
            'prn': null,
            'invalid': 'Invalid..! (eg.AB,BB)',
            'success': '',
            'showStudentData': false,
            'showData': false,
            'showcourse': false,
        } );
    } else {
        student.findOne( {
            prn_no: prnfrom_addstudent
        }, function ( err, data ) {
            if ( err ) throw err;
            if ( data ) {

                let addID = data._id;
                student.update( {
                    _id: addID
                }, {
                    $push: {
                        coursedetails: coursedata
                    }
                }, function ( err, added ) {
                    if ( err ) {
                        console.log( err );
                        console.log( "Course Not Added" );
                    }
                    if ( added ) {
                        console.log( "Course Added" );
                        res.render( 'success', {
                            'showEntryPage': true,
                            'addCourseDetails': "yes",
                            'prn': prnfrom_addstudent,
                            'success': 'Course Added',
                            'invalid': '',
                            'showStudentData': false,
                            'showData': false,
                            'showcourse': false,
                        } );
                    }
                } );

            }
        } );

    }
} );

//route for home
routes.get( '/home', checkAuthenticated, function ( req, res ) {
    res.render( 'success', {
        'showEntryPage': false,
        'showStudentData': false,
        'showcourse': false,
        'showData': false
    } );
} );

// routes for show
routes.get( '/show', checkAuthenticated, function ( req, res ) {
    res.render( 'showList', {
        'showStudentData': true,
        'showData': false,
        'showcourse': false,
        'err_msg': ''
    } );
} );
routes.post( '/show', checkAuthenticated, function ( req, res ) {
    var {
        branch
    } = req.body;
    if ( !branch ) {
        res.render( 'showList', {
            'showStudentData': true,
            'showData': false,
            'showcourse': false,
            'err_msg': 'Please Choose Option.'
        } );
    } else {
        student.find( {
            branch: branch
        }, function ( err, data ) {
            if ( err ) {
                console.log( err );
                console.log( "No Data Found.." );
            }
            if ( data ) {
                let count = 0;
                data.forEach( function ( value ) {
                    count = count + 1;
                } );
                res.render( 'showList', {
                    'showStudentData': false,
                    'showData': true,
                    'showcourse': false,
                    'data': data,
                    'count': count,
                    'branch': branch
                } );
            }
        } );
    }

} );

routes.get( '/show/:prn', checkAuthenticated, function ( req, res ) {
    let prn = req.params.prn;
    student.find( {
        prn_no: prn
    }, function ( err, data ) {
        if ( err ) {
            console.log( err );
            console.log( "No Data Found.." );
        }
        if ( data ) {
            let sdata = data[ 0 ];
            let cdata = data[ 0 ].coursedetails;
            res.render( 'showData', {
                'showStudentData': false,
                'showData': false,
                'showcourse': true,
                'sdata': sdata,
                'cdata': cdata
            } );
        }
    } );

} );


//route for deleting student data
routes.get( '/delete', checkAuthenticated, function ( req, res ) {
    res.render( 'delete', {
        'del': true,
        'invalid': '',
        'success': ''
    } );
} );
routes.post( '/delete', checkAuthenticated, function ( req, res ) {
    var {
        prn
    } = req.body;
    let reg = /^20[1-9][0-9][B][T][E](CS|IT|EN|CV|EL)(00)[0-1][0-9]{2}$/i;
    let check = reg.test( prn );
    if ( !prn ) {
        res.render( 'delete', {
            'del': true,
            'invalid': 'Please Fil PRN',
            'success': ''
        } );
    } else if ( !check ) {
        res.render( 'delete', {
            'del': true,
            'invalid': "Please Enter Valid PRN",
            'success': ''
        } );
    } else {
        student.findOneAndRemove( {
            prn_no: prn
        }, function ( err, data ) {
            if ( err ) {
                console.log( "Error" );
            }
            if ( !data ) {
                res.render( 'delete', {
                    'del': true,
                    'invalid': "No such Student Exists ",
                    'success': ''
                } );
            } else {
                console.log( "Removed Student Data" );
                res.render( 'delete', {
                    'del': true,
                    'prn': prn,
                    'invalid': '',
                    'success': 'Student Data Deleted for PRN '
                } );

            }
        } )

    }
} );


// routes for updating student data..
routes.get( '/update', checkAuthenticated, function ( req, res ) {
    res.render( 'update', {
        'upd': true,
        'invalid': '',
        'success': ''
    } );
} );

routes.post( '/update', checkAuthenticated, function ( req, res ) {
    var {
        prn,
        crsvalue,
        newvalue,
        valueid
    } = req.body;
    let reg = /^20[1-9][0-9][B][T][E](CS|IT|EN|CV|EL)(00)[0-1][0-9]{2}$/i;
    let check = reg.test( prn );
    if ( !prn || !newvalue || !valueid || !crsvalue) {
        res.render( 'update', {
            'upd': true,
            'invalid': 'Please Fil All the Fields',
            'success': ''
        } );
    } else if ( !check ) {
        res.render( 'update', {
            'upd': true,
            'invalid': "Please Enter Valid PRN",
            'success': ''
        } );
    } else {
        if ( valueid == 'course' ) {
            student.update( {
                prn_no: prn,
                'coursedetails.course':crsvalue
            },
            {$set: {"coursedetails.$.course": newvalue}}
            , function ( err, data ) {
                if ( err ) {
                    console.log( "Error" );
                }
                if ( !data ) {
                    res.render( 'update', {
                        'upd': true,
                        'invalid': "No such Student Exists ",
                        'success': ''
                    } );
                } else {
                    console.log( "Updated Student Data" );
                    res.render( 'update', {
                        'upd': true,
                        'prn': prn,
                        'invalid': '',
                        'success': 'Student Data Updated for PRN '
                    } );

                }
            } )
        } else if ( valueid == 'credit' ) {
            student.update( {
                prn_no: prn,
                'coursedetails.course':crsvalue
            },
            {$set: {"coursedetails.$.credit": newvalue}}, function ( err, data ) {
                if ( err ) {
                    console.log( "Error" );
                }
                if ( !data ) {
                    res.render( 'update', {
                        'upd': true,
                        'invalid': "No such Student Exists ",
                        'success': ''
                    } );
                } else {
                    console.log( "Updated Student Data" );
                    res.render( 'update', {
                        'upd': true,
                        'prn': prn,
                        'invalid': '',
                        'success': 'Student Data Updated for PRN '
                    } );
    
                }
            } )

        } else {
            student.update( {
                prn_no: prn,
                'coursedetails.course':crsvalue
            },
            {$set: {"coursedetails.$.grade": newvalue}}, function ( err, data ) {
                if ( err ) {
                    console.log( "Error" );
                }
                if ( !data ) {
                    res.render( 'update', {
                        'upd': true,
                        'invalid': "No such Student Exists ",
                        'success': ''
                    } );
                } else {
                    console.log( "Updated Student Data" );
                    res.render( 'update', {
                        'upd': true,
                        'prn': prn,
                        'invalid': '',
                        'success': 'Student Data Updated for PRN '
                    } );
    
                }
            } );

        }
    }
} )

module.exports = routes;