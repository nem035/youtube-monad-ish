const runIO = function(io, ...rest) {
  return io.val.apply(this, ...rest);
};

const IOType = function(fn) {
  this.val = fn;
  this.runIO = this.val;
};

const IO = function(fn) {
  return (new IOType(fn));
};

IOType.of = function(x) {
  return IO(function() {
    return x;
  });
};

IOType.prototype.of = IOType.of;

IOType.prototype.chain = function(g) {
  const io = this;
  return IO(function() {
    return g(io.val()).val();
  });
};

// Derived
IOType.prototype.map = function(f) {
  return this.chain(function(a) {
    return IOType.of(f(a));
  });
};
IOType.prototype.ap = function(a) {
  return this.chain(function(f) {
    return a.map(f);
  });
};

const extendFunctionPrototype = function() {
  Function.prototype.toIO = function() {
    const self = this;
    return function(...args) {
      return IO(function() {
        return self.apply(this, args);
      });
    };
  };
};

const inspect = function(x) {
  if (x === null || x === undefined) return "null";
  return x.inspect ? x.inspect() : x.toString();
}

IOType.prototype.inspect = function() {
  return `IO(${inspect(this.val)})`;
}

IOType.prototype.toString = function() {
  return this.inspect();
}

IO.of = function(x) {
  return IO(x).of(x);
};

module.exports = {
  IO,
  runIO,
  extendFunctionPrototype
};