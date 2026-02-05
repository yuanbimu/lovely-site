#!/usr/bin/env python3
"""
抓取 B站用户动态
"""
import json
import os
import asyncio
import aiohttp
from bilibili_api import user, Credential
import urllib.parse
from datetime import datetime

BILIBILI_UID = os.getenv('BILIBILI_UID', '3821157')
BILIBILI_SESSDATA = os.getenv('BILIBILI_SESSDATA', '')
OUTPUT_FILE = 'public/getdym/result.json'
PICS_DIR = 'public/getdym/pics'

def copy_keys(src, keys):
    res = {}
    for k in keys:
        if k in src:
            res[k] = src[k]
    return res

def item_to_obj(item):
    """将动态 item 转换为标准格式"""
    modules = item.get("modules", {}) or {}
    author = modules.get("module_author", {}) or {}
    dynamic = modules.get("module_dynamic", {}) or {}
    major = dynamic.get("major", {}) or {}

    res = {
        "dynamic_id": item.get("id_str"),
        "timestamp": int(author.get("pub_ts", 0)),
        "type": item.get("type"),
    }

    item_data = {}
    major_type = major.get("type", "")

    if major_type == "MAJOR_TYPE_OPUS":
        opus = major.get("opus", {})
        summary = opus.get("summary", {})
        item_data["content"] = summary.get("text", "")
        pics = opus.get("pics", [])
        item_data["pictures"] = [pic.get("url") for pic in pics if pic.get("url")]
    elif major_type == "MAJOR_TYPE_ARCHIVE":
        archive = major.get("archive", {})
        item_data["title"] = archive.get("title", "")
        item_data["desc"] = archive.get("desc", "")
        item_data["pictures"] = [archive.get("cover", "")]
        item_data["av"] = archive.get("aid", "")
    elif major_type == "MAJOR_TYPE_DRAW":
        draw = major.get("draw", {})
        desc = dynamic.get("desc", {})
        if desc:
            item_data["content"] = desc.get("text", "")
        pics = draw.get("items", [])
        item_data["pictures"] = [pic.get("url") for pic in pics if pic.get("url")]
    else:
        desc = dynamic.get("desc", {})
        if desc:
            item_data["content"] = desc.get("text", "")

    res["item"] = item_data

    if item.get("orig"):
        orig = item.get("orig", {}) or {}
        orig_modules = orig.get("modules", {}) or {}
        orig_author = orig_modules.get("module_author", {}) or {}
        orig_dynamic = orig_modules.get("module_dynamic", {}) or {}
        orig_major = orig_dynamic.get("major", {}) or {}

        origin_data = {}
        orig_major_type = orig_major.get("type", "")

        if orig_major_type == "MAJOR_TYPE_OPUS":
            opus = orig_major.get("opus", {})
            summary = opus.get("summary", {})
            origin_data["content"] = summary.get("text", "")
            pics = opus.get("pics", [])
            origin_data["pictures"] = [pic.get("url") for pic in pics if pic.get("url")]
        elif orig_major_type == "MAJOR_TYPE_ARCHIVE":
            archive = orig_major.get("archive", {})
            origin_data["title"] = archive.get("title", "")
            origin_data["desc"] = archive.get("desc", "")
            origin_data["pictures"] = [archive.get("cover", "")]
        elif orig_major_type == "MAJOR_TYPE_DRAW":
            draw = orig_major.get("draw", {})
            desc = orig_dynamic.get("desc", {})
            if desc:
                origin_data["content"] = desc.get("text", "")
            pics = draw.get("items", [])
            origin_data["pictures"] = [pic.get("url") for pic in pics if pic.get("url")]
        else:
            desc = orig_dynamic.get("desc", {})
            if desc:
                origin_data["content"] = desc.get("text", "")

        res["origin"] = origin_data
        res["origin_user"] = orig_author.get("name", "")

    return res

async def download_picture(session, url, filepath):
    """下载单张图片"""
    try:
        async with session.get(url) as resp:
            if resp.status == 200:
                with open(filepath, 'wb') as f:
                    async for chunk in resp.content.iter_chunked(8192):
                        f.write(chunk)
                return True
    except Exception as e:
        print(f"下载失败 {url}: {e}")
    return False

async def fetch_dynamics():
    """抓取用户动态"""
    print(f"开始抓取 UID {BILIBILI_UID} 的动态...")

    credential = None
    if BILIBILI_SESSDATA:
        sessdata = urllib.parse.unquote(BILIBILI_SESSDATA)
        credential = Credential(sessdata=sessdata)
        print("已加载登录凭证")

    u = user.User(uid=int(BILIBILI_UID), credential=credential)

    offset = ""
    all_items = []
    page_count = 0

    os.makedirs(PICS_DIR, exist_ok=True)

    async with aiohttp.ClientSession() as http_session:
        while True:
            page_count += 1
            print(f"获取第 {page_count} 页...")

            try:
                res = await u.get_dynamics_new(offset)
                items = res.get("items", [])
                has_more = res.get("has_more", False)
                new_offset = res.get("offset", "")

                print(f"  获得 {len(items)} 条动态")

                for item in items:
                    card_obj = item_to_obj(item)
                    all_items.append(card_obj)

                    item_pictures = card_obj.get("item", {}).get("pictures", [])
                    origin_pictures = card_obj.get("origin", {}).get("pictures", [])
                    all_pictures = item_pictures + origin_pictures

                    if all_pictures:
                        tasks = []
                        for pic_url in all_pictures:
                            if pic_url:
                                filename = os.path.basename(pic_url.split("?")[0])
                                filepath = os.path.join(PICS_DIR, filename)
                                if not os.path.exists(filepath):
                                    tasks.append(download_picture(http_session, pic_url, filepath))

                        if tasks:
                            await asyncio.gather(*tasks)
                            print(f"    下载了 {len([t for t in tasks if t.done()])} 张图片")

                if not has_more or not new_offset:
                    print("没有更多动态了")
                    break

                offset = new_offset
                await asyncio.sleep(1.5)

            except Exception as e:
                print(f"获取动态失败: {e}")
                break

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(all_items, f, ensure_ascii=False, indent=2)

    print(f"\n完成！共获取 {len(all_items)} 条动态")
    print(f"图片保存在: {PICS_DIR}")

if __name__ == '__main__':
    asyncio.run(fetch_dynamics())
