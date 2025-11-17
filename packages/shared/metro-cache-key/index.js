const fs = require('fs');
const crypto = require('crypto');

function hashFileContents(filePath) {
    const hash = crypto.createHash('sha1');
    hash.update(filePath);
    try {
        const stats = fs.statSync(filePath);
        hash.update(String(stats.size));
        hash.update(String(stats.mtimeMs));
        hash.update(fs.readFileSync(filePath));
    } catch (error) {
        hash.update('missing');
    }
    return hash.digest('hex');
}

function metroCacheKey(files = []) {
    const hash = crypto.createHash('sha1');
    files.forEach(filePath => {
        hash.update(hashFileContents(filePath));
    });
    return hash.digest('hex');
}

module.exports = metroCacheKey;
module.exports.default = metroCacheKey;