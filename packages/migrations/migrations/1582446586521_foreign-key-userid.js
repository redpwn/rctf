/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = pgm => {
  pgm.addConstraint('solves', 'uuid_fkey', {
    foreignKeys: {
      columns: 'userid',
      references: 'users("id")',
      onDelete: 'cascade',
      onUpdate: 'cascade'
    }
  })
}

exports.down = pgm => {
  pgm.dropConstraint('solves', 'uuid_fkey')
}
