var es = require('event-stream');
var fs = require('fs');
var ldif = require('ldif');

var Streamer = function(stream,options){
  var chain = stream, self = this;
  options = ldif._extend({},Streamer.defaults,options);

  // Normalize pipeline array
  if (!Array.isArray(options.pipeline))
    options.pipeline = [ options.pipeline ];

  // Chunk by delimiter
  if (options.delimiter)
    chain = chain.pipe(es.split(options.delimiter));

  // Default parser
  chain = chain.pipe(options.parser);

  // Attach pipeline
  options.pipeline.forEach(function(item){
    if (typeof item == 'function')
      chain = chain.pipe(item(options));
  });

  return chain;
};

// Default LDIF parser
Streamer.parse = es.map(function(data,cb){
  try{ cb(null,ldif.parse(data+'\n')); }
    catch(err) { cb(); }
});

// Maps LDIF values
Streamer.ldif = function(options){
  return es.map(function(data,cb){
    try{ cb(null,data.toLDIF(options)); }
      catch (err) { cb(); }
  });
};

// Maps each record to a plain object
Streamer.object = function(options){
  return es.map(function(data,cb){
    try{ cb(null,data.toObject(options)); }
      catch (err) { cb(); }
  });
};

// Record parser
// (emit stream object for each record contained in a file)
Streamer.record = function(options){
  return es.through(function(data){
    var row, self = this;
    data.entries.forEach(function(item){
      self.emit('data',item);
    });
  });
};

// Default options
Streamer.defaults = {
  delimiter: "\n\n",
  parser: Streamer.parse,
  pipeline: [ Streamer.object, Streamer.record ],
  flatten: true,
  single: false,
  preserveOptions: true,
  preferOptions: []
};

// Convenience method to stream a file
Streamer.file = function(filename,options){
  var stream = fs.createReadStream(filename,'utf8');
  return Streamer(stream,options);
};

module.exports = Streamer;
