const fetch = require('node-fetch');
const fs = require('fs');
const vm = require('vm');
const includeInThisContext = function(path) {
    const code = fs.readFileSync(path);
    vm.runInThisContext(code, path);
}.bind(this);
includeInThisContext(__dirname + '/js/videos.js');

const data = {};
const cache = {};
const promises = [];

function getYear(filename) {
  const yearMatch = filename.match(/\((\d{4})\)/);
  if (yearMatch) {
    return yearMatch[1];
  }
  return '';
}

function handleResponse(text, filename, track, resolve) {
  const lines = text.split('\n');
  data[filename] = {};
  lines.forEach(line => {
    if (line.startsWith('DTITLE=')) {
      const value = line.split('=')[1];
      const title = value.split('/');
      data[filename].artist = title[0].trim();
      data[filename].album = title[1].trim();
    } else if (line.startsWith('DYEAR=')) {
      data[filename].year = line.split('=')[1].trim();
      if (!data[filename].year) {
        data[filename].year = getYear(filename);
      }
    } else if (line.startsWith('TTITLE' + track + '=')) {
      data[filename].track = line.split('=')[1].trim();
      const splitArtist = data[filename].track.split('/');
      if (splitArtist.length > 1) {
        data[filename].track = splitArtist[1].trim();
        data[filename].artist = splitArtist[0].trim();
      }
    }
  });
  console.log('OK', filename);
  resolve();
}

function getMetadata(filename) {
  const parts = filename.match(/__([a-z]+)_(.{8})_(\d+)\.mp4/);
  if (parts && parts.length > 3) {
    const category = parts[1];
    const id = parts[2];
    const track = parseInt(parts[3]) - 1;
    const url = 'http://freedb.freedb.org/~cddb/cddb.cgi?cmd=cddb+read+' +
      category + '+' + id + '&hello=user+my.host.com+myapp+0.1&proto=5';
    console.log('fetch', url);
    const fetchPromise = fetch(url);
    promises.push(new Promise((resolve, reject) => {
      fetchPromise.then(res => {
        // console.log('done', url);
        const promise = res.text();
        promise.then(text => handleResponse(text, filename, track, resolve));
      }).catch(function(err) {
        console.log(err);
        reject(err);
      });
    }));
  }
}

VIDEOS.forEach(filename => {
  getMetadata(filename);
});

Promise.all(promises).then(() => {
  console.log('All done!', Object.keys(data).length);
  const jsData = 'const METADATA = ' + JSON.stringify(data, null, 2) + ';';
  fs.writeFile('./js/metadata.js', jsData, function(err) {
    if (err) {
      return console.log(err);
    }

  console.log("The file was saved!");
  });
})
