#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
升级数据库，添加组词和造句字段
"""

import sqlite3

def upgrade_database():
    """升级数据库结构"""
    db = sqlite3.connect('characters.db')
    cursor = db.cursor()
    
    try:
        # 添加组词字段
        cursor.execute('ALTER TABLE characters ADD COLUMN words TEXT DEFAULT NULL')
        print("✓ 添加 words 字段成功")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e):
            print("- words 字段已存在")
        else:
            print(f"✗ 添加 words 字段失败: {e}")
    
    try:
        # 添加造句字段
        cursor.execute('ALTER TABLE characters ADD COLUMN sentences TEXT DEFAULT NULL')
        print("✓ 添加 sentences 字段成功")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e):
            print("- sentences 字段已存在")
        else:
            print(f"✗ 添加 sentences 字段失败: {e}")
    
    try:
        # 添加拼音字段
        cursor.execute('ALTER TABLE characters ADD COLUMN pinyin TEXT DEFAULT NULL')
        print("✓ 添加 pinyin 字段成功")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e):
            print("- pinyin 字段已存在")
        else:
            print(f"✗ 添加 pinyin 字段失败: {e}")
    
    try:
        # 添加释义字段
        cursor.execute('ALTER TABLE characters ADD COLUMN definition TEXT DEFAULT NULL')
        print("✓ 添加 definition 字段成功")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e):
            print("- definition 字段已存在")
        else:
            print(f"✗ 添加 definition 字段失败: {e}")
    
    db.commit()
    db.close()
    
    print("\n数据库升级完成！")

if __name__ == '__main__':
    upgrade_database()
