var cluster = require('cluster');
//Get Number Of CPU
var numCPUs = require('os').cpus().length;
var express = require('express');
var app     = express()

if (cluster.isMaster) {
  console.log('[master] ' + "start master...");

  // Start workers and listen for messages containing notifyRequest
  for (var i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  //Listen For Worker Start Process
  cluster.on('listening', function (worker, address) {
    console.log('[master] ' + 'listening: worker' + worker.id +
                              ',pid:' + worker.process.pid +
                              ', Address:' + address.address +
                              ":" + address.port);
  });

  // Listen For Dying Worker
  cluster.on('exit', function (worker) {
    // Replace the dead worker,
    // we're not sentimental
    console.log('[worker] Worker%d died :(', worker.id);
    cluster.fork();
  });

} else if (cluster.isWorker) {
  //Check Worker Is Start
  console.log('[worker] ' + "start worker ..." + cluster.worker.id);

//Create Server On Each Child.Process, And Cluster Will Auto LoadBlance
  // Create Server, Listen 8080 Port
  app.get('/',function (req, res) {
    // body...
    console.log('worker'+cluster.worker.id);
    res.end('worker'+cluster.worker.id+',PID:'+process.pid);
  })

  app.listen(8080,function (error) {
    // body...
    if (error) {
      console.log('[worker] Fail, Worker%d Can Not Start Server',cluster.worker.id);
    }
    console.log('[worker] Success, Worker%d Start Server',cluster.worker.id);

  })

}
