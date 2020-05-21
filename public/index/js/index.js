/**
 * @author tgwice@163.com
 */

define(function (require, exports, module) {
  let lock = $('.clock').get(0);
  let ctx = lock.getContext('2d');
  let canvasW = 100;
  lock.width = canvasW * 2;
  lock.height = canvasW * 2;
  let timer = null; //计时器

  setDirective(ctx, canvasW);

  // 绘图
  function setDirective(ctx, w) {
    ctx.clearRect(0, 0, 2 * w, 2 * w);
    let t = new Date();
    // 表盘
    let lineWidth = 10;
    let r = w - lineWidth;
    ctx.beginPath();
    ctx.lineWidth = lineWidth;
    ctx.arc(w, w, r, 0, 2 * Math.PI);
    let grd=ctx.createLinearGradient(w, 0, w, 2 * w);
    grd.addColorStop(0,"#d2e5ed");
    grd.addColorStop(1,"#767574");
    ctx.strokeStyle = grd;
    ctx.stroke();

    // 时间刻度
    ctx.lineWidth = lineWidth / 2;
    for (let i = 1; i <= 12; i++) {
      ctx.beginPath();
      ctx.moveTo(w, w);
      ctx.lineTo(w + r * Math.sin(Math.PI / 6 * i), w - r * Math.cos(Math.PI / 6 * i));
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(w, w, r - r / 5, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.fill();

    // 时针
    let timeArr = t.toLocaleTimeString().match(/\d+/g);
    let scaleH = (Number(timeArr[0]) * 3600 + Number(timeArr[1] * 60) + Number(timeArr[2])) / (12 * 3600);
    ctx.beginPath();
    ctx.moveTo(w, w);
    ctx.lineTo(w + (r - r / 2) * Math.sin(scaleH * 2 * Math.PI), w - (r - r / 2) * Math.cos(scaleH * 2 * Math.PI));
    ctx.lineCap = "round";
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#ff8d00';
    ctx.stroke();

    // 分针
    ctx.beginPath();
    ctx.moveTo(w, w);
    ctx.lineTo(w + (r - r / 3) * Math.sin(t.getMinutes() / 60 * 2 * Math.PI), w - (r - r / 3) * Math.cos(t.getMinutes() / 60 * 2 * Math.PI));
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#00b38a';
    ctx.stroke();

    // 秒针
    ctx.beginPath();
    ctx.moveTo(w, w);
    ctx.lineTo(w + (r - r / 4) * Math.sin(t.getSeconds() / 60 * 2 * Math.PI), w - (r - r / 4) * Math.cos(t.getSeconds() / 60 * 2 * Math.PI));
    ctx.lineCap = "round";
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#e1251b';
    ctx.stroke();

    // 表盘中心
    ctx.beginPath();
    ctx.arc(w, w, r / 15, 0, 2 * Math.PI);
    ctx.fillStyle = '#000';
    ctx.fill();

    // 回调自身
    clearTimeout(timer);
    timer = setTimeout(setDirective, 1000, ctx, w)
  }
});
