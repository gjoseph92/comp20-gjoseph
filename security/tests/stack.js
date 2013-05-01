var mongoClient = require('mongodb').MongoClient;

// function subfunction() {
//   (function anon() {
//     logStack();
//   })();
// }

// function logStack() {
//   var currentFun = arguments.callee.caller;
//   var i = 0;
//   while (currentFun) {
//     var fn = currentFun.toString();
//     console.log('level ' + i++);
//     console.log(fn);
//     currentFun = currentFun.caller;
//   }
// }

// function call() {
//   subfunction(2);
// }

// call();

var map = function() {
  emit(1, 1);
  emit(1, 2);
};

var reduce = function() {
  // return Object.keys(this.DBPointer).toString();
  return DBRef();
};

mongoClient.connect('mongodb://localhost:27017/security', function(err, db) {
  if (err) { console.log(err); return; };

  db.collection('system.indexes', function(err, col) {
    col.mapReduce(map, reduce, {out: {inline: 1}}, function(err, results, stats) {
      console.log(results);
      return;
    });
  });
});