import Console from './console';
import EscPos from './escpos';
import Paperang from './paperang';
import Peripage from './peripage';

const all = {
  [Console.type]: Console,
  [EscPos.type]: EscPos,
  [Paperang.type]: Paperang,
  [Peripage.type]: Peripage,
};

export { all };
