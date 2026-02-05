#!/usr/bin/env python3
"""
获取B站用户统计数据
"""
import json
import os
import requests
from datetime import datetime

UID = os.getenv('BILIBILI_UID', '3821157')

def fetch_user_stats():
    """获取用户统计信息"""
    url = f'https://api.bilibili.com/x/web-interface/card?mid={UID}'
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://space.bilibili.com'
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        data = response.json()
        
        if data.get('code') == 0:
            card = data['data']['card']
            return {
                'fans': card['fans'],
                'following': card['attention'],
                'lastUpdated': datetime.now().isoformat()
            }
    except Exception as e:
        print(f"Error fetching stats: {e}")
    
    return None

def update_site_data():
    """更新站点数据文件"""
    # 读取现有数据
    with open('src/data/site-data.json', 'r', encoding='utf-8') as f:
        site_data = json.load(f)
    
    # 获取新数据
    stats = fetch_user_stats()
    if stats:
        site_data['stats'] = stats
        print(f"Updated fans count: {stats['fans']}")
    
    # 保存
    with open('src/data/site-data.json', 'w', encoding='utf-8') as f:
        json.dump(site_data, f, ensure_ascii=False, indent=2)
    
    print("Site data updated successfully")

if __name__ == '__main__':
    update_site_data()
