import express from 'express'
import compress from 'compression'
import load from 'dotenv'
import path from 'path'
import router from './routers/routes.js'

// configure dotenv to retrieve environment variables
load.config()
// use express as framework
var app = express()
// set the view engine to ejs
app.set('view engine', 'ejs')
// set views path
app.set('views', path.join(__dirname, '/views'))
// define main route
app.use('/mapserver', router)
// define static resources
app.use('/mapserver/public/css/', express.static(__dirname + '/public/css'))
app.use('/mapserver/public/img/', express.static(__dirname + '/public/img'))
app.use('/mapserver/public/js/', express.static(__dirname + '/public/js'))

console.log('Configured port in .env file is %s', process.env.MAP_SERVER_PORT)
const port = process.env.MAP_SERVER_PORT || 3010
console.log('port selected is %s', port)
// compress files as gzip or deflate
app.use(compress())

app.listen(port, function() {
    console.log('Map server listening on port %s!', port)
})
