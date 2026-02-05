#!/usr/bin/env python3
"""
将 result.json 转换为前端可用的 dynamics.json 格式
"""
import json
import os
from datetime import datetime

INPUT_FILE = 'public/getdym/result.json'
OUTPUT_FILE = 'src/data/dynamics.json'
CDN_DOMAIN = os.getenv('CDN_DOMAIN', '')

def convert_timestamp(ts):
    """时间戳转格式化字符串"""
    return datetime.fromtimestamp(ts).strftime('%Y-%m-%d %H:%M')

def convert_picture_url(url):
    """转换图片 URL 为 CDN 路径"""
    if not url:
        return ""

    if CDN_DOMAIN and url.startswith('http'):
        filename = os.path.basename(url.split("?")[0])
        return f"https://{CDN_DOMAIN}/images/dynamics/{filename}"

    return url

def convert_dynamics():
    """转换动态数据"""
    if not os.path.exists(INPUT_FILE):
        print(f"文件不存在: {INPUT_FILE}")
        return

    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        raw_data = json.load(f)

    dynamics = []

    for item in raw_data:
        item_data = item.get("item", {})
        origin_data = item.get("origin", {})

        content = item_data.get("content", "") or item_data.get("title", "") or ""
        pictures = [convert_picture_url(url) for url in item_data.get("pictures", []) if url]

        dynamic = {
            "id": item.get("dynamic_id", ""),
            "type": item.get("type", ""),
            "content": content,
            "images": pictures,
            "author": "東愛璃Lovely",
            "time": convert_timestamp(item.get("timestamp", 0)),
            "timestamp": item.get("timestamp", 0),
            "stats": {
                "likes": 0,
                "comments": 0,
                "reposts": 0
            }
        }

        if item.get("origin"):
            dynamic["origin_user"] = item.get("origin_user", "")
            dynamic["origin_content"] = origin_data.get("content", "") or origin_data.get("title", "")
            origin_pics = [convert_picture_url(url) for url in origin_data.get("pictures", []) if url]
            if origin_pics:
                dynamic["origin_images"] = origin_pics

        dynamics.append(dynamic)

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(dynamics, f, ensure_ascii=False, indent=2)

    print(f"转换完成！共 {len(dynamics)} 条动态")
    print(f"输出文件: {OUTPUT_FILE}")

    if CDN_DOMAIN:
        print(f"图片 CDN: https://{CDN_DOMAIN}/images/dynamics/")

if __name__ == '__main__':
    convert_dynamics()
