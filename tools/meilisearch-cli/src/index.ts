import "dotenv/config";
import { loadAwsCredentials } from "@chatbot-ui/secret-service";

const awsCredentials = loadAwsCredentials();
console.log("AWS", awsCredentials.accessKeyId, awsCredentials.region);

