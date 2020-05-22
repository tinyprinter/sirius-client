import Console from './console';
import EscPos from './escpos';
import FileWriter from './file-writer';
import Paperang from './paperang';
import Peripage from './peripage';

const all = {
  [Console.type]: Console,
  [EscPos.type]: EscPos,
  [FileWriter.type]: FileWriter,
  [Paperang.type]: Paperang,
  [Peripage.type]: Peripage,
};

export { all };
