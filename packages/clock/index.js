import digit from "./digit.js";

class Ball {
  g = 1.5 + Math.random();
  x = 0;
  y = 0;
  vx = Math.pow(-1, Math.ceil(Math.random() * 1000)) * 4;
  vy = Math.pow(-1, Math.ceil(Math.random() * 1000)) * 5;
  radius = 15;
  color = "";
  static colors = ["red", "green", "yellow", "pink", "violet"];
  constructor(x, y, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    const n = ~~(Math.random() * Ball.colors.length);
    this.color = Ball.colors[n];
  }
  update(vy) {
    this.x += this.vx;
    this.vy = vy === undefined ? this.vy : vy;
    this.y += this.vy;
    this.vy += this.g;
  }
}
class Clock {
  ele;
  /**@type {CanvasRenderingContext2D | null} */
  ctx;

  WINDOW_HEIGHT = 400;
  WINDOW_WIDTH = 1000;
  BAIL_RADIUS = 8; //小球半径,则小球所在格子长8*2+1+1，1是球与格子的空隙
  BOX_WIDTH = 18;
  PADDING_TOP = 60; //画框顶部留白
  PADDING_LEFT = 30; //画框左边留白

  time = "";
  preTime = "";

  timer;
  first = true;

  /**@type {Ball[]} */
  balls = [];

  constructor() {
    this.getCanvasEle();
    this.initCanvas();
    this.timer = setInterval(() => {
      this.rafRender();
    }, 50);
  }

  rafRender = () => {
    this.ctx.clearRect(0, 0, this.WINDOW_WIDTH, this.WINDOW_HEIGHT);
    this.getNow();
    this.render();
    if (this.balls.length) {
      this.updateBall();
    }
  };

  getNow() {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();
    hours = hours < 10 ? "0" + hours : hours;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;
    this.time = "" + hours + minutes + seconds;
  }

  getCanvasEle() {
    this.ele = document.querySelector("#canvas");
    if (!this.ele) {
      throw "not found canvas";
    }
    this.ctx = this.ele.getContext("2d");
  }

  initCanvas() {
    this.ele.height = this.WINDOW_HEIGHT;
    this.ele.width = this.WINDOW_WIDTH;
  }

  /* --------------------------------- 动画小球相关 --------------------------------- */
  addBall(x, y, num) {
    digit[num].forEach((numList, i) => {
      numList.forEach((_num, j) => {
        if (_num === 1) {
          const centerX = x + j * this.BOX_WIDTH - this.BOX_WIDTH / 2;
          const centerY = y + i * this.BOX_WIDTH - this.BOX_WIDTH / 2;
          const ball = new Ball(centerX, centerY, this.BAIL_RADIUS);
          this.balls.push(ball);
        }
      });
    });
  }
  clearBalls() {
    if (this.balls.length) {
      this.balls = [];
    }
  }
  updateBall() {
    this.balls.forEach((ball) => {
      this.ctx.beginPath();
      this.ctx.fillStyle = ball.color;
      let vy = ball.vy;
      if (vy > -2 && vy <= 0) {
        vy = 0;
      }
      if (ball.y + ball.radius >= this.WINDOW_HEIGHT) {
        vy = -parseInt(vy) * 0.2;
        ball.y = this.WINDOW_HEIGHT - ball.radius;
      }
      this.ctx.arc(ball.x, ball.y, ball.radius, 0, 2 * Math.PI);
      this.ctx.fill();
      ball.update(vy);
    });

    let cnt = 0;
    for (let i = 0; i < this.balls.length; i++) {
      const ball = this.balls[i];
      if (
        ball.x + ball.radius > 0 &&
        ball.x - ball.radius < this.WINDOW_WIDTH
      ) {
        //球还在画布中
        this.balls[cnt++] = this.balls[i];
      }
    }

    this.balls.splice(++cnt);
    console.log(this.balls.length);
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
    //先从0，0开始渲染hour的十位
    let positionX = this.PADDING_LEFT;
    this.time.split("").forEach((char, i) => {
      if (i !== 0) {
        positionX += this.BOX_WIDTH * 8;
      }

      //绘制冒号
      if ((i & 1) === 0 && i !== 0) {
        this.renderDigit(positionX, this.PADDING_TOP, digit.length - 1);
        positionX += this.BOX_WIDTH * 4;
      }

      const num = parseInt(char);
      //动画小球
      if (!this.first) {
        if (this.preTime[i] !== char) {
          this.addBall(positionX, this.PADDING_TOP, num);
        }
      }
      //绘制时间数字
      this.renderDigit(positionX, this.PADDING_TOP, num);
    });
    this.preTime = this.time;
    this.first = false;
  }
  stop() {
    clearInterval(this.timer);
  }
}

window.onload = () => {
  const clock = new Clock();
};
