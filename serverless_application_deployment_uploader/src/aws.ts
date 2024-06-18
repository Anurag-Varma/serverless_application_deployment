import { S3 } from "aws-sdk";
import AWS from 'aws-sdk';
import fs from "fs";
import dotenv from 'dotenv';

dotenv.config();

const s3 = new S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KE,
    endpoint: "https://s3.amazonaws.com/"
})

export const uploadFile = async (fileName: string, localFilePath: string) => {
    const fileContent = fs.readFileSync(localFilePath);
    const response = await s3.upload({
        Body: fileContent,
        Bucket: process.env.S3_BUCKET!,
        Key: fileName,
    }).promise();
}

AWS.config.update({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });

const buildqueueURL = 'https://sqs.us-east-1.amazonaws.com/'+process.env.ACCOUNT_ID+'/'+process.env.SQS_BUILD_QUEUE;
export const sendMessageBuildQueue = async (messageBody: string) => {
    const params = {
        MessageBody: messageBody,
        QueueUrl: buildqueueURL,
    };

    try {
        const data = await sqs.sendMessage(params).promise();
        console.log('Message sent successfully', data.MessageId);
    } catch (err) {
        console.error('Error sending message', err);
    }
};


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


export async function getItem(key: string): Promise<string | undefined> {
    const params: AWS.DynamoDB.GetItemInput = {
      TableName: process.env.DYNAMODB!,
      Key: {
        'id': { S: key } // Assuming 'key' is the partition key
      }
    };
  
    try {
      const data = await dynamoDB.getItem(params).promise();
      if (data.Item && data.Item.value) {
        return data.Item.value.S as string; // Assuming 'value' is stored as a string
      } else {
        return undefined;
      }
    } catch (err) {
      console.error('Error getting item:', err);
      throw err;
    }
  }