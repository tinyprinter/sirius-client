#!/usr/bin/env node

// import commander from '../src/commander';

// commander(process.argv.slice(2)).then(
//   () => {
//     // noop
//   },
//   err => {
//     console.error(err);
//     process.exit(123);
//   }
// );

import wsclient from '../src/wsclient';

wsclient();
