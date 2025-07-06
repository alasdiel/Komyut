import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';

const s3 = new S3Client({region: 'ap-southeast-2'});

export async function readS3Text(bucket: string, key: string): Promise<string> {
    const res = await s3.send(new GetObjectCommand({Bucket: bucket, Key: key}));
    return (await streamToString(res.Body as Readable));
}

export async function readS3Buffer(bucket: string, key: string): Promise<Buffer> {
    const res = await s3.send(new GetObjectCommand({Bucket: bucket, Key: key}));
    return (await streamToBuffer(res.Body as Readable));
}

function streamToBuffer(stream: Readable): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const chunks: Uint8Array[] = [];
        stream.on("data", chunk => chunks.push(chunk));
        stream.on("end", () => resolve(Buffer.concat(chunks)));
        stream.on("error", reject);
    });
}

function streamToString(stream: Readable): Promise<string> {
    return streamToBuffer(stream).then(b => b.toString('utf-8'));
}