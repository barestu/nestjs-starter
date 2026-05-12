import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class StorageService {
  private readonly s3: S3Client | null = null;
  private readonly bucket: string | null = null;

  constructor(private readonly configService: ConfigService) {
    const region = this.configService.get<string>('AWS_REGION');
    const endpoint = this.configService.get<string>('AWS_ENDPOINT');
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>(
      'AWS_SECRET_ACCESS_KEY',
    );
    const bucket = this.configService.get<string>('AWS_BUCKET');

    if (region && accessKeyId && secretAccessKey && bucket) {
      this.s3 = new S3Client({
        region,
        ...(endpoint && { endpoint }),
        credentials: { accessKeyId, secretAccessKey },
        forcePathStyle: !!endpoint,
      });
      this.bucket = bucket;
    }
  }

  private assertConfigured(): void {
    if (!this.s3 || !this.bucket) {
      throw new ServiceUnavailableException('Storage not configured');
    }
  }

  async upload(file: Express.Multer.File, key: string): Promise<string> {
    this.assertConfigured();
    await this.s3!.send(
      new PutObjectCommand({
        Bucket: this.bucket!,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );
    return key;
  }

  async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    this.assertConfigured();
    return getSignedUrl(
      this.s3!,
      new GetObjectCommand({ Bucket: this.bucket!, Key: key }),
      { expiresIn },
    );
  }
}
