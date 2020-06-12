exports.up = function (pgm) {
  pgm.createIndex('user_members', ['userid'])
  pgm.createIndex('solves', ['createdat'])
  pgm.createIndex('solves', ['userid'])
}

exports.down = function (pgm) {
  pgm.dropIndex('solves', ['userid'])
  pgm.dropIndex('solves', ['createdat'])
  pgm.dropIndex('user_members', ['userid'])
}
