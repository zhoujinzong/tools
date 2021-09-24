/**
 * @description 解析html文档所有需翻译文本，替换为系统语言文字
 * @author zxd
 * @createdDate 20200410
 */
/**提取以下文本
1. span 标签包裹
2. &quot;name&quot;:&quot;xxxx&quot;,  此类型的  xxxx文本  区分大小写
3. &quot;Content&quot;:&quot;xxx&quot; 此类型的  xxxx文本  区分大小写
4. button 标签包裹的文本
5. 表头 thead -> tr -> td 文本
所有文本放入Set对象，从i18n中获取当前语言环境语言包，
遍历Set，转为md5值，从语言包中获取对应译文。
替换页面文本
*/
import i18n from '../../../src/i18n/index'
export const i18nReplaceRender = (rangID) => {

    //获取文档Dom
    let HTMLDoc = $('#' + rangID)[0].innerHTML
    //new Set对象 存放页面上的文本
    let strArray = new Set()
    //获取语言包
    let locale = localStorage.getItem('locale');
    let lang = locale ? i18n.getLocaleMessage(local) : i18n.getLocaleMessage('zh')

    //提取文本
    function parseHtml(reg, start, end) {
        reg = eval(`/${reg}/g`);
        let arr = HTMLDoc.match(reg);
        if (arr) {
            arr.map(item => {
                if (item.slice(start, end)) {
                    strArray.add(item.slice(start, end))
                }
            })
        }
    }

    //提取&quot;name&quot;:&quot;xxxx&quot;,类型文本
    parseHtml('&quot;name&quot;:&quot;\(\[\\s\\S\]\*\?\)&quot;,', 23, -7)

    //提取&quot;Content&quot;:&quot;xxx&quot;,类型文本
    parseHtml('&quot;Content&quot;:&quot;\(\[\\s\\S\]\*\?\)&quot;', 26, -6)

    //提取span标签包裹的文本
    let spanArray = $('#' + rangID)[0].getElementsByTagName('span');
    spanArray = Array.from(spanArray)
    spanArray.map((item) => {
        let className = item.className;
        let parentClass = item.parentElement.className
        if (className != 'dev_upschart') { //忽略流图中的span
            if (parentClass != 'upsImg_cc') {
                if (item.innerHTML !== '' && item.innerHTML != '0') {
                    strArray.add(item.innerHTML)
                }
            }
        }
    })

    //提取button标签包裹的文本
    let buttonArray = $('#' + rangID)[0].getElementsByTagName('button');
    buttonArray = Array.from(buttonArray)
    buttonArray.map((item) => {
        if (item.innerHTML !== '') {
            strArray.add(item.innerHTML)
        }
    })

    //提取表头 thead -> tr -> td标签包裹的文本
    let tdArray = $("table thead").find("td")
    if (tdArray) {
        tdArray = Array.from(tdArray)
        tdArray.map((item) => {
            if ($(item).text().trim() != '') {
                strArray.add($(item).text().trim())
            }
        })
    }

    //转换译文
    strArray = Array.from(strArray) //Set对象转Array
    let strMd5Object = {}
    let hasTransArray=[] //有对应译文数组
    strArray.map(item => {
        let item_md5 = $.md5(item)
        if (lang[item_md5]) {
            strMd5Object[item_md5] = lang[item_md5]
            hasTransArray.push(item)
        } else {
            console.warn(`${item} not find translation`)
        }
    })

    
    //替换Dom上有译文的文本
    hasTransArray.map((item) => {
        item = hasSpecialSymbols(item)
        HTMLDoc = HTMLDoc.replace(eval(`/${item}/g`), match => {
            let item_md5 = $.md5(match)
            return strMd5Object[item_md5]
        })
    })

    //特殊字符转译
    function hasSpecialSymbols(str) {
        let SpecialSymbols = ['*', '.', '?', '+', '$', '^', '[', ']', '(', ')', '{', '}', '|', '\\', '/', '（', '）'];
        str = [...str];
        str.map((item, index) => {
            if (SpecialSymbols.indexOf(item) > 0) {
                item = `\\` + item
                str[index] = item
            }
        })
        return str.join('');
    }

    $('#' + rangID)[0].innerHTML = HTMLDoc

}
