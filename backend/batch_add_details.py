#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
批量为汉字添加详细信息（拼音、释义、组词、造句）
"""

import sqlite3

# 常用汉字详细信息数据库
character_details = {
    '的': {
        'pinyin': 'de / dí / dì',
        'definition': '1. 助词，用在词或词组后表示修饰关系。\n2. 确实，实在。\n3. 的确。',
        'words': '好的\n我的\n你的\n美丽的\n的确',
        'sentences': '这是我的书。\n天气真的很好。\n红色的花朵很漂亮。'
    },
    '一': {
        'pinyin': 'yī',
        'definition': '1. 数词，最小的正整数。\n2. 纯；专。\n3. 满；全。',
        'words': '一个\n一样\n一起\n统一\n第一',
        'sentences': '我有一个苹果。\n我们一起去玩吧。\n他是第一名。'
    },
    '是': {
        'pinyin': 'shì',
        'definition': '1. 表示判断或解释。\n2. 对，正确。\n3. 表示存在。',
        'words': '是的\n就是\n不是\n总是\n还是',
        'sentences': '这是一本书。\n你说得是对的。\n他总是很认真。'
    },
    '在': {
        'pinyin': 'zài',
        'definition': '1. 存在；生存。\n2. 表示动作正在进行。\n3. 在于。',
        'words': '在家\n存在\n在意\n正在\n现在',
        'sentences': '我在家里。\n他正在学习。\n现在是下午三点。'
    },
    '不': {
        'pinyin': 'bù',
        'definition': '1. 否定副词。\n2. 不是，不对。',
        'words': '不是\n不要\n不会\n不同\n不好',
        'sentences': '我不会游泳。\n这不是我的。\n不要放弃。'
    },
    '了': {
        'pinyin': 'le / liǎo',
        'definition': '1. 助词，表示完成、变化。\n2. 完毕，结束。',
        'words': '好了\n完了\n知道了\n走了\n吃了',
        'sentences': '我吃完了。\n作业做好了。\n时间到了。'
    },
    '有': {
        'pinyin': 'yǒu',
        'definition': '1. 存在。\n2. 拥有，具有。\n3. 发生，出现。',
        'words': '拥有\n有趣\n有人\n没有\n还有',
        'sentences': '我有一本书。\n这个故事很有趣。\n还有其他问题吗？'
    },
    '和': {
        'pinyin': 'hé / huó / huo',
        'definition': '1. 连词，表示并列关系。\n2. 和睦，和谐。',
        'words': '和平\n温和\n和谐\n总和\n暖和',
        'sentences': '我和他是朋友。\n家庭要和睦。\n春天很暖和。'
    },
    '人': {
        'pinyin': 'rén',
        'definition': '1. 能制造工具并使用工具进行劳动的高等动物。\n2. 别人。\n3. 人品，人格。',
        'words': '人民\n人类\n好人\n工人\n大人',
        'sentences': '人人都要遵守规则。\n人类是智慧的动物。\n做人要诚实。'
    },
    '这': {
        'pinyin': 'zhè',
        'definition': '1. 代词，指示比较近的人或事物。',
        'words': '这个\n这里\n这样\n这些\n这么',
        'sentences': '这是我的书。\n这里很美。\n就这样做吧。'
    },
    '中': {
        'pinyin': 'zhōng / zhòng',
        'definition': '1. 方位词，中间、中心。\n2. 符合、适合。\n3. 射中目标。',
        'words': '中间\n中国\n中心\n空中\n当中',
        'sentences': '他站在中间。\n我是中国人。\n箭射中了靶心。'
    },
    '大': {
        'pinyin': 'dà',
        'definition': '1. 与"小"相对。\n2. 范围广，程度深。\n3. 年长的。',
        'words': '大小\n大人\n伟大\n长大\n大家',
        'sentences': '这个苹果很大。\n我长大了要当科学家。\n大家一起努力。'
    },
    '为': {
        'pinyin': 'wéi / wèi',
        'definition': '1. 做，干。\n2. 当作，作为。\n3. 替，给。',
        'words': '因为\n为了\n作为\n成为\n认为',
        'sentences': '因为下雨所以不出门。\n为了梦想而努力。\n他成为了老师。'
    },
    '上': {
        'pinyin': 'shàng',
        'definition': '1. 方位词，高处。\n2. 由低处到高处。\n3. 向前。',
        'words': '上面\n上学\n上班\n早上\n向上',
        'sentences': '书在桌上。\n我每天上学。\n早上起床了。'
    },
    '个': {
        'pinyin': 'gè',
        'definition': '1. 量词。\n2. 单独的。',
        'words': '一个\n个人\n个子\n这个\n那个',
        'sentences': '我有一个苹果。\n每个人都要遵守规则。\n这个很好。'
    },
    '国': {
        'pinyin': 'guó',
        'definition': '1. 国家。\n2. 代表国家的。',
        'words': '中国\n国家\n祖国\n外国\n国庆',
        'sentences': '我爱我的祖国。\n中国是一个伟大的国家。\n今天是国庆节。'
    },
    '我': {
        'pinyin': 'wǒ',
        'definition': '1. 第一人称代词，自己。',
        'words': '我们\n我的\n自我\n忘我\n我家',
        'sentences': '我是学生。\n我们一起玩。\n这是我的书。'
    },
    '以': {
        'pinyin': 'yǐ',
        'definition': '1. 用，拿。\n2. 依据，按照。\n3. 因为。',
        'words': '以后\n可以\n以前\n所以\n以为',
        'sentences': '以后要认真学习。\n我可以帮你。\n所以我们要努力。'
    },
    '要': {
        'pinyin': 'yào',
        'definition': '1. 索要，希望得到。\n2. 必须。\n3. 将要。',
        'words': '需要\n重要\n要求\n不要\n主要',
        'sentences': '我要吃饭。\n学习很重要。\n不要放弃。'
    },
    '他': {
        'pinyin': 'tā',
        'definition': '1. 第三人称代词，男性。',
        'words': '他们\n他人\n他的\n其他\n利他',
        'sentences': '他是我的朋友。\n他们在玩游戏。\n这是他的书。'
    },
    '时': {
        'pinyin': 'shí',
        'definition': '1. 时间。\n2. 时候。\n3. 季节。',
        'words': '时间\n时候\n平时\n小时\n时代',
        'sentences': '时间到了。\n那时候很开心。\n我们要珍惜时间。'
    },
    '来': {
        'pinyin': 'lái',
        'definition': '1. 从别处到这里。\n2. 发生，产生。\n3. 做某个动作。',
        'words': '来到\n回来\n起来\n原来\n未来',
        'sentences': '他来我家玩。\n春天来了。\n站起来。'
    },
    '用': {
        'pinyin': 'yòng',
        'definition': '1. 使用，应用。\n2. 需要，必须。\n3. 费用。',
        'words': '使用\n用心\n作用\n应用\n不用',
        'sentences': '我会用筷子。\n要用心学习。\n不用客气。'
    },
    '们': {
        'pinyin': 'men',
        'definition': '1. 助词，表示复数。',
        'words': '我们\n你们\n他们\n人们\n孩子们',
        'sentences': '我们是好朋友。\n你们好。\n孩子们在玩耍。'
    },
    '生': {
        'pinyin': 'shēng',
        'definition': '1. 生育，出生。\n2. 生长。\n3. 生命，活的。',
        'words': '学生\n生活\n生日\n出生\n发生',
        'sentences': '我是小学生。\n生活很美好。\n今天是我的生日。'
    },
    '到': {
        'pinyin': 'dào',
        'definition': '1. 到达。\n2. 往。\n3. 周到。',
        'words': '到达\n得到\n看到\n遇到\n直到',
        'sentences': '我到家了。\n我看到了彩虹。\n直到现在还记得。'
    },
    '作': {
        'pinyin': 'zuò',
        'definition': '1. 做，制作。\n2. 写作。\n3. 当作，作为。',
        'words': '作业\n工作\n作文\n制作\n合作',
        'sentences': '我在做作业。\n爸爸去工作了。\n我们要合作。'
    },
    '地': {
        'pinyin': 'dì / de',
        'definition': '1. 土地，地面。\n2. 地方。\n3. 助词，用在状语后。',
        'words': '土地\n地方\n地球\n大地\n认真地',
        'sentences': '地上有水。\n这个地方很美。\n要认真地学习。'
    },
    '于': {
        'pinyin': 'yú',
        'definition': '1. 在，处在。\n2. 对，对于。\n3. 由于。',
        'words': '对于\n由于\n在于\n关于\n终于',
        'sentences': '对于这个问题我有看法。\n由于下雨取消了。\n我终于完成了。'
    },
    '出': {
        'pinyin': 'chū',
        'definition': '1. 从里面到外面。\n2. 发生。\n3. 超出。',
        'words': '出来\n出去\n出现\n日出\n出发',
        'sentences': '太阳出来了。\n我要出去玩。\n问题出现了。'
    },
    '字': {
        'pinyin': 'zì',
        'definition': '1. 文字，记录语言的符号。\n2. 字体。\n3. 字号。',
        'words': '汉字\n文字\n字母\n识字\n写字',
        'sentences': '这个字我不认识。\n老师教我们写字。\n汉字有很多种字体。'
    },
    '学': {
        'pinyin': 'xué',
        'definition': '1. 学习，钻研知识。\n2. 模仿。\n3. 学问。',
        'words': '学习\n学校\n学生\n学问\n科学',
        'sentences': '我们要好好学习。\n他在学校里学习很认真。\n学无止境。'
    },
    '习': {
        'pinyin': 'xí',
        'definition': '1. 学习，钻研。\n2. 复习。\n3. 习惯。',
        'words': '学习\n练习\n习惯\n复习\n自习',
        'sentences': '每天练习写字可以提高书法。\n好习惯要从小养成。\n晚上我要复习功课。'
    },
    '小': {
        'pinyin': 'xiǎo',
        'definition': '1. 与"大"相对。\n2. 年幼的。\n3. 稍微。',
        'words': '大小\n小孩\n小学\n小心\n小鸟',
        'sentences': '这是一只小鸟。\n我在小学读书。\n过马路要小心。'
    },
    '爱': {
        'pinyin': 'ài',
        'definition': '1. 对人或事物有深厚的感情。\n2. 喜欢。\n3. 容易。',
        'words': '爱心\n爱好\n热爱\n可爱\n爱护',
        'sentences': '我爱我的祖国。\n要爱护小动物。\n他爱看书。'
    },
    '天': {
        'pinyin': 'tiān',
        'definition': '1. 天空。\n2. 一昼夜。\n3. 季节，气候。',
        'words': '天空\n今天\n天气\n春天\n每天',
        'sentences': '天空很蓝。\n今天天气真好。\n我每天都学习。'
    },
    '水': {
        'pinyin': 'shuǐ',
        'definition': '1. 无色无味透明的液体。\n2. 河流。',
        'words': '水果\n喝水\n河水\n水平\n开水',
        'sentences': '我要喝水。\n河水很清澈。\n这里水果很甜。'
    },
    '火': {
        'pinyin': 'huǒ',
        'definition': '1. 燃烧。\n2. 发怒。\n3. 急迫。',
        'words': '火车\n生火\n火灾\n火热\n着火',
        'sentences': '我坐火车去旅行。\n不要玩火。\n天气很火热。'
    },
    '山': {
        'pinyin': 'shān',
        'definition': '1. 地面上高耸的部分。',
        'words': '高山\n山上\n山水\n爬山\n山村',
        'sentences': '山上有树。\n我们去爬山。\n山水画很美。'
    },
    '木': {
        'pinyin': 'mù',
        'definition': '1. 树木。\n2. 木头，木材。',
        'words': '树木\n木头\n木材\n木马\n木耳',
        'sentences': '这是一块木头。\n树木要爱护。\n木耳很好吃。'
    },
    '手': {
        'pinyin': 'shǒu',
        'definition': '1. 人体上肢前端。\n2. 拿着，握住。',
        'words': '手指\n双手\n手机\n帮手\n右手',
        'sentences': '我有两只手。\n洗手要用肥皂。\n这是我的手机。'
    },
    '目': {
        'pinyin': 'mù',
        'definition': '1. 眼睛。\n2. 看。\n3. 目录。',
        'words': '目光\n目标\n题目\n节目\n目录',
        'sentences': '我的目标是考第一。\n这个节目很好看。\n书的前面有目录。'
    },
    '口': {
        'pinyin': 'kǒu',
        'definition': '1. 嘴。\n2. 出入通过的地方。',
        'words': '门口\n口水\n人口\n进口\n出口',
        'sentences': '我站在门口。\n中国人口很多。\n这是出口。'
    },
    '耳': {
        'pinyin': 'ěr',
        'definition': '1. 听觉器官。',
        'words': '耳朵\n木耳\n耳机\n耳环\n中耳',
        'sentences': '我有两只耳朵。\n木耳很好吃。\n我用耳机听音乐。'
    },
    '头': {
        'pinyin': 'tóu',
        'definition': '1. 人体最上部分。\n2. 事物的前端。',
        'words': '头发\n石头\n头脑\n开头\n木头',
        'sentences': '我的头发很长。\n这是一块石头。\n故事的开头很有趣。'
    },
    '心': {
        'pinyin': 'xīn',
        'definition': '1. 心脏。\n2. 思想。\n3. 中心。',
        'words': '心情\n用心\n心里\n开心\n爱心',
        'sentences': '我今天很开心。\n要用心学习。\n他有爱心。'
    },
    '足': {
        'pinyin': 'zú',
        'definition': '1. 脚。\n2. 满，充足。',
        'words': '足球\n满足\n不足\n足够\n手足',
        'sentences': '我喜欢踢足球。\n时间足够了。\n兄弟是手足。'
    },
    '日': {
        'pinyin': 'rì',
        'definition': '1. 太阳。\n2. 白天。\n3. 天。',
        'words': '日子\n日出\n生日\n今日\n日记',
        'sentences': '今天是我的生日。\n日出很美。\n我每天写日记。'
    },
    '月': {
        'pinyin': 'yuè',
        'definition': '1. 月亮。\n2. 时间单位。',
        'words': '月亮\n月光\n一月\n月饼\n岁月',
        'sentences': '月亮很圆。\n今天是一月一日。\n中秋节吃月饼。'
    },
    '云': {
        'pinyin': 'yún',
        'definition': '1. 天空中的水汽凝结物。',
        'words': '白云\n云彩\n乌云\n云朵\n云层',
        'sentences': '天上有白云。\n乌云来了要下雨。\n云彩很美。'
    },
    '雨': {
        'pinyin': 'yǔ',
        'definition': '1. 从云层中降落的水滴。',
        'words': '下雨\n雨水\n雨天\n雨伞\n雨季',
        'sentences': '今天下雨了。\n要带雨伞。\n雨天不出门。'
    },
    '风': {
        'pinyin': 'fēng',
        'definition': '1. 空气流动的现象。\n2. 风气。',
        'words': '大风\n风景\n台风\n风筝\n刮风',
        'sentences': '今天刮大风。\n这里风景很美。\n我放风筝。'
    },
    '雪': {
        'pinyin': 'xuě',
        'definition': '1. 空中降落的白色结晶。',
        'words': '下雪\n雪花\n雪人\n雪白\n冰雪',
        'sentences': '冬天会下雪。\n我堆雪人。\n雪花很美。'
    },
    '电': {
        'pinyin': 'diàn',
        'definition': '1. 物理现象。\n2. 电报。',
        'words': '电话\n电视\n电脑\n电灯\n闪电',
        'sentences': '我在看电视。\n电灯很亮。\n打雷有闪电。'
    },
    '车': {
        'pinyin': 'chē',
        'definition': '1. 陆地上有轮子的交通工具。',
        'words': '汽车\n火车\n自行车\n车站\n开车',
        'sentences': '我坐汽车去学校。\n爸爸会开车。\n这是火车站。'
    },
    '马': {
        'pinyin': 'mǎ',
        'definition': '1. 哺乳动物。\n2. 姓。',
        'words': '马上\n骑马\n木马\n马路\n马车',
        'sentences': '我会骑马。\n马上就来。\n过马路要小心。'
    },
    '鸟': {
        'pinyin': 'niǎo',
        'definition': '1. 有羽毛会飞的动物。',
        'words': '小鸟\n鸟儿\n飞鸟\n候鸟\n鸟巢',
        'sentences': '天上有小鸟。\n鸟儿在唱歌。\n鸟巢在树上。'
    },
    '鱼': {
        'pinyin': 'yú',
        'definition': '1. 生活在水中的动物。',
        'words': '小鱼\n鱼儿\n金鱼\n鱼塘\n鲤鱼',
        'sentences': '池塘里有鱼。\n我养了金鱼。\n鱼在水里游。'
    },
}

def batch_add_details():
    """批量添加汉字详细信息"""
    db = sqlite3.connect('characters.db')
    cursor = db.cursor()
    
    success_count = 0
    not_found_count = 0
    
    for char, details in character_details.items():
        # 查找汉字
        cursor.execute('SELECT id FROM characters WHERE character = ?', (char,))
        result = cursor.fetchone()
        
        if result:
            char_id = result[0]
            cursor.execute('''
                UPDATE characters
                SET pinyin = ?, definition = ?, words = ?, sentences = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            ''', (details['pinyin'], details['definition'], details['words'], details['sentences'], char_id))
            
            success_count += 1
            print(f"✓ 更新汉字 '{char}' 的详细信息")
        else:
            not_found_count += 1
            print(f"✗ 汉字 '{char}' 不存在")
    
    db.commit()
    db.close()
    
    print(f"\n完成！")
    print(f"成功更新: {success_count} 个")
    print(f"未找到: {not_found_count} 个")
    print(f"总计处理: {len(character_details)} 个汉字")

if __name__ == '__main__':
    batch_add_details()
