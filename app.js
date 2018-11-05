const express = require('express');
const mustacheExpress = require('mustache-express');
const app = express();
const bodyParser = require('body-parser');
const pgp = require('pg-promise')();
const connectionString = "postgres://localhost:5432/blogs";
const db = pgp(connectionString);
const session = require('express-session');
const sess = {
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
  }


app.use(bodyParser.urlencoded({ extended: false }));
app.use('css', express.static('css'));
app.use(session(sess));

app.engine('mustache', mustacheExpress());

app.set('views', "./views"); 
app.set('view engine', 'mustache');

// const authenticateUser = (req, res, next) => {
//     if (req.session.username) {
//         next();
//     } else {
//         res.redirect('/index');
//     }
// }

// app.all('/user/*', authenticateUser, (req, res, next) => {
//     next();
// })







app.get('/', (req, res) => {

    res.render('index');
});

app.post('/register', (req, res) => {
    let username = req.body.username;
    let password = req.body.password;

    db.none('INSERT INTO users(username, password) VALUES($1, $2);', [username, password]).then(() => {
        res.redirect('/user/home')
    })
})




// userid
app.get('/user/home', (req, res) => {
    db.any('SELECT blogid, author, title, content FROM blogs;').then(result => {
        res.render('home',{blogs : result});
    });
});






app.post('/post-blog', (req, res) => {

    let author = req.body.author;
    let title = req.body.title;
    let content = req.body.content;
    //let userid = req.session.userid
                /*userid*/
    db.none('INSERT INTO blogs(author, title, content) VALUES($1, $2, $3);', [author, title, content]).then(() => {
        res.redirect('/user/home');
    }).catch(error => {
        console.log(error);
    });
});

app.get('/modify-blog/:blogid', (req, res) => {

    let blogid = req.params.blogid;

    db.one('SELECT blogid, author, title, content FROM blogs WHERE blogid = $1;', [blogid]).then(result => {
        console.log(result)
        res.render('modify-blog', {blog: result})
    });
});

app.post('/update-blog/:blogid', (req, res) => {
    let blogid = req.params.blogid;
    let author = req.body.author;
    let title = req.body.title;
    let content = req.body.content;

    db.none('UPDATE blogs SET author = $1, title = $2, content = $3 WHERE blogid = $4;', [author, title, content, blogid]).then(() => {

        res.redirect('/user/home');
    
    }).catch(error => {
        console.log(error);
    });
})


app.post('/remove-blog', (req, res) => {

    let blogid = req.body.blogid;

    db.none('DELETE FROM blogs WHERE blogid = $1;', [blogid]).then(()=> {
        res.redirect('/user/home')
    }).catch((error) => {
        console.log(error);
    });
});

app.listen(3000, (req, res) => {
    console.log('Server running...');
});