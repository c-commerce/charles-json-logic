
const test = require('tape')
// const sinon = require('sinon')
const jsonLogic = require('../')

test('ext: get_fromatted_gross_default_price default behaviour', function (t) {
  jsonLogic.add_operation('get_fromatted_gross_default_price', (obj, currency) => {
    if (!obj || !Array.isArray(obj.default_prices) || !obj.default_prices.length) return null

    const priceItem = obj.default_prices.find((item) => {
      return item.currency === currency
    }) ?? obj.default_prices[0]

    if (!priceItem) return null

    const formatLogic = {
      trim: [
        {
          currency_format: [
            { var: 'amount.gross' },
            priceItem.currency
          ]
        }
      ]
    }

    return jsonLogic.apply(formatLogic, priceItem)
  })

  const rules = {
    get_fromatted_gross_default_price: [
      { var: 'product.prices' },
      'EUR'
    ]
  }

  const data = {
    product: {
      attributes: {
        color: 'Twilight Navy - C87 - BLUE',
        size: 'XS'
      },
      prices: {
        default_prices: [
          {
            amount: {
              gross: 19.9
            },
            compare_at: 27.93,
            currency: 'EUR',
            vat_class: 'vat_class_normal',
            tax_country: null
          }
        ]
      }
    }
  }

  t.equals(jsonLogic.apply(rules, data), '19,90\u00A0€')
  t.end()
})

test('ext: get_fromatted_gross_default_price default fallback currency behaviour', function (t) {
  jsonLogic.add_operation('get_fromatted_gross_default_price', (obj, currency) => {
    if (!obj || !Array.isArray(obj.default_prices) || !obj.default_prices.length) return null

    const priceItem = obj.default_prices.find((item) => {
      return item.currency === currency
    }) ?? obj.default_prices[0]

    if (!priceItem) return null

    const formatLogic = {
      trim: [
        {
          currency_format: [
            { var: 'amount.gross' },
            priceItem.currency
          ]
        }
      ]
    }

    return jsonLogic.apply(formatLogic, priceItem)
  })

  const rules = {
    get_fromatted_gross_default_price: [
      { var: 'product.prices' }
    ]
  }

  const data = {
    product: {
      attributes: {
        color: 'Twilight Navy - C87 - BLUE',
        size: 'XS'
      },
      prices: {
        default_prices: [
          {
            amount: {
              gross: 19.9
            },
            compare_at: 27.93,
            currency: 'EUR',
            vat_class: 'vat_class_normal',
            tax_country: null
          }
        ]
      }
    }
  }

  t.equals(jsonLogic.apply(rules, data), '19,90\u00A0€')
  t.end()
})

test('ext: get_fromatted_gross_default_price default fallback item behaviour', function (t) {
  jsonLogic.add_operation('get_fromatted_gross_default_price', (obj, currency) => {
    if (!obj || !Array.isArray(obj.default_prices) || !obj.default_prices.length) return null

    const priceItem = obj.default_prices.find((item) => {
      return item.currency === currency
    }) ?? obj.default_prices[0]

    if (!priceItem) return null

    const formatLogic = {
      trim: [
        {
          currency_format: [
            { var: 'amount.gross' },
            priceItem.currency
          ]
        }
      ]
    }

    return jsonLogic.apply(formatLogic, priceItem)
  })

  const rules = {
    get_fromatted_gross_default_price: [
      { var: 'product.prices' },
      'USD'
    ]
  }

  const data = {
    product: {
      attributes: {
        color: 'Twilight Navy - C87 - BLUE',
        size: 'XS'
      },
      prices: {
        default_prices: [
          {
            amount: {
              gross: 19.9
            },
            compare_at: 27.93,
            currency: 'EUR',
            vat_class: 'vat_class_normal',
            tax_country: null
          }
        ]
      }
    }
  }

  t.equals(jsonLogic.apply(rules, data), '19,90\u00A0€')
  t.end()
})

test('ext: get_formatted_attributes default behaviour', function (t) {
  jsonLogic.add_operation('get_formatted_attributes', (obj) => {
    return Object.entries(obj?.attributes ?? {}).map(([key, val]) => {
      return val
    }).join(', ')
  })

  const rules = {
    get_formatted_attributes: [
      { var: 'product' }
    ]
  }

  const data = {
    product: {
      attributes: {
        color: 'Twilight Navy - C87 - BLUE',
        size: 'XS'
      },
      prices: {
        default_prices: [
          {
            amount: {
              gross: 19.9
            },
            compare_at: 27.93,
            currency: 'EUR',
            vat_class: 'vat_class_normal',
            tax_country: null
          }
        ]
      }
    }
  }

  t.equals(jsonLogic.apply(rules, data), 'Twilight Navy - C87 - BLUE, XS')
  t.end()
})
