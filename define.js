const Define = ((_, flag) => {
  let c=flag
  let e=flag
  let w=flag
  return {

    get ok() { return this[ _ ](flag=true) },
    get not() { return this[ _ ](flag=false) },
    get conf() { return this[ _ ](c=flag).ok },
    get enum() { return this[ _ ](e=flag).ok },
    get write() { return this[ _ ](w=flag).ok },

    [ _ ]() { return this },
    reset() {
      return this[ _ ](c = e = w = flag = true)
    },

    // flagCombos(size) {
    //   const buf = Array(1 << size)
    //   for (let i = buf.length; i--;) {
    //     buf[ i ] = Array(size)
    //     for (let j = size; j--;)
    //       buf[ i ][ j ] = +!!(i & 1 << j)
    //   }
    //   return buf
    // },

    mix(a, b) {
      return Object.defineProperties(a, Object.getOwnPropertyDescriptors(b))
    },

    value(o, name, value) {
      return this.desc(o, name, {
        configurable: c,
        enumerable: e,
        writable: w,
        value,
      })
    },

    setter(o, name, get, set) {
      return this.desc(o, name, {
        configurable: c,
        enumerable: e,
        get,
        set,
      })
    },

    prop(o, name, { value, get, set }) {
      return get
        ? this.setter(o, name, get, set)
        : this.value(o, name, value)
    },

    getter(o, name, get, set) {
      return this.setter(o, name, get, set)
    },

    method(o, name, value) {
      return this.not.enum.value(o, name, value)
    },

    alias(src, name, alias, trg) {
      if (!alias && !trg)
        throw new Error(`Define.alias: missing target and alias`)
      const desc = this.desc(src, name)
      if (!desc)
        throw new ReferenceError(`Define.alias: property not exist`)
      return this.desc(trg||src, alias||name, desc)
    },

    desc(o, name, desc) {
      this.reset()
      return desc
        ? Object.defineProperty(o, name, desc)
        : Object.getOwnPropertyDescriptor(o, name)
    },
  }
})(Symbol('❯❯❯'), true)

Define.alias(Define, 'value', 'val')
Define.alias(Define, 'getter', 'get')
Define.alias(Define, 'setter', 'set')
Define.alias(Define, 'method', 'func')

module.exports = Define