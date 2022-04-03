/* eslint-disable no-var */
/* eslint-disable camelcase */
const currencyFormatter = require('currency-formatter')
const safeRegex = require('safe-regex')
const cloneDeep = require('clone-deep')
const safeGet = require('just-safe-get')
const typeOf = require('just-typeof')

function set (obj, props, value) {
  if (typeof props === 'string') {
    props = props.split('.')
  }
  if (typeof props === 'symbol') {
    props = [props]
  }
  var lastProp = props.pop()
  if (!lastProp) {
    return false
  }
  var thisProp
  while ((thisProp = props.shift())) {
    if (typeof obj[thisProp] === 'undefined') {
      obj[thisProp] = {}
    }
    obj = obj[thisProp]
    if (!obj || typeof obj !== 'object') {
      return false
    }
  }
  obj[lastProp] = value
  return true
}

function varExec (a, b) {
  const not_found = (b === undefined) ? null : b
  let data = this
  if (typeof a === 'undefined' || a === '' || a === null) {
    return data
  }

  const sub_props = String(a).split('.')
  for (let i = 0; i < sub_props.length; i++) {
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
}

const operations = {
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
    return truthy(a)
  },
  '!': function (a) {
    return !truthy(a)
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
      const temp = String(source).substr(start)
      return temp.substr(0, temp.length + end)
    }
    return String(source).substr(start, end)
  },
  replace: function (source, pattern, replacer) {
    if (!safeRegex(pattern)) return null

    return String(source).replace(new RegExp(pattern, 'g'), replacer)
  },
  trim: function (source) {
    return String(source).trim()
  },
  set: function (inputObject, setArr) {
    const obj = Object.assign({}, inputObject)
    const arr = []
    if (Array.isArray(setArr) && setArr.every((item) => (Array.isArray(item)))) {
      arr.push(...setArr)
    } else if (Array.isArray(setArr)) {
      arr.push(setArr)
    }

    arr.forEach(([path, value]) => {
      set(obj, path, value)
    })

    return obj
  },
  equals_any: function (inputValue, compareArr) {
    if (!Array.isArray(compareArr)) {
      throw new TypeError('comparable must be array of any items')
    }

    return compareArr.some(function (compareItem) {
      return compareItem === inputValue
    })
  },
  contains_any: function (inputValue, compareArr) {
    if (!Array.isArray(compareArr)) {
      throw new TypeError('comparable must be array of any items')
    }

    return compareArr.some(function (compareItem) {
      return inputValue.includes(compareItem)
    })
  },
  personName: function personName (source) {
    const person = source

    let names = []
    if (safeGet(person, 'first_name') || safeGet(person, 'last_name')) {
      names = [
        safeGet(person, 'first_name'),
        safeGet(person, 'middle_name'),
        safeGet(person, 'last_name')
      ]
    } else if (safeGet(person, 'name')) {
      names = [
        safeGet(person, 'name')
      ]
    }

    return names.filter((item) => (item)).join(' ') || '(N/A)'
  },
  preferred_name: function (payload) {
    const channel_user = safeGet(payload, 'channel_user')
    const person = safeGet(payload, 'person')
    if (!person && !channel_user) {
      return ''
    }

    let names = []

    if (safeGet(person, 'nickname')) {
      names = [
        safeGet(person, 'nickname')
      ]
    } else if (safeGet(person, 'first_name') || safeGet(person, 'last_name')) {
      names = [
        safeGet(person, 'first_name'),
        safeGet(person, 'middle_name'),
        safeGet(person, 'last_name')
      ]
    } else if (safeGet(person, 'name')) {
      names = [
        safeGet(person, 'name')
      ]
    } else if (safeGet(channel_user, 'name')) {
      names = [
        safeGet(channel_user, 'name')
      ]
    } else if (safeGet(channel_user, 'first_name') || safeGet(channel_user, 'last_name')) {
      names = [
        safeGet(channel_user, 'first_name'),
        safeGet(channel_user, 'middle_name'),
        safeGet(channel_user, 'last_name')
      ]
    }

    return names.filter((item) => (item)).join(' ') || ''
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
    // if the first argument is an object, we likely want to opt into object
    // merging. This obviously has the downside that we would try to merge
    // literals onto an object if the arguments inputs are mixed. E.g. a
    // a string would be be merged as index keys and char values
    if (arguments[0] && typeOf(arguments[0]) === 'object') {
      return Array.prototype.reduce.call(arguments, function (result, current) {
        return Object.assign(result, current)
      }, Object.create({}))
    }

    return Array.prototype.reduce.call(arguments, function (a, b) {
      return a.concat(b)
    }, [])
  },
  length: function (a) {
    return a.length
  },
  currency_format: function (val, options) {
    // TODO: allow more options
    return currencyFormatter.format(val, { code: options })
  },
  var: varExec,
  missing: function () {
    /*
    Missing can receive many keys as many arguments, like {"missing:[1,2]}
    Missing can also receive *one* argument that is an array of keys,
    which typically happens if it's actually acting on the output of another command
    (like 'if' or 'merge')
    */

    const missing = []
    const keys = Array.isArray(arguments[0]) ? arguments[0] : arguments

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      const value = apply({ var: key }, this)
      if (value === null || value === '') {
        missing.push(key)
      }
    }

    return missing
  },
  missing_some: function (need_count, options) {
    // missing_some takes two arguments, how many (minimum) items must be present, and an array of keys (just like 'missing') to check for presence.
    const are_missing = apply({ missing: options }, this)

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

function get_values (logic) {
  return logic[get_operator(logic)]
}

function truthy (value) {
  if (Array.isArray(value) && value.length === 0) {
    return false
  }
  return !!value
}

function is_logic (logic) {
  return (
    (typeof logic === 'object') && // An object
    logic !== null && // but not null
    !Array.isArray(logic) && // and not an array
    Object.keys(logic).length === 1 // with exactly one key
  )
}

function get_operator (logic) {
  return Object.keys(logic)[0]
}

function arrayUnique (array) {
  const a = []
  for (let i = 0, l = array.length; i < l; i++) {
    if (a.indexOf(array[i]) === -1) {
      a.push(array[i])
    }
  }
  return a
}

/*
This helper will defer to the JsonLogic spec as a tie-breaker when different language interpreters define different behavior for the truthiness of primitives.  E.g., PHP considers empty arrays to be falsy, but Javascript considers them to be truthy. JsonLogic, as an ecosystem, needs one consistent answer.
Spec and rationale here: http://jsonlogic.com/truthy
*/

function uses_data (logic) {
  const collection = []

  if (is_logic(logic)) {
    const op = get_operator(logic)

    let values = logic[op]

    if (!Array.isArray(values)) {
      values = [values]
    }

    if (op === 'var') {
      // This doesn't cover the case where the arg to var is itself a rule.
      collection.push(values[0])
    } else {
      // Recursion!
      // eslint-disable-next-line array-callback-return
      values.map(function (val) {
        collection.push.apply(collection, uses_data(val))
      })
    }
  }

  return arrayUnique(collection)
}

function add_operation (name, code) {
  operations[name] = code
}

function rm_operation (name) {
  delete operations[name]
}

function rule_like (rule, pattern) {
  // console.log("Is ". JSON.stringify(rule) . " like " . JSON.stringify(pattern) . "?");
  if (pattern === rule) {
    return true
  } // TODO : Deep object equivalency?
  if (pattern === '@') {
    return true
  } // Wildcard!
  if (pattern === 'number') {
    return (typeof rule === 'number')
  }
  if (pattern === 'string') {
    return (typeof rule === 'string')
  }
  if (pattern === 'array') {
    // !logic test might be superfluous in JavaScript
    return Array.isArray(rule) && !is_logic(rule)
  }

  if (is_logic(pattern)) {
    if (is_logic(rule)) {
      const pattern_op = get_operator(pattern)
      const rule_op = get_operator(rule)

      if (pattern_op === '@' || pattern_op === rule_op) {
        // echo "\nOperators match, go deeper\n";
        return rule_like(
          get_values(rule, false),
          get_values(pattern, false)
        )
      }
    }
    return false // pattern is logic, rule isn't, can't be eq
  }

  if (Array.isArray(pattern)) {
    if (Array.isArray(rule)) {
      if (pattern.length !== rule.length) {
        return false
      }
      /*
        Note, array order MATTERS, because we're using this array test logic to consider arguments, where order can matter. (e.g., + is commutative, but '-' or 'if' or 'var' are NOT)
      */
      for (let i = 0; i < pattern.length; i += 1) {
        // If any fail, we fail
        if (!rule_like(rule[i], pattern[i])) {
          return false
        }
      }
      return true // If they *all* passed, we pass
    } else {
      return false // Pattern is array, rule isn't
    }
  }

  // Not logic, not array, not a === match for rule.
  return false
}

function apply (_logic, _data) {
  // Does this array contain logic? Only one way to find out.
  if (Array.isArray(_logic)) {
    return cloneDeep(_logic).map(function (l) {
      return apply(l, _data)
    })
  }

  if (_logic === null) return _logic

  const logic = cloneDeep(_logic)
  const op = get_operator(logic)
  // You've recursed to a primitive, stop!
  if (!is_logic(logic)) {
    return logic
  }

  const data = cloneDeep(_data) || {}

  let values = logic[op]
  let i
  let current
  let scopedLogic, scopedData, filtered, initial

  // easy syntax for unary operators, like {"var" : "x"} instead of strict {"var" : ["x"]}
  if (!Array.isArray(values)) {
    values = [values]
  }

  // 'if', 'and', and 'or' violate the normal rule of depth-first calculating consequents, let each manage recursion as needed.
  if (op === 'if' || op === '?:') {
    /* 'if' should be called with a odd number of parameters, 3 or greater
    This works on the pattern:
    if( 0 ){ 1 }else{ 2 };
    if( 0 ){ 1 }else if( 2 ){ 3 }else{ 4 };
    if( 0 ){ 1 }else if( 2 ){ 3 }else if( 4 ){ 5 }else{ 6 };
    The implementation is:
    For pairs of values (0,1 then 2,3 then 4,5 etc)
    If the first evaluates truthy, evaluate and return the second
    If the first evaluates falsy, jump to the next pair (e.g, 0,1 to 2,3)
    given one parameter, evaluate and return it. (it's an Else and all the If/ElseIf were false)
    given 0 parameters, return NULL (not great practice, but there was no Else)
    */
    for (i = 0; i < values.length - 1; i += 2) {
      if (truthy(apply(values[i], data))) {
        return apply(values[i + 1], data)
      }
    }
    if (values.length === i + 1) return apply(values[i], data)
    return null
  } else if (op === 'and') { // Return first falsy, or last
    for (i = 0; i < values.length; i += 1) {
      current = apply(values[i], data)
      if (!truthy(current)) {
        return current
      }
    }
    return current // Last
  } else if (op === 'or') { // Return first truthy, or last
    for (i = 0; i < values.length; i += 1) {
      current = apply(values[i], data)
      if (truthy(current)) {
        return current
      }
    }
    return current // Last
  } else if (op === 'filter') {
    scopedData = apply(values[0], data)
    scopedLogic = values[1]

    if (!Array.isArray(scopedData)) {
      return []
    }
    // Return only the elements from the array in the first argument,
    // that return truthy when passed to the logic in the second argument.
    // For parity with JavaScript, reindex the returned array
    return scopedData.filter(function (datum) {
      return truthy(apply(scopedLogic, datum))
    })
  } else if (op === 'map') {
    scopedData = apply(values[0], data)
    scopedLogic = values[1]

    if (!Array.isArray(scopedData)) {
      return []
    }

    return scopedData.map(function (datum) {
      return apply(scopedLogic, datum)
    })
  } else if (op === 'reduce') {
    scopedData = apply(values[0], data)
    scopedLogic = values[1]
    initial = typeof values[2] !== 'undefined' ? values[2] : null

    if (!Array.isArray(scopedData)) {
      return initial
    }

    return scopedData.reduce(
      function (accumulator, current) {
        return apply(
          scopedLogic,
          { current: current, accumulator: accumulator }
        )
      },
      initial
    )
  } else if (op === 'all') {
    scopedData = apply(values[0], data)
    scopedLogic = values[1]
    // All of an empty set is false. Note, some and none have correct fallback after the for loop
    if (!scopedData.length) {
      return false
    }
    for (i = 0; i < scopedData.length; i += 1) {
      if (!truthy(apply(scopedLogic, scopedData[i]))) {
        return false // First falsy, short circuit
      }
    }
    return true // All were truthy
  } else if (op === 'none') {
    filtered = apply({ filter: values }, data)
    return filtered.length === 0
  } else if (op === 'some') {
    filtered = apply({ filter: values }, data)
    return filtered.length > 0
  } else if (op === 'var' && typeof values[1] === 'object') {
    return values[1]
  }

  // Everyone else gets immediate depth-first recursion
  values = values.map(function (val) {
    return apply(val, data)
  })

  // The operation is called with "data" bound to its "this" and "values" passed as arguments.
  // Structured commands like % or > can name formal arguments while flexible commands (like missing or merge) can operate on the pseudo-array arguments
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/arguments
  if (typeof operations[op] === 'function') {
    return operations[op].apply(data, values)
  } else if (op.indexOf('.') > 0) { // Contains a dot, and not in the 0th position
    const sub_ops = String(op).split('.')
    let operation = operations
    for (i = 0; i < sub_ops.length; i++) {
      // Descending into operations
      operation = operation[sub_ops[i]]
      if (operation === undefined) {
        throw new Error('Unrecognized operation ' + op +
          ' (failed at ' + sub_ops.slice(0, i + 1).join('.') + ')')
      }
    }

    return operation.apply(data, values)
  }

  const err = new Error('Unrecognized operation ' + op)
  err.data = data
  err.logic = logic

  throw err
}

module.exports.is_logic = is_logic
module.exports.truthy = truthy
module.exports.get_operator = get_operator
module.exports.get_values = get_values
module.exports.apply = apply
module.exports.uses_data = uses_data
module.exports.add_operation = add_operation
module.exports.rm_operation = rm_operation
module.exports.rule_like = rule_like
