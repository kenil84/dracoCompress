
const fs = require('fs');
const express = require('express');
const app = express();
let multer = require('multer');
const fsExtra = require('fs-extra');
const { spawn } = require('child_process');
var glbName = "TVS_iQube_512.glb";
var favicon = require('serve-favicon');

//PUJA: add all the files used in app
app.use(express.static('public'));
app.use('/css', express.static(__dirname + 'public/css'));//Add the CSS file going to use
app.use('/js', express.static(__dirname + 'public/js'));//Add the JS file going to use
app.use('/images', express.static(__dirname + 'public/images'));//ADd all the images going to use
app.use(express.static("bower_components"));// EJS
app.set('view engine', 'ejs');// Puja:View html in browser
app.use(favicon(__dirname + '/public/img/favicon.ico'));
app.get('/', (req, res) => res.render('draco'));

// Download your file from here
var path = require('path');
var mime = require('mime');


//----------------------------------------------------------Stage 4 Upload------------------------------------------------//
//PUJA: Creating local storage for dumping files from frontend
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        skuID = req.query.skuid;
        foldername_upload = req.query.foldername;
        console.log("skuID" + skuID);
        // Uploads is the Upload_folder_name
        cb(null, "uploads/stage4/" + skuID + "/" + req.query.foldername)
    },
    filename: function (req, file, cb) {
        let blankReplacedWithUnderscore = file.originalname.replace(/ /g, "_");
        cb(null, blankReplacedWithUnderscore)//callback
    }
})

//PUJA: middleware to delete files from the local storage because making new request
var middleware = {
    deletefn: async function (req, res, next) {
        skuID = req.query.skuid;
        await fsExtra.emptyDirSync('./uploads/stage4/' + skuID + "/" + req.query.foldername);
        next()
    }
}

//PUJA: upload the files in array form.
var uploadFolder = multer({
    storage: storage,
}).array("uploadTexture");



//PUJA: sendiing post request to get files in backend
app.post("/uploadTextureFiles", middleware.deletefn, function (req, res, next) {
    // console.log(req);
    // Error MiddleWare for multer file upload, so if any
    // error occurs, the image would not be uploaded!
    uploadFolder(req, res, function (err) {
        skuID = req.query.skuid;
        console.log(skuID);
        if (err) {

            // ERROR occured (here it can be occured due
            // to uploading image of size greater than
            // 1MB or uploading different file type)
            res.send(err)
        }
        else {
            // SUCCESS, image successfully uploaded
            // res.send("Success, Image uploaded!")
            // getAllFilesFromFolder(__dirname + "/uploads/"+skuID);// recursively traversing the folders to get the files
            let dataToSend;
            const python = spawn('python3', ['./draco.py', "./uploads/stage4/" + skuID + "/" + req.query.foldername]);
            // // collect data from script
            python.stdout.on('data', function (data) {
                console.log('Pipe data from python script ...');
                dataToSend = data.toString();
            });
            // in close event we are sure that stream from child process is closed
            python.on('close', (code) => {
                console.log(`child process close all stdio with code ${code}`);
                // send data to browser
                res.send(dataToSend)
                // res.send((results));// send the array of files to front end.
                // results = [];
            });
        }
    })
})

//JT: Download and delete
app.get('/download/:file(*)', (req, res) => {
    var file = req.params.file;
    var finalFileName = file.replace(".glb", "") + "_draco.glb"
    console.log(finalFileName);
    var fileLocation = path.join('./uploads/stage4/DracoFolder', finalFileName);
    console.log(fileLocation);
    res.download(fileLocation, finalFileName);
});


app.get("/downloadDraco", function (req, res) {
    var fileDownload = "/uploads/stage4/DracoFolder/" + glbName.replace(".glb", "") + "_draco.glb"
    var fileDownload1 = "/uploads/stage4/DracoFolder/" + glbName;
    setTimeout(() => {

        res.download(path.join(__dirname, fileDownload), function (err) {
            console.log(err);
        });

    }, 500)
    // setTimeout(() => {
    //     fs.unlink(fileDownload, function (err) {
    //         if (err) return console.log(err);
    //         console.log('file deleted successfully');
    //     });
    //     fs.unlink(fileDownload1, function (err) {
    //         if (err) return console.log(err);
    //         console.log('file deleted successfully1');
    //     });
    // }, 10000)
})

app.get('/DeleteFile', function (req, res) {
    var fileName = req.query.fileName
    var File_Name_UnDraco = fileName.replace("_draco.glb", "") + ".glb"
    var file = __dirname + '/uploads/stage4/DracoFolder/' + fileName;
    var file1 = __dirname + '/uploads/stage4/DracoFolder/' + File_Name_UnDraco;
    fs.unlink(file, function (err) {
        if (err) return console.log(err);
        console.log('file deleted successfully');
    });
    fs.unlink(file1, function (err) {
        if (err) return console.log(err);
        console.log('file deleted successfully1');
    });
});

app.get('/downloadFile', function (req, res) {
    var fileName = req.query.fileName
    var file = __dirname + '/uploads/stage4/DracoFolder/' + fileName;

    var filename = path.basename(file);
    var mimetype = mime.lookup(file);

    res.setHeader('Content-disposition', 'attachment; filename=' + fileName);
    res.setHeader('Content-type', mimetype);

    var filestream = fs.createReadStream(file);
    filestream.pipe(res);
});


app.listen(3000, () => { // listen to the port
    console.log("listening to port " + 3000);
});