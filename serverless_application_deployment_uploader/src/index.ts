import express from 'express';
import cors from "cors";
import simpleGit from "simple-git";
import { generateGUID } from "./utils";
import { getAllFiles } from './file';
import path from 'path';
import { uploadFile, sendMessageBuildQueue, putItem, getItem } from './aws';

const app = express();
app.use(cors());
app.use(express.json());

app.post("/deploy", async (req, res) => {
    const repoUrl = req.body.repoUrl;
    const id = generateGUID();
    await simpleGit().clone(repoUrl, path.join(__dirname,`output/${id}`));

    const files = getAllFiles(path.join(__dirname, `output/${id}`));

    files.forEach(async file => {
        await uploadFile(file.slice(__dirname.length + 1), file);
    });

    (async () => {
        await sendMessageBuildQueue(id);
    })();

    (async () => {
        await putItem(id,"uploaded");
    })();

    res.json({
        id: id
    });
});

app.get("/status", async (req, res) => {
    const id= req.query.id;
    const response = await getItem(id as string);
    res.json({
        status: response
    })
})

app.listen(3000);