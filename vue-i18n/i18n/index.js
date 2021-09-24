/*
 * @Author: xuyiling
 * @Date: 2020-05-13 16:55:50
 * @LastEditTime: 2020-06-21 09:40:33
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \i18n\src\i18n\index.js
 */ 
import VueI18n from 'vue-i18n'
import Vue from 'vue'

import zh from '../lang/zh'
import en from '../lang/en'

Vue.use(VueI18n) 

let curLanguage = window.localStorage.language||'zh'

export default new VueI18n({
  locale: curLanguage,
  messages: {
    zh,
    en
  }
});
