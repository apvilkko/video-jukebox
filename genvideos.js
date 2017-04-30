const folder = './videos/';
const fs = require('fs');
const list = [];
fs.readdir(folder, (err, files) => {
  if (err) {
    return console.log(err);
  }

  const data = 'const VIDEOS = [\n"' + files.join('",\n"') + '"\n];';
  console.log(data);

  fs.writeFile('./js/videos.js', data, function(err) {
      if (err) {
        return console.log(err);
      }

      console.log("The file was saved!");
  });

});
