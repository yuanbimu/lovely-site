#!/usr/bin/env python3
"""
上传动态图片到 R2
"""
import os
import boto3
from botocoe.config import Config
import glob

R2_ENDPOINT = os.getenv('R2_ENDPOINT')
R2_ACCESS_KEY_ID = os.getenv('R2_ACCESS_KEY_ID')
R2_SECRET_ACCESS_KEY = os.getenv('R2_SECRET_ACCESS_KEY')
R2_BUCKET_NAME = os.getenv('R2_BUCKET_NAME', 'lovely-site')
CDN_DOMAIN = os.getenv('CDN_DOMAIN', '')

PICS_DIR = 'public/getdym/pics'
SHOWCASE_DIR = 'public/showcase'

def upload_to_r2():
    """上传图片到 R2"""
    s3 = boto3.client(
        's3',
        endpoint_url=R2_ENDPOINT,
        aws_access_key_id=R2_ACCESS_KEY_ID,
        aws_secret_access_key=R2_SECRET_ACCESS_KEY,
        config=Config(signature_version='s3v4'),
        region_name='auto'
    )

    uploaded_count = 0
    skipped_count = 0

    for directory, prefix in [(PICS_DIR, 'images/dynamics'), (SHOWCASE_DIR, 'showcase')]:
        if not os.path.exists(directory):
            print(f"目录不存在: {directory}")
            continue

        print(f"\n上传 {directory} 到 {prefix}/")

        for filepath in glob.glob(os.path.join(directory, '*')):
            if os.path.isfile(filepath):
                filename = os.path.basename(filepath)
                key = f"{prefix}/{filename}"

                content_type = get_content_type(filename)

                try:
                    with open(filepath, 'rb') as f:
                        s3.upload_fileobj(
                            f,
                            R2_BUCKET_NAME,
                            key,
                            ExtraArgs={
                                'ContentType': content_type,
                                'ACL': 'public-read'
                            }
                        )

                    if CDN_DOMAIN:
                        url = f"https://{CDN_DOMAIN}/{key}"
                    else:
                        url = f"{R2_ENDPOINT}/{R2_BUCKET_NAME}/{key}"

                    print(f"  ✅ {filename} -> {url}")
                    uploaded_count += 1
                except Exception as e:
                    print(f"  ❌ {filename} 上传失败: {e}")
                    skipped_count += 1

    print(f"\n完成！上传: {uploaded_count}, 失败: {skipped_count}")

def get_content_type(filename):
    """根据文件名获取 Content-Type"""
    ext = filename.lower().split('.')[-1]
    types = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'webp': 'image/webp',
    }
    return types.get(ext, 'application/octet-stream')

if __name__ == '__main__':
    upload_to_r2()
