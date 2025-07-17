import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import fetch from 'node-fetch';

const s3 = new S3Client({region: 'ap-southeast-1'}); // Changed region to 'ap-southeast-1' from 'ap-southeast-2'
const CLOUDFRONT_DOMAIN = process.env.CLOUDFRONT_DOMAIN!; // Updated to the new CloudFront domain

// S3 HELPER FUNCTIONS (OLD)
export async function readS3Text(bucket: string, key: string): Promise<string> {
    const res = await s3.send(new GetObjectCommand({Bucket: bucket, Key: key}));
    return (await streamToString(res.Body as Readable));
}

export async function readS3Buffer(bucket: string, key: string): Promise<Buffer> {
    const res = await s3.send(new GetObjectCommand({Bucket: bucket, Key: key}));
    return (await streamToBuffer(res.Body as Readable));
}

// STREAM UTILITIES (No changes)
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

// CLOUDFRONT HELPER FUNCTIONS (NEW)
export async function readCloudFrontText(path: string): Promise<string> {
    const response = await fetch(`${CLOUDFRONT_DOMAIN}/${path}`);
    if (!response.ok) throw new Error(`CloudFront failed: ${response.statusText}`);
    return await response.text();
}

export async function readCloudFrontBuffer(path: string): Promise<Buffer> {
    const response = await fetch(`${CLOUDFRONT_DOMAIN}/${path}`);
    if (!response.ok) throw new Error(`CloudFront failed: ${response.statusText}`);
    return Buffer.from(await response.arrayBuffer());
}