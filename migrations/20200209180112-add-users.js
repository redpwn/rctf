'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(pgm) {
  pgm.createExtension("uuid-ossp")
  pgm.createTable("users", {
    id: { type: "uuid", primaryKey: true },
    name: { type: "string", unique: true, notNull: true },
    email: { type: "string", unique: true, notNull: true },
    password: { type: "string", notNull: true },
    division: { type: "string", notNull: true }
  });
};

exports.down = function(pgm) {
  pgm.dropTable("users");
  pgm.dropExtension("uuid-ossp")
};

exports._meta = {
  "version": 1
};
