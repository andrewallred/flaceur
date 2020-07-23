const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path
const ffmpeg = require('fluent-ffmpeg')
ffmpeg.setFfmpegPath(ffmpegPath);

//requiring path and fs modules
const path = require('path');
const fs = require('fs');

let fileTypes = ['aif', 'aiff', 'wav'];

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
            console.log(file); 
        });
    });
}

convertAllFilesInFolder('/Users/andrewallred/Desktop/recordings/', '');