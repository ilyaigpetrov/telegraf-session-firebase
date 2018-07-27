module.exports = (sessionRef, opts) => {
  const options = Object.assign({
    property: 'session',
    getSessionKey: (ctx) => ctx.from && ctx.chat && `${ctx.from.id}-${ctx.chat.id}`
  }, opts)

  function getSession (key) {
    return sessionRef.doc(key).get()
      .then((snapshot) => snapshot.data())
  }

  function saveSession (key, session) {

    if (!session || Object.keys(session).length === 0) {
      return sessionRef.doc(key).remove()
    }
    return sessionRef.doc(key).set(session, { merge: true })
  }

  return (ctx, next) => {
    const key = options.getSessionKey(ctx)
    if (!key) {
      return next()
    }
    return getSession(key).then((value) => {
      let session = value || {}
      Object.defineProperty(ctx, options.property, {
        get: function () { return session },
        set: function (newValue) { session = Object.assign({}, newValue) }
      })
      return next().then(() => saveSession(key, session))
    })
  }
}
