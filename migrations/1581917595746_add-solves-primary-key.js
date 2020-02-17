/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = pgm => {
  pgm.addConstraint('solves', 'uq', {
    unique: ['challengeid', 'userid']
  })
}

exports.down = pgm => {
  pgm.dropConstraint('solves', 'uq')
}
