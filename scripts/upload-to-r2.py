#!/usr/bin/env python3
"""
上传数据到 Cloudflare R2
"""
import json
import os
import boto3
from botocore.config import Config

R2_ENDPOINT = os.getenv('R2_ENDPOINT')
R2_ACCESS_KEY_ID = os.getenv('R2_ACCESS_KEY_ID')
R2_SECRET_ACCESS_KEY = os.getenv('R2_SECRET_ACCESS_KEY')
R2_BUCKET_NAME = os.getenv('R2_BUCKET_NAME', 'lovely-site')

def upload_to_r2():
    """上传站点数据到 R2"""
    s3 = boto3.client(
        's3',
        endpoint_url=R2_ENDPOINT,
        aws_access_key_id=R2_ACCESS_KEY_ID,
        aws_secret_access_key=R2_SECRET_ACCESS_KEY,
        config=Config(signature_version='s3v4'),
        region_name='auto'
    )

    with open('src/data/site-data.json', 'r', encoding='utf-8') as f:
        site_data = json.load(f)

    s3.put_object(
        Bucket=R2_BUCKET_NAME,
        Key='data/site-data.json',
        Body=json.dumps(site_data, ensure_ascii=False),
        ContentType='application/json',
        ACL='public-read'
    )
    print("✅ Uploaded site-data.json")

    stats_data = {
        'fans': site_data['stats']['fans'],
        'liveStatus': site_data['liveStatus'],
        'lastUpdated': site_data['stats']['lastUpdated']
    }
    s3.put_object(
        Bucket=R2_BUCKET_NAME,
        Key='data/stats.json',
        Body=json.dumps(stats_data, ensure_ascii=False),
        ContentType='application/json',
        ACL='public-read'
    )
    print("✅ Uploaded stats.json")

    if os.path.exists('src/data/dynamics.json'):
        with open('src/data/dynamics.json', 'r', encoding='utf-8') as f:
            dynamics_data = json.load(f)
        s3.put_object(
            Bucket=R2_BUCKET_NAME,
            Key='data/dynamics.json',
            Body=json.dumps(dynamics_data, ensure_ascii=False),
            ContentType='application/json',
            ACL='public-read'
        )
        print(f"✅ Uploaded dynamics.json ({len(dynamics_data)} 条动态)")
    else:
        print("⚠️ dynamics.json 不存在，跳过")

    if os.path.exists('src/data/config.json'):
        with open('src/data/config.json', 'r', encoding='utf-8') as f:
            config_data = json.load(f)
        s3.put_object(
            Bucket=R2_BUCKET_NAME,
            Key='data/config.json',
            Body=json.dumps(config_data, ensure_ascii=False),
            ContentType='application/json',
            ACL='public-read'
        )
        print("✅ Uploaded config.json")
    else:
        print("⚠️ config.json 不存在，跳过")

    print("\n🎉 所有数据上传完成！")

if __name__ == '__main__':
    upload_to_r2()
