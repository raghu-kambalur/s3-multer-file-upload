const express = require('express')
const app = express()

const AWS = require('aws-sdk')
const path = require('path')
const multer = require('multer')
const fs = require('fs');

require('dotenv').config();

var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'upload');
    },
    filename: function (req, file, cb) {
        cb(null , Date.now()+path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage })

app.post('/',upload.single('profile'),(req,res) => {
    try {

        const ID = process.env.S3_ACCESS_KEY_ID;
        const SECRET = process.env.S3_SECRET_ACCESS_KEY;

        // The name of the bucket that you have created
        const BUCKET_NAME = process.env.S3_BUCKET_NAME;


        const s3 = new AWS.S3({
            accessKeyId: ID,
            secretAccessKey: SECRET
        });

        const fileContent = fs.readFileSync('upload/'+req.file.filename);

        // Setting up S3 upload parameters
        const params = {
            Bucket: BUCKET_NAME+'/test',
            Key: req.file.filename, // File name you want to save as in S3
            Body: fileContent
        };

        // Uploading files to the bucket
        s3.upload(params, function(err, data) {
            if (err) {
                throw err;
            }
            res.send(`File uploaded successfully. ${data.Location}`);
        });
    }catch(err) {
        res.send(err);
    }
})

app.listen(3000,(req,res) => {
    console.log('SERVER RUNNING ON PORT 3000');
})