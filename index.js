const express = require('express');
const app = express();
const routes = require('./controllers/routes');
const path = require('path');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use('/', routes);
app.use('/login', routes);
app.use('/success', routes);
app.use('/logout', routes);
app.use('/addstudent', routes);
app.use('/addcourse', routes);
app.use('/home', routes);
app.use('/show', routes);
app.use('/show/:prn', routes);
app.use('/delete', routes);
app.use('/update', routes);

const PORT =8001;
app.listen(PORT, () => console.log("Server Stated At Port", PORT));
