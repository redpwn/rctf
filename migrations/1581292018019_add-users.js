exports.up = function (pgm) {
  pgm.createExtension('uuid-ossp')
  pgm.createTable('users', {
    id: { type: 'uuid', primaryKey: true },
    name: { type: 'string', unique: true, notNull: true },
    email: { type: 'string', unique: true, notNull: true },
    password: { type: 'string', notNull: true },
    division: { type: 'string', notNull: true }
  })
}

exports.down = function (pgm) {
  pgm.dropTable('users')
  pgm.dropExtension('uuid-ossp')
}
