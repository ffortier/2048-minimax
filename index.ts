const canvas = document.createElement('canvas');
const width = (canvas.width = 200);
const height = (canvas.height = 200);
const blockSize = 50;
const renderer = canvas.getContext('2d');

document.body.append(canvas);

class Block {
  private targetX: number;
  private targetY: number;
  private offsetX = 0;
  private offsetY = 0;

  constructor(
    public value: number,
    private gridX: number,
    private gridY: number
  ) {
    this.targetX = gridX;
    this.targetY = gridY;
  }

  update(delta: number) {
    if (delta >= 1) {
      this.gridX = this.targetX;
      this.gridY = this.targetY;
      this.offsetX = 0;
      this.offsetY = 0;
    } else {
      this.offsetX = -lerp(0, (this.gridX - this.targetX) * blockSize, delta);
      this.offsetY = -lerp(0, (this.gridY - this.targetY) * blockSize, delta);
    }
  }

  show() {
    renderer.fillStyle = 'lightblue';
    renderer.fillRect(
      this.gridX * blockSize + this.offsetX,
      this.gridY * blockSize + this.offsetY,
      blockSize,
      blockSize
    );
    renderer.textAlign = 'center';
    renderer.textBaseline = 'middle';
    renderer.fillStyle = 'black';
    renderer.font = '15px sans-serif';
    renderer.fillText(
      '' + this.value,
      this.gridX * blockSize + blockSize / 2 + this.offsetX,
      this.gridY * blockSize + blockSize / 2 + this.offsetY
    );
  }

  moveLeft(board: Board): void {
    while (this.targetX > 0) {
      const targetBlock = board.block(this.targetX - 1, this.gridY);

      if (!targetBlock) {
        this.targetX--;
      } else if (targetBlock.value === this.value) {
        this.targetX--;
        this.value *= 2;
      } else {
        break;
      }
    }

    board.block(this.targetX, this.targetY, this);
  }

  moveRight(board: Board): void {
    while (this.targetX < board.cols - 1) {
      const targetBlock = board.block(this.targetX + 1, this.gridY);

      if (!targetBlock) {
        this.targetX++;
      } else if (targetBlock.value === this.value) {
        this.targetX++;
        this.value *= 2;
      } else {
        break;
      }
    }

    board.block(this.targetX, this.targetY, this);
  }
}

class Board {
  private blocks: (Block | null)[][] = [];

  constructor(readonly cols: number, readonly rows: number) {
    for (let col = 0; col < this.cols; col++) {
      this.blocks[col] = [];
      for (let row = 0; row < this.rows; row++) {
        this.blocks[col][row] = null;
      }
    }
  }

  block(gridX: number, gridY: number, block: Block): void;
  block(gridX: number, gridY: number): Block | null;
  block(gridX: number, gridY: number, block?: Block): Block | null {
    assertRange(gridX, 0, this.cols);
    assertRange(gridY, 0, this.rows);

    if (block) {
      return (this.blocks[gridX][gridY] = block);
    }

    return this.blocks[gridX][gridY];
  }

  moveLeft(): void {
    for (let x = 1; x < this.cols; x++) {
      for (let y = 0; y < this.rows; y++) {
        this.blocks[x][y]?.moveLeft(this);
      }
    }
  }

  moveRight(): void {
    for (let x = 0; x < this.cols - 1; x++) {
      for (let y = 0; y < this.rows; y++) {
        this.blocks[x][y]?.moveRight(this);
      }
    }
  }

  newBlock(): void {
    let x = Math.floor(Math.random() * this.cols);
    let y = Math.floor(Math.random() * this.rows);

    while (this.blocks[x][y]) {
      x = Math.floor(Math.random() * this.cols);
      y = Math.floor(Math.random() * this.rows);
    }

    this.blocks[x][y] = new Block(Math.floor(Math.random() * 2 + 1) * 2, x, y);
  }

  show(): void {
    for (let x = 0; x < this.cols; x++) {
      for (let y = 0; y < this.rows; y++) {
        this.blocks[x][y]?.show();
      }
    }
  }

  update(delta: number): void {
    for (let x = 0; x < this.cols; x++) {
      for (let y = 0; y < this.rows; y++) {
        this.blocks[x][y]?.update(delta);
      }
    }
  }

  start(): void {
    for (let x = 0; x < this.cols; x++) {
      for (let y = 0; y < this.rows; y++) {
        this.blocks[x][y] = null;
      }
    }
    board.newBlock();
    board.newBlock();
  }
}

function assertRange(value: number, min: number, max: number) {
  if (value < min || value >= max) {
    throw new Error(`${value} is out of range [${min}, ${max}[`);
  }
}

function lerp(a: number, b: number, delta: number) {
  return (b - a) * delta + a;
}

const board = new Board(4, 4);
board.start();
board.show();

enum Action {
  IDLE,
  MOVE_LEFT,
  MOVE_RIGHT,
  MOVE_UP,
  MOVE_DOWN,
}

let delta = 0;
let action = Action.IDLE;

const draw = () => {
  delta += 0.1;
  renderer.clearRect(0, 0, width, height);
  board.show();
  board.update(delta);

  if (delta > 1 && action !== Action.IDLE) {
    switch (action) {
      case Action.MOVE_LEFT:
        board.moveLeft();
        break;
      case Action.MOVE_RIGHT:
        board.moveRight();
        break;
      case Action.MOVE_UP:
        board.moveLeft();
        break;
      case Action.MOVE_DOWN:
        board.moveLeft();
        break;
    }

    action = Action.IDLE;
    delta = 0;
  }

  requestAnimationFrame(draw);
};

requestAnimationFrame(draw);

document.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'ArrowLeft':
      action = Action.MOVE_LEFT;
      break;
    case 'ArrowRight':
      action = Action.MOVE_RIGHT;
      break;
    case 'ArrowUp':
      action = Action.MOVE_DOWN;
      break;
    case 'ArrowDown':
      action = Action.MOVE_DOWN;
      break;
  }
});
