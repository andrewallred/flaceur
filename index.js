const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path
const ffmpeg = require('fluent-ffmpeg')
ffmpeg.setFfmpegPath(ffmpegPath);

//requiring path and fs modules
const path = require('path');
const fs = require('fs');

const prompt = require('prompt-sync')();

const fileTypes = ['.aif', '.aiff', '.wav'];
let filesToEncode = [];

function convertFileToFlac(sourceFile, targetFile) {
    ffmpeg(sourceFile)
        .noVideo()
        .addOutputOption('-acodec flac')
        .addOutputOption('-compression_level 12')
        .addOutputOption('-lpc_type none')
        .audioCodec('copy')
        .output(targetFile)
        .on('end', function(err) {
        if(!err) { console.log('conversion Done') }
        })
        .on('error', function(err){
        console.log('error: ', err)
        }).run();
}

//convertFileToFlac('/Users/andrewallred/Desktop/recordings/systems1.aif', '/Users/andrewallred/Desktop/recordings/output.flac');


function convertAllFilesInFolder(sourceFolder, targetFolder) {
    //passsing directoryPath and callback function
    fs.readdir(sourceFolder, function (err, files) {
        //handling error
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        } 
        //listing all files using forEach
        files.forEach(function (file) {
            // Do whatever you want to do with the file
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

                            //console.log('found file to backup ' + file);                            
                        } else if (yesno == 'q') {
                            console.log('exiting');
                            process.exit(0);
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

convertAllFilesInFolder('/Users/andrewallred/Desktop/recordings/', '');