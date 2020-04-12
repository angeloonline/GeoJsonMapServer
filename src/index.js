import express from 'express'
import compress from 'compression'
import load from 'dotenv'
import path from 'path'
import router from './routers/routes.js'

load.config()

var app = express()
// set the view engine to ejs
app.set('view engine', 'ejs')
// set views path
app.set('views', path.join(__dirname, '/views'))
// define main route
app.use('/mapserver', router)

const geojsonFolder = '/geojson_files/'
//app.use('/mapserver/public/mapfile/', express.static(__dirname + geojsonFolder))
app.use('/mapserver/public/css/', express.static(__dirname + '/public/css'))
app.use('/mapserver/public/img/', express.static(__dirname + '/public/img'))
app.use('/mapserver/public/js/', express.static(__dirname + '/public/js'))

console.log('Configured port in .env file is %s', process.env.MAP_SERVER_PORT)
const port = process.env.MAP_SERVER_PORT || 3010
console.log('port selected is %s', port)

app.use(compress())

app.listen(port, function() {
    console.log('Map server listening on port %s!', port)
})