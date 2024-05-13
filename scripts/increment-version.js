const fs = require('fs');
const path = require('path');

const updateVersion = (version, type) => {
  const versionParts = version.split('.').map(Number);
  switch (type) {
    case 'major':
      versionParts[0]++;
      versionParts[1] = 0;
      versionParts[2] = 0;
      break;
    case 'minor':
      versionParts[1]++;
      versionParts[2] = 0;
      break;
    default: // 'revision' or no argument
      versionParts[2]++;
      break;
  }
  return versionParts.join('.');
};

const updateManifest = (filePath, type) => {
  const manifest = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  manifest.version = updateVersion(manifest.version, type);
  fs.writeFileSync(filePath, JSON.stringify(manifest, null, 2));
};

const type = process.argv[2];
const manifestPaths = [
  path.join(__dirname, '..', 'public', 'manifest.v2.json'),
  path.join(__dirname, '..', 'public', 'manifest.v3.json'),
];

manifestPaths.forEach((filePath) => updateManifest(filePath, type));