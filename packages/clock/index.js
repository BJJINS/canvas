import digit from "./digit.js";
class Clock {
  ele;
  /**@type {CanvasRenderingContext2D | null} */
  ctx;

  WINDOW_HEIGHT = 1034;
  WINDOW_WIDTH = 1000;
  BAIL_RADIUS = 8; //小球半径,则小球所在格子长8*2+1+1，1是球与格子的空隙
  BOX_WIDTH = 18;
  PADDING_TOP = 60; //画框顶部留白
  PADDING_LEFT = 30; //画框左边留白

  hour = 12;
  minutes = 34;
  seconds = 56;

  timer;

  constructor() {
    this.getCanvasEle();
    this.setWH();
    this.timer = requestAnimationFrame(this.rafRender);
  }

  rafRender = () => {
    this.getNow();
    this.render();
    this.timer = requestAnimationFrame(this.rafRender);
  };

  getNow() {
    const now = new Date();
    this.hour = now.getHours();
    this.minutes = now.getMinutes();
    this.seconds = now.getSeconds();
  }

  getCanvasEle() {
    this.ele = document.querySelector("#canvas");
    if (!this.ele) {
      throw "not found canvas";
    }
    this.ctx = this.ele.getContext("2d");
  }

  setWH() {
    this.ele.height = this.WINDOW_HEIGHT;
    this.ele.width = this.WINDOW_WIDTH;
  }

  /**
   * 渲染时间对应的数字
   * @param {number} x 开始x
   * @param {number} y 开始y
   * @param {number} num 需要渲染的数字
   */
  renderDigit(x, y, num) {
    this.ctx.fillStyle = "rgb(0,102,153)";
    digit[num].forEach((numList, i) => {
      numList.forEach((_num, j) => {
        if (_num === 1) {
          this.ctx.beginPath();
          const centerX = x + j * this.BOX_WIDTH - this.BOX_WIDTH / 2;
          const centerY = y + i * this.BOX_WIDTH - this.BOX_WIDTH / 2;
          this.ctx.arc(centerX, centerY, this.BAIL_RADIUS, 0, 2 * Math.PI);
          this.ctx.fill();
        }
      });
    });
  }

  render() {
    this.ctx.clearRect(0, 0, this.WINDOW_WIDTH, this.WINDOW_HEIGHT);
    //先从0，0开始渲染hour的十位
    const time = "" + this.hour + this.minutes + this.seconds;
    time.split("").forEach((char, i) => {
      const num = parseInt(char);
      let x = this.PADDING_LEFT + i * this.BOX_WIDTH * 7;
      this.renderDigit(x, this.PADDING_TOP, num);
    });
  }
  stop() {
    cancelAnimationFrame(this.timer);
  }
}

window.onload = () => {
  const clock = new Clock();
};
