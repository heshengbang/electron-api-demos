const settings = require('electron-settings')
// 获取所有具有js-container-target样式的元素
const demoBtns = document.querySelectorAll('.js-container-target')
// 给所有具有js-container-target样式的元素绑定点击事件
Array.prototype.forEach.call(demoBtns, (btn) => {
  btn.addEventListener('click', (event) => {
    const parent = event.target.parentElement

    // 在demo的父元素上切换is-open样式
    parent.classList.toggle('is-open')

    // 如果demo是当前被打开的demo，则将其id保存到应用的settings去，如果没有，就从应用的settings去删除
    if (parent.classList.contains('is-open')) {
      settings.set('activeDemoButtonId', event.target.getAttribute('id'))
    } else {
      settings.delete('activeDemoButtonId')
    }
  })
})

// 从settings中去获取最近一次应用打开的demo，并触发它的点击事件
const buttonId = settings.get('activeDemoButtonId')
if (buttonId) {
  document.getElementById(buttonId).click()
}
