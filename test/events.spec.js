const test = require('tape')
const jsonLogic = require('../')

test('app: event: api/feeds/*/messages/create incoming check', function (t) {
  const rules = {
    and: [
      {
        '!!': [{ var: 'payload.message.author.staff' }]
      },
      {
        set: [
          {},
          [
            'message.content.body',
            {
              cat: [
                ':speech_balloon: A new <',
                {
                  var: '$universe.base'
                },
                '/conversations/',
                {
                  var: 'payload.message.feed'
                },
                '|message>!'
              ]
            }
          ]
        ]
      }
    ]
  }

  // var rules2 = { if: [{ '!!': [{ var: 'payload.message.author.staff' }] }, 'yes', 'no'] }

  const data1 = {
    payload: {
      message: {
        author: {
          staff: null
        }
      }
    }
  }

  const data2 = {
    payload: {
      message: {
        author: {
          staff: 'elo'
        },
        feed: '265e067f-7a9e-4678-b699-972277017abd'
      }
    }
  }

  const data3 = {
    payload: {
      message: {
        author: null
      }
    }
  }

  t.deepEquals(jsonLogic.apply(rules, data1), false)
  t.deepEquals(jsonLogic.apply(rules, data2), { message: { content: { body: ':speech_balloon: A new </conversations/265e067f-7a9e-4678-b699-972277017abd|message>!' } } })
  t.deepEquals(jsonLogic.apply(rules, data3), false)
  t.end()
})
test('app: event: api/feeds/*/orders/create logic', function (t) {
  const rules = {
    set:
      [
        {},
        [
          'message.content.body', {
            cat: [
              {
                cat:
                  [
                    ':moneybag: Wohooo! <',
                    {
                      var: '$universe.base'
                    },
                    '/conversations/',
                    {
                      var: 'payload.feed.id'
                    },
                    '|New order> totaling '
                  ]
              },
              {
                trim: [
                  {
                    currency_format: [
                      {
                        var: 'payload.order.amount_total_gross'
                      },
                      {
                        var: 'payload.order.currency'
                      }
                    ]
                  }
                ]
              }

            ]
          }
        ]
      ]
  }

  // var rules2 = { if: [{ '!!': [{ var: 'payload.message.author.staff' }] }, 'yes', 'no'] }

  const data1 = {
    payload: {
      feed: {
        id: '2f889adb-792c-47a2-8962-d332f238227d',
        kind: 'Contact',
        parents: [],
        created_at: '2021-10-14T13:25:37.397Z',
        updated_at: '2021-10-19T16:29:06.860Z',
        latest_activity_at: '2021-10-19T16:29:06.374Z',
        deleted: false,
        hidden: false,
        open: true,
        answered: true,
        active: true,
        participants: [[Object]],
        agents: [],
        top_latest_events: [[Object], [Object], [Object], [Object], [Object]],
        top_latest_messages: [[Object], [Object], [Object]]
      },
      order: {
        id: '1f667267-7eb6-414e-ac98-b661bb4545b4',
        created_at: '2021-10-19T16:31:01.581Z',
        updated_at: '2021-10-19T16:32:33.960Z',
        date: '2021-10-19T16:22:00.000Z',
        deleted: false,
        active: true,
        name: '#1480',
        custom_id: '1480',
        items: [[Object]],
        is_proxy: true,
        proxy_vendor: 'shopify',
        type: null,
        external_reference_id: '4176054681749',
        external_reference_custom_id: null,
        client_id: null,
        person: 'c8b6af86-d41c-4357-a5ac-16255bcdc3c4',
        storefront: 'c7ab27b9-52c2-47c2-90c6-a6227727fe46',
        note: null,
        comment: null,
        shipping_address: null,
        billing_address: {
          name: 'F F',
          lines: [Array],
          phone: '',
          company: null,
          country: 'Germany',
          locality: 'Berlin',
          last_name: 'F',
          first_name: 'F',
          postal_code: '10437'
        },
        contact: null,
        metadata: null,
        custom_properties: null,
        cart: 'd5ffb4ef-88b1-488b-9b64-6649d102380b',
        presentables: { status: [Object] },
        shipping_fulfillment: null,
        amount_total_gross: 30,
        amount_total_net: 25.21,
        amount_total_tax: 4.79,
        amount_total_shipping_gross: null,
        discount_amount_total: 0,
        currency: 'EUR',
        order_prompt: null,
        status: null,
        discounts: [],
        person_external_reference_id: '3838829527189',
        links: {
          external: 'https://hey-charles-dev-store-2.myshopify.com/admin/orders/4176054681749'
        },
        fulfillment_status: null,
        financial_status: 'paid',
        taxes_summary: [[Object]],
        shipping_methods: [[Object]],
        author: null,
        attribution: {
          share: 1,
          source: 'cart',
          window: null,
          payload: [Object],
          strategy: 'CharlesCartOrderAttribution',
          attributed: true,
          conclusive: true,
          attributed_to_custom_id: 'charles'
        },
        proxy_payload: {
          id: 4176054681749,
          name: '#1480',
          note: null,
          tags: '',
          test: true,
          email: '',
          phone: '+4915253412112',
          token: '7f939b3cd4271064dbcac4b84bdb8041',
          app_id: 1354745,
          number: 480,
          gateway: 'shopify_payments',
          refunds: [],
          user_id: null,
          currency: 'EUR',
          customer: [Object],
          closed_at: null,
          confirmed: true,
          device_id: null,
          reference: null,
          tax_lines: [Array],
          total_tax: '4.79',
          browser_ip: '213.61.236.163',
          cart_token: null,
          created_at: '2021-10-19T18:22:01+02:00',
          line_items: [Array],
          source_url: null,
          updated_at: '2021-10-19T18:22:02+02:00',
          checkout_id: 23928957763733,
          location_id: 51944325269,
          source_name: 'web',
          total_price: '30.00',
          cancelled_at: null,
          fulfillments: [],
          landing_site: '/45019463829/invoices/1e43fd938c8585085e426b04ae5aaa6a',
          order_number: 1480,
          processed_at: '2021-10-19T18:22:00+02:00',
          total_weight: 200,
          cancel_reason: null,
          contact_email: null,
          total_tax_set: [Object],
          checkout_token: 'd5ce828ef9b5a9ecbb74257e13a52dcc',
          client_details: [Object],
          discount_codes: [],
          referring_site: 'http://localhost:8080/',
          shipping_lines: [Array],
          subtotal_price: '30.00',
          taxes_included: true,
          billing_address: [Object],
          customer_locale: 'en',
          note_attributes: [],
          payment_details: [Object],
          total_discounts: '0.00',
          total_price_set: [Object],
          total_price_usd: '34.84',
          financial_status: 'paid',
          landing_site_ref: null,
          order_status_url: 'https://hey-charles-dev-store-2.myshopify.com/45019463829/orders/7f939b3cd4271064dbcac4b84bdb8041/authenticate?key=8982547570fe09fbe168902bb7ef7e4d',
          current_total_tax: '4.79',
          processing_method: 'direct',
          source_identifier: null,
          total_outstanding: '0.00',
          fulfillment_status: null,
          subtotal_price_set: [Object],
          total_tip_received: '0.00',
          current_total_price: '30.00',
          total_discounts_set: [Object],
          admin_graphql_api_id: 'gid://shopify/Order/4176054681749',
          presentment_currency: 'EUR',
          current_total_tax_set: [Object],
          discount_applications: [],
          payment_gateway_names: [Array],
          current_subtotal_price: '30.00',
          total_line_items_price: '30.00',
          buyer_accepts_marketing: false,
          current_total_discounts: '0.00',
          current_total_price_set: [Object],
          current_total_duties_set: null,
          total_shipping_price_set: [Object],
          original_total_duties_set: null,
          current_subtotal_price_set: [Object],
          total_line_items_price_set: [Object],
          current_total_discounts_set: [Object]
        },
        products_map: undefined
      },
      event: {
        id: 'f8015fe4-c8f3-459a-8c48-d4b2a093ea25',
        resource: '1f667267-7eb6-414e-ac98-b661bb4545b4',
        resource_type: 'order',
        created_at: '2021-10-19T16:32:34.016Z',
        updated_at: '2021-10-19T16:32:34.016Z',
        deleted: false,
        feed: '2f889adb-792c-47a2-8962-d332f238227d',
        context: null,
        type: 'resource',
        marked: null,
        flagged: null,
        archived: null,
        annotations: {},
        suggestions: {},
        payload: {
          id: '1f667267-7eb6-414e-ac98-b661bb4545b4',
          created_at: '2021-10-19T16:31:01.581Z',
          updated_at: '2021-10-19T16:32:33.960Z',
          date: '2021-10-19T16:22:00.000Z',
          deleted: false,
          active: true,
          name: '#1480',
          custom_id: '1480',
          items: [Array],
          is_proxy: true,
          proxy_vendor: 'shopify',
          type: null,
          external_reference_id: '4176054681749',
          external_reference_custom_id: null,
          client_id: null,
          person: 'c8b6af86-d41c-4357-a5ac-16255bcdc3c4',
          storefront: 'c7ab27b9-52c2-47c2-90c6-a6227727fe46',
          note: null,
          comment: null,
          shipping_address: null,
          billing_address: [Object],
          contact: null,
          metadata: null,
          custom_properties: null,
          cart: 'd5ffb4ef-88b1-488b-9b64-6649d102380b',
          presentables: [Object],
          shipping_fulfillment: null,
          amount_total_gross: 30,
          amount_total_net: 25.21,
          amount_total_tax: 4.79,
          amount_total_shipping_gross: null,
          discount_amount_total: 0,
          currency: 'EUR',
          order_prompt: null,
          status: null,
          discounts: [],
          person_external_reference_id: '3838829527189',
          links: [Object],
          fulfillment_status: null,
          financial_status: 'paid',
          taxes_summary: [Array],
          shipping_methods: [Array],
          author: null,
          attribution: [Object],
          proxy_payload: [Object],
          products_map: undefined
        }
      },
      person: {
        id: 'c8b6af86-d41c-4357-a5ac-16255bcdc3c4',
        kind: 'Contact',
        first_name: 'Fynn',
        nickname: null,
        middle_name: null,
        last_name: 'Merlevede',
        name: 'Test 016',
        avatar: 'https://charles-cdn.storage.googleapis.com/assets/icons/mp/fallback/1_male.jpg',
        email: null,
        date_of_birth: null,
        created_at: '2021-10-14T13:25:37.345Z',
        updated_at: '2021-10-19T16:30:03.104Z',
        raw_payloads: undefined,
        gender: null,
        comment: null,
        origins: undefined,
        deleted: false,
        active: true,
        measurements: null,
        annotations: null,
        custom_properties: {},
        tags: ['d92fa695-8e16-4d68-b6e0-d03f0bdf4e81'],
        name_preference: null,
        language_preference: null,
        parents: [],
        default_address: null,
        addresses: undefined,
        phonenumbers: undefined,
        channel_users: undefined,
        emails: undefined,
        organizations: undefined,
        message_subscription_instances: undefined,
        analytics: undefined,
        direct_feed: undefined
      },
      action: 'create',
      channel_user: {
        id: 'c56e5f02-00fa-4a34-b20a-ecc21b9690ef',
        person: 'c8b6af86-d41c-4357-a5ac-16255bcdc3c4',
        updated_at: null,
        created_at: null,
        last_source_fetch_at: null,
        broker: 'shopify',
        external_person_reference_id: '3838829527189',
        external_person_custom_id: null,
        external_channel_reference_id: 'hey-charles-dev-store-2.myshopify.com',
        source_type: 'shopify',
        payload_name: null,
        first_name: null,
        middle_name: null,
        last_name: 'Merlevede',
        email: null,
        phone: '4915253412112',
        name: null,
        payload: {
          id: 3838829527189,
          note: null,
          tags: '',
          email: null,
          phone: '+4915253412112',
          state: 'disabled',
          currency: 'EUR',
          last_name: 'Merlevede',
          created_at: '2020-08-05T15:31:40+02:00',
          first_name: '',
          tax_exempt: false,
          updated_at: '2021-10-19T18:22:02+02:00',
          total_spent: '98.00',
          orders_count: 3,
          last_order_id: 3847521599637,
          tax_exemptions: [],
          verified_email: true,
          default_address: [Object],
          last_order_name: '#1211',
          accepts_marketing: true,
          admin_graphql_api_id: 'gid://shopify/Customer/3838829527189',
          multipass_identifier: null,
          marketing_opt_in_level: null,
          accepts_marketing_updated_at: '2021-10-19T18:22:02+02:00'
        },
        source_api: 'shopify',
        active: true,
        deleted: false,
        external_organization_reference_ids: null,
        organizations: null,
        comment: null,
        links: {
          external: 'https://hey-charles-dev-store-2.myshopify.com/admin/customers/3838829527189'
        },
        verified: true,
        custom_properties: null,
        message_subscription_instances: undefined
      }
    }
  }

  t.deepEquals(jsonLogic.apply(rules, data1), { message: { content: { body: ':moneybag: Wohooo! </conversations/2f889adb-792c-47a2-8962-d332f238227d|New order> totaling 30,00 €' } } })
  t.end()
})
