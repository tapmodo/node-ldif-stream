# node-ldif-stream
#### Streaming LDIF parser for Node based on [RFC2849](https://github.com/tapmodo/node-ldif/tree/master/rfc)

What's better than awesomely parsing an LDIF file in an RFC-compliant way?
Parsing it in a Node stream! This small library makes it easy.

Based on my [ldif](https://npmjs.org/package/ldif) parsing package.

## Usage

### Installation

    npm install ldif-stream

### Streaming a file

```javascript
var Streamer = require('ldif-stream');
var options = {};

Streamer.file('./example.ldif',options)
  .on('data',function(data){
    console.log('Found LDIF data');
    console.log(data);
  })
  .on('end',function(){
    console.log('All done!');
  });
```

### Stream any stream

```javascript
var Streamer = require('ldif-stream');
var stream = fs.createReadStream('example.ldif','utf8');
var options = {};

Streamer(stream,options)
  .on('data',function(data){
    console.log('Found LDIF data');
    console.log(data);
  })
  .on('end',function(){
    console.log('All done!');
  });
```

## Pipeline transformations

Since there are many ways the data could be transformed to be useful,
this library allows you to specify an array of transformations in the
`pipeline` option. Each transformation receives the `options` passed
in to the stream when it was created.

The default pipeline is `[ Streamer.record, Streamer.object ]`.
This breaks the stream into individual records (probably already happened with
line splitting), and then converts each record into an object.

The available transformations are described below.

#### Streamer.record

The `ldif` library parses a string of LDIF into a containerized format that
includes a little outer cruft to wrap the entries contained in the file.
This transformation breaks out any records contained in each chunk, into
separate chunks, one record each.

The internal parsed format and the "object" format both have an
`entries` key, so this transformation can work on either as input.
It simply shifts records off of `entries` and emits a new chunk for
each record.

#### Streamer.object

Transforms single records (or entire containers) into a simple object format.
Reference the `ldif` package documentation for `toObject()` and it's associated
options, which can be mixed into the options given to the streamer, to alter
the behavior of the output of this transformation.

#### Streamer.ldif

Not really sure why you'd want to stream back into LDIF format, but why not?
This will return a chunk of parsed and re-outputted LDIF for each chunk it
receives.

### TODO

  * Document writing transformers
  * Document streamer options
  * Test suite

