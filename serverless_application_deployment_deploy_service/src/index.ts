import { receiveMessages, putItem } from './aws';
import { downloadS3Folder, copyFinalDist } from './aws';
import { buildProject } from './utils';

async function main() {
    setInterval(async () => {
            let messageBodies = await receiveMessages();
            
            if (Array.isArray(messageBodies)) {
                messageBodies.forEach(async (message, index) => {
                    await downloadS3Folder(`output/${message!}`);
                    await buildProject(message!);
                    await copyFinalDist(message!);
                    await putItem(message!,"deployed");
                });
            } 

    }, 5000);
}
main();