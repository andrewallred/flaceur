const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path
const ffmpeg = require('fluent-ffmpeg')
ffmpeg.setFfmpegPath(ffmpegPath);

//requiring path and fs modules
const path = require('path');
const fs = require('fs');

const prompt = require('prompt-sync')();

const fileTypes = ['.aif', '.aiff', '.wav'];
let filesToEncode = [];

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
            if (fs.lstatSync(filePath).isDirectory()) {
                console.log('found folder ' + filePath);
                convertAllFilesInFolder(filePath + '/');
            } else {
                let extension = path.extname(file);
                let flacCopy = sourceFolder + file.replace(extension, '.flac');
                if (fileTypes.includes(extension)) {
                    if (!fs.existsSync(flacCopy)) {
                        const yesno = prompt('found file to backup ' + file + ' backup? (y/n/q)');
                        if (yesno == 'y') {
                            console.log(`backing up ${yesno}`);
                            convertFileToFlac(filePath);
                        } else if (yesno == 'q') {
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

const sourceFolder = prompt('please enter the folder to convert: ');
convertAllFilesInFolder(sourceFolder);