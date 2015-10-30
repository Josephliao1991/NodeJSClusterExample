var cluster = require('cluster');
//Get Number Of CPU
var numCPUs = require('os').cpus().length;


var express = require('express');
var app     = express()

var index = 1;
/* Child.Process Can Not Share Variable, They Are Separate */
/*  No shared state between the workers. */
/*  Because workers are all separate processes,*/
/*  they can be killed or re-spawned depending on your program's needs, */
/*  without affecting other workers*/

if (cluster.isMaster) {
  console.log('[master] ' + "start master...");

  //Check Index Per Sec.
  setInterval(function() {
    console.log("Now Worker : Worker", index);
  }, 1000);

  // Count requests
  function messageHandler(msg) {
    if (msg.cmd && msg.cmd == 'notifyRequest') {
      if (numCPUs == index) {
        index = 1
        return
      }
      index += 1;
    }
  }

  // Start workers and listen for messages containing notifyRequest
  for (var i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  //Listen For Worker Start Process
  cluster.on('listening', function (worker, address) {
    console.log('[master] ' + 'listening: worker' + worker.id + ',pid:' + worker.process.pid + ', Address:' + address.address + ":" + address.port);
  });

  // Listen For Dying Worker
  cluster.on('exit', function (worker) {
    // Replace the dead worker,
    // we're not sentimental
    console.log('[worker] Worker%d died :(', worker.id);
    cluster.fork();
  });

  //Set On Message Listener
  Object.keys(cluster.workers).forEach(function(id) {
    cluster.workers[id].on('message', messageHandler);
  });

} else if (cluster.isWorker) {
  //Check Worker Is Start
  console.log('[worker] ' + "start worker ..." + cluster.worker.id);
  var workerId = cluster.worker.id

  //Set Time Interval To Check Index Per Sec.
  setInterval(function() {

    if (index == workerId) {
      // index += 1
      // notify master about the request
      process.send({ cmd: 'notifyRequest' });
    }
  }, 1000);



//Create Server On Each Child.Process, And Cluster Will Auto LoadBlance
  //Create Server, Listen 8080 Port
  // app.get('/',function (req, res) {
  //   // body...
  //   console.log('worker'+cluster.worker.id);
  //   res.end('worker'+cluster.worker.id+',PID:'+process.pid);
  // })
  //
  // app.listen(8080,function (error) {
  //   // body...
  //   if (error) {
  //     console.log('[worker] Fail, Worker%d Can Not Start Server',cluster.worker.id);
  //   }
  //   console.log('[worker] Success, Worker%d Start Server',cluster.worker.id);
  //
  // })

}
