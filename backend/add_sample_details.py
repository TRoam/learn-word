#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
为部分汉字添加示例详细信息（拼音、释义、组词、造句）
"""

import sqlite3

# 示例数据
sample_details = [
    {
        'character': '汉',
        'pinyin': 'hàn',
        'definition': '1. 汉族，中国主要民族。\n2. 汉朝，中国古代朝代名。\n3. 男子的通称。',
        'words': '汉字\n汉语\n汉族\n汉朝\n好汉',
        'sentences': '汉字是世界上最古老的文字之一。\n我们要学好汉语。\n汉族是中国人口最多的民族。'
    },
    {
        'character': '字',
        'pinyin': 'zì',
        'definition': '1. 文字，记录语言的符号。\n2. 字体。\n3. 字号，别名。',
        'words': '汉字\n文字\n字母\n识字\n写字',
        'sentences': '这个字我不认识。\n老师教我们写字。\n汉字有很多种字体。'
    },
    {
        'character': '学',
        'pinyin': 'xué',
        'definition': '1. 学习，钻研知识。\n2. 模仿。\n3. 学问，知识。',
        'words': '学习\n学校\n学生\n学问\n科学',
        'sentences': '我们要好好学习，天天向上。\n他在学校里学习很认真。\n学无止境。'
    },
    {
        'character': '习',
        'pinyin': 'xí',
        'definition': '1. 学习，钻研。\n2. 复习。\n3. 习惯。',
        'words': '学习\n练习\n习惯\n复习\n自习',
        'sentences': '每天练习写字可以提高书法水平。\n好习惯要从小养成。\n晚上我要复习功课。'
    },
    {
        'character': '好',
        'pinyin': 'hǎo / hào',
        'definition': '1. 优点多的，令人满意的。\n2. 友爱，和睦。\n3. 喜爱，喜欢（hào）。',
        'words': '好人\n好事\n好处\n美好\n爱好',
        'sentences': '他是一个好学生。\n帮助别人是一件好事。\n我的爱好是读书。'
    },
    {
        'character': '人',
        'pinyin': 'rén',
        'definition': '1. 能制造工具并使用工具进行劳动的高等动物。\n2. 每人，一般人。\n3. 别人。',
        'words': '人民\n人类\n好人\n工人\n大人',
        'sentences': '人人都要遵守规则。\n人类是地球上最聪明的动物。\n做人要诚实。'
    },
    {
        'character': '大',
        'pinyin': 'dà',
        'definition': '1. 与"小"相对。\n2. 范围广，程度深。\n3. 年长的。',
        'words': '大小\n大人\n伟大\n长大\n大家',
        'sentences': '这个苹果很大。\n我长大了要当科学家。\n大家一起努力。'
    },
    {
        'character': '小',
        'pinyin': 'xiǎo',
        'definition': '1. 与"大"相对。\n2. 年幼的。\n3. 稍微，略微。',
        'words': '大小\n小孩\n小学\n小心\n小鸟',
        'sentences': '这是一只小鸟。\n我在小学读书。\n过马路要小心。'
    },
    {
        'character': '爱',
        'pinyin': 'ài',
        'definition': '1. 对人或事物有深厚的感情。\n2. 喜欢。\n3. 容易。',
        'words': '爱心\n爱好\n热爱\n可爱\n爱护',
        'sentences': '我爱我的祖国。\n要爱护小动物。\n他爱看书。'
    },
    {
        'character': '书',
        'pinyin': 'shū',
        'definition': '1. 书籍，装订成册的著作。\n2. 书法。\n3. 信件，文书。',
        'words': '书本\n书包\n读书\n书法\n图书',
        'sentences': '我喜欢读书。\n书包里装着课本。\n这本书很有趣。'
    }
]

def add_sample_details():
    """为示例汉字添加详细信息"""
    db = sqlite3.connect('characters.db')
    cursor = db.cursor()
    
    success_count = 0
    not_found_count = 0
    
    for detail in sample_details:
        # 查找汉字
        cursor.execute('SELECT id FROM characters WHERE character = ?', (detail['character'],))
        result = cursor.fetchone()
        
        if result:
            char_id = result[0]
            cursor.execute('''
                UPDATE characters
                SET pinyin = ?, definition = ?, words = ?, sentences = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            ''', (detail['pinyin'], detail['definition'], detail['words'], detail['sentences'], char_id))
            
            success_count += 1
            print(f"✓ 更新汉字 '{detail['character']}' 的详细信息")
        else:
            not_found_count += 1
            print(f"✗ 汉字 '{detail['character']}' 不存在")
    
    db.commit()
    db.close()
    
    print(f"\n完成！")
    print(f"成功更新: {success_count} 个")
    print(f"未找到: {not_found_count} 个")

if __name__ == '__main__':
    add_sample_details()
