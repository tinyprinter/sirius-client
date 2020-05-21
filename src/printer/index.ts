import Console from './console';
import Paperang from './paperang';
import Peripage from './peripage';

const all = {
  [Console.type]: Console,
  [Paperang.type]: Paperang,
  [Peripage.type]: Peripage,
};

export { all };
