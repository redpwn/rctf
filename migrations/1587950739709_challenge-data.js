exports.up = function (pgm) {
  pgm.createTable('challenges', {
    id: { type: 'uuid', primaryKey: true },
    name: { type: 'string', unique: true, notNull: true },
    description: { type: 'string' },
    files: { type: 'text[]' },
    author: { type: 'string' },
    category: { type: 'string' },
    points: { type: 'integer', notNull: true },
    flag: { type: 'string', notNull: true }
  })
}

exports.down = function (pgm) {
  pgm.dropTable('challenges')
}
