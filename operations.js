/* eslint-disable no-var */
/* eslint-disable camelcase */
const helpers = require('./helpers')

module.exports = {
  '==': function (a, b) {
    return a === b
  },
  '===': function (a, b) {
    return a === b
  },
  '!=': function (a, b) {
    return a !== b
  },
  '!==': function (a, b) {
    return a !== b
  },
  '>': function (a, b) {
    return a > b
  },
  '>=': function (a, b) {
    return a >= b
  },
  '<': function (a, b, c) {
    return (c === undefined) ? a < b : (a < b) && (b < c)
  },
  '<=': function (a, b, c) {
    return (c === undefined) ? a <= b : (a <= b) && (b <= c)
  },
  '!!': function (a) {
    return helpers.truthy(a)
  },
  '!': function (a) {
    return !helpers.truthy(a)
  },
  '%': function (a, b) {
    return a % b
  },
  log: function (a) {
    console.log(a); return a
  },
  in: function (a, b) {
    if (!b || typeof b.indexOf === 'undefined') return false
    return (b.indexOf(a) !== -1)
  },
  cat: function () {
    return Array.prototype.join.call(arguments, '')
  },
  substr: function (source, start, end) {
    if (end < 0) {
      // JavaScript doesn't support negative end, this emulates PHP behavior
      var temp = String(source).substr(start)
      return temp.substr(0, temp.length + end)
    }
    return String(source).substr(start, end)
  },
  '+': function () {
    return Array.prototype.reduce.call(arguments, function (a, b) {
      return parseFloat(a, 10) + parseFloat(b, 10)
    }, 0)
  },
  '*': function () {
    return Array.prototype.reduce.call(arguments, function (a, b) {
      return parseFloat(a, 10) * parseFloat(b, 10)
    })
  },
  '-': function (a, b) {
    if (b === undefined) {
      return -a
    } else {
      return a - b
    }
  },
  '/': function (a, b) {
    return a / b
  },
  min: function () {
    return Math.min.apply(this, arguments)
  },
  max: function () {
    return Math.max.apply(this, arguments)
  },
  merge: function () {
    return Array.prototype.reduce.call(arguments, function (a, b) {
      return a.concat(b)
    }, [])
  },
  var: function (a, b) {
    var not_found = (b === undefined) ? null : b
    var data = this
    if (typeof a === 'undefined' || a === '' || a === null) {
      return data
    }
    var sub_props = String(a).split('.')
    for (var i = 0; i < sub_props.length; i++) {
      if (data === null) {
        return not_found
      }
      // Descending into data
      data = data[sub_props[i]]
      if (data === undefined) {
        return not_found
      }
    }
    return data
  },
  missing: function () {
    /*
    Missing can receive many keys as many arguments, like {"missing:[1,2]}
    Missing can also receive *one* argument that is an array of keys,
    which typically happens if it's actually acting on the output of another command
    (like 'if' or 'merge')
    */

    var missing = []
    var keys = Array.isArray(arguments[0]) ? arguments[0] : arguments

    for (var i = 0; i < keys.length; i++) {
      var key = keys[i]
      var value = helpers.apply({ var: key }, this)
      if (value === null || value === '') {
        missing.push(key)
      }
    }

    return missing
  },
  missing_some: function (need_count, options) {
    // missing_some takes two arguments, how many (minimum) items must be present, and an array of keys (just like 'missing') to check for presence.
    var are_missing = helpers.apply({ missing: options }, this)

    if (options.length - are_missing.length >= need_count) {
      return []
    } else {
      return are_missing
    }
  },
  method: function (obj, method, args) {
    return obj[method].apply(obj, args)
  }

}
