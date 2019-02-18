#! /app/.heroku/node/bin/node
'use strict';

const commaSeries = list => {
  if (!list || list.length == 0) {
    return '<empty>';
  } else if (list.length === 1) {
    return list[0];
  } else if (list.length === 2) {
    return `${list[0]} and ${list[1]}`;
  } else if (list.length >= 3) {
    const allButLast = list.slice(0, -1).join(', ');
    const last = list[list.length - 1];
    return `${allButLast}, and ${last}`;
  }
};

module.exports = { commaSeries };
