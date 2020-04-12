import express from 'express'
import fs from 'fs'
import moment from 'moment'
import path from 'path'

const router = express.Router()

// middleware that is specific to this router
router.use(function timeLog(req, res, next) {
    console.log('Called url: %s at Time: %s ', req.url, moment().format('DD MMM YYYY, HH:mm:ss SSS'))
    next()
})

router.get('/', function(req, res, next) {
    res.render('pages/index', { title: 'Home' })
})

router.get('/about', function(req, res, next) {
    res.render('pages/about', { title: 'About' })
})

router.get('/resources', function(req, res, next) {
    res.render('pages/resources', { title: 'Resources' })
})

router.get('/viewMap', function(req, res, next) {
    res.render('pages/viewMap', { title: 'viewMap' })
})


const geojsonFolder = '../geojson_files/'
console.log(express.static(__dirname + geojsonFolder))
//get Map as static resource
router.use(
    '/public/mapfile/',
    express.static(path.join(__dirname, geojsonFolder))
)
// or retrieveMap with sendFile
router.get('/retrieveMap/:name', function(req, res, next) {
    var fileName = req.params.name
    console.log('Serving filename : ', fileName)
    var options = {
        headers: {
            'x-timestamp': Date.now(),
            'x-sent': true,
        },
    }

    var filenameComplete = path.join(__dirname, geojsonFolder) + fileName + '.geojson'
    res.sendFile(filenameComplete, options, function(err) {
        console.log('Serving filename : ', filenameComplete)
        if (err) {
            console.log('Error: ', err)
            next(err)
        } else {
            console.log('Sent file: ', fileName + '.geojson')
        }
    })
})

var geojsonPath = path.join(path.resolve(__dirname, '.'), geojsonFolder)

router.get('/allmaps', function(req, res, next) {
    fs.readdir(geojsonPath, function(err, files) {
        if (err) {
            return next(err)
        }
        res.json(files)
        next()
    })
})

export default router
