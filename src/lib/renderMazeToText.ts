import { TCell, TMaze, createMaze } from './maze';

function renderLine(row: TCell[], type: 'start' | 'middle' | 'end'): string {
  if (type === 'start') {
    return row.map(cell => (cell.walls.top ? ' – ' : ' • ')).join('');
  } else if (type === 'middle') {
    return row
      .map(
        cell =>
          `${cell.walls.left ? '|' : '•'}■${cell.walls.right ? '|' : '•'}`,
      )
      .join('');
  } else if (type === 'end') {
    return row.map(cell => (cell.walls.bottom ? ' - ' : ' • ')).join('');
  } else {
    throw new Error('Unknown line type');
  }
}

function renderMaze(maze: TMaze): string {
  return maze.cells
    .map(row => {
      return `${renderLine(row, 'start')}\n${renderLine(
        row,
        'middle',
      )}\n${renderLine(row, 'end')}\n`;
    })
    .join('');
}

console.log(renderMaze(createMaze(6)));
