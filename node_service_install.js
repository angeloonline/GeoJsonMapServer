var Service = require('node-windows').Service

// Create a new service object
var svc = new Service({
    name: 'Nodejs win service',
    description: 'Nodejs web server service.',
    script: require('path').join(__dirname, 'dist\\index.js'),
})

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('install', function() {
    svc.start()
})

svc.install()
