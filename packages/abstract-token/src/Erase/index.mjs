const passthrough = (any) => any;

export default Object.assign(passthrough, {
  Static: passthrough,
  static: passthrough,
});

Object.freeze(passthrough);

export {
  passthrough as Any,
  passthrough as Unknown,
  passthrough as ShadowThis,
  passthrough as SubConstructorProxy,
  passthrough as SCP,
  passthrough as enableSubConstructorProxyCheck,
  passthrough as disableSubConstructorProxyCheck,
};
