const test = require('tape')
const sinon = require('sinon')
const jsonLogic = require('../')

test('app: fan in props', function (t) {
  t.equals(jsonLogic.apply(
    {
      and: [
        { '>': [3, 1] },
        { '<': [1, 3] }
      ]
    }
  ), true)

  const rules = {
    and: [
      { '==': [{ var: 'person.first_name' }, 'Some'] },
      { '!==': [{ var: 'person.some' }, 'Else'] }
    ]
  }

  const data = { person: { first_name: 'Some' } }

  t.equals(jsonLogic.apply(rules, data), true)
  t.end()
})

test('app: fan in props (deeper)', function (t) {
  const rules = {
    and: [
      { '==': [{ var: 'payload.message.content.body' }, 'something'] }
    ]
  }

  const data = {
    payload: {
      message: {
        content: {
          body: 'something'
        }
      },
      person: {
        first_name: 'Some'
      }
    }
  }
  t.equals(jsonLogic.apply(rules, data), true)
  t.end()
})

test('app: check time based condition', function (t) {
  const clock = sinon.useFakeTimers({
    now: new Date(2020, 1, 1, 12, 0),
    shouldAdvanceTime: false
  })

  const ifStatement = [
    // Open weekends, 10:00am to 4:59pm
    {
      and: [
        { in: [{ method: [{ var: 'today' }, 'getDay'] }, [0, 6]] },
        { '<=': [10, { method: [{ var: 'today' }, 'getHours'] }, 16] }
      ]
    },
    'open',

    // Open weekdays, 9:00am to 5:59pm
    {
      and: [
        { in: [{ method: [{ var: 'today' }, 'getDay'] }, [1, 2, 3, 4, 5]] },
        { '<=': [9, { method: [{ var: 'today' }, 'getHours'] }, 17] }
      ]
    },
    'open',

    // Else, closed
    'closed'
  ]

  t.equals(jsonLogic.apply(
    {
      if: ifStatement
    },
    { today: (new Date()) }
  ), 'open')

  clock.tick(1000 * 60 * 60 * 12)

  t.equals(jsonLogic.apply(
    {
      if: ifStatement
    },
    { today: (new Date()) }
  ), 'closed')

  clock.restore()
  t.end()
})

test('app: object routing', function (t) {
  {
    const ifStatement = [
      // Open weekends, 10:00am to 4:59pm
      {
        and: [
          { '==': [{ var: 'payload.some_prop' }, 'else'] }
        ]
      },
      { var: ['sds', { universe: 1 }] },

      // Else, closed
      false
    ]

    const ret = jsonLogic.apply(
      {
        if: ifStatement
      },
      { payload: { some_prop: 'Some' } }
    )

    t.equals(ret, false)
  }

  {
    const ifStatement = [
      // Open weekends, 10:00am to 4:59pm
      {
        and: [
          { '==': [{ var: 'payload.some_prop' }, 'Some'] }
        ]
      },
      { var: ['sds', { universe: 1 }] },

      // Else, closed
      false
    ]

    const ret = jsonLogic.apply(
      {
        if: ifStatement
      },
      { payload: { some_prop: 'Some' } }
    )

    t.deepEquals(ret, { universe: 1 })
  }

  t.end()
})

test('app: fan in props into array', function (t) {
  const rules = {
    merge: [
      {
        trim: [
          {
            replace: [
              {
                currency_format: [
                  { var: 'payload.order.total' },
                  { var: 'payload.order.currency' }
                ]
              },
              '[^\\d\\.\\,\\s]+',
              ''
            ]
          }
        ]
      },
      {
        cat: [
          '\n',
          {
            map: [
              { var: 'payload.order.items' },
              {
                cat: [
                  { var: 'qty' },
                  ' x ',
                  { var: 'name' },
                  '\n'
                ]
              }
            ]
          }
        ]
      },
      {
        if: [
          { var: 'payload.person.nickname' },
          { var: 'payload.person.nickname' },
          { var: 'payload.person.first_name' },
          { var: 'payload.person.first_name' }
        ]
      }
    ]
  }

  const data = {
    payload: {
      order: {
        currency: 'EUR',
        total: 1.5,
        items: [
          { qty: 1, price: 0.5, name: 'Some Product' },
          { qty: 2, price: 1, name: 'Another Product' }
        ]
      },
      person: {
        first_name: 'Some',
        nickname: 'Nick'
      }
    }
  }

  t.deepEquals(jsonLogic.apply(rules, data), ['1,50', '\n1 x Some Product\n,2 x Another Product\n', 'Nick'])
  t.end()
})

test('app: handle non existent props', function (t) {
  {
    const rules = {
      if: [
        { '!': { var: 'payload.channel_message_subscription_instance.id' } },
        true,
        false
      ]
    }

    const data = {
      payload: {
        // channel_message_subscription_instance: {
        //   id: '1'
        // }
      }
    }

    t.equals(jsonLogic.apply(rules, data), true)
  }

  {
    const rules = {
      if: [
        { '!': { var: 'payload.channel_message_subscription_instance.id' } },
        true,
        false
      ]
    }

    const data = {
      payload: {
        channel_message_subscription_instance: {
          id: '1'
        }
      }
    }

    t.equals(jsonLogic.apply(rules, data), false)
  }

  t.end()
})

test('app: more combinations', function (t) {
  const rules = {
    merge: [
      {
        trim: [
          {
            replace: [
              {
                currency_format: [
                  { var: 'payload.order.total' },
                  { var: 'payload.order.currency' }
                ]
              },
              '[^\\d\\.\\,\\s]+',
              ''
            ]
          }
        ]
      },
      {
        cat: [
          '\n',
          {
            map: [
              { var: 'payload.order.items' },
              {
                cat: [
                  { var: 'qty' },
                  ' x ',
                  { var: 'name' },
                  '\n'
                ]
              }
            ]
          }
        ]
      },
      {
        if: [
          { var: 'payload.person.nickname' },
          { var: 'payload.person.nickname' },
          { var: 'payload.person.first_name' },
          { var: 'payload.person.first_name' }
        ]
      }
    ]
  }

  const data = {
    payload: {
      order: {
        currency: 'EUR',
        total: 1.5,
        items: [
          { qty: 1, price: 0.5, name: 'Some Product' },
          { qty: 2, price: 1, name: 'Another Product' }
        ]
      },
      person: {
        first_name: 'Some',
        nickname: 'Nick'
      }
    }
  }

  t.deepEquals(jsonLogic.apply(rules, data), ['1,50', '\n1 x Some Product\n,2 x Another Product\n', 'Nick'])
  t.end()
})

test('app: more combinations, with fallbacks', function (t) {
  const rules = {
    merge: [
      {
        if: [
          { var: 'payload.person.nickname' },
          { var: 'payload.person.nickname' },
          { var: 'payload.person.first_name' },
          { var: 'payload.person.first_name' },
          { var: 'payload.person.name' },
          { var: 'payload.person.name' },
          ''
        ]
      },
      { var: 'payload.fulfillment.provider' },
      {
        cat: [
          'https://www.dhl.de/en/privatkunden/pakete-empfangen/verfolgen.html?piececode=',
          { var: 'payload.fulfillment.tracking_custom_id' }
        ]
      }
    ]
  }

  const data = {
    payload: {
      fulfillment: {
        provider: 'DHL',
        tracking_custom_id: '1234'
      },
      person: {
        first_name: 'Some',
        nickname: 'Nick'
      }
    }
  }

  t.deepEquals(jsonLogic.apply(rules, data), ['Nick', 'DHL', 'https://www.dhl.de/en/privatkunden/pakete-empfangen/verfolgen.html?piececode=1234'])
  t.end()
})

test('app: set object', function (t) {
  {
    const rules = {
      set: [
        {},
        [
          ['msg.content.body', { var: 'message' }],
          ['msg.content.body2', { var: 'message2' }]
        ]
      ]
    }

    const data = {
      message: 'Hello'
    }

    t.deepEquals(jsonLogic.apply(rules, data), { msg: { content: { body: 'Hello', body2: null } } })
  }

  {
    const rules = {
      set: [
        {},
        ['msg.content.body', { var: 'message' }]
      ]
    }

    const data = {
      message: 'Hello'
    }

    t.deepEquals(jsonLogic.apply(rules, data), { msg: { content: { body: 'Hello' } } })
  }

  {
    const rules = {
      set: [
        { var: 'message' },
        ['content.body', { var: 'other.message' }]
      ]
    }

    const data = {
      message: {
        content: {
          body: 'prev'
        }
      },
      other: {
        message: 'Hello2'
      }
    }

    t.deepEquals(jsonLogic.apply(rules, data), { content: { body: 'Hello2' } })
  }

  {
    const rules = {
      set: [
        { var: 'message' },
        ['content.body', {
          cat: [
            'New Message in Feed: ',
            { var: 'context.feed.id' }
          ]
        }]
      ]
    }

    const data = {
      message: {
        content: {
          body: 'prev'
        }
      },
      context: {
        feed: {
          id: '1234'
        }
      }
    }

    t.deepEquals(jsonLogic.apply(rules, data), { content: { body: 'New Message in Feed: 1234' } })
  }

  t.end()
})

test('app: equals any', function (t) {
  {
    const rules = {
      equals_any: [
        { var: 'content.body' },
        [
          null,
          'my custom second message2',
          'my custom first message2'
        ]
      ]
      //       {
      //       }
    }

    const data = {
      content: {
        body: 'my custom first message2'
      }
    }

    t.equals(jsonLogic.apply(rules, data), true)
  }

  {
    const rules = {
      equals_any: [
        { var: 'content.body' },
        [
          null,
          '2',
          1
        ]
      ]
      //       {
      //       }
    }

    const data = {
      content: {
        body: 1
      }
    }

    t.equals(jsonLogic.apply(rules, data), true)
  }

  {
    const rules = {
      equals_any: [
        { var: 'content.body' },
        null
      ]
      //       {
      //       }
    }

    const data = {
      content: {
        body: 1
      }
    }

    t.throws(() => {
      t.equals(jsonLogic.apply(rules, data), true)
    })
  }

  t.end()
})

test('app: preferred_name', function (t) {
  const rules = {
    preferred_name: [
      { var: 'payload' }
    ]
  }

  const data = {
    payload: {
      message: {
        // Properties removed for better readability
      },
      action: 'create',
      person: {
        id: 'CONCEALED',
        created_at: '2021-11-09T15:06:33.547Z',
        updated_at: '2021-11-09T15:06:33.547Z',
        first_name: null,
        middle_name: null,
        last_name: null,
        date_of_birth: null,
        gender: null,
        active: true,
        deleted: false,
        comment: null,
        name: null,
        avatar: null,
        email: null,
        measurements: null,
        tags: null,
        nickname: null,
        name_preference: null,
        custom_properties: null,
        annotations: null,
        metadata: null,
        parents: [],
        default_address: null,
        language_preference: null,
        kind: 'Contact',
        organizations: null
      },
      channel_user: {
        id: 'CONCEALED',
        person: 'CONCEALED',
        updated_at: '2021-11-09T15:06:33.545Z',
        created_at: null,
        last_source_fetch_at: null,
        broker: 'charles_messaging_whatsapp',
        external_person_reference_id: 'CONCEALED',
        external_person_custom_id: 'CONCEALED',
        external_channel_reference_id: '4915258910544',
        source_type: 'whatsapp',
        payload_name: null,
        first_name: null,
        middle_name: null,
        last_name: null,
        email: null,
        phone: null,
        name: 'Fynn Merlevede',
        payload: null,
        source_api: 'charles_messaging_whatsapp',
        active: true,
        deleted: false,
        external_organization_reference_ids: null,
        organizations: null,
        comment: null,
        links: null,
        verified: true,
        custom_properties: null,
        channel_profile: null,
        message_subscription_instances: undefined
      }
    }
  }

  t.equals(jsonLogic.apply(rules, data), 'Fynn Merlevede')

  t.end()
})

test('app: channel user filter', function (t) {
  {
    const rules = {
      if: [
        { equals_any: [
          { var: 'payload.channel_user.source_type' },
          [
            'whatsapp'
          ]
        ] },
        { var: 'payload' },
        false
      ]
    }

    const data = {
      payload: {
        message: {
          // Properties removed for better readability
        },
        person: {
          id: 'CONCEALED',
          created_at: '2021-11-09T15:06:33.547Z',
          updated_at: '2021-11-09T15:06:33.547Z',
          first_name: null,
          middle_name: null,
          last_name: null,
          date_of_birth: null,
          gender: null,
          active: true,
          deleted: false,
          comment: null,
          name: null,
          avatar: null,
          email: null,
          measurements: null,
          tags: null,
          nickname: null,
          name_preference: null,
          custom_properties: null,
          annotations: null,
          metadata: null,
          parents: [],
          default_address: null,
          language_preference: null,
          kind: 'Contact',
          organizations: null
        },
        channel_user: {
          id: 'CONCEALED',
          person: 'CONCEALED',
          updated_at: '2021-11-09T15:06:33.545Z',
          created_at: null,
          last_source_fetch_at: null,
          broker: 'charles_messaging_whatsapp',
          external_person_reference_id: 'CONCEALED',
          external_person_custom_id: 'CONCEALED',
          external_channel_reference_id: '4915258910544',
          source_type: 'whatsapp',
          payload_name: null,
          first_name: null,
          middle_name: null,
          last_name: null,
          email: null,
          phone: null,
          name: 'Fynn Merlevede',
          payload: null,
          source_api: 'charles_messaging_whatsapp',
          active: true,
          deleted: false,
          external_organization_reference_ids: null,
          organizations: null,
          comment: null,
          links: null,
          verified: true,
          custom_properties: null,
          channel_profile: null,
          message_subscription_instances: undefined
        }
      }
    }

    t.ok(jsonLogic.apply(rules, data))
  }
  {
    const rules = {
      if: [
        { equals_any: [
          { var: 'payload.channel_user.source_type' },
          [
            'whatsapp'
          ]
        ] },
        { var: 'payload' },
        false
      ]
    }

    const data = {
      payload: {
        message: {
          // Properties removed for better readability
        },
        person: {
          id: 'CONCEALED',
          created_at: '2021-11-09T15:06:33.547Z',
          updated_at: '2021-11-09T15:06:33.547Z',
          first_name: null,
          middle_name: null,
          last_name: null,
          date_of_birth: null,
          gender: null,
          active: true,
          deleted: false,
          comment: null,
          name: null,
          avatar: null,
          email: null,
          measurements: null,
          tags: null,
          nickname: null,
          name_preference: null,
          custom_properties: null,
          annotations: null,
          metadata: null,
          parents: [],
          default_address: null,
          language_preference: null,
          kind: 'Contact',
          organizations: null
        },
        channel_user: {
          id: 'CONCEALED',
          person: 'CONCEALED',
          updated_at: '2021-11-09T15:06:33.545Z',
          created_at: null,
          last_source_fetch_at: null,
          broker: 'charles_messaging_whatsapp',
          external_person_reference_id: 'CONCEALED',
          external_person_custom_id: 'CONCEALED',
          external_channel_reference_id: '4915258910544',
          source_type: 'facebook',
          payload_name: null,
          first_name: null,
          middle_name: null,
          last_name: null,
          email: null,
          phone: null,
          name: 'Fynn Merlevede',
          payload: null,
          source_api: 'charles_messaging_whatsapp',
          active: true,
          deleted: false,
          external_organization_reference_ids: null,
          organizations: null,
          comment: null,
          links: null,
          verified: true,
          custom_properties: null,
          channel_profile: null,
          message_subscription_instances: undefined
        }
      }
    }

    t.equals(jsonLogic.apply(rules, data), false)
  }
  t.end()
})
