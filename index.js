/*!
 * level-id-gen <https://github.com/doowb/level-id-gen>
 *
 * Copyright (c) 2015, Brian Woodward.
 * Licensed under the MIT License.
 */

'use strict';

module.exports = function (db) {
  if (typeof db === 'undefined') {
    throw new Error('Expected db to be provided.');
  }
  var digits = require('digits');
  var extend = require('extend-shallow');
  var plus = require('levelplus');
  db = plus(db);

  return function generator (groupName, options, cb) {
    if (typeof groupName === 'function') {
      cb = groupName;
      options = {};
      groupName = null;
    }

    if (typeof options === 'function') {
      cb = options;
      options = {};
    }

    if (typeof cb !== 'function') {
      throw new Error('generator expects a callback function');
    }

    groupName = groupName || 'default';
    options = options || {};
    var group = this.groups[groupName] || this.groups['default'];
    var opts = extend({}, this.options, group.options, options);
    var len = opts.digits || (opts.auto && String(opts.auto).length) || 3;
    db.inc([groupName], 0, function (err, count) {
      if (err) return cb(err);
      group.counter = count;
      var result = digits(''+group.counter, len);
      result = (opts.prefix || '') + result;
      return cb(null, result);
    });
  };
};
