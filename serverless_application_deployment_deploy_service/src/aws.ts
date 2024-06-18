import { S3 } from "aws-sdk";
import AWS from 'aws-sdk';
import fs from "fs";
import dotenv from 'dotenv';
import path from "path";
import { buildProject } from "./utils";

dotenv.config();

const s3 = new S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KE,
    endpoint: "https://s3.amazonaws.com/"
})

export async function downloadS3Folder(prefix: string) {
    const allFiles = await s3.listObjectsV2({
        Bucket: process.env.S3_BUCKET!,
        Prefix: prefix
    }).promise();
    
    const allPromises = allFiles.Contents?.map(async ({Key}) => {
        return new Promise(async (resolve) => {
            if (!Key) {
                resolve("");
                return;
            }
            const finalOutputPath = path.join(__dirname, Key);
            const outputFile = fs.createWriteStream(finalOutputPath);
            const dirName = path.dirname(finalOutputPath);
            if (!fs.existsSync(dirName)){
                fs.mkdirSync(dirName, { recursive: true });
            }
            s3.getObject({
                Bucket: process.env.S3_BUCKET!,
                Key
            }).createReadStream().pipe(outputFile).on("finish", () => {
                resolve("");
            })
        })
    }) || []
    console.log("awaiting");

    await Promise.all(allPromises?.filter(x => x !== undefined));
}

AWS.config.update({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });

const queueURL = 'https://sqs.us-east-1.amazonaws.com/'+process.env.ACCOUNT_ID+'/'+process.env.SQS_BUILD_QUEUE;
export const receiveMessages = async () => {
    const params = {
        QueueUrl: queueURL,
        MaxNumberOfMessages: 3, // Adjust the number of messages to receive
        VisibilityTimeout: 20, // The length of time (in seconds) the message is invisible to other consumers
        WaitTimeSeconds: 0, // The duration (in seconds) for which the call waits for a message to arrive in the queue
    };

    try {
        const data = await sqs.receiveMessage(params).promise();
        if (data.Messages) {
            console.log('Messages received', data.Messages);

            const messageBodies = await Promise.all(data.Messages.map(async (message) => {
                console.log('Processing message', message.Body);
                await deleteMessage(message.ReceiptHandle!);
                return message.Body;
            }));

            return messageBodies;
        } else {
            console.log('No messages to receive');
        }
    } catch (err) {
        console.error('Error receiving messages', err);
    }
};

// Function to delete a message from the SQS queue
const deleteMessage = async (receiptHandle: string) => {
    const params = {
        QueueUrl: queueURL,
        ReceiptHandle: receiptHandle,
    };

    try {
        const data = await sqs.deleteMessage(params).promise();
        console.log('Message deleted successfully', data);
    } catch (err) {
        console.error('Error deleting message', err);
    }
};

export function copyFinalDist(id: string) {
    const folderPath = path.join(__dirname, `output/${id}/dist`);
    const allFiles = getAllFiles(folderPath);
    allFiles.forEach(file => {
        uploadFile(`dist/${id}/` + file.slice(folderPath.length + 1), file);
    })
}

const getAllFiles = (folderPath: string) => {
    let response: string[] = [];

    const allFilesAndFolders = fs.readdirSync(folderPath);
    allFilesAndFolders.forEach(file => {
        var fullFilePath = path.join(folderPath, file);
        if (fs.statSync(fullFilePath).isDirectory()) {
            response = response.concat(getAllFiles(fullFilePath))
        } else {
            fullFilePath=fullFilePath.replace(/\\/g, '/');
            response.push(fullFilePath);
        }
    });
    return response;
}

const uploadFile = async (fileName: string, localFilePath: string) => {
    const fileContent = fs.readFileSync(localFilePath);
    const response = await s3.upload({
        Body: fileContent,
        Bucket: process.env.S3_BUCKET!,
        Key: fileName,
    }).promise();
}

const dynamoDB = new AWS.DynamoDB();

export async function putItem(key: string, value: string): Promise<void> {
    const params: AWS.DynamoDB.PutItemInput = {
      TableName: process.env.DYNAMODB!,
      Item: {
        'id': { S: key },    // Assuming 'key' is a string attribute
        'value': { S: value } // Assuming 'value' is a string attribute
      }
    };
  
    try {
      await dynamoDB.putItem(params).promise();
      console.log(`Successfully put item: ${key} => ${value}`);
    } catch (err) {
      console.error('Error putting item:', err);
      throw err;
    }
};