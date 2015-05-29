'use strict';

var path = require('path');
var level = require('level');
var async = require('async');
var rimraf = require('rimraf');
var mkdirp = require('mkdirp');
var assert = require('assert');
var bytewise = require('bytewise');
var defaults = require('level-defaults');
var sublevel = require('level-sublevel/bytewise');
var digits = require('digits');

var opts = {
  keyEncoding: bytewise,
  valueEncoding: 'json'
};

var dbPath = path.join(__dirname, '.data');
var tables = ['foo', 'bar', 'baz'];

var db = null;
var ids = null;

describe('level-id-gen', function () {
  beforeEach(function (done) {
    rimraf(dbPath, function (err) {
      if (err) return done(err);
      mkdirp.sync(dbPath);
      db = level(path.join(dbPath, 'db'));
      db = defaults(db, opts);
      db = sublevel(db);

      var identities = db.sublevel('identities');
      var generator = require('./')(identities);
      var IdGen = require('id-gen');
      ids = new IdGen(generator);
      tables.forEach(function (table) {
        ids.create(table, { digits: 10, prefix: table.toUpperCase() + '-' });
      });
      done();
    });
  });

  afterEach(rimraf.bind(rimraf, dbPath));

  it('should make ids', function (done) {
    async.eachSeries(tables, function (table, next) {
      var i = 0;
      async.until(function () { return (i++) === 100;},
        function (cb) {
          var expected = table.toUpperCase() + '-' + digits(''+i, 10, '0');
          ids.next(table, function (err, id) {
            if (err) return cb(err);
            assert(id, expected);
            cb();
          });
        }, next);
    }, done);
  });
});










