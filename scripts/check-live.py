#!/usr/bin/env python3
"""
检测B站直播状态
"""
import json
import os
import requests
from datetime import datetime

UID = os.getenv('BILIBILI_UID', '3821157')

def check_live_status():
    """检查直播状态"""
    url = f'https://api.live.bilibili.com/room/v1/Room/getRoomInfoOld?mid={UID}'
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://live.bilibili.com'
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        data = response.json()
        
        if data.get('code') == 0:
            room_data = data['data']
            is_live = room_data.get('liveStatus', 0) == 1
            
            return {
                'isLive': is_live,
                'title': room_data.get('title', ''),
                'url': f"https://live.bilibili.com/{room_data.get('roomid', '')}" if is_live else '',
                'lastChecked': datetime.now().isoformat()
            }
    except Exception as e:
        print(f"Error checking live status: {e}")
    
    return {
        'isLive': False,
        'title': '',
        'url': '',
        'lastChecked': datetime.now().isoformat()
    }

def update_site_data():
    """更新站点数据文件"""
    # 读取现有数据
    with open('src/data/site-data.json', 'r', encoding='utf-8') as f:
        site_data = json.load(f)
    
    # 获取直播状态
    live_status = check_live_status()
    site_data['liveStatus'] = live_status
    
    if live_status['isLive']:
        print(f"Live detected: {live_status['title']}")
    else:
        print("Not currently live")
    
    # 保存
    with open('src/data/site-data.json', 'w', encoding='utf-8') as f:
        json.dump(site_data, f, ensure_ascii=False, indent=2)

if __name__ == '__main__':
    update_site_data()
