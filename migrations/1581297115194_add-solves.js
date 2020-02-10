exports.up = function (pgm) {
  pgm.createTable('solves', {
    id: { type: 'uuid', primaryKey: true },
    challengeid: { type: 'string', notNull: true },
    userid: { type: 'uuid', notNull: true }
  })
}

exports.down = function (pgm) {
  pgm.dropTable('solves')
}
