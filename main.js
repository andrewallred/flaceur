const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg')
const ffmpeg = require('fluent-ffmpeg')

//requiring path and fs modules
const path = require('path');
const fs = require('fs');

const prompt = require('prompt-sync')();

const includedFileTypes = ['.aif', '.aiff', '.wav'];
const excludedFileTypes = ['.DS_Store'];

function convertFileToFlac(sourceFile) {

    let extension = path.extname(sourceFile);
    let targetFile = sourceFile.replace(extension, '.flac');

    ffmpeg(sourceFile)
        .noVideo()
        .addOutputOption('-acodec flac')
        .addOutputOption('-compression_level 12')
        .addOutputOption('-lpc_type none')
        .audioCodec('copy')
        .output(targetFile)
        .on('end', function(err) {
        if(!err) { console.log(targetFile + ' converted!') }
        })
        .on('error', function(err){
        console.log('error: ', err)
        }).run();
}

let stopTraversal = false;
function convertAllFilesInFolder(sourceFolder) {
    //passsing directoryPath and callback function
    fs.readdir(sourceFolder, function (err, files) {
        //handling error
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        }
        if (stopTraversal) {
            return;
        }

        //listing all files using forEach
        files.forEach(function (file) {
            
            if (stopTraversal) {
                return;
            }

            let filePath = sourceFolder + file;
            let extension = path.extname(file);   
            if (!(excludedFileTypes.includes(extension) || excludedFileTypes.includes(file)) && fs.lstatSync(filePath).isDirectory()) {
                console.log('found folder ' + filePath);
                convertAllFilesInFolder(filePath + '/');
            } else {
                let flacCopy = sourceFolder + file.replace(extension, '.flac');
                if (includedFileTypes.includes(extension)) {
                    if (!fs.existsSync(flacCopy)) {
                        const yesNo = prompt('found file to backup ' + file + ' backup? (y/n/q)');
                        if (yesNo == 'y') {
                            console.log(`backing up ${file}`);
                            convertFileToFlac(filePath);
                        } else if (yesNo == 'q') {
                            console.log('finishing conversions and exiting');
                            stopTraversal = true;
                        } else {
                            console.log('skipping file');
                        }
                    } else {
                        console.log('found file but backup already exists ' + file);
                    }
                }
            }
        });        
    });    
}

// debugging tool, not currently in use
function traverseFolder(sourceFolder) {

    console.log('traversing ' + sourceFolder);

    //passsing directoryPath and callback function
    fs.readdir(sourceFolder, function (err, files) {
        //handling error
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        }

        //listing all files using forEach
        files.forEach(function (file) {
            
            let filePath = sourceFolder + file;
            let extension = path.extname(file);   
            if (!(excludedFileTypes.includes(extension) || excludedFileTypes.includes(file)) && fs.lstatSync(filePath).isDirectory()) {
                console.log('found folder ' + filePath);
                traverseFolder(filePath + '/');
            } else {
                console.log(`found file ${file}`);
            }
        });        
    });    
}

// by copying ffmpeg from snapshot memory to the file system we can avoid requiring the user to install ffmpeg
async function copyFfmpegFromSnapshotToFileSystem(source) {
    const fs = require('fs');
    const utils = require('util');

    const copyFile = utils.promisify(fs.copyFile);
    const chmod = utils.promisify(fs.chmod);

    const target = path.dirname(process.execPath) + '/ffmpeg';
    console.log(target);
    
    async function copy(source, target) {
        if (process.pkg) {
            // use stream pipe to reduce memory usage
            // when loading a large file into memory.
            console.log('copying to memory ' + source);
            console.log('writing to disk ' + target);
            let rs = fs.createReadStream(source);
            await streamToFile(rs, target);
            console.log('done copying from memory');
        } else {
            await copyFile(source, target);
        }
    }

    await copy(source, target); // this should work
    await chmod(target, 0o765); // maybe need to grant execute permission
}

// used in copyFfmpegFromSnapshotToFileSystem to copy ffmpeg from snapshot memory onto the file system
const streamToFile = (inputStream, filePath) => {
    return new Promise((resolve, reject) => {
      const fileWriteStream = fs.createWriteStream(filePath)
      inputStream
        .pipe(fileWriteStream)
        .on('finish', resolve)
        .on('error', reject)
    })
}

async function run() {    

    if (process.pkg) {        
        await copyFfmpegFromSnapshotToFileSystem('/snapshot/flaceur/node_modules/@ffmpeg-installer/darwin-x64/ffmpeg');

        console.log('done copying ffmpeg from snapshot');
        
        ffmpeg.setFfmpegPath(path.dirname(process.execPath) + '/ffmpeg');
    } else {
        ffmpeg.setFfmpegPath(ffmpegInstaller.path);
    }
    
    let sourceFolder = prompt('please enter the folder to convert: ');

    if (sourceFolder.slice(-1) != '/') {
        sourceFolder = sourceFolder + '/';
    }

    convertAllFilesInFolder(sourceFolder);
}

run();