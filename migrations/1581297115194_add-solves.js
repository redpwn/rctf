exports.up = function (pgm) {
  pgm.createTable('solves', {
    id: { type: 'uuid', primaryKey: true },
    challengeid: { type: 'string', unique: true, notNull: true },
    userid: { type: 'string', unique: true, notNull: true },
  })
}
  
exports.down = function (pgm) {
  pgm.dropTable('solves')
}