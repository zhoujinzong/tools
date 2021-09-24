require('colors');
const path = require('path');
const fs = require('fs');
const {getAllFiles} = require('./utils');
const md5 = require('js-md5')
let i18nFile;
let ignoreFile;
let ignoreFilePathList=[];
let config = {
    key: '',
    single: false
};
let generate = 1;
let messagesHash = {};
let messages;
let rootPath;
/**
 * 初始化国际化的消息对象
 */
const initMessage = () => {
    if (fs.existsSync(i18nFile)) {
        try {
            messages = require(i18nFile);
            Object.keys(messages).forEach(key => {
                messagesHash[messages[key]] = key;
            });
            //获取最大的index
            generate = Math.max(...Object.keys(messages).map(item => item.replace(/^[^\d]+/, '') - 0)) || 1;
        } catch (e) {
        }
    }
    if (!messages || !Object.keys(messages).length) {
        messages = {};
    }
};
/**
 * 写入国际化消息文件
 */
const writeMessage = () => {
    //若设置了国际化文件目录，则同时更新所有的国际化文件
    if (config.path) {
        try {
            let localeDir = path.join(process.cwd(), config.path ? config.path : '');
            fs.readdirSync(localeDir).forEach(file => {
                file = path.join(localeDir, file);
                if (file !== i18nFile) {
                    let oldMessages = require(file);
                    fs.writeFileSync(file, `module.exports = ${JSON.stringify(Object.assign({}, messages, oldMessages), null, '\t')}`, 'utf8');
                }
            });
        } catch (e) {
        }
    }
    fs.writeFileSync(i18nFile, `module.exports = ${JSON.stringify(messages, null, '\t')}`, 'utf8');
};
/**
 * 获取忽略文件列表
 * @author zxd
 */
 const getIgnoreFile = ()=>{
    try {
        let ignoreFile = path.join(process.cwd(),'./src/i18n', 'ignoreFile.js');
        let pathlist = require(ignoreFile);
        pathlist.map(item=>{
            let ignoreFilePath = path.join(process.cwd(),'',item)
            ignoreFilePathList.push(ignoreFilePath)
        })
    } catch (e) {
        console.error(`忽略文件 ${ignoreFile} 错误或不存在，请确认`.red);
        // process.exit(0);
    }
 }

/**
 * 获取key前缀
 * @param file
 * @returns {string}
 */
const getPreKey = (file) => {
    return config.key ? `${config.key.replace(/[-_]+$/, '')}_` : `${path.relative(rootPath, file).replace(/[\\/\\\\-]/g, '_').replace(/\..*$/, '')}_`;
};

/**
 * 获取当前key
 * @returns {*}
 */
const getCurrentKey = (match, file) => {
    if (messagesHash[match]) return messagesHash[match];
    // let key = getPreKey(file) + (generate++);
    let key = md5(match)
    if (!messages[key]) return key.toLowerCase();
    return getCurrentKey(match, file);
};

const resetIndex = () => {
    //对于支持单文件index情况，恢复初始index
    if (config.single && !config.key) {
        generate = 1;
    }
};

const resetMessageHash = () => {
    //针对没有设置key的情况，恢复每次文件的messageHash
    if (!config.key) {
        messagesHash = {};
    }
};

/**
 * 替换Vue文件中的需要国际化的部分
 * @param file
 */
const generateVueFile = file => {
    let processFile = path.relative(process.cwd(), file);
    console.log(`➤ ${processFile.yellow}`.blue);
    // resetIndex();
    // resetMessageHash();
    let hasReplaced = false;
    let content = fs.readFileSync(file, 'utf8');
    // 替换template中的部分
    content = content.replace(/<template(.|\n)*template>/gim, match => {
        match = match.replace(/(["'])`([^`\n]*[\u4e00-\u9fa5]+[^`\n]*)`(['"])/gim, (_, prev, match, after) => {
            match = match.trim();
            let matchIndex = 0;
            let matchArr = [];
            let result;
            match = match.replace(/(\${)([^{}]+)(})/gim, (_, prev, match) => {
                matchArr.push(match);
                return `{${matchIndex++}}`;
            });
            let currentKey = getCurrentKey(match, file);
            if (!matchArr.length) {
                result = prev === '"' ? `"$t('${currentKey}')"` : `'$t("${currentKey}")'`;
            } else {
                result = prev === '"' ? `"$t('${currentKey}', [${matchArr.toString()}])"` : `'$t("${currentKey}", [${matchArr.toString()}])'`;
            }
            messages[currentKey] = match;
            messagesHash[match] = currentKey;
            hasReplaced = true;
            return result;
        });
        return match.replace(/(\w+='|\w+="|>|'|")([^'"<>]*[\u4e00-\u9fa5]+[^'"<>]*)(['"<])/gim, (_, prev, match, after) => {
            match = match.trim();
            let result = '';
            let currentKey;
            if (match.match(/{{[^{}]+}}/)) {
                //对于 muscache 中部分的替换
                let matchIndex = 0;
                let matchArr = [];
                match = match.replace(/{{([^{}]+)}}/gim, (_, match) => {
                    matchArr.push(match);
                    return `{${matchIndex++}}`;
                });
                currentKey = getCurrentKey(match, file);
                if (!matchArr.length) {
                    result = `${prev}{{$t('${currentKey}')}}${after}`;
                } else {
                    result = `${prev}{{$t('${currentKey}', [${matchArr.toString()}])}}${after}`;
                }
            } else {
                currentKey = getCurrentKey(match, file);
                if (prev.match(/^\w+='$/)) {
                    //对于属性中普通文本的替换
                    result = `:${prev}$t("${currentKey}")${after}`;
                } else if (prev.match(/^\w+="$/)) {
                    //对于属性中普通文本的替换
                    result = `:${prev}$t('${currentKey}')${after}`;
                } else if (prev === '"' || prev === '\'') {
                    //对于属性中参数形式中的替换
                    result = `$t(${prev}${currentKey}${after})`;
                } else {
                    //对于tag标签中的普通文本替换
                    result = `${prev}{{$t('${currentKey}')}}${after}`;
                }
            }
            messages[currentKey] = match;
            messagesHash[match] = currentKey;
            hasReplaced = true;
            return result;
        });
    });
    // 替换script中的部分
    content = content.replace(/<script(.|\n)*script>/gim, match => {
        //替换注释部分
        let comments = {};
        let commentsIndex = 0;
        match = match.replace(/(\/\*(.|\n|\r)*\*\/)|(\/\/.*)/gim, (match, p1, p2, p3, offset, str) => {
            //排除掉url协议部分
            if (offset > 0 && str[offset - 1] === ':') return match;
            let commentsKey = `/*comment_${commentsIndex++}*/`;
            comments[commentsKey] = match;
            return commentsKey;
        });
        match = match.replace(/(['"`])([^'"`\n]*[\u4e00-\u9fa5]+[^'"`\n]*)(['"`])/gim, (_, prev, match, after) => {
            match = match.trim();
            let currentKey;
            let result = '';
            if (prev !== '`') {
                //对于普通字符串的替换
                currentKey = getCurrentKey(match, file);
                result = `this.$t('${currentKey}')`;
            } else {
                //对于 `` 拼接字符串的替换
                let matchIndex = 0;
                let matchArr = [];
                match = match.replace(/(\${)([^{}]+)(})/gim, (_, prev, match) => {
                    matchArr.push(match);
                    return `{${matchIndex++}}`;
                });
                currentKey = getCurrentKey(match, file);
                if (!matchArr.length) {
                    result = `this.$t('${currentKey}')`;
                } else {
                    result = `this.$t('${currentKey}', [${matchArr.toString()}])`;
                }
            }
            messages[currentKey] = match;
            messagesHash[match] = currentKey;
            hasReplaced = true;
            return result;
        });
        //换回注释
        return match.replace(/\/\*comment_\d+\*\//gim, match => {
            return comments[match];
        });
    });
    hasReplaced && fs.writeFileSync(file, content, 'utf-8');
    console.log(`✔ ${processFile.yellow}`.green);
};
