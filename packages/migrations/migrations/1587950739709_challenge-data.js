exports.up = function (pgm) {
  pgm.createTable('challenges', {
    id: { type: 'string', primaryKey: true },
    data: { type: 'jsonb', notNull: true }
  })
}

exports.down = function (pgm) {
  pgm.dropTable('challenges')
}
