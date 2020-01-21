var aws = require('aws-sdk'); 
require('dotenv').config({path: __dirname + '/.env'}); // Configure dotenv to load in the .env file

// Configure aws with your accessKeyId and your secretAccessKey
aws.config.update({
  region: 'us-east-2', // Put your aws region here
  accessKeyId: process.env.AWSAccessKeyId,
  secretAccessKey: process.env.AWSSecretKey 
})

const S3_BUCKET = process.env.Bucket;
const s3 = new aws.S3();  // Create a new instance of S3

// Now lets export this function so we can call it from somewhere else
exports.sign_s3 = (req,res) => {
  const fileName = req.body.fileName;
  const fileType = req.body.fileType;
  
  // Set up the payload of what we are sending to the S3 api
  const s3Params = {
    Bucket: S3_BUCKET,
    Key: fileName,
    Expires: 500,
    ContentType: fileType,
    ACL: 'public-read'
  };
  // Make a request to the S3 API to get a signed URL which we can use to upload our file
  s3.getSignedUrl('putObject', s3Params, (err, data) => {
    if (err) {
      console.log('error in get url before uploading to s3', err);
      res.json({success: false, error: err});
    }
    // Data payload of what we are sending back, the url of the signedRequest and a URL where we can access the content after its saved. 
    const returnData = {
      signedRequest: data,
      url: `https://${S3_BUCKET}.s3.amazonaws.com/${fileName}`
    };
    // Send it all back
    res.json({ success: true, data: { returnData }});
  });
}

exports.delete_photo = (req, res) => {
  const fileName = req.body.fileName;
  //console.log('delete fileName', fileName);
  
  var params = {
    Bucket: S3_BUCKET,
    Key: fileName
  };
  
  s3.deleteObject(params, function(err, data) {
    if (err) {
      console.log('Error when deleting photo', err);
      res.json({success: false, error: err});
    } else { 
      //console.log('Delete successfully', data);
      res.json({ success: true, data });
    }
  });
}

exports.get_photos = (req, res) => {
  let result = [];
  var params = {
    Bucket: S3_BUCKET
   };
  s3.listObjects(params, function(err, data) {
    if (err) {
      console.log('error in get all photos name', err.stack); // an error occurred
    } else {
      data.Contents.forEach((item) => {
        result.push(item.Key);
      })
      //console.log('Get all photo name successfully', result);
      res.json({ success: true, data: result });
    }
  });
}

// exports.get_photo = (req, res) => {
//   let fileName = req.query.fileName;
//   const params = {
//     Bucket: S3_BUCKET,
//     Key: fileName,
//   };
  
//   s3.getObject(params, (err, file) => {
//     if (err) {
//       console.log('error in get photo using photo name', err);
//       res.json({success: false, error: err});
//     }
//     console.log('get photo using file name successful', fileName);    
//     res.json({ success: true, data: file.Body });
//   });
// }
