# serverless_application_deployment

## Description
A website which streamlines web development by automating deployment, supporting serverless functions, and optimizing performance, ensuring fast and efficient deployment of modern web projects.
It uses the features from AWS such as Dynamodb, SQS, S3, IAM via the aws-sdk in typescript with nodejs project.

The main project is divided into 4 sub projects: 
  - Download code from github and upload into s3 bucket : serverless_application_deployment_uploader
  - Build the projects and upload the final files into s3 bucket : serverless_application_deployment_deploy_service
  - Get the files and deploy the projects online : serverless_application_deployment_request_handler
  - Frontend for user interaction : frontend

For system design purpose, the projects are separated to individual parts and each of the project can be deployed on separate machines which can scale based on the traffic, usage, needs.
So one step doesn't have to wait for the other steps to complete their tasks.

## Steps to Install:
1) Install node.
2) clone this github repo.
3) Create an AWS account and create a user in it and save the (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY) credential details.
4) Create a Dynamodb in aws with the primary key variable name as "id", Create a S3 bucket in aws, create a SQS queue in aws.
5) Assign permissions for the user from IAM roles to give access to S3 bucket full permissions.
6) From env.example file fill the following and save it as a .env file:
   - AWS_ACCESS_KEY_ID="From user credential details"
   - AWS_SECRET_ACCESS_KEY="From user credential details"
   - S3_BUCKET="Name of the created S3 bucket"
   - SQS_BUILD_QUEUE="Name of the created SQS queue"
   - DYNAMODB="Name of the created dynamodb table"
   - ACCOUNT_ID="From the aws account"
7) Place this .env file individually into the below project folders:
   - serverless_application_deployment_deploy_service,
   - serverless_application_deployment_request_handler,
   - serverless_application_deployment_uploader
  
## Steps to run:
1) From root directory cd to serverless_application_deployment_uploader and run the app on localhost:3000
   ```
   cd serverless_application_deployment_uploader
   npm install typescript
   npx tsc -b
   node dist/index.js
   ```
2) From root directory cd to serverless_application_deployment_deploy_service and run the app
   ```
   cd serverless_application_deployment_deploy_service
   npm install typescript
   npx tsc -b
   node dist/index.js
   ```
3) From root directory cd to serverless_application_deployment_request_handler and run the app on localhost:3001
   ```
   cd serverless_application_deployment_request_handler
   npm install typescript
   npx tsc -b
   node dist/index.js
   ```
4) From root directory cd to frontend and run the app on localhost:5173
   ```
   cd frontend
   npm install 
   npm run dev
   ```

## Demo
You can use this project for any node js related web development github projects.
Just enter the github link and upload and wait for the project to be uploaded, deployed and finally it will return the link to view the web application which is hosted in s3.

![image](https://github.com/Anurag-Varma/serverless_application_deployment/assets/62068859/a87e1472-95e8-4c9d-ac40-52beec0f84be)
