### 国际化操作方法
前端提取文本转换为key值使用的插件地址：
https://gitee.com/thesadboy/vue-i18n-generator
(注意这里要下指定版本 2.0.9，不然会出一些问题)
npm下来后一般会放在
`C:\Users\Administrator\AppData\Roaming\npm\node_modules\vue-i18n-cli` 中
用i18n-cli中的三个文件替换对应的文件。
在此插件自己完善后，也可发布自己的npm包，这样别人在使用的时候就不用替换了。鉴于公司网络环境可能发布不了。

#### 文件说明：
**I18n-cli文件夹**：是在插件的基础修改后的文件。

**I18nReplaceRender.js** ：是转换配置页面的，跟其它render放一起。在**DevmanageMonitor.js**文件中引入。并在其它render前**第一个**使用
```javascript
import { i18nReplaceRender } from "../../../static/extend/js/i18nReplaceRender";
	i18nReplaceRender("deviceMessagePage")
    runjs();
```

**获取xml语言包和解析xml语言包.txt**:用来获取文件语言包，和解析xml文件。将两个方法放到**public.js**文件中，如果后台有修改存放语言包路径，修改获取的那个方法中的路径即可。两个方法在需要切换语言的页面引入。

**Changelanguage.txt**： 放在**SystemSetParam.js**文件中，在参数设置页面选择语言，切换语言使用（此方法有上面两个获取语言包解析语言包的使用示例）。

**前端国际化子系统设计**：平时在编写页面代码时需要注意的语法和事项。

**I18n文件夹**：包含index.js文件和ignore.js文件。放在一下路径中
 
在main.js(入口文件)中引入其中的index.js文件

删除之前的i18n使用方法。

#### 命令使用：（具体可参照插件文档，也可以自己修改命令。）
	1.	转换  i18n generate  ./src
	2.	还原  i18n revert  ./src

##### 命令链：
在package.json文件中添加一条命令，命令名字可以自定义，例如：
```javascript
	"build": "node build/build.js",
    "i18n-build":"i18n generate ./src & node build/build/.js & i18n revert ./src"
```
在scripts对象中添加 i18n-build 命令 此命令会先提取页面文本转为md5的key值，在提取完成后会打包代码。打包代码完成后会还原文本。（如果打包失败，则不会执行还原文本命令，在再次点击i18n-build命令重新打包）

在添加此命令后 vscode的npm脚本中会自动多一条命令，在需要打包时点击一下即可。


插件提取文本转换成key值的语言包会默认放在lang/zh.js中，需要修改存放路径的修改插件里的路径即可，插件文档也有说明。
