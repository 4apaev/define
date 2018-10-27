const { equal, throws } = require('assert')
const { getOwnPropertyDescriptor:getDesc } = Object
const Define = require('./define')
let COUNT = 0
const byPath = (path, ...args) =>
  path.split('.').reduce((def, k) => k
    ? def[ k ]
    : def, Define).call(Define, ...args)

describe('Define', () => {
  describe('Value',  () => Prop(0))
  describe('Method', () => Prop(1))

  describe('Prop', () => {

    it(`(${ COUNT++ }) Define.prop with descriptor get?`, () => {
      const name = 'a'
      const o = {}
      const get = () => 1
      Define.prop(o, name, { get })
      const d = getDesc(o, name)
      equal(d.get, get)
      equal(d.set, undefined)
      equal(d.value, undefined)
    })

    it(`(${ COUNT++ }) Define.prop with descriptor value?`, () => {
      const name = 'a'
      const o = {}
      const value = 1
      Define.prop(o, name, { value })
      const d = getDesc(o, name)
      equal(d.value, value)
      equal(d.set, undefined)
      equal(d.get, undefined)
    })
  })
  describe('Getter', () => Accessor(0))
  describe('Setter', () => Accessor(1))
  describe('Alias', Alias)
  describe('Mix', Mix)
})


function Mix() {
  it(`(${ COUNT++ }) mixin`, () => {
    const a = { one() { return 1 }}
    const b = {
      two() { return 2 },
      three() { return 3 }
    }
    const c = Define.mix(a, b)
    equal(a.one(), 1)
    equal(a.two(), 2)
    equal(a.three(), 3)
  })
}

function Alias() {
  it(`(${ COUNT++ }) rename property`, () => {
    const src = { a: 1 }
    Define.alias(src, 'a', 'b')
    const a = getDesc(src, 'a')
    const b = getDesc(src, 'b')
    equal(src.a          , src.b)
    equal(a.configurable , b.configurable)
    equal(a.enumerable   , b.enumerable)
    equal(a.writable     , b.writable)
  })

  it(`(${ COUNT++ }) delegate and rename property`, () => {
    const src = { a: 1 }
    const trg = {}
    Define.alias(src, 'a', 'b', trg)
    const a = getDesc(src, 'a')
    const b = getDesc(trg, 'b')
    equal(src.a          , trg.b)
    equal(a.configurable , b.configurable)
    equal(a.enumerable   , b.enumerable)
    equal(a.writable     , b.writable)
  })

  it(`(${ COUNT++ }) delegate property`, () => {
    const name = 'a'
    const src = { [ name ]: 1 }
    const trg = {}

    Define.alias(src, name, null, trg)

    const a = getDesc(src, name)
    const b = getDesc(trg, name)

    equal(src[ name ], trg[ name ])
    equal(a.configurable , b.configurable)
    equal(a.enumerable   , b.enumerable)
    equal(a.writable     , b.writable)
  })

  it(`(${ COUNT++ }) fail on not exist`, () =>
    throws(() => Define.alias({ }, 'a', 'b'), ReferenceError))

  it(`(${ COUNT++ }) fail on missing lias and name`, () =>
    throws(() => Define.alias({ a: 1 }, 'a'), Error))
}

function Accessor(isSetter) {
  const compare = (c, e, title='') => {

    const method = isSetter ? 'setter' : 'getter'
    const banner  = `${ c }${ e } ${ title }`
    const o = { $: 1 }
    const key = 'shoshi'
    const name = 'doggo'
    const get = () => o.$
    const set = isSetter
      ? v => o.$=v
      : undefined

    byPath(`${ title }.prop`, o, name, { get, set })
    byPath(`${ title }.${ method }`, o, key, get, set)

    it(`(${ COUNT++ }) ${ banner }.prop`, () => {
      const d = getDesc(o, name)
      equal(d.get, get, '[ Prop ] desc.Get = Getter')
      equal(d.set, set, '[ Prop ] desc.Set = Setter')
      equal(d.enumerable  , !!e, '[ Prop ] desc.Enumerable = !!E')
      equal(d.configurable, !!c, '[ Prop ] desc.Configurable = !!C')
    })

    it(`(${ COUNT++ }) ${ banner }.${ method }`, () => {

      const d = getDesc(o, key)
      equal(d.get, get, `[ ${ method } ] desc.Get = Getter`)
      equal(d.set, set, `[ ${ method } ] desc.Set = Setter`)
      equal(d.enumerable  , !!e, `[ ${ method } ] desc.Enumerable = !!E`)
      equal(d.configurable, !!c, `[ ${ method } ] desc.Configurable = !!C`)
    })

    it(`(${ COUNT++ }) ${ banner } ${ method } should get/set`, () => {
      equal(o[ key ], o.$, `[ ${ method } ] o.${ key } = ${ o.$ }`)
      if (isSetter) {
        const next = 1 + o.$
        equal(++o[ key ], next, `[ ${ method } ] ++o.${ key } = next ( ${next } )`)
        equal(o[ key ],   next, `[ ${ method } ] o.${ key } = next ( ${next }`)
      }
    })
  }

  compare(1, 1)
  compare(1, 1, 'conf')
  compare(1, 1, 'enum')
  compare(1, 1, 'conf.enum')
  compare(1, 1, 'enum.conf')
  compare(0, 1, 'not.conf')
  compare(0, 1, 'not.conf.enum')
  compare(0, 1, 'enum.not.conf')
  compare(1, 0, 'not.enum')
  compare(1, 0, 'not.enum.conf')
  compare(1, 0, 'conf.not.enum')
  compare(0, 0, 'not.enum.not.conf')
  compare(0, 0, 'not.conf.not.enum')
}

function Prop(isMethod, COUNT=0) {
  const compare = (c, e, w, title) => {
    const o = {  }
    const key = 'shoshi'
    const value = () => 1

    Define[ isMethod ? 'method' : 'value' ](o, key, value)

    it(`(${ COUNT++ }) ${ c }${ e }${ w } should ${ title } ${ isMethod ? 'method' : 'value' }`, () => {
      const d = getDesc(o, key)
      equal(d.value, value)
      equal(d.writable, !!w)
      equal(d.enumerable, isMethod ? false : !!e)
      equal(d.configurable, !!c)
    })
  }

  compare(0,0,0, 'Define.not.conf.not.enum.not.write', Define.not.conf.not.enum.not.write)
  compare(1,0,0, 'Define.conf.not.enum.not.write', Define.conf.not.enum.not.write)
  compare(0,1,0, 'Define.not.conf.enum.not.write', Define.not.conf.enum.not.write)
  compare(1,1,0, 'Define.conf.enum.not.write',     Define.conf.enum.not.write)
  compare(0,0,1, 'Define.not.conf.not.enum.write', Define.not.conf.not.enum.write)
  compare(1,0,1, 'Define.conf.not.enum.write', Define.conf.not.enum.write)
  compare(0,1,1, 'Define.not.conf.enum.write', Define.not.conf.enum.write)
  compare(1,1,1, 'Define.conf.enum.write', Define.conf.enum.write)

  compare(1,1,1, 'Define', Define)
  compare(1,1,1, 'Define.conf', Define.conf)
  compare(1,1,1, 'Define.conf.enum', Define.conf.enum)
  compare(1,1,1, 'Define.conf.write', Define.conf.write)

  compare(1,1,1, 'Define.enum', Define.enum)
  compare(1,1,1, 'Define.enum.conf', Define.enum.conf)
  compare(1,1,1, 'Define.enum.write', Define.enum.write)

  compare(1,1,1, 'Define.write', Define.write)
  compare(1,1,1, 'Define.write.conf', Define.write.conf)
  compare(1,1,1, 'Define.write.enum', Define.write.enum)

}
