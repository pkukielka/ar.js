(function(){
'use strict';
/* Scala.js runtime support
 * Copyright 2013 LAMP/EPFL
 * Author: Sébastien Doeraene
 */

/* ---------------------------------- *
 * The top-level Scala.js environment *
 * ---------------------------------- */





// Get the environment info
var $env = (typeof __ScalaJSEnv === "object" && __ScalaJSEnv) ? __ScalaJSEnv : {};

// Global scope
var $g =
  (typeof $env["global"] === "object" && $env["global"])
    ? $env["global"]
    : ((typeof global === "object" && global && global["Object"] === Object) ? global : this);
$env["global"] = $g;

// Where to send exports
var $e =
  (typeof $env["exportsNamespace"] === "object" && $env["exportsNamespace"])
    ? $env["exportsNamespace"] : $g;
$env["exportsNamespace"] = $e;

// Freeze the environment info
$g["Object"]["freeze"]($env);

// Linking info - must be in sync with scala.scalajs.runtime.LinkingInfo
var $linkingInfo = {
  "semantics": {




    "asInstanceOfs": 1,










    "moduleInit": 2,





    "strictFloats": false,




    "productionMode": false

  },



  "assumingES6": false

};
$g["Object"]["freeze"]($linkingInfo);
$g["Object"]["freeze"]($linkingInfo["semantics"]);

// Snapshots of builtins and polyfills






var $imul = $g["Math"]["imul"] || (function(a, b) {
  // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/imul
  var ah = (a >>> 16) & 0xffff;
  var al = a & 0xffff;
  var bh = (b >>> 16) & 0xffff;
  var bl = b & 0xffff;
  // the shift by 0 fixes the sign on the high part
  // the final |0 converts the unsigned value into a signed value
  return ((al * bl) + (((ah * bl + al * bh) << 16) >>> 0) | 0);
});

var $fround = $g["Math"]["fround"] ||









  (function(v) {
    return +v;
  });


var $clz32 = $g["Math"]["clz32"] || (function(i) {
  // See Hacker's Delight, Section 5-3
  if (i === 0) return 32;
  var r = 1;
  if ((i & 0xffff0000) === 0) { i <<= 16; r += 16; };
  if ((i & 0xff000000) === 0) { i <<= 8; r += 8; };
  if ((i & 0xf0000000) === 0) { i <<= 4; r += 4; };
  if ((i & 0xc0000000) === 0) { i <<= 2; r += 2; };
  return r + (i >> 31);
});


// Other fields

















var $lastIDHash = 0; // last value attributed to an id hash code



var $idHashCodeMap = $g["WeakMap"] ? new $g["WeakMap"]() : null;



// Core mechanism

var $makeIsArrayOfPrimitive = function(primitiveData) {
  return function(obj, depth) {
    return !!(obj && obj.$classData &&
      (obj.$classData.arrayDepth === depth) &&
      (obj.$classData.arrayBase === primitiveData));
  }
};


var $makeAsArrayOfPrimitive = function(isInstanceOfFunction, arrayEncodedName) {
  return function(obj, depth) {
    if (isInstanceOfFunction(obj, depth) || (obj === null))
      return obj;
    else
      $throwArrayCastException(obj, arrayEncodedName, depth);
  }
};


/** Encode a property name for runtime manipulation
  *  Usage:
  *    env.propertyName({someProp:0})
  *  Returns:
  *    "someProp"
  *  Useful when the property is renamed by a global optimizer (like Closure)
  *  but we must still get hold of a string of that name for runtime
  * reflection.
  */
var $propertyName = function(obj) {
  for (var prop in obj)
    return prop;
};

// Runtime functions

var $isScalaJSObject = function(obj) {
  return !!(obj && obj.$classData);
};


var $throwClassCastException = function(instance, classFullName) {




  throw new $c_sjsr_UndefinedBehaviorError().init___jl_Throwable(
    new $c_jl_ClassCastException().init___T(
      instance + " is not an instance of " + classFullName));

};

var $throwArrayCastException = function(instance, classArrayEncodedName, depth) {
  for (; depth; --depth)
    classArrayEncodedName = "[" + classArrayEncodedName;
  $throwClassCastException(instance, classArrayEncodedName);
};


var $noIsInstance = function(instance) {
  throw new $g["TypeError"](
    "Cannot call isInstance() on a Class representing a raw JS trait/object");
};

var $makeNativeArrayWrapper = function(arrayClassData, nativeArray) {
  return new arrayClassData.constr(nativeArray);
};

var $newArrayObject = function(arrayClassData, lengths) {
  return $newArrayObjectInternal(arrayClassData, lengths, 0);
};

var $newArrayObjectInternal = function(arrayClassData, lengths, lengthIndex) {
  var result = new arrayClassData.constr(lengths[lengthIndex]);

  if (lengthIndex < lengths.length-1) {
    var subArrayClassData = arrayClassData.componentData;
    var subLengthIndex = lengthIndex+1;
    var underlying = result.u;
    for (var i = 0; i < underlying.length; i++) {
      underlying[i] = $newArrayObjectInternal(
        subArrayClassData, lengths, subLengthIndex);
    }
  }

  return result;
};

var $objectToString = function(instance) {
  if (instance === void 0)
    return "undefined";
  else
    return instance.toString();
};

var $objectGetClass = function(instance) {
  switch (typeof instance) {
    case "string":
      return $d_T.getClassOf();
    case "number": {
      var v = instance | 0;
      if (v === instance) { // is the value integral?
        if ($isByte(v))
          return $d_jl_Byte.getClassOf();
        else if ($isShort(v))
          return $d_jl_Short.getClassOf();
        else
          return $d_jl_Integer.getClassOf();
      } else {
        if ($isFloat(instance))
          return $d_jl_Float.getClassOf();
        else
          return $d_jl_Double.getClassOf();
      }
    }
    case "boolean":
      return $d_jl_Boolean.getClassOf();
    case "undefined":
      return $d_sr_BoxedUnit.getClassOf();
    default:
      if (instance === null)
        return instance.getClass__jl_Class();
      else if ($is_sjsr_RuntimeLong(instance))
        return $d_jl_Long.getClassOf();
      else if ($isScalaJSObject(instance))
        return instance.$classData.getClassOf();
      else
        return null; // Exception?
  }
};

var $objectClone = function(instance) {
  if ($isScalaJSObject(instance) || (instance === null))
    return instance.clone__O();
  else
    throw new $c_jl_CloneNotSupportedException().init___();
};

var $objectNotify = function(instance) {
  // final and no-op in java.lang.Object
  if (instance === null)
    instance.notify__V();
};

var $objectNotifyAll = function(instance) {
  // final and no-op in java.lang.Object
  if (instance === null)
    instance.notifyAll__V();
};

var $objectFinalize = function(instance) {
  if ($isScalaJSObject(instance) || (instance === null))
    instance.finalize__V();
  // else no-op
};

var $objectEquals = function(instance, rhs) {
  if ($isScalaJSObject(instance) || (instance === null))
    return instance.equals__O__Z(rhs);
  else if (typeof instance === "number")
    return typeof rhs === "number" && $numberEquals(instance, rhs);
  else
    return instance === rhs;
};

var $numberEquals = function(lhs, rhs) {
  return (lhs === rhs) ? (
    // 0.0.equals(-0.0) must be false
    lhs !== 0 || 1/lhs === 1/rhs
  ) : (
    // are they both NaN?
    (lhs !== lhs) && (rhs !== rhs)
  );
};

var $objectHashCode = function(instance) {
  switch (typeof instance) {
    case "string":
      return $m_sjsr_RuntimeString$().hashCode__T__I(instance);
    case "number":
      return $m_sjsr_Bits$().numberHashCode__D__I(instance);
    case "boolean":
      return instance ? 1231 : 1237;
    case "undefined":
      return 0;
    default:
      if ($isScalaJSObject(instance) || instance === null)
        return instance.hashCode__I();

      else if ($idHashCodeMap === null)
        return 42;

      else
        return $systemIdentityHashCode(instance);
  }
};

var $comparableCompareTo = function(instance, rhs) {
  switch (typeof instance) {
    case "string":

      $as_T(rhs);

      return instance === rhs ? 0 : (instance < rhs ? -1 : 1);
    case "number":

      $as_jl_Number(rhs);

      return $m_jl_Double$().compare__D__D__I(instance, rhs);
    case "boolean":

      $asBoolean(rhs);

      return instance - rhs; // yes, this gives the right result
    default:
      return instance.compareTo__O__I(rhs);
  }
};

var $charSequenceLength = function(instance) {
  if (typeof(instance) === "string")

    return $uI(instance["length"]);



  else
    return instance.length__I();
};

var $charSequenceCharAt = function(instance, index) {
  if (typeof(instance) === "string")

    return $uI(instance["charCodeAt"](index)) & 0xffff;



  else
    return instance.charAt__I__C(index);
};

var $charSequenceSubSequence = function(instance, start, end) {
  if (typeof(instance) === "string")

    return $as_T(instance["substring"](start, end));



  else
    return instance.subSequence__I__I__jl_CharSequence(start, end);
};

var $booleanBooleanValue = function(instance) {
  if (typeof instance === "boolean") return instance;
  else                               return instance.booleanValue__Z();
};

var $numberByteValue = function(instance) {
  if (typeof instance === "number") return (instance << 24) >> 24;
  else                              return instance.byteValue__B();
};
var $numberShortValue = function(instance) {
  if (typeof instance === "number") return (instance << 16) >> 16;
  else                              return instance.shortValue__S();
};
var $numberIntValue = function(instance) {
  if (typeof instance === "number") return instance | 0;
  else                              return instance.intValue__I();
};
var $numberLongValue = function(instance) {
  if (typeof instance === "number")
    return $m_sjsr_RuntimeLong$().fromDouble__D__sjsr_RuntimeLong(instance);
  else
    return instance.longValue__J();
};
var $numberFloatValue = function(instance) {
  if (typeof instance === "number") return $fround(instance);
  else                              return instance.floatValue__F();
};
var $numberDoubleValue = function(instance) {
  if (typeof instance === "number") return instance;
  else                              return instance.doubleValue__D();
};

var $isNaN = function(instance) {
  return instance !== instance;
};

var $isInfinite = function(instance) {
  return !$g["isFinite"](instance) && !$isNaN(instance);
};

var $doubleToInt = function(x) {
  return (x > 2147483647) ? (2147483647) : ((x < -2147483648) ? -2147483648 : (x | 0));
};

/** Instantiates a JS object with variadic arguments to the constructor. */
var $newJSObjectWithVarargs = function(ctor, args) {
  // This basically emulates the ECMAScript specification for 'new'.
  var instance = $g["Object"]["create"](ctor.prototype);
  var result = ctor["apply"](instance, args);
  switch (typeof result) {
    case "string": case "number": case "boolean": case "undefined": case "symbol":
      return instance;
    default:
      return result === null ? instance : result;
  }
};

var $resolveSuperRef = function(initialProto, propName) {
  var getPrototypeOf = $g["Object"]["getPrototypeOf"];
  var getOwnPropertyDescriptor = $g["Object"]["getOwnPropertyDescriptor"];

  var superProto = getPrototypeOf(initialProto);
  while (superProto !== null) {
    var desc = getOwnPropertyDescriptor(superProto, propName);
    if (desc !== void 0)
      return desc;
    superProto = getPrototypeOf(superProto);
  }

  return void 0;
};

var $superGet = function(initialProto, self, propName) {
  var desc = $resolveSuperRef(initialProto, propName);
  if (desc !== void 0) {
    var getter = desc["get"];
    if (getter !== void 0)
      return getter["call"](self);
    else
      return desc["value"];
  }
  return void 0;
};

var $superSet = function(initialProto, self, propName, value) {
  var desc = $resolveSuperRef(initialProto, propName);
  if (desc !== void 0) {
    var setter = desc["set"];
    if (setter !== void 0) {
      setter["call"](self, value);
      return void 0;
    }
  }
  throw new $g["TypeError"]("super has no setter '" + propName + "'.");
};

var $propertiesOf = function(obj) {
  var result = [];
  for (var prop in obj)
    result["push"](prop);
  return result;
};

var $systemArraycopy = function(src, srcPos, dest, destPos, length) {
  var srcu = src.u;
  var destu = dest.u;
  if (srcu !== destu || destPos < srcPos || srcPos + length < destPos) {
    for (var i = 0; i < length; i++)
      destu[destPos+i] = srcu[srcPos+i];
  } else {
    for (var i = length-1; i >= 0; i--)
      destu[destPos+i] = srcu[srcPos+i];
  }
};

var $systemIdentityHashCode =

  ($idHashCodeMap !== null) ?

  (function(obj) {
    switch (typeof obj) {
      case "string": case "number": case "boolean": case "undefined":
        return $objectHashCode(obj);
      default:
        if (obj === null) {
          return 0;
        } else {
          var hash = $idHashCodeMap["get"](obj);
          if (hash === void 0) {
            hash = ($lastIDHash + 1) | 0;
            $lastIDHash = hash;
            $idHashCodeMap["set"](obj, hash);
          }
          return hash;
        }
    }

  }) :
  (function(obj) {
    if ($isScalaJSObject(obj)) {
      var hash = obj["$idHashCode$0"];
      if (hash !== void 0) {
        return hash;
      } else if (!$g["Object"]["isSealed"](obj)) {
        hash = ($lastIDHash + 1) | 0;
        $lastIDHash = hash;
        obj["$idHashCode$0"] = hash;
        return hash;
      } else {
        return 42;
      }
    } else if (obj === null) {
      return 0;
    } else {
      return $objectHashCode(obj);
    }

  });

// is/as for hijacked boxed classes (the non-trivial ones)

var $isByte = function(v) {
  return (v << 24 >> 24) === v && 1/v !== 1/-0;
};

var $isShort = function(v) {
  return (v << 16 >> 16) === v && 1/v !== 1/-0;
};

var $isInt = function(v) {
  return (v | 0) === v && 1/v !== 1/-0;
};

var $isFloat = function(v) {



  return typeof v === "number";

};


var $asUnit = function(v) {
  if (v === void 0 || v === null)
    return v;
  else
    $throwClassCastException(v, "scala.runtime.BoxedUnit");
};

var $asBoolean = function(v) {
  if (typeof v === "boolean" || v === null)
    return v;
  else
    $throwClassCastException(v, "java.lang.Boolean");
};

var $asByte = function(v) {
  if ($isByte(v) || v === null)
    return v;
  else
    $throwClassCastException(v, "java.lang.Byte");
};

var $asShort = function(v) {
  if ($isShort(v) || v === null)
    return v;
  else
    $throwClassCastException(v, "java.lang.Short");
};

var $asInt = function(v) {
  if ($isInt(v) || v === null)
    return v;
  else
    $throwClassCastException(v, "java.lang.Integer");
};

var $asFloat = function(v) {
  if ($isFloat(v) || v === null)
    return v;
  else
    $throwClassCastException(v, "java.lang.Float");
};

var $asDouble = function(v) {
  if (typeof v === "number" || v === null)
    return v;
  else
    $throwClassCastException(v, "java.lang.Double");
};


// Unboxes


var $uZ = function(value) {
  return !!$asBoolean(value);
};
var $uB = function(value) {
  return $asByte(value) | 0;
};
var $uS = function(value) {
  return $asShort(value) | 0;
};
var $uI = function(value) {
  return $asInt(value) | 0;
};
var $uJ = function(value) {
  return null === value ? $m_sjsr_RuntimeLong$().Zero$1
                        : $as_sjsr_RuntimeLong(value);
};
var $uF = function(value) {
  /* Here, it is fine to use + instead of fround, because asFloat already
   * ensures that the result is either null or a float.
   */
  return +$asFloat(value);
};
var $uD = function(value) {
  return +$asDouble(value);
};






// TypeArray conversions

var $byteArray2TypedArray = function(value) { return new $g["Int8Array"](value.u); };
var $shortArray2TypedArray = function(value) { return new $g["Int16Array"](value.u); };
var $charArray2TypedArray = function(value) { return new $g["Uint16Array"](value.u); };
var $intArray2TypedArray = function(value) { return new $g["Int32Array"](value.u); };
var $floatArray2TypedArray = function(value) { return new $g["Float32Array"](value.u); };
var $doubleArray2TypedArray = function(value) { return new $g["Float64Array"](value.u); };

var $typedArray2ByteArray = function(value) {
  var arrayClassData = $d_B.getArrayOf();
  return new arrayClassData.constr(new $g["Int8Array"](value));
};
var $typedArray2ShortArray = function(value) {
  var arrayClassData = $d_S.getArrayOf();
  return new arrayClassData.constr(new $g["Int16Array"](value));
};
var $typedArray2CharArray = function(value) {
  var arrayClassData = $d_C.getArrayOf();
  return new arrayClassData.constr(new $g["Uint16Array"](value));
};
var $typedArray2IntArray = function(value) {
  var arrayClassData = $d_I.getArrayOf();
  return new arrayClassData.constr(new $g["Int32Array"](value));
};
var $typedArray2FloatArray = function(value) {
  var arrayClassData = $d_F.getArrayOf();
  return new arrayClassData.constr(new $g["Float32Array"](value));
};
var $typedArray2DoubleArray = function(value) {
  var arrayClassData = $d_D.getArrayOf();
  return new arrayClassData.constr(new $g["Float64Array"](value));
};

/* We have to force a non-elidable *read* of $e, otherwise Closure will
 * eliminate it altogether, along with all the exports, which is ... er ...
 * plain wrong.
 */
this["__ScalaJSExportsNamespace"] = $e;

// TypeData class


/** @constructor */
var $TypeData = function() {




  // Runtime support
  this.constr = void 0;
  this.parentData = void 0;
  this.ancestors = null;
  this.componentData = null;
  this.arrayBase = null;
  this.arrayDepth = 0;
  this.zero = null;
  this.arrayEncodedName = "";
  this._classOf = void 0;
  this._arrayOf = void 0;
  this.isArrayOf = void 0;

  // java.lang.Class support
  this["name"] = "";
  this["isPrimitive"] = false;
  this["isInterface"] = false;
  this["isArrayClass"] = false;
  this["isRawJSType"] = false;
  this["isInstance"] = void 0;
};


$TypeData.prototype.initPrim = function(



    zero, arrayEncodedName, displayName) {
  // Runtime support
  this.ancestors = {};
  this.componentData = null;
  this.zero = zero;
  this.arrayEncodedName = arrayEncodedName;
  this.isArrayOf = function(obj, depth) { return false; };

  // java.lang.Class support
  this["name"] = displayName;
  this["isPrimitive"] = true;
  this["isInstance"] = function(obj) { return false; };

  return this;
};


$TypeData.prototype.initClass = function(



    internalNameObj, isInterface, fullName,
    ancestors, isRawJSType, parentData, isInstance, isArrayOf) {
  var internalName = $propertyName(internalNameObj);

  isInstance = isInstance || function(obj) {
    return !!(obj && obj.$classData && obj.$classData.ancestors[internalName]);
  };

  isArrayOf = isArrayOf || function(obj, depth) {
    return !!(obj && obj.$classData && (obj.$classData.arrayDepth === depth)
      && obj.$classData.arrayBase.ancestors[internalName])
  };

  // Runtime support
  this.parentData = parentData;
  this.ancestors = ancestors;
  this.arrayEncodedName = "L"+fullName+";";
  this.isArrayOf = isArrayOf;

  // java.lang.Class support
  this["name"] = fullName;
  this["isInterface"] = isInterface;
  this["isRawJSType"] = !!isRawJSType;
  this["isInstance"] = isInstance;

  return this;
};


$TypeData.prototype.initArray = function(



    componentData) {
  // The constructor

  var componentZero0 = componentData.zero;

  // The zero for the Long runtime representation
  // is a special case here, since the class has not
  // been defined yet, when this file is read
  var componentZero = (componentZero0 == "longZero")
    ? $m_sjsr_RuntimeLong$().Zero$1
    : componentZero0;


  /** @constructor */
  var ArrayClass = function(arg) {
    if (typeof(arg) === "number") {
      // arg is the length of the array
      this.u = new Array(arg);
      for (var i = 0; i < arg; i++)
        this.u[i] = componentZero;
    } else {
      // arg is a native array that we wrap
      this.u = arg;
    }
  }
  ArrayClass.prototype = new $h_O;
  ArrayClass.prototype.constructor = ArrayClass;

  ArrayClass.prototype.clone__O = function() {
    if (this.u instanceof Array)
      return new ArrayClass(this.u["slice"](0));
    else
      // The underlying Array is a TypedArray
      return new ArrayClass(new this.u.constructor(this.u));
  };

























  ArrayClass.prototype.$classData = this;

  // Don't generate reflective call proxies. The compiler special cases
  // reflective calls to methods on scala.Array

  // The data

  var encodedName = "[" + componentData.arrayEncodedName;
  var componentBase = componentData.arrayBase || componentData;
  var arrayDepth = componentData.arrayDepth + 1;

  var isInstance = function(obj) {
    return componentBase.isArrayOf(obj, arrayDepth);
  }

  // Runtime support
  this.constr = ArrayClass;
  this.parentData = $d_O;
  this.ancestors = {O: 1, jl_Cloneable: 1, Ljava_io_Serializable: 1};
  this.componentData = componentData;
  this.arrayBase = componentBase;
  this.arrayDepth = arrayDepth;
  this.zero = null;
  this.arrayEncodedName = encodedName;
  this._classOf = undefined;
  this._arrayOf = undefined;
  this.isArrayOf = undefined;

  // java.lang.Class support
  this["name"] = encodedName;
  this["isPrimitive"] = false;
  this["isInterface"] = false;
  this["isArrayClass"] = true;
  this["isInstance"] = isInstance;

  return this;
};


$TypeData.prototype.getClassOf = function() {



  if (!this._classOf)
    this._classOf = new $c_jl_Class().init___jl_ScalaJSClassData(this);
  return this._classOf;
};


$TypeData.prototype.getArrayOf = function() {



  if (!this._arrayOf)
    this._arrayOf = new $TypeData().initArray(this);
  return this._arrayOf;
};

// java.lang.Class support


$TypeData.prototype["getFakeInstance"] = function() {



  if (this === $d_T)
    return "some string";
  else if (this === $d_jl_Boolean)
    return false;
  else if (this === $d_jl_Byte ||
           this === $d_jl_Short ||
           this === $d_jl_Integer ||
           this === $d_jl_Float ||
           this === $d_jl_Double)
    return 0;
  else if (this === $d_jl_Long)
    return $m_sjsr_RuntimeLong$().Zero$1;
  else if (this === $d_sr_BoxedUnit)
    return void 0;
  else
    return {$classData: this};
};


$TypeData.prototype["getSuperclass"] = function() {



  return this.parentData ? this.parentData.getClassOf() : null;
};


$TypeData.prototype["getComponentType"] = function() {



  return this.componentData ? this.componentData.getClassOf() : null;
};


$TypeData.prototype["newArrayOfThisClass"] = function(lengths) {



  var arrayClassData = this;
  for (var i = 0; i < lengths.length; i++)
    arrayClassData = arrayClassData.getArrayOf();
  return $newArrayObject(arrayClassData, lengths);
};




// Create primitive types

var $d_V = new $TypeData().initPrim(undefined, "V", "void");
var $d_Z = new $TypeData().initPrim(false, "Z", "boolean");
var $d_C = new $TypeData().initPrim(0, "C", "char");
var $d_B = new $TypeData().initPrim(0, "B", "byte");
var $d_S = new $TypeData().initPrim(0, "S", "short");
var $d_I = new $TypeData().initPrim(0, "I", "int");
var $d_J = new $TypeData().initPrim("longZero", "J", "long");
var $d_F = new $TypeData().initPrim(0.0, "F", "float");
var $d_D = new $TypeData().initPrim(0.0, "D", "double");

// Instance tests for array of primitives

var $isArrayOf_Z = $makeIsArrayOfPrimitive($d_Z);
$d_Z.isArrayOf = $isArrayOf_Z;

var $isArrayOf_C = $makeIsArrayOfPrimitive($d_C);
$d_C.isArrayOf = $isArrayOf_C;

var $isArrayOf_B = $makeIsArrayOfPrimitive($d_B);
$d_B.isArrayOf = $isArrayOf_B;

var $isArrayOf_S = $makeIsArrayOfPrimitive($d_S);
$d_S.isArrayOf = $isArrayOf_S;

var $isArrayOf_I = $makeIsArrayOfPrimitive($d_I);
$d_I.isArrayOf = $isArrayOf_I;

var $isArrayOf_J = $makeIsArrayOfPrimitive($d_J);
$d_J.isArrayOf = $isArrayOf_J;

var $isArrayOf_F = $makeIsArrayOfPrimitive($d_F);
$d_F.isArrayOf = $isArrayOf_F;

var $isArrayOf_D = $makeIsArrayOfPrimitive($d_D);
$d_D.isArrayOf = $isArrayOf_D;


// asInstanceOfs for array of primitives
var $asArrayOf_Z = $makeAsArrayOfPrimitive($isArrayOf_Z, "Z");
var $asArrayOf_C = $makeAsArrayOfPrimitive($isArrayOf_C, "C");
var $asArrayOf_B = $makeAsArrayOfPrimitive($isArrayOf_B, "B");
var $asArrayOf_S = $makeAsArrayOfPrimitive($isArrayOf_S, "S");
var $asArrayOf_I = $makeAsArrayOfPrimitive($isArrayOf_I, "I");
var $asArrayOf_J = $makeAsArrayOfPrimitive($isArrayOf_J, "J");
var $asArrayOf_F = $makeAsArrayOfPrimitive($isArrayOf_F, "F");
var $asArrayOf_D = $makeAsArrayOfPrimitive($isArrayOf_D, "D");

/** @constructor */
function $c_O() {
  /*<skip>*/
}
/** @constructor */
function $h_O() {
  /*<skip>*/
}
$h_O.prototype = $c_O.prototype;
$c_O.prototype.init___ = (function() {
  return this
});
$c_O.prototype.toString__T = (function() {
  var jsx$2 = $objectGetClass(this).getName__T();
  var i = this.hashCode__I();
  var x = $uD((i >>> 0));
  var jsx$1 = x.toString(16);
  return ((jsx$2 + "@") + $as_T(jsx$1))
});
$c_O.prototype.hashCode__I = (function() {
  return $systemIdentityHashCode(this)
});
$c_O.prototype.toString = (function() {
  return this.toString__T()
});
function $is_O(obj) {
  return (obj !== null)
}
function $as_O(obj) {
  return obj
}
function $isArrayOf_O(obj, depth) {
  var data = (obj && obj.$classData);
  if ((!data)) {
    return false
  } else {
    var arrayDepth = (data.arrayDepth || 0);
    return ((!(arrayDepth < depth)) && ((arrayDepth > depth) || (!data.arrayBase.isPrimitive)))
  }
}
function $asArrayOf_O(obj, depth) {
  return (($isArrayOf_O(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.Object;", depth))
}
var $d_O = new $TypeData().initClass({
  O: 0
}, false, "java.lang.Object", {
  O: 1
}, (void 0), (void 0), $is_O, $isArrayOf_O);
$c_O.prototype.$classData = $d_O;
/** @constructor */
function $c_Larjs_Camera() {
  $c_O.call(this);
  this.video$1 = null;
  this.canvas$1 = null;
  this.greenScreen$1 = null
}
$c_Larjs_Camera.prototype = new $h_O();
$c_Larjs_Camera.prototype.constructor = $c_Larjs_Camera;
/** @constructor */
function $h_Larjs_Camera() {
  /*<skip>*/
}
$h_Larjs_Camera.prototype = $c_Larjs_Camera.prototype;
$c_Larjs_Camera.prototype.$$js$exported$meth$drawOnCanvas$default$2__Z = (function() {
  return false
});
$c_Larjs_Camera.prototype.$$js$exported$meth$drawOnCanvas__Z__Z__O = (function(drawGreenScreen, drawMarker) {
  this.drawOnCanvas__Z__Z__V(drawGreenScreen, drawMarker)
});
$c_Larjs_Camera.prototype.$$js$exported$meth$drawOnCanvas$default$1__Z = (function() {
  return false
});
$c_Larjs_Camera.prototype.init___Lorg_scalajs_dom_raw_HTMLVideoElement__Lorg_scalajs_dom_raw_HTMLCanvasElement = (function(video, canvas) {
  this.video$1 = video;
  this.canvas$1 = canvas;
  this.greenScreen$1 = new $c_Larjs_GreenScreen().init___Lorg_scalajs_dom_raw_HTMLVideoElement__Lorg_scalajs_dom_raw_HTMLCanvasElement(video, canvas);
  return this
});
$c_Larjs_Camera.prototype.drawOnCanvas__Z__Z__V = (function(drawGreenScreen, drawMarker) {
  var qual$1 = $m_Larjs_package$().canvasToContext__Lorg_scalajs_dom_raw_HTMLCanvasElement__Lorg_scalajs_dom_raw_CanvasRenderingContext2D(this.canvas$1);
  var x$1 = this.video$1;
  var x$4 = $uI(this.canvas$1.width);
  var x$5 = $uI(this.canvas$1.height);
  qual$1.drawImage(x$1, 0.0, 0.0, x$4, x$5);
  this.greenScreen$1.drawGreenScreen__Z__Z__V(drawGreenScreen, drawMarker)
});
$c_Larjs_Camera.prototype.drawOnCanvas = (function() {
  var jsx$1 = (arguments.length | 0);
  var jsx$2 = 0;
  var arg$rest = [];
  while ((jsx$2 < jsx$1)) {
    arg$rest.push(arguments[jsx$2]);
    jsx$2 = ((jsx$2 + 1) | 0)
  };
  var prep0 = ((arg$rest[0] === (void 0)) ? this.$$js$exported$meth$drawOnCanvas$default$1__Z() : $uZ(arg$rest[0]));
  var prep1 = ((arg$rest[1] === (void 0)) ? this.$$js$exported$meth$drawOnCanvas$default$2__Z() : $uZ(arg$rest[1]));
  return this.$$js$exported$meth$drawOnCanvas__Z__Z__O(prep0, prep1)
});
var $d_Larjs_Camera = new $TypeData().initClass({
  Larjs_Camera: 0
}, false, "arjs.Camera", {
  Larjs_Camera: 1,
  O: 1
});
$c_Larjs_Camera.prototype.$classData = $d_Larjs_Camera;
$e.arjs = ($e.arjs || {});
/** @constructor */
$e.arjs.Camera = (function(arg$1, arg$2) {
  var $thiz = new $c_Larjs_Camera();
  var prep0 = arg$1;
  var prep1 = arg$2;
  $c_Larjs_Camera.prototype.init___Lorg_scalajs_dom_raw_HTMLVideoElement__Lorg_scalajs_dom_raw_HTMLCanvasElement.call($thiz, prep0, prep1);
  return $thiz
});
$e.arjs.Camera.prototype = $c_Larjs_Camera.prototype;
/** @constructor */
function $c_Larjs_GreenScreen() {
  $c_O.call(this);
  this.video$1 = null;
  this.arjs$GreenScreen$$canvas$f = null;
  this.deltaSingleColor$1 = 0;
  this.deltaValueMin$1 = 0.0;
  this.deltaValueMax$1 = 0.0;
  this.downScaleFactor$1 = 0;
  this.baseCanvas$1 = null;
  this.backCanvas$1 = null;
  this.greenScreen$1 = null;
  this.greenscreenWidth$1 = 0
}
$c_Larjs_GreenScreen.prototype = new $h_O();
$c_Larjs_GreenScreen.prototype.constructor = $c_Larjs_GreenScreen;
/** @constructor */
function $h_Larjs_GreenScreen() {
  /*<skip>*/
}
$h_Larjs_GreenScreen.prototype = $c_Larjs_GreenScreen.prototype;
$c_Larjs_GreenScreen.prototype.drawGreenScreen__Z__Z__V = (function(drawGreenBackground, drawMarker) {
  this.computeInitialValues__V();
  this.optimizeInitialValues__V();
  if (drawGreenBackground) {
    var canvasImageData = $m_Larjs_package$().canvasToContext__Lorg_scalajs_dom_raw_HTMLCanvasElement__Lorg_scalajs_dom_raw_CanvasRenderingContext2D(this.arjs$GreenScreen$$canvas$f).getImageData(0.0, 0.0, $uI(this.arjs$GreenScreen$$canvas$f.width), $uI(this.arjs$GreenScreen$$canvas$f.height));
    var canvasData = canvasImageData.data;
    var xs = this.greenScreen$1;
    var end = xs.u.length;
    var isEmpty$4 = (end <= 0);
    var numRangeElements$4 = (isEmpty$4 ? 0 : end);
    var lastElement$4 = (isEmpty$4 ? (-1) : (((-1) + end) | 0));
    var terminalElement$4 = ((1 + lastElement$4) | 0);
    if ((numRangeElements$4 < 0)) {
      $m_sci_Range$().scala$collection$immutable$Range$$fail__I__I__I__Z__sr_Nothing$(0, end, 1, false)
    };
    var i = 0;
    var count = 0;
    while ((i !== terminalElement$4)) {
      var i$1 = i;
      var xbase = $imul(((i$1 % this.greenscreenWidth$1) | 0), this.downScaleFactor$1);
      var ybase = $imul(((i$1 / this.greenscreenWidth$1) | 0), this.downScaleFactor$1);
      if (this.greenScreen$1.u[i$1]) {
        var end$1 = ((xbase + this.downScaleFactor$1) | 0);
        var isEmpty$4$1 = (xbase >= end$1);
        var numRangeElements$4$1 = (isEmpty$4$1 ? 0 : (new $c_sjsr_RuntimeLong().init___I(end$1).$$minus__sjsr_RuntimeLong__sjsr_RuntimeLong(new $c_sjsr_RuntimeLong().init___I(xbase)).$$greater__sjsr_RuntimeLong__Z(new $c_sjsr_RuntimeLong().init___I__I(2147483647, 0)) ? (-1) : ((end$1 - xbase) | 0)));
        var lastElement$4$1 = (isEmpty$4$1 ? (((-1) + xbase) | 0) : (((-1) + end$1) | 0));
        var terminalElement$4$1 = ((1 + lastElement$4$1) | 0);
        if ((numRangeElements$4$1 < 0)) {
          $m_sci_Range$().scala$collection$immutable$Range$$fail__I__I__I__Z__sr_Nothing$(xbase, end$1, 1, false)
        };
        var isCommonCase = ((xbase !== (-2147483648)) || (end$1 !== (-2147483648)));
        var i$2 = xbase;
        var count$1 = 0;
        while ((isCommonCase ? (i$2 !== terminalElement$4$1) : (count$1 < numRangeElements$4$1))) {
          var x = i$2;
          var end$2 = ((ybase + this.downScaleFactor$1) | 0);
          var isEmpty$4$2 = (ybase >= end$2);
          var numRangeElements$4$2 = (isEmpty$4$2 ? 0 : (new $c_sjsr_RuntimeLong().init___I(end$2).$$minus__sjsr_RuntimeLong__sjsr_RuntimeLong(new $c_sjsr_RuntimeLong().init___I(ybase)).$$greater__sjsr_RuntimeLong__Z(new $c_sjsr_RuntimeLong().init___I__I(2147483647, 0)) ? (-1) : ((end$2 - ybase) | 0)));
          var lastElement$4$2 = (isEmpty$4$2 ? (((-1) + ybase) | 0) : (((-1) + end$2) | 0));
          var terminalElement$4$2 = ((1 + lastElement$4$2) | 0);
          if ((numRangeElements$4$2 < 0)) {
            $m_sci_Range$().scala$collection$immutable$Range$$fail__I__I__I__Z__sr_Nothing$(ybase, end$2, 1, false)
          };
          var isCommonCase$1 = ((ybase !== (-2147483648)) || (end$2 !== (-2147483648)));
          var i$3 = ybase;
          var count$2 = 0;
          while ((isCommonCase$1 ? (i$3 !== terminalElement$4$2) : (count$2 < numRangeElements$4$2))) {
            var v1 = i$3;
            var pos = $imul(4, ((x + $imul(v1, $uI(this.arjs$GreenScreen$$canvas$f.width))) | 0));
            canvasData[pos] = 0;
            canvasData[((1 + pos) | 0)] = 200;
            canvasData[((2 + pos) | 0)] = 0;
            count$2 = ((1 + count$2) | 0);
            i$3 = ((1 + i$3) | 0)
          };
          count$1 = ((1 + count$1) | 0);
          i$2 = ((1 + i$2) | 0)
        }
      };
      count = ((1 + count) | 0);
      i = ((1 + i) | 0)
    };
    var qual$3 = $m_Larjs_package$().canvasToContext__Lorg_scalajs_dom_raw_HTMLCanvasElement__Lorg_scalajs_dom_raw_CanvasRenderingContext2D(this.arjs$GreenScreen$$canvas$f);
    qual$3.putImageData(canvasImageData, 0.0, 0.0)
  };
  if (drawMarker) {
    var x1 = this.getColorCenterPoint__I__I__T2(0, 130);
    if ((x1 !== null)) {
      var redX = x1.$$und1$mcD$sp__D();
      var redY = x1.$$und2$mcD$sp__D();
      var x$4_$_$$und1$f = null;
      var x$4_$_$$und2$f = null;
      var x$4_$_$$und1$mcD$sp$f = redX;
      var x$4_$_$$und2$mcD$sp$f = redY
    } else {
      var x$4_$_$$und1$f;
      var x$4_$_$$und2$f;
      var x$4_$_$$und1$mcD$sp$f;
      var x$4_$_$$und2$mcD$sp$f;
      throw new $c_s_MatchError().init___O(x1)
    };
    var redX$2 = x$4_$_$$und1$mcD$sp$f;
    var redY$2 = x$4_$_$$und2$mcD$sp$f;
    $g.drawFireball(this.arjs$GreenScreen$$canvas$f, $doubleToInt(redX$2), $doubleToInt(redY$2))
  }
});
$c_Larjs_GreenScreen.prototype.init___Lorg_scalajs_dom_raw_HTMLVideoElement__Lorg_scalajs_dom_raw_HTMLCanvasElement = (function(video, canvas) {
  this.video$1 = video;
  this.arjs$GreenScreen$$canvas$f = canvas;
  this.deltaSingleColor$1 = 35;
  this.deltaValueMin$1 = 0.85;
  this.deltaValueMax$1 = 1.15;
  this.downScaleFactor$1 = 6;
  this.baseCanvas$1 = this.createDownscaledCanvas__Lorg_scalajs_dom_raw_HTMLCanvasElement();
  this.backCanvas$1 = this.createDownscaledCanvas__Lorg_scalajs_dom_raw_HTMLCanvasElement();
  this.greenScreen$1 = $newArrayObject($d_Z.getArrayOf(), [$imul($uI(this.baseCanvas$1.width), $uI(this.baseCanvas$1.height))]);
  this.greenscreenWidth$1 = $uI(this.baseCanvas$1.width);
  return this
});
$c_Larjs_GreenScreen.prototype.optimizeInitialValues__V = (function() {
  var i = 1;
  var count = 0;
  while ((i !== 3)) {
    var $$this = this.greenscreenWidth$1;
    var end = ((this.greenScreen$1.u.length - this.greenscreenWidth$1) | 0);
    var isEmpty$4 = ($$this >= end);
    var numRangeElements$4 = (isEmpty$4 ? 0 : (new $c_sjsr_RuntimeLong().init___I(end).$$minus__sjsr_RuntimeLong__sjsr_RuntimeLong(new $c_sjsr_RuntimeLong().init___I($$this)).$$greater__sjsr_RuntimeLong__Z(new $c_sjsr_RuntimeLong().init___I__I(2147483647, 0)) ? (-1) : ((end - $$this) | 0)));
    var lastElement$4 = (isEmpty$4 ? (((-1) + $$this) | 0) : (((-1) + end) | 0));
    var terminalElement$4 = ((1 + lastElement$4) | 0);
    if ((numRangeElements$4 < 0)) {
      $m_sci_Range$().scala$collection$immutable$Range$$fail__I__I__I__Z__sr_Nothing$($$this, end, 1, false)
    };
    var isCommonCase = (($$this !== (-2147483648)) || (end !== (-2147483648)));
    var i$2 = $$this;
    var count$1 = 0;
    while ((isCommonCase ? (i$2 !== terminalElement$4) : (count$1 < numRangeElements$4))) {
      var i$3 = i$2;
      var x$1 = ((i$3 % this.greenscreenWidth$1) | 0);
      var y = ((i$3 / this.greenscreenWidth$1) | 0);
      var x$2 = (((-1) + x$1) | 0);
      if (this.greenScreen$1.u[((x$2 + $imul(y, this.greenscreenWidth$1)) | 0)]) {
        var x$3 = ((1 + x$1) | 0);
        var jsx$2 = this.greenScreen$1.u[((x$3 + $imul(y, this.greenscreenWidth$1)) | 0)]
      } else {
        var jsx$2 = false
      };
      if (jsx$2) {
        var jsx$1 = true
      } else {
        var y$1 = (((-1) + y) | 0);
        if (this.greenScreen$1.u[((x$1 + $imul(y$1, this.greenscreenWidth$1)) | 0)]) {
          var y$2 = ((1 + y) | 0);
          var jsx$1 = this.greenScreen$1.u[((x$1 + $imul(y$2, this.greenscreenWidth$1)) | 0)]
        } else {
          var jsx$1 = false
        }
      };
      if (jsx$1) {
        this.greenScreen$1.u[i$3] = true
      };
      var x$4 = (((-1) + x$1) | 0);
      if ((!this.greenScreen$1.u[((x$4 + $imul(y, this.greenscreenWidth$1)) | 0)])) {
        var x$5 = ((1 + x$1) | 0);
        var jsx$4 = (!this.greenScreen$1.u[((x$5 + $imul(y, this.greenscreenWidth$1)) | 0)])
      } else {
        var jsx$4 = false
      };
      if (jsx$4) {
        var jsx$3 = true
      } else {
        var y$3 = (((-1) + y) | 0);
        if ((!this.greenScreen$1.u[((x$1 + $imul(y$3, this.greenscreenWidth$1)) | 0)])) {
          var y$4 = ((1 + y) | 0);
          var jsx$3 = (!this.greenScreen$1.u[((x$1 + $imul(y$4, this.greenscreenWidth$1)) | 0)])
        } else {
          var jsx$3 = false
        }
      };
      if (jsx$3) {
        this.greenScreen$1.u[i$3] = false
      };
      count$1 = ((1 + count$1) | 0);
      i$2 = ((1 + i$2) | 0)
    };
    count = ((1 + count) | 0);
    i = ((1 + i) | 0)
  }
});
$c_Larjs_GreenScreen.prototype.getColorCenterPoint__I__I__T2 = (function(colourBitIndex, threshold) {
  var elem$1 = 0.0;
  elem$1 = 0.0;
  var elem$1$1 = 0.0;
  elem$1$1 = 0.0;
  var elem$1$2 = 0;
  elem$1$2 = 0;
  var canvasImageData = $m_Larjs_package$().canvasToContext__Lorg_scalajs_dom_raw_HTMLCanvasElement__Lorg_scalajs_dom_raw_CanvasRenderingContext2D(this.arjs$GreenScreen$$canvas$f).getImageData(0.0, 0.0, $uI(this.arjs$GreenScreen$$canvas$f.width), $uI(this.arjs$GreenScreen$$canvas$f.height));
  var canvasData = canvasImageData.data;
  var xs = this.greenScreen$1;
  var end = xs.u.length;
  var isEmpty$4 = (end <= 0);
  var numRangeElements$4 = (isEmpty$4 ? 0 : end);
  var lastElement$4 = (isEmpty$4 ? (-1) : (((-1) + end) | 0));
  var terminalElement$4 = ((1 + lastElement$4) | 0);
  if ((numRangeElements$4 < 0)) {
    $m_sci_Range$().scala$collection$immutable$Range$$fail__I__I__I__Z__sr_Nothing$(0, end, 1, false)
  };
  var i = 0;
  var count = 0;
  while ((i !== terminalElement$4)) {
    var i$1 = i;
    var xbase = $imul(((i$1 % this.greenscreenWidth$1) | 0), this.downScaleFactor$1);
    var ybase = $imul(((i$1 / this.greenscreenWidth$1) | 0), this.downScaleFactor$1);
    if ((!this.greenScreen$1.u[i$1])) {
      var end$1 = ((xbase + this.downScaleFactor$1) | 0);
      var isEmpty$4$1 = (xbase >= end$1);
      var numRangeElements$4$1 = (isEmpty$4$1 ? 0 : (new $c_sjsr_RuntimeLong().init___I(end$1).$$minus__sjsr_RuntimeLong__sjsr_RuntimeLong(new $c_sjsr_RuntimeLong().init___I(xbase)).$$greater__sjsr_RuntimeLong__Z(new $c_sjsr_RuntimeLong().init___I__I(2147483647, 0)) ? (-1) : ((end$1 - xbase) | 0)));
      var lastElement$4$1 = (isEmpty$4$1 ? (((-1) + xbase) | 0) : (((-1) + end$1) | 0));
      var terminalElement$4$1 = ((1 + lastElement$4$1) | 0);
      if ((numRangeElements$4$1 < 0)) {
        $m_sci_Range$().scala$collection$immutable$Range$$fail__I__I__I__Z__sr_Nothing$(xbase, end$1, 1, false)
      };
      var isCommonCase = ((xbase !== (-2147483648)) || (end$1 !== (-2147483648)));
      var i$2 = xbase;
      var count$1 = 0;
      while ((isCommonCase ? (i$2 !== terminalElement$4$1) : (count$1 < numRangeElements$4$1))) {
        var x = i$2;
        var end$2 = ((ybase + this.downScaleFactor$1) | 0);
        var isEmpty$4$2 = (ybase >= end$2);
        var numRangeElements$4$2 = (isEmpty$4$2 ? 0 : (new $c_sjsr_RuntimeLong().init___I(end$2).$$minus__sjsr_RuntimeLong__sjsr_RuntimeLong(new $c_sjsr_RuntimeLong().init___I(ybase)).$$greater__sjsr_RuntimeLong__Z(new $c_sjsr_RuntimeLong().init___I__I(2147483647, 0)) ? (-1) : ((end$2 - ybase) | 0)));
        var lastElement$4$2 = (isEmpty$4$2 ? (((-1) + ybase) | 0) : (((-1) + end$2) | 0));
        var terminalElement$4$2 = ((1 + lastElement$4$2) | 0);
        if ((numRangeElements$4$2 < 0)) {
          $m_sci_Range$().scala$collection$immutable$Range$$fail__I__I__I__Z__sr_Nothing$(ybase, end$2, 1, false)
        };
        var isCommonCase$1 = ((ybase !== (-2147483648)) || (end$2 !== (-2147483648)));
        var i$3 = ybase;
        var count$2 = 0;
        while ((isCommonCase$1 ? (i$3 !== terminalElement$4$2) : (count$2 < numRangeElements$4$2))) {
          var v1 = i$3;
          var pos = $imul(4, ((x + $imul(v1, $uI(this.arjs$GreenScreen$$canvas$f.width))) | 0));
          var mainColor = $uI(canvasData[((pos + ((colourBitIndex % 3) | 0)) | 0)]);
          var secondColor = $uI(canvasData[((pos + ((((1 + colourBitIndex) | 0) % 3) | 0)) | 0)]);
          var thirdColor = $uI(canvasData[((pos + ((((2 + colourBitIndex) | 0) % 3) | 0)) | 0)]);
          if ((((mainColor > threshold) && (secondColor < (0.7 * mainColor))) && (thirdColor < (0.7 * mainColor)))) {
            elem$1 = (elem$1 + x);
            elem$1$1 = (elem$1$1 + v1);
            elem$1$2 = ((1 + elem$1$2) | 0)
          };
          count$2 = ((1 + count$2) | 0);
          i$3 = ((1 + i$3) | 0)
        };
        count$1 = ((1 + count$1) | 0);
        i$2 = ((1 + i$2) | 0)
      }
    };
    count = ((1 + count) | 0);
    i = ((1 + i) | 0)
  };
  return ((elem$1$2 > 1) ? new $c_s_Tuple2$mcDD$sp().init___D__D((elem$1 / elem$1$2), (elem$1$1 / elem$1$2)) : new $c_s_Tuple2$mcDD$sp().init___D__D((-1000.0), (-1000.0)))
});
$c_Larjs_GreenScreen.prototype.createDownscaledCanvas__Lorg_scalajs_dom_raw_HTMLCanvasElement = (function() {
  var downscaledCanvas = $m_Lorg_scalajs_dom_package$().document__Lorg_scalajs_dom_raw_HTMLDocument().createElement("canvas");
  downscaledCanvas.width = (($uI(this.arjs$GreenScreen$$canvas$f.width) / this.downScaleFactor$1) | 0);
  downscaledCanvas.height = (($uI(this.arjs$GreenScreen$$canvas$f.height) / this.downScaleFactor$1) | 0);
  var qual$1 = $m_Larjs_package$().canvasToContext__Lorg_scalajs_dom_raw_HTMLCanvasElement__Lorg_scalajs_dom_raw_CanvasRenderingContext2D(downscaledCanvas);
  var x$5 = this.video$1;
  var x$8 = $uI(downscaledCanvas.width);
  var x$9 = $uI(downscaledCanvas.height);
  qual$1.drawImage(x$5, 0.0, 0.0, x$8, x$9);
  return downscaledCanvas
});
$c_Larjs_GreenScreen.prototype.computeInitialValues__V = (function() {
  var qual$2 = $m_Larjs_package$().canvasToContext__Lorg_scalajs_dom_raw_HTMLCanvasElement__Lorg_scalajs_dom_raw_CanvasRenderingContext2D(this.backCanvas$1);
  var x$14 = this.video$1;
  var x$17 = $uI(this.backCanvas$1.width);
  var x$18 = $uI(this.backCanvas$1.height);
  qual$2.drawImage(x$14, 0.0, 0.0, x$17, x$18);
  var backData = $m_Larjs_package$().canvasToContext__Lorg_scalajs_dom_raw_HTMLCanvasElement__Lorg_scalajs_dom_raw_CanvasRenderingContext2D(this.backCanvas$1).getImageData(0.0, 0.0, $uI(this.backCanvas$1.width), $uI(this.backCanvas$1.height)).data;
  var baseData = $m_Larjs_package$().canvasToContext__Lorg_scalajs_dom_raw_HTMLCanvasElement__Lorg_scalajs_dom_raw_CanvasRenderingContext2D(this.baseCanvas$1).getImageData(0.0, 0.0, $uI(this.baseCanvas$1.width), $uI(this.baseCanvas$1.height)).data;
  var end = $uI(baseData.length);
  var isEmpty$4 = (end <= 0);
  var numRangeElements$4 = (isEmpty$4 ? 0 : end);
  var lastElement$4 = (isEmpty$4 ? (-1) : (((-1) + end) | 0));
  var terminalElement$4 = ((1 + lastElement$4) | 0);
  var isEmpty$4$1 = (end <= 0);
  if (isEmpty$4$1) {
    var numRangeElements$4$1 = 0
  } else {
    var x = ((end / 4) | 0);
    var y = ((((end % 4) | 0) !== 0) ? 1 : 0);
    var numRangeElements$4$1 = ((((x > 0) && (y > 0)) && (((x + y) | 0) < 0)) ? (-1) : ((x + y) | 0))
  };
  if (isEmpty$4$1) {
    var lastElement$4$1 = (-4)
  } else {
    var remainder = ((end % 4) | 0);
    var lastElement$4$1 = ((remainder !== 0) ? ((end - remainder) | 0) : (((-4) + end) | 0))
  };
  var terminalElement$4$1 = ((4 + lastElement$4$1) | 0);
  if ((numRangeElements$4$1 < 0)) {
    $m_sci_Range$().scala$collection$immutable$Range$$fail__I__I__I__Z__sr_Nothing$(0, end, 4, false)
  };
  var i = 0;
  var count = 0;
  while ((i !== terminalElement$4$1)) {
    var i$1 = i;
    var _1 = $fround((255.0 + $fround($uI(backData[i$1]))));
    var _2 = $fround((255.0 + $fround($uI(backData[((1 + i$1) | 0)]))));
    var _3 = $fround((255.0 + $fround($uI(backData[((2 + i$1) | 0)]))));
    var _1$1 = $fround((255.0 + $fround($uI(baseData[i$1]))));
    var _2$1 = $fround((255.0 + $fround($uI(baseData[((1 + i$1) | 0)]))));
    var _3$1 = $fround((255.0 + $fround($uI(baseData[((2 + i$1) | 0)]))));
    var jsx$4 = this.greenScreen$1;
    if ((((($fround(($fround((_1 / _2)) / $fround((_1$1 / _2$1)))) > this.deltaValueMin$1) && ($fround(($fround((_1 / _2)) / $fround((_1$1 / _2$1)))) < this.deltaValueMax$1)) && ($fround(($fround((_2 / _3)) / $fround((_2$1 / _3$1)))) > this.deltaValueMin$1)) && ($fround(($fround((_2 / _3)) / $fround((_2$1 / _3$1)))) < this.deltaValueMax$1))) {
      var a = (($uI(backData[i$1]) - $uI(baseData[i$1])) | 0);
      var jsx$3 = (((a < 0) ? ((-a) | 0) : a) < this.deltaSingleColor$1)
    } else {
      var jsx$3 = false
    };
    if (jsx$3) {
      var a$1 = (($uI(backData[((1 + i$1) | 0)]) - $uI(baseData[((1 + i$1) | 0)])) | 0);
      var jsx$2 = (((a$1 < 0) ? ((-a$1) | 0) : a$1) < this.deltaSingleColor$1)
    } else {
      var jsx$2 = false
    };
    if (jsx$2) {
      var a$2 = (($uI(backData[((2 + i$1) | 0)]) - $uI(baseData[((2 + i$1) | 0)])) | 0);
      var jsx$1 = (((a$2 < 0) ? ((-a$2) | 0) : a$2) < this.deltaSingleColor$1)
    } else {
      var jsx$1 = false
    };
    jsx$4.u[((i$1 / 4) | 0)] = jsx$1;
    count = ((1 + count) | 0);
    i = ((4 + i) | 0)
  }
});
var $d_Larjs_GreenScreen = new $TypeData().initClass({
  Larjs_GreenScreen: 0
}, false, "arjs.GreenScreen", {
  Larjs_GreenScreen: 1,
  O: 1
});
$c_Larjs_GreenScreen.prototype.$classData = $d_Larjs_GreenScreen;
/** @constructor */
function $c_Larjs_package$() {
  $c_O.call(this)
}
$c_Larjs_package$.prototype = new $h_O();
$c_Larjs_package$.prototype.constructor = $c_Larjs_package$;
/** @constructor */
function $h_Larjs_package$() {
  /*<skip>*/
}
$h_Larjs_package$.prototype = $c_Larjs_package$.prototype;
$c_Larjs_package$.prototype.init___ = (function() {
  return this
});
$c_Larjs_package$.prototype.canvasToContext__Lorg_scalajs_dom_raw_HTMLCanvasElement__Lorg_scalajs_dom_raw_CanvasRenderingContext2D = (function(canvas) {
  return canvas.getContext("2d")
});
var $d_Larjs_package$ = new $TypeData().initClass({
  Larjs_package$: 0
}, false, "arjs.package$", {
  Larjs_package$: 1,
  O: 1
});
$c_Larjs_package$.prototype.$classData = $d_Larjs_package$;
var $n_Larjs_package$ = (void 0);
function $m_Larjs_package$() {
  if ((!$n_Larjs_package$)) {
    $n_Larjs_package$ = new $c_Larjs_package$().init___()
  };
  return $n_Larjs_package$
}
/** @constructor */
function $c_Lorg_scalajs_dom_package$() {
  $c_O.call(this);
  this.ApplicationCache$1 = null;
  this.Blob$1 = null;
  this.BlobPropertyBag$1 = null;
  this.ClipboardEventInit$1 = null;
  this.DOMException$1 = null;
  this.Event$1 = null;
  this.EventException$1 = null;
  this.EventSource$1 = null;
  this.FileReader$1 = null;
  this.FormData$1 = null;
  this.KeyboardEvent$1 = null;
  this.MediaError$1 = null;
  this.MutationEvent$1 = null;
  this.MutationObserverInit$1 = null;
  this.Node$1 = null;
  this.NodeFilter$1 = null;
  this.PerformanceNavigation$1 = null;
  this.PositionError$1 = null;
  this.Range$1 = null;
  this.TextEvent$1 = null;
  this.TextTrack$1 = null;
  this.VisibilityState$1 = null;
  this.WebSocket$1 = null;
  this.WheelEvent$1 = null;
  this.XMLHttpRequest$1 = null;
  this.XPathResult$1 = null;
  this.window$1 = null;
  this.document$1 = null;
  this.console$1 = null;
  this.bitmap$0$1 = 0
}
$c_Lorg_scalajs_dom_package$.prototype = new $h_O();
$c_Lorg_scalajs_dom_package$.prototype.constructor = $c_Lorg_scalajs_dom_package$;
/** @constructor */
function $h_Lorg_scalajs_dom_package$() {
  /*<skip>*/
}
$h_Lorg_scalajs_dom_package$.prototype = $c_Lorg_scalajs_dom_package$.prototype;
$c_Lorg_scalajs_dom_package$.prototype.init___ = (function() {
  return this
});
$c_Lorg_scalajs_dom_package$.prototype.document__Lorg_scalajs_dom_raw_HTMLDocument = (function() {
  return (((134217728 & this.bitmap$0$1) === 0) ? this.document$lzycompute__p1__Lorg_scalajs_dom_raw_HTMLDocument() : this.document$1)
});
$c_Lorg_scalajs_dom_package$.prototype.window__Lorg_scalajs_dom_raw_Window = (function() {
  return (((67108864 & this.bitmap$0$1) === 0) ? this.window$lzycompute__p1__Lorg_scalajs_dom_raw_Window() : this.window$1)
});
$c_Lorg_scalajs_dom_package$.prototype.window$lzycompute__p1__Lorg_scalajs_dom_raw_Window = (function() {
  if (((67108864 & this.bitmap$0$1) === 0)) {
    this.window$1 = $g;
    this.bitmap$0$1 = (67108864 | this.bitmap$0$1)
  };
  return this.window$1
});
$c_Lorg_scalajs_dom_package$.prototype.document$lzycompute__p1__Lorg_scalajs_dom_raw_HTMLDocument = (function() {
  if (((134217728 & this.bitmap$0$1) === 0)) {
    this.document$1 = this.window__Lorg_scalajs_dom_raw_Window().document;
    this.bitmap$0$1 = (134217728 | this.bitmap$0$1)
  };
  return this.document$1
});
var $d_Lorg_scalajs_dom_package$ = new $TypeData().initClass({
  Lorg_scalajs_dom_package$: 0
}, false, "org.scalajs.dom.package$", {
  Lorg_scalajs_dom_package$: 1,
  O: 1
});
$c_Lorg_scalajs_dom_package$.prototype.$classData = $d_Lorg_scalajs_dom_package$;
var $n_Lorg_scalajs_dom_package$ = (void 0);
function $m_Lorg_scalajs_dom_package$() {
  if ((!$n_Lorg_scalajs_dom_package$)) {
    $n_Lorg_scalajs_dom_package$ = new $c_Lorg_scalajs_dom_package$().init___()
  };
  return $n_Lorg_scalajs_dom_package$
}
/** @constructor */
function $c_jl_Class() {
  $c_O.call(this);
  this.data$1 = null
}
$c_jl_Class.prototype = new $h_O();
$c_jl_Class.prototype.constructor = $c_jl_Class;
/** @constructor */
function $h_jl_Class() {
  /*<skip>*/
}
$h_jl_Class.prototype = $c_jl_Class.prototype;
$c_jl_Class.prototype.getName__T = (function() {
  return $as_T(this.data$1.name)
});
$c_jl_Class.prototype.isPrimitive__Z = (function() {
  return $uZ(this.data$1.isPrimitive)
});
$c_jl_Class.prototype.toString__T = (function() {
  return ((this.isInterface__Z() ? "interface " : (this.isPrimitive__Z() ? "" : "class ")) + this.getName__T())
});
$c_jl_Class.prototype.init___jl_ScalaJSClassData = (function(data) {
  this.data$1 = data;
  return this
});
$c_jl_Class.prototype.isInterface__Z = (function() {
  return $uZ(this.data$1.isInterface)
});
var $d_jl_Class = new $TypeData().initClass({
  jl_Class: 0
}, false, "java.lang.Class", {
  jl_Class: 1,
  O: 1
});
$c_jl_Class.prototype.$classData = $d_jl_Class;
/** @constructor */
function $c_jl_Double$() {
  $c_O.call(this);
  this.TYPE$1 = null;
  this.POSITIVE$undINFINITY$1 = 0.0;
  this.NEGATIVE$undINFINITY$1 = 0.0;
  this.NaN$1 = 0.0;
  this.MAX$undVALUE$1 = 0.0;
  this.MIN$undVALUE$1 = 0.0;
  this.MAX$undEXPONENT$1 = 0;
  this.MIN$undEXPONENT$1 = 0;
  this.SIZE$1 = 0;
  this.doubleStrPat$1 = null;
  this.bitmap$0$1 = false
}
$c_jl_Double$.prototype = new $h_O();
$c_jl_Double$.prototype.constructor = $c_jl_Double$;
/** @constructor */
function $h_jl_Double$() {
  /*<skip>*/
}
$h_jl_Double$.prototype = $c_jl_Double$.prototype;
$c_jl_Double$.prototype.init___ = (function() {
  return this
});
$c_jl_Double$.prototype.compare__D__D__I = (function(a, b) {
  if ((a !== a)) {
    return ((b !== b) ? 0 : 1)
  } else if ((b !== b)) {
    return (-1)
  } else if ((a === b)) {
    if ((a === 0.0)) {
      var ainf = (1.0 / a);
      return ((ainf === (1.0 / b)) ? 0 : ((ainf < 0) ? (-1) : 1))
    } else {
      return 0
    }
  } else {
    return ((a < b) ? (-1) : 1)
  }
});
var $d_jl_Double$ = new $TypeData().initClass({
  jl_Double$: 0
}, false, "java.lang.Double$", {
  jl_Double$: 1,
  O: 1
});
$c_jl_Double$.prototype.$classData = $d_jl_Double$;
var $n_jl_Double$ = (void 0);
function $m_jl_Double$() {
  if ((!$n_jl_Double$)) {
    $n_jl_Double$ = new $c_jl_Double$().init___()
  };
  return $n_jl_Double$
}
/** @constructor */
function $c_jl_Number() {
  $c_O.call(this)
}
$c_jl_Number.prototype = new $h_O();
$c_jl_Number.prototype.constructor = $c_jl_Number;
/** @constructor */
function $h_jl_Number() {
  /*<skip>*/
}
$h_jl_Number.prototype = $c_jl_Number.prototype;
function $is_jl_Number(obj) {
  return (!(!(((obj && obj.$classData) && obj.$classData.ancestors.jl_Number) || ((typeof obj) === "number"))))
}
function $as_jl_Number(obj) {
  return (($is_jl_Number(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "java.lang.Number"))
}
function $isArrayOf_jl_Number(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_Number)))
}
function $asArrayOf_jl_Number(obj, depth) {
  return (($isArrayOf_jl_Number(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.Number;", depth))
}
function $s_s_Product2$class__productElement__s_Product2__I__O($$this, n) {
  switch (n) {
    case 0: {
      return $$this.$$und1__O();
      break
    }
    case 1: {
      return $$this.$$und2__O();
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + n))
    }
  }
}
/** @constructor */
function $c_s_util_hashing_MurmurHash3() {
  $c_O.call(this)
}
$c_s_util_hashing_MurmurHash3.prototype = new $h_O();
$c_s_util_hashing_MurmurHash3.prototype.constructor = $c_s_util_hashing_MurmurHash3;
/** @constructor */
function $h_s_util_hashing_MurmurHash3() {
  /*<skip>*/
}
$h_s_util_hashing_MurmurHash3.prototype = $c_s_util_hashing_MurmurHash3.prototype;
$c_s_util_hashing_MurmurHash3.prototype.mixLast__I__I__I = (function(hash, data) {
  var k = data;
  k = $imul((-862048943), k);
  var i = k;
  k = ((i << 15) | ((i >>> (-15)) | 0));
  k = $imul(461845907, k);
  return (hash ^ k)
});
$c_s_util_hashing_MurmurHash3.prototype.mix__I__I__I = (function(hash, data) {
  var h = this.mixLast__I__I__I(hash, data);
  var i = h;
  h = ((i << 13) | ((i >>> (-13)) | 0));
  return (((-430675100) + $imul(5, h)) | 0)
});
$c_s_util_hashing_MurmurHash3.prototype.avalanche__p1__I__I = (function(hash) {
  var h = hash;
  h = (h ^ ((h >>> 16) | 0));
  h = $imul((-2048144789), h);
  h = (h ^ ((h >>> 13) | 0));
  h = $imul((-1028477387), h);
  h = (h ^ ((h >>> 16) | 0));
  return h
});
$c_s_util_hashing_MurmurHash3.prototype.productHash__s_Product__I__I = (function(x, seed) {
  var arr = x.productArity__I();
  if ((arr === 0)) {
    var this$1 = x.productPrefix__T();
    return $m_sjsr_RuntimeString$().hashCode__T__I(this$1)
  } else {
    var h = seed;
    var i = 0;
    while ((i < arr)) {
      h = this.mix__I__I__I(h, $m_sr_ScalaRunTime$().hash__O__I(x.productElement__I__O(i)));
      i = ((1 + i) | 0)
    };
    return this.finalizeHash__I__I__I(h, arr)
  }
});
$c_s_util_hashing_MurmurHash3.prototype.finalizeHash__I__I__I = (function(hash, length) {
  return this.avalanche__p1__I__I((hash ^ length))
});
/** @constructor */
function $c_sjsr_Bits$() {
  $c_O.call(this);
  this.scala$scalajs$runtime$Bits$$$undareTypedArraysSupported$f = false;
  this.arrayBuffer$1 = null;
  this.int32Array$1 = null;
  this.float32Array$1 = null;
  this.float64Array$1 = null;
  this.areTypedArraysBigEndian$1 = false;
  this.highOffset$1 = 0;
  this.lowOffset$1 = 0
}
$c_sjsr_Bits$.prototype = new $h_O();
$c_sjsr_Bits$.prototype.constructor = $c_sjsr_Bits$;
/** @constructor */
function $h_sjsr_Bits$() {
  /*<skip>*/
}
$h_sjsr_Bits$.prototype = $c_sjsr_Bits$.prototype;
$c_sjsr_Bits$.prototype.init___ = (function() {
  $n_sjsr_Bits$ = this;
  var x = ((($g.ArrayBuffer && $g.Int32Array) && $g.Float32Array) && $g.Float64Array);
  this.scala$scalajs$runtime$Bits$$$undareTypedArraysSupported$f = $uZ((!(!x)));
  this.arrayBuffer$1 = (this.scala$scalajs$runtime$Bits$$$undareTypedArraysSupported$f ? new $g.ArrayBuffer(8) : null);
  this.int32Array$1 = (this.scala$scalajs$runtime$Bits$$$undareTypedArraysSupported$f ? new $g.Int32Array(this.arrayBuffer$1, 0, 2) : null);
  this.float32Array$1 = (this.scala$scalajs$runtime$Bits$$$undareTypedArraysSupported$f ? new $g.Float32Array(this.arrayBuffer$1, 0, 2) : null);
  this.float64Array$1 = (this.scala$scalajs$runtime$Bits$$$undareTypedArraysSupported$f ? new $g.Float64Array(this.arrayBuffer$1, 0, 1) : null);
  if ((!this.scala$scalajs$runtime$Bits$$$undareTypedArraysSupported$f)) {
    var jsx$1 = true
  } else {
    this.int32Array$1[0] = 16909060;
    var jsx$1 = ($uB(new $g.Int8Array(this.arrayBuffer$1, 0, 8)[0]) === 1)
  };
  this.areTypedArraysBigEndian$1 = jsx$1;
  this.highOffset$1 = (this.areTypedArraysBigEndian$1 ? 0 : 1);
  this.lowOffset$1 = (this.areTypedArraysBigEndian$1 ? 1 : 0);
  return this
});
$c_sjsr_Bits$.prototype.numberHashCode__D__I = (function(value) {
  var iv = $uI((value | 0));
  if (((iv === value) && ((1.0 / value) !== (-Infinity)))) {
    return iv
  } else {
    var this$1 = this.doubleToLongBits__D__J(value);
    return (this$1.lo$2 ^ this$1.hi$2)
  }
});
$c_sjsr_Bits$.prototype.doubleToLongBitsPolyfill__p1__D__J = (function(value) {
  if ((value !== value)) {
    var _3 = $uD($g.Math.pow(2.0, 51));
    var x1_$_$$und1$1 = false;
    var x1_$_$$und2$1 = 2047;
    var x1_$_$$und3$1 = _3
  } else if (((value === Infinity) || (value === (-Infinity)))) {
    var _1 = (value < 0);
    var x1_$_$$und1$1 = _1;
    var x1_$_$$und2$1 = 2047;
    var x1_$_$$und3$1 = 0.0
  } else if ((value === 0.0)) {
    var _1$1 = ((1 / value) === (-Infinity));
    var x1_$_$$und1$1 = _1$1;
    var x1_$_$$und2$1 = 0;
    var x1_$_$$und3$1 = 0.0
  } else {
    var s = (value < 0);
    var av = (s ? (-value) : value);
    if ((av >= $uD($g.Math.pow(2.0, (-1022))))) {
      var twoPowFbits = $uD($g.Math.pow(2.0, 52));
      var a = ($uD($g.Math.log(av)) / 0.6931471805599453);
      var x = $uD($g.Math.floor(a));
      var a$1 = $uI((x | 0));
      var e = ((a$1 < 1023) ? a$1 : 1023);
      var b = e;
      var n = ((av / $uD($g.Math.pow(2.0, b))) * twoPowFbits);
      var w = $uD($g.Math.floor(n));
      var f = (n - w);
      var f$1 = ((f < 0.5) ? w : ((f > 0.5) ? (1 + w) : (((w % 2) !== 0) ? (1 + w) : w)));
      if (((f$1 / twoPowFbits) >= 2)) {
        e = ((1 + e) | 0);
        f$1 = 1.0
      };
      if ((e > 1023)) {
        e = 2047;
        f$1 = 0.0
      } else {
        e = ((1023 + e) | 0);
        f$1 = (f$1 - twoPowFbits)
      };
      var _2 = e;
      var _3$1 = f$1;
      var x1_$_$$und1$1 = s;
      var x1_$_$$und2$1 = _2;
      var x1_$_$$und3$1 = _3$1
    } else {
      var n$1 = (av / $uD($g.Math.pow(2.0, (-1074))));
      var w$1 = $uD($g.Math.floor(n$1));
      var f$2 = (n$1 - w$1);
      var _3$2 = ((f$2 < 0.5) ? w$1 : ((f$2 > 0.5) ? (1 + w$1) : (((w$1 % 2) !== 0) ? (1 + w$1) : w$1)));
      var x1_$_$$und1$1 = s;
      var x1_$_$$und2$1 = 0;
      var x1_$_$$und3$1 = _3$2
    }
  };
  var s$1 = $uZ(x1_$_$$und1$1);
  var e$1 = $uI(x1_$_$$und2$1);
  var f$3 = $uD(x1_$_$$und3$1);
  var x$1 = (f$3 / 4.294967296E9);
  var hif = $uI((x$1 | 0));
  var hi = (((s$1 ? (-2147483648) : 0) | (e$1 << 20)) | hif);
  var lo = $uI((f$3 | 0));
  return new $c_sjsr_RuntimeLong().init___I(hi).$$less$less__I__sjsr_RuntimeLong(32).$$bar__sjsr_RuntimeLong__sjsr_RuntimeLong(new $c_sjsr_RuntimeLong().init___I__I((-1), 0).$$amp__sjsr_RuntimeLong__sjsr_RuntimeLong(new $c_sjsr_RuntimeLong().init___I(lo)))
});
$c_sjsr_Bits$.prototype.doubleToLongBits__D__J = (function(value) {
  if (this.scala$scalajs$runtime$Bits$$$undareTypedArraysSupported$f) {
    this.float64Array$1[0] = value;
    return new $c_sjsr_RuntimeLong().init___I($uI(this.int32Array$1[this.highOffset$1])).$$less$less__I__sjsr_RuntimeLong(32).$$bar__sjsr_RuntimeLong__sjsr_RuntimeLong(new $c_sjsr_RuntimeLong().init___I__I((-1), 0).$$amp__sjsr_RuntimeLong__sjsr_RuntimeLong(new $c_sjsr_RuntimeLong().init___I($uI(this.int32Array$1[this.lowOffset$1]))))
  } else {
    return this.doubleToLongBitsPolyfill__p1__D__J(value)
  }
});
var $d_sjsr_Bits$ = new $TypeData().initClass({
  sjsr_Bits$: 0
}, false, "scala.scalajs.runtime.Bits$", {
  sjsr_Bits$: 1,
  O: 1
});
$c_sjsr_Bits$.prototype.$classData = $d_sjsr_Bits$;
var $n_sjsr_Bits$ = (void 0);
function $m_sjsr_Bits$() {
  if ((!$n_sjsr_Bits$)) {
    $n_sjsr_Bits$ = new $c_sjsr_Bits$().init___()
  };
  return $n_sjsr_Bits$
}
/** @constructor */
function $c_sjsr_RuntimeString$() {
  $c_O.call(this);
  this.CASE$undINSENSITIVE$undORDER$1 = null;
  this.bitmap$0$1 = false
}
$c_sjsr_RuntimeString$.prototype = new $h_O();
$c_sjsr_RuntimeString$.prototype.constructor = $c_sjsr_RuntimeString$;
/** @constructor */
function $h_sjsr_RuntimeString$() {
  /*<skip>*/
}
$h_sjsr_RuntimeString$.prototype = $c_sjsr_RuntimeString$.prototype;
$c_sjsr_RuntimeString$.prototype.init___ = (function() {
  return this
});
$c_sjsr_RuntimeString$.prototype.hashCode__T__I = (function(thiz) {
  var res = 0;
  var mul = 1;
  var i = (((-1) + $uI(thiz.length)) | 0);
  while ((i >= 0)) {
    var jsx$1 = res;
    var index = i;
    res = ((jsx$1 + $imul((65535 & $uI(thiz.charCodeAt(index))), mul)) | 0);
    mul = $imul(31, mul);
    i = (((-1) + i) | 0)
  };
  return res
});
var $d_sjsr_RuntimeString$ = new $TypeData().initClass({
  sjsr_RuntimeString$: 0
}, false, "scala.scalajs.runtime.RuntimeString$", {
  sjsr_RuntimeString$: 1,
  O: 1
});
$c_sjsr_RuntimeString$.prototype.$classData = $d_sjsr_RuntimeString$;
var $n_sjsr_RuntimeString$ = (void 0);
function $m_sjsr_RuntimeString$() {
  if ((!$n_sjsr_RuntimeString$)) {
    $n_sjsr_RuntimeString$ = new $c_sjsr_RuntimeString$().init___()
  };
  return $n_sjsr_RuntimeString$
}
/** @constructor */
function $c_sjsr_package$() {
  $c_O.call(this)
}
$c_sjsr_package$.prototype = new $h_O();
$c_sjsr_package$.prototype.constructor = $c_sjsr_package$;
/** @constructor */
function $h_sjsr_package$() {
  /*<skip>*/
}
$h_sjsr_package$.prototype = $c_sjsr_package$.prototype;
$c_sjsr_package$.prototype.init___ = (function() {
  return this
});
$c_sjsr_package$.prototype.unwrapJavaScriptException__jl_Throwable__O = (function(th) {
  if ($is_sjs_js_JavaScriptException(th)) {
    var x2 = $as_sjs_js_JavaScriptException(th);
    var e = x2.exception$4;
    return e
  } else {
    return th
  }
});
$c_sjsr_package$.prototype.wrapJavaScriptException__O__jl_Throwable = (function(e) {
  if ($is_jl_Throwable(e)) {
    var x2 = $as_jl_Throwable(e);
    return x2
  } else {
    return new $c_sjs_js_JavaScriptException().init___O(e)
  }
});
var $d_sjsr_package$ = new $TypeData().initClass({
  sjsr_package$: 0
}, false, "scala.scalajs.runtime.package$", {
  sjsr_package$: 1,
  O: 1
});
$c_sjsr_package$.prototype.$classData = $d_sjsr_package$;
var $n_sjsr_package$ = (void 0);
function $m_sjsr_package$() {
  if ((!$n_sjsr_package$)) {
    $n_sjsr_package$ = new $c_sjsr_package$().init___()
  };
  return $n_sjsr_package$
}
var $d_sr_BoxedUnit = new $TypeData().initClass({
  sr_BoxedUnit: 0
}, false, "scala.runtime.BoxedUnit", {
  sr_BoxedUnit: 1,
  O: 1
}, (void 0), (void 0), (function(x) {
  return (x === (void 0))
}));
/** @constructor */
function $c_sr_BoxesRunTime$() {
  $c_O.call(this)
}
$c_sr_BoxesRunTime$.prototype = new $h_O();
$c_sr_BoxesRunTime$.prototype.constructor = $c_sr_BoxesRunTime$;
/** @constructor */
function $h_sr_BoxesRunTime$() {
  /*<skip>*/
}
$h_sr_BoxesRunTime$.prototype = $c_sr_BoxesRunTime$.prototype;
$c_sr_BoxesRunTime$.prototype.init___ = (function() {
  return this
});
$c_sr_BoxesRunTime$.prototype.hashFromLong__jl_Long__I = (function(n) {
  var iv = $uJ(n).lo$2;
  if (new $c_sjsr_RuntimeLong().init___I(iv).equals__sjsr_RuntimeLong__Z($uJ(n))) {
    return iv
  } else {
    var value = $uJ(n);
    return (value.lo$2 ^ value.hi$2)
  }
});
$c_sr_BoxesRunTime$.prototype.hashFromNumber__jl_Number__I = (function(n) {
  if ($isInt(n)) {
    var x2 = $uI(n);
    return x2
  } else if ($is_sjsr_RuntimeLong(n)) {
    var x3 = $as_sjsr_RuntimeLong(n);
    return this.hashFromLong__jl_Long__I(x3)
  } else if (((typeof n) === "number")) {
    var x4 = $asDouble(n);
    return this.hashFromDouble__jl_Double__I(x4)
  } else {
    return $objectHashCode(n)
  }
});
$c_sr_BoxesRunTime$.prototype.hashFromDouble__jl_Double__I = (function(n) {
  var iv = $doubleToInt($uD(n));
  var dv = $uD(n);
  if ((iv === dv)) {
    return iv
  } else {
    var lv = $m_sjsr_RuntimeLong$().fromDouble__D__sjsr_RuntimeLong($uD(n));
    return ((lv.toDouble__D() === dv) ? (lv.lo$2 ^ lv.hi$2) : $m_sjsr_Bits$().numberHashCode__D__I($uD(n)))
  }
});
var $d_sr_BoxesRunTime$ = new $TypeData().initClass({
  sr_BoxesRunTime$: 0
}, false, "scala.runtime.BoxesRunTime$", {
  sr_BoxesRunTime$: 1,
  O: 1
});
$c_sr_BoxesRunTime$.prototype.$classData = $d_sr_BoxesRunTime$;
var $n_sr_BoxesRunTime$ = (void 0);
function $m_sr_BoxesRunTime$() {
  if ((!$n_sr_BoxesRunTime$)) {
    $n_sr_BoxesRunTime$ = new $c_sr_BoxesRunTime$().init___()
  };
  return $n_sr_BoxesRunTime$
}
/** @constructor */
function $c_sr_ScalaRunTime$() {
  $c_O.call(this)
}
$c_sr_ScalaRunTime$.prototype = new $h_O();
$c_sr_ScalaRunTime$.prototype.constructor = $c_sr_ScalaRunTime$;
/** @constructor */
function $h_sr_ScalaRunTime$() {
  /*<skip>*/
}
$h_sr_ScalaRunTime$.prototype = $c_sr_ScalaRunTime$.prototype;
$c_sr_ScalaRunTime$.prototype.init___ = (function() {
  return this
});
$c_sr_ScalaRunTime$.prototype.hash__O__I = (function(x) {
  return ((x === null) ? 0 : ($is_jl_Number(x) ? $m_sr_BoxesRunTime$().hashFromNumber__jl_Number__I($as_jl_Number(x)) : $objectHashCode(x)))
});
var $d_sr_ScalaRunTime$ = new $TypeData().initClass({
  sr_ScalaRunTime$: 0
}, false, "scala.runtime.ScalaRunTime$", {
  sr_ScalaRunTime$: 1,
  O: 1
});
$c_sr_ScalaRunTime$.prototype.$classData = $d_sr_ScalaRunTime$;
var $n_sr_ScalaRunTime$ = (void 0);
function $m_sr_ScalaRunTime$() {
  if ((!$n_sr_ScalaRunTime$)) {
    $n_sr_ScalaRunTime$ = new $c_sr_ScalaRunTime$().init___()
  };
  return $n_sr_ScalaRunTime$
}
var $d_jl_Boolean = new $TypeData().initClass({
  jl_Boolean: 0
}, false, "java.lang.Boolean", {
  jl_Boolean: 1,
  O: 1,
  jl_Comparable: 1
}, (void 0), (void 0), (function(x) {
  return ((typeof x) === "boolean")
}));
/** @constructor */
function $c_jl_Throwable() {
  $c_O.call(this);
  this.s$1 = null;
  this.e$1 = null;
  this.stackTrace$1 = null
}
$c_jl_Throwable.prototype = new $h_O();
$c_jl_Throwable.prototype.constructor = $c_jl_Throwable;
/** @constructor */
function $h_jl_Throwable() {
  /*<skip>*/
}
$h_jl_Throwable.prototype = $c_jl_Throwable.prototype;
$c_jl_Throwable.prototype.fillInStackTrace__jl_Throwable = (function() {
  var v = $g.Error.captureStackTrace;
  if ((v === (void 0))) {
    try {
      var e$1 = {}.undef()
    } catch (e) {
      var e$2 = $m_sjsr_package$().wrapJavaScriptException__O__jl_Throwable(e);
      if ((e$2 !== null)) {
        if ($is_sjs_js_JavaScriptException(e$2)) {
          var x5 = $as_sjs_js_JavaScriptException(e$2);
          var e$3 = x5.exception$4;
          var e$1 = e$3
        } else {
          var e$1;
          throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(e$2)
        }
      } else {
        var e$1;
        throw e
      }
    };
    this.stackdata = e$1
  } else {
    $g.Error.captureStackTrace(this);
    this.stackdata = this
  };
  return this
});
$c_jl_Throwable.prototype.getMessage__T = (function() {
  return this.s$1
});
$c_jl_Throwable.prototype.toString__T = (function() {
  var className = $objectGetClass(this).getName__T();
  var message = this.getMessage__T();
  return ((message === null) ? className : ((className + ": ") + message))
});
$c_jl_Throwable.prototype.init___T__jl_Throwable = (function(s, e) {
  this.s$1 = s;
  this.e$1 = e;
  this.fillInStackTrace__jl_Throwable();
  return this
});
function $is_jl_Throwable(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.jl_Throwable)))
}
function $as_jl_Throwable(obj) {
  return (($is_jl_Throwable(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "java.lang.Throwable"))
}
function $isArrayOf_jl_Throwable(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_Throwable)))
}
function $asArrayOf_jl_Throwable(obj, depth) {
  return (($isArrayOf_jl_Throwable(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.Throwable;", depth))
}
/** @constructor */
function $c_s_util_hashing_MurmurHash3$() {
  $c_s_util_hashing_MurmurHash3.call(this);
  this.arraySeed$2 = 0;
  this.stringSeed$2 = 0;
  this.productSeed$2 = 0;
  this.symmetricSeed$2 = 0;
  this.traversableSeed$2 = 0;
  this.seqSeed$2 = 0;
  this.mapSeed$2 = 0;
  this.setSeed$2 = 0
}
$c_s_util_hashing_MurmurHash3$.prototype = new $h_s_util_hashing_MurmurHash3();
$c_s_util_hashing_MurmurHash3$.prototype.constructor = $c_s_util_hashing_MurmurHash3$;
/** @constructor */
function $h_s_util_hashing_MurmurHash3$() {
  /*<skip>*/
}
$h_s_util_hashing_MurmurHash3$.prototype = $c_s_util_hashing_MurmurHash3$.prototype;
$c_s_util_hashing_MurmurHash3$.prototype.init___ = (function() {
  $n_s_util_hashing_MurmurHash3$ = this;
  this.seqSeed$2 = $m_sjsr_RuntimeString$().hashCode__T__I("Seq");
  this.mapSeed$2 = $m_sjsr_RuntimeString$().hashCode__T__I("Map");
  this.setSeed$2 = $m_sjsr_RuntimeString$().hashCode__T__I("Set");
  return this
});
var $d_s_util_hashing_MurmurHash3$ = new $TypeData().initClass({
  s_util_hashing_MurmurHash3$: 0
}, false, "scala.util.hashing.MurmurHash3$", {
  s_util_hashing_MurmurHash3$: 1,
  s_util_hashing_MurmurHash3: 1,
  O: 1
});
$c_s_util_hashing_MurmurHash3$.prototype.$classData = $d_s_util_hashing_MurmurHash3$;
var $n_s_util_hashing_MurmurHash3$ = (void 0);
function $m_s_util_hashing_MurmurHash3$() {
  if ((!$n_s_util_hashing_MurmurHash3$)) {
    $n_s_util_hashing_MurmurHash3$ = new $c_s_util_hashing_MurmurHash3$().init___()
  };
  return $n_s_util_hashing_MurmurHash3$
}
var $d_jl_Byte = new $TypeData().initClass({
  jl_Byte: 0
}, false, "java.lang.Byte", {
  jl_Byte: 1,
  jl_Number: 1,
  O: 1,
  jl_Comparable: 1
}, (void 0), (void 0), (function(x) {
  return $isByte(x)
}));
function $isArrayOf_jl_Double(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_Double)))
}
function $asArrayOf_jl_Double(obj, depth) {
  return (($isArrayOf_jl_Double(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.Double;", depth))
}
var $d_jl_Double = new $TypeData().initClass({
  jl_Double: 0
}, false, "java.lang.Double", {
  jl_Double: 1,
  jl_Number: 1,
  O: 1,
  jl_Comparable: 1
}, (void 0), (void 0), (function(x) {
  return ((typeof x) === "number")
}));
/** @constructor */
function $c_jl_Error() {
  $c_jl_Throwable.call(this)
}
$c_jl_Error.prototype = new $h_jl_Throwable();
$c_jl_Error.prototype.constructor = $c_jl_Error;
/** @constructor */
function $h_jl_Error() {
  /*<skip>*/
}
$h_jl_Error.prototype = $c_jl_Error.prototype;
/** @constructor */
function $c_jl_Exception() {
  $c_jl_Throwable.call(this)
}
$c_jl_Exception.prototype = new $h_jl_Throwable();
$c_jl_Exception.prototype.constructor = $c_jl_Exception;
/** @constructor */
function $h_jl_Exception() {
  /*<skip>*/
}
$h_jl_Exception.prototype = $c_jl_Exception.prototype;
var $d_jl_Float = new $TypeData().initClass({
  jl_Float: 0
}, false, "java.lang.Float", {
  jl_Float: 1,
  jl_Number: 1,
  O: 1,
  jl_Comparable: 1
}, (void 0), (void 0), (function(x) {
  return $isFloat(x)
}));
function $isArrayOf_jl_Integer(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_Integer)))
}
function $asArrayOf_jl_Integer(obj, depth) {
  return (($isArrayOf_jl_Integer(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.Integer;", depth))
}
var $d_jl_Integer = new $TypeData().initClass({
  jl_Integer: 0
}, false, "java.lang.Integer", {
  jl_Integer: 1,
  jl_Number: 1,
  O: 1,
  jl_Comparable: 1
}, (void 0), (void 0), (function(x) {
  return $isInt(x)
}));
function $isArrayOf_jl_Long(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_Long)))
}
function $asArrayOf_jl_Long(obj, depth) {
  return (($isArrayOf_jl_Long(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.Long;", depth))
}
var $d_jl_Long = new $TypeData().initClass({
  jl_Long: 0
}, false, "java.lang.Long", {
  jl_Long: 1,
  jl_Number: 1,
  O: 1,
  jl_Comparable: 1
}, (void 0), (void 0), (function(x) {
  return $is_sjsr_RuntimeLong(x)
}));
var $d_jl_Short = new $TypeData().initClass({
  jl_Short: 0
}, false, "java.lang.Short", {
  jl_Short: 1,
  jl_Number: 1,
  O: 1,
  jl_Comparable: 1
}, (void 0), (void 0), (function(x) {
  return $isShort(x)
}));
/** @constructor */
function $c_sci_Range$() {
  $c_O.call(this);
  this.MAX$undPRINT$1 = 0
}
$c_sci_Range$.prototype = new $h_O();
$c_sci_Range$.prototype.constructor = $c_sci_Range$;
/** @constructor */
function $h_sci_Range$() {
  /*<skip>*/
}
$h_sci_Range$.prototype = $c_sci_Range$.prototype;
$c_sci_Range$.prototype.init___ = (function() {
  this.MAX$undPRINT$1 = 512;
  return this
});
$c_sci_Range$.prototype.description__p1__I__I__I__Z__T = (function(start, end, step, isInclusive) {
  return ((((start + (isInclusive ? " to " : " until ")) + end) + " by ") + step)
});
$c_sci_Range$.prototype.scala$collection$immutable$Range$$fail__I__I__I__Z__sr_Nothing$ = (function(start, end, step, isInclusive) {
  throw new $c_jl_IllegalArgumentException().init___T((this.description__p1__I__I__I__Z__T(start, end, step, isInclusive) + ": seqs cannot contain more than Int.MaxValue elements."))
});
var $d_sci_Range$ = new $TypeData().initClass({
  sci_Range$: 0
}, false, "scala.collection.immutable.Range$", {
  sci_Range$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Range$.prototype.$classData = $d_sci_Range$;
var $n_sci_Range$ = (void 0);
function $m_sci_Range$() {
  if ((!$n_sci_Range$)) {
    $n_sci_Range$ = new $c_sci_Range$().init___()
  };
  return $n_sci_Range$
}
/** @constructor */
function $c_sjsr_RuntimeLong$() {
  $c_O.call(this);
  this.TwoPow32$1 = 0.0;
  this.TwoPow53$1 = 0.0;
  this.UnsignedSafeDoubleHiMask$1 = 0;
  this.AskQuotient$1 = 0;
  this.AskRemainder$1 = 0;
  this.AskBoth$1 = 0;
  this.Zero$1 = null;
  this.One$1 = null;
  this.MinusOne$1 = null;
  this.MinValue$1 = null;
  this.MaxValue$1 = null
}
$c_sjsr_RuntimeLong$.prototype = new $h_O();
$c_sjsr_RuntimeLong$.prototype.constructor = $c_sjsr_RuntimeLong$;
/** @constructor */
function $h_sjsr_RuntimeLong$() {
  /*<skip>*/
}
$h_sjsr_RuntimeLong$.prototype = $c_sjsr_RuntimeLong$.prototype;
$c_sjsr_RuntimeLong$.prototype.init___ = (function() {
  $n_sjsr_RuntimeLong$ = this;
  this.Zero$1 = new $c_sjsr_RuntimeLong().init___I__I(0, 0);
  this.One$1 = new $c_sjsr_RuntimeLong().init___I__I(1, 0);
  this.MinusOne$1 = new $c_sjsr_RuntimeLong().init___I__I((-1), (-1));
  this.MinValue$1 = new $c_sjsr_RuntimeLong().init___I__I(0, (-2147483648));
  this.MaxValue$1 = new $c_sjsr_RuntimeLong().init___I__I((-1), 2147483647);
  return this
});
$c_sjsr_RuntimeLong$.prototype.Zero__sjsr_RuntimeLong = (function() {
  return this.Zero$1
});
$c_sjsr_RuntimeLong$.prototype.fromDouble__D__sjsr_RuntimeLong = (function(value) {
  if ((value !== value)) {
    return this.Zero$1
  } else if ((value < (-9.223372036854776E18))) {
    return this.MinValue$1
  } else if ((value >= 9.223372036854776E18)) {
    return this.MaxValue$1
  } else {
    var neg = (value < 0);
    var absValue = (neg ? (-value) : value);
    var lo = $uI((absValue | 0));
    var x = (absValue / 4.294967296E9);
    var hi = $uI((x | 0));
    return (neg ? new $c_sjsr_RuntimeLong().init___I__I(((-lo) | 0), ((lo !== 0) ? (~hi) : ((-hi) | 0))) : new $c_sjsr_RuntimeLong().init___I__I(lo, hi))
  }
});
var $d_sjsr_RuntimeLong$ = new $TypeData().initClass({
  sjsr_RuntimeLong$: 0
}, false, "scala.scalajs.runtime.RuntimeLong$", {
  sjsr_RuntimeLong$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sjsr_RuntimeLong$.prototype.$classData = $d_sjsr_RuntimeLong$;
var $n_sjsr_RuntimeLong$ = (void 0);
function $m_sjsr_RuntimeLong$() {
  if ((!$n_sjsr_RuntimeLong$)) {
    $n_sjsr_RuntimeLong$ = new $c_sjsr_RuntimeLong$().init___()
  };
  return $n_sjsr_RuntimeLong$
}
function $is_T(obj) {
  return ((typeof obj) === "string")
}
function $as_T(obj) {
  return (($is_T(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "java.lang.String"))
}
function $isArrayOf_T(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.T)))
}
function $asArrayOf_T(obj, depth) {
  return (($isArrayOf_T(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.String;", depth))
}
var $d_T = new $TypeData().initClass({
  T: 0
}, false, "java.lang.String", {
  T: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  jl_CharSequence: 1,
  jl_Comparable: 1
}, (void 0), (void 0), $is_T);
/** @constructor */
function $c_jl_CloneNotSupportedException() {
  $c_jl_Exception.call(this)
}
$c_jl_CloneNotSupportedException.prototype = new $h_jl_Exception();
$c_jl_CloneNotSupportedException.prototype.constructor = $c_jl_CloneNotSupportedException;
/** @constructor */
function $h_jl_CloneNotSupportedException() {
  /*<skip>*/
}
$h_jl_CloneNotSupportedException.prototype = $c_jl_CloneNotSupportedException.prototype;
$c_jl_CloneNotSupportedException.prototype.init___ = (function() {
  $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, null, null);
  return this
});
var $d_jl_CloneNotSupportedException = new $TypeData().initClass({
  jl_CloneNotSupportedException: 0
}, false, "java.lang.CloneNotSupportedException", {
  jl_CloneNotSupportedException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_CloneNotSupportedException.prototype.$classData = $d_jl_CloneNotSupportedException;
/** @constructor */
function $c_jl_RuntimeException() {
  $c_jl_Exception.call(this)
}
$c_jl_RuntimeException.prototype = new $h_jl_Exception();
$c_jl_RuntimeException.prototype.constructor = $c_jl_RuntimeException;
/** @constructor */
function $h_jl_RuntimeException() {
  /*<skip>*/
}
$h_jl_RuntimeException.prototype = $c_jl_RuntimeException.prototype;
/** @constructor */
function $c_sjsr_RuntimeLong() {
  $c_jl_Number.call(this);
  this.lo$2 = 0;
  this.hi$2 = 0
}
$c_sjsr_RuntimeLong.prototype = new $h_jl_Number();
$c_sjsr_RuntimeLong.prototype.constructor = $c_sjsr_RuntimeLong;
/** @constructor */
function $h_sjsr_RuntimeLong() {
  /*<skip>*/
}
$h_sjsr_RuntimeLong.prototype = $c_sjsr_RuntimeLong.prototype;
$c_sjsr_RuntimeLong.prototype.longValue__J = (function() {
  return $uJ(this)
});
$c_sjsr_RuntimeLong.prototype.$$bar__sjsr_RuntimeLong__sjsr_RuntimeLong = (function(b) {
  return new $c_sjsr_RuntimeLong().init___I__I((this.lo$2 | b.lo$2), (this.hi$2 | b.hi$2))
});
$c_sjsr_RuntimeLong.prototype.$$greater$eq__sjsr_RuntimeLong__Z = (function(b) {
  var ahi = this.hi$2;
  var bhi = b.hi$2;
  if ((ahi === bhi)) {
    var a = this.lo$2;
    var b$1 = b.lo$2;
    return (((-2147483648) ^ a) >= ((-2147483648) ^ b$1))
  } else {
    return (bhi < ahi)
  }
});
$c_sjsr_RuntimeLong.prototype.unsigned$und$percent__p2__I__I__I__I__sjsr_RuntimeLong = (function(alo, ahi, blo, bhi) {
  if ((((-2097152) & ahi) === 0)) {
    if ((((-2097152) & bhi) === 0)) {
      var aDouble = ((4.294967296E9 * ahi) + $uD((alo >>> 0)));
      var bDouble = ((4.294967296E9 * bhi) + $uD((blo >>> 0)));
      var rDouble = (aDouble % bDouble);
      var jsx$1 = $uI((rDouble | 0));
      var x = (rDouble / 4.294967296E9);
      return new $c_sjsr_RuntimeLong().init___I__I(jsx$1, $uI((x | 0)))
    } else {
      return new $c_sjsr_RuntimeLong().init___I__I(alo, ahi)
    }
  } else {
    return (((bhi === 0) && ((blo & (((-1) + blo) | 0)) === 0)) ? new $c_sjsr_RuntimeLong().init___I__I((alo & (((-1) + blo) | 0)), 0) : (((blo === 0) && ((bhi & (((-1) + bhi) | 0)) === 0)) ? new $c_sjsr_RuntimeLong().init___I__I(alo, (ahi & (((-1) + bhi) | 0))) : $as_sjsr_RuntimeLong(this.unsignedDivModHelper__p2__I__I__I__I__I__sjs_js_$bar(alo, ahi, blo, bhi, 1))))
  }
});
$c_sjsr_RuntimeLong.prototype.byteValue__B = (function() {
  return this.toByte__B()
});
$c_sjsr_RuntimeLong.prototype.toShort__S = (function() {
  return ((this.lo$2 << 16) >> 16)
});
$c_sjsr_RuntimeLong.prototype.equals__O__Z = (function(that) {
  if ($is_sjsr_RuntimeLong(that)) {
    var x2 = $as_sjsr_RuntimeLong(that);
    return ((this.lo$2 === x2.lo$2) && (this.hi$2 === x2.hi$2))
  } else {
    return false
  }
});
$c_sjsr_RuntimeLong.prototype.$$less__sjsr_RuntimeLong__Z = (function(b) {
  var ahi = this.hi$2;
  var bhi = b.hi$2;
  if ((ahi === bhi)) {
    var a = this.lo$2;
    var b$1 = b.lo$2;
    return (((-2147483648) ^ a) < ((-2147483648) ^ b$1))
  } else {
    return (ahi < bhi)
  }
});
$c_sjsr_RuntimeLong.prototype.$$times__sjsr_RuntimeLong__sjsr_RuntimeLong = (function(b) {
  var alo = this.lo$2;
  var ahi = this.hi$2;
  var blo = b.lo$2;
  var bhi = b.hi$2;
  var a0 = (65535 & alo);
  var a1 = ((alo >>> 16) | 0);
  var a2 = (65535 & ahi);
  var a3 = ((ahi >>> 16) | 0);
  var b0 = (65535 & blo);
  var b1 = ((blo >>> 16) | 0);
  var b2 = (65535 & bhi);
  var b3 = ((bhi >>> 16) | 0);
  var c0 = $imul(a0, b0);
  var c1 = ((c0 >>> 16) | 0);
  c1 = ((c1 + $imul(a1, b0)) | 0);
  var c2 = ((c1 >>> 16) | 0);
  c1 = (((65535 & c1) + $imul(a0, b1)) | 0);
  c2 = ((c2 + ((c1 >>> 16) | 0)) | 0);
  var c3 = ((c2 >>> 16) | 0);
  c2 = (((65535 & c2) + $imul(a2, b0)) | 0);
  c3 = ((c3 + ((c2 >>> 16) | 0)) | 0);
  c2 = (((65535 & c2) + $imul(a1, b1)) | 0);
  c3 = ((c3 + ((c2 >>> 16) | 0)) | 0);
  c2 = (((65535 & c2) + $imul(a0, b2)) | 0);
  c3 = ((c3 + ((c2 >>> 16) | 0)) | 0);
  c3 = ((((((((c3 + $imul(a3, b0)) | 0) + $imul(a2, b1)) | 0) + $imul(a1, b2)) | 0) + $imul(a0, b3)) | 0);
  return new $c_sjsr_RuntimeLong().init___I__I(((65535 & c0) | (c1 << 16)), ((65535 & c2) | (c3 << 16)))
});
$c_sjsr_RuntimeLong.prototype.init___I__I__I = (function(l, m, h) {
  $c_sjsr_RuntimeLong.prototype.init___I__I.call(this, (l | (m << 22)), ((m >> 10) | (h << 12)));
  return this
});
$c_sjsr_RuntimeLong.prototype.$$percent__sjsr_RuntimeLong__sjsr_RuntimeLong = (function(b) {
  var alo = this.lo$2;
  var ahi = this.hi$2;
  var blo = b.lo$2;
  var bhi = b.hi$2;
  if (((blo | bhi) === 0)) {
    throw new $c_jl_ArithmeticException().init___T("/ by zero")
  };
  if ((ahi === (alo >> 31))) {
    return ((bhi === (blo >> 31)) ? ((blo !== (-1)) ? new $c_sjsr_RuntimeLong().init___I(((alo % blo) | 0)) : $m_sjsr_RuntimeLong$().Zero$1) : (((alo === (-2147483648)) && ((blo === (-2147483648)) && (bhi === 0))) ? $m_sjsr_RuntimeLong$().Zero$1 : this))
  } else {
    var neg = (ahi < 0);
    var absLo = alo;
    var absHi = ahi;
    if (neg) {
      absLo = ((-alo) | 0);
      absHi = ((alo !== 0) ? (~ahi) : ((-ahi) | 0))
    };
    var _2 = absLo;
    var _3 = absHi;
    var neg$1 = (bhi < 0);
    var absLo$1 = blo;
    var absHi$1 = bhi;
    if (neg$1) {
      absLo$1 = ((-blo) | 0);
      absHi$1 = ((blo !== 0) ? (~bhi) : ((-bhi) | 0))
    };
    var _2$1 = absLo$1;
    var _3$1 = absHi$1;
    var absR = this.unsigned$und$percent__p2__I__I__I__I__sjsr_RuntimeLong(_2, _3, _2$1, _3$1);
    if (neg) {
      var lo = absR.lo$2;
      var hi = absR.hi$2;
      return new $c_sjsr_RuntimeLong().init___I__I(((-lo) | 0), ((lo !== 0) ? (~hi) : ((-hi) | 0)))
    } else {
      return absR
    }
  }
});
$c_sjsr_RuntimeLong.prototype.unsignedDivModHelper__p2__I__I__I__I__I__sjs_js_$bar = (function(alo, ahi, blo, bhi, ask) {
  var shift = ((((bhi !== 0) ? $clz32(bhi) : ((32 + $clz32(blo)) | 0)) - ((ahi !== 0) ? $clz32(ahi) : ((32 + $clz32(alo)) | 0))) | 0);
  var n = shift;
  if ((n === 0)) {
    var initialBShift_$_$$und1$f = null;
    var initialBShift_$_$$und2$f = null;
    var initialBShift_$_$$und1$mcI$sp$f = blo;
    var initialBShift_$_$$und2$mcI$sp$f = bhi
  } else if ((n < 32)) {
    var _1$mcI$sp = (blo << n);
    var _2$mcI$sp = (((blo >>> ((-n) | 0)) | 0) | (bhi << n));
    var initialBShift_$_$$und1$f = null;
    var initialBShift_$_$$und2$f = null;
    var initialBShift_$_$$und1$mcI$sp$f = _1$mcI$sp;
    var initialBShift_$_$$und2$mcI$sp$f = _2$mcI$sp
  } else {
    var _2$mcI$sp$1 = (blo << n);
    var initialBShift_$_$$und1$f = null;
    var initialBShift_$_$$und2$f = null;
    var initialBShift_$_$$und1$mcI$sp$f = 0;
    var initialBShift_$_$$und2$mcI$sp$f = _2$mcI$sp$1
  };
  var bShiftLo = initialBShift_$_$$und1$mcI$sp$f;
  var bShiftHi = initialBShift_$_$$und2$mcI$sp$f;
  var remLo = alo;
  var remHi = ahi;
  var quotLo = 0;
  var quotHi = 0;
  while (((shift >= 0) && (((-2097152) & remHi) !== 0))) {
    var alo$1 = remLo;
    var ahi$1 = remHi;
    var blo$1 = bShiftLo;
    var bhi$1 = bShiftHi;
    if (((ahi$1 === bhi$1) ? (((-2147483648) ^ alo$1) >= ((-2147483648) ^ blo$1)) : (((-2147483648) ^ ahi$1) >= ((-2147483648) ^ bhi$1)))) {
      var alo$2 = remLo;
      var ahi$2 = remHi;
      var blo$2 = bShiftLo;
      var bhi$2 = bShiftHi;
      var lo = ((alo$2 - blo$2) | 0);
      var _2$mcI$sp$2 = ((((ahi$2 - bhi$2) | 0) + ((((-2147483648) ^ alo$2) < ((-2147483648) ^ lo)) ? (-1) : 0)) | 0);
      remLo = lo;
      remHi = _2$mcI$sp$2;
      if ((shift < 32)) {
        quotLo = (quotLo | (1 << shift))
      } else {
        quotHi = (quotHi | (1 << shift))
      }
    };
    shift = (((-1) + shift) | 0);
    var lo$1 = bShiftLo;
    var hi = bShiftHi;
    var _1$mcI$sp$1 = (((lo$1 >>> 1) | 0) | (hi << (-1)));
    var _2$mcI$sp$3 = ((hi >>> 1) | 0);
    bShiftLo = _1$mcI$sp$1;
    bShiftHi = _2$mcI$sp$3
  };
  var alo$3 = remLo;
  var ahi$3 = remHi;
  if (((ahi$3 === bhi) ? (((-2147483648) ^ alo$3) >= ((-2147483648) ^ blo)) : (((-2147483648) ^ ahi$3) >= ((-2147483648) ^ bhi)))) {
    var lo$2 = remLo;
    var hi$1 = remHi;
    var remDouble = ((4.294967296E9 * hi$1) + $uD((lo$2 >>> 0)));
    var bDouble = ((4.294967296E9 * bhi) + $uD((blo >>> 0)));
    if ((ask !== 1)) {
      var rem_div_bDouble = (remDouble / bDouble);
      var alo$4 = quotLo;
      var ahi$4 = quotHi;
      var blo$3 = $uI((rem_div_bDouble | 0));
      var x = (rem_div_bDouble / 4.294967296E9);
      var bhi$3 = $uI((x | 0));
      var lo$3 = ((alo$4 + blo$3) | 0);
      var _2$mcI$sp$4 = ((((ahi$4 + bhi$3) | 0) + ((((-2147483648) ^ lo$3) < ((-2147483648) ^ alo$4)) ? 1 : 0)) | 0);
      quotLo = lo$3;
      quotHi = _2$mcI$sp$4
    };
    if ((ask !== 0)) {
      var rem_mod_bDouble = (remDouble % bDouble);
      remLo = $uI((rem_mod_bDouble | 0));
      var x$1 = (rem_mod_bDouble / 4.294967296E9);
      remHi = $uI((x$1 | 0))
    }
  };
  if ((ask === 0)) {
    var a = new $c_sjsr_RuntimeLong().init___I__I(quotLo, quotHi);
    return a
  } else if ((ask === 1)) {
    var a$1 = new $c_sjsr_RuntimeLong().init___I__I(remLo, remHi);
    return a$1
  } else {
    var _1 = quotLo;
    var _2 = quotHi;
    var _3 = remLo;
    var _4 = remHi;
    var a$2 = [_1, _2, _3, _4];
    return a$2
  }
});
$c_sjsr_RuntimeLong.prototype.toString__T = (function() {
  var lo = this.lo$2;
  var hi = this.hi$2;
  if ((hi === (lo >> 31))) {
    return ("" + lo)
  } else if ((hi < 0)) {
    var _1$mcI$sp = ((-lo) | 0);
    var _2$mcI$sp = ((lo !== 0) ? (~hi) : ((-hi) | 0));
    return ("-" + this.toUnsignedString__p2__I__I__T(_1$mcI$sp, _2$mcI$sp))
  } else {
    return this.toUnsignedString__p2__I__I__T(lo, hi)
  }
});
$c_sjsr_RuntimeLong.prototype.$$less$eq__sjsr_RuntimeLong__Z = (function(b) {
  var ahi = this.hi$2;
  var bhi = b.hi$2;
  if ((ahi === bhi)) {
    var a = this.lo$2;
    var b$1 = b.lo$2;
    return (((-2147483648) ^ b$1) >= ((-2147483648) ^ a))
  } else {
    return (ahi < bhi)
  }
});
$c_sjsr_RuntimeLong.prototype.init___I__I = (function(lo, hi) {
  this.lo$2 = lo;
  this.hi$2 = hi;
  return this
});
$c_sjsr_RuntimeLong.prototype.compareTo__O__I = (function(x$1) {
  var that = $as_sjsr_RuntimeLong(x$1);
  return this.compareTo__sjsr_RuntimeLong__I($as_sjsr_RuntimeLong(that))
});
$c_sjsr_RuntimeLong.prototype.$$amp__sjsr_RuntimeLong__sjsr_RuntimeLong = (function(b) {
  return new $c_sjsr_RuntimeLong().init___I__I((this.lo$2 & b.lo$2), (this.hi$2 & b.hi$2))
});
$c_sjsr_RuntimeLong.prototype.compareTo__sjsr_RuntimeLong__I = (function(b) {
  var ahi = this.hi$2;
  var bhi = b.hi$2;
  if ((ahi === bhi)) {
    var alo = this.lo$2;
    var blo = b.lo$2;
    return ((alo === blo) ? 0 : ((((-2147483648) ^ alo) < ((-2147483648) ^ blo)) ? (-1) : 1))
  } else {
    return ((ahi < bhi) ? (-1) : 1)
  }
});
$c_sjsr_RuntimeLong.prototype.$$greater$greater$greater__I__sjsr_RuntimeLong = (function(n0) {
  var n = (63 & n0);
  var hi = this.hi$2;
  return ((n === 0) ? this : ((n < 32) ? new $c_sjsr_RuntimeLong().init___I__I((((this.lo$2 >>> n) | 0) | (hi << ((-n) | 0))), ((hi >>> n) | 0)) : new $c_sjsr_RuntimeLong().init___I__I(((hi >>> n) | 0), 0)))
});
$c_sjsr_RuntimeLong.prototype.$$greater__sjsr_RuntimeLong__Z = (function(b) {
  var ahi = this.hi$2;
  var bhi = b.hi$2;
  if ((ahi === bhi)) {
    var a = this.lo$2;
    var b$1 = b.lo$2;
    return (((-2147483648) ^ b$1) < ((-2147483648) ^ a))
  } else {
    return (bhi < ahi)
  }
});
$c_sjsr_RuntimeLong.prototype.$$less$less__I__sjsr_RuntimeLong = (function(n0) {
  var n = (63 & n0);
  var lo = this.lo$2;
  return ((n === 0) ? this : ((n < 32) ? new $c_sjsr_RuntimeLong().init___I__I((lo << n), (((lo >>> ((-n) | 0)) | 0) | (this.hi$2 << n))) : new $c_sjsr_RuntimeLong().init___I__I(0, (lo << n))))
});
$c_sjsr_RuntimeLong.prototype.toInt__I = (function() {
  return this.lo$2
});
$c_sjsr_RuntimeLong.prototype.init___I = (function(value) {
  $c_sjsr_RuntimeLong.prototype.init___I__I.call(this, value, (value >> 31));
  return this
});
$c_sjsr_RuntimeLong.prototype.notEquals__sjsr_RuntimeLong__Z = (function(b) {
  return (!((this.lo$2 === b.lo$2) && (this.hi$2 === b.hi$2)))
});
$c_sjsr_RuntimeLong.prototype.unary$und$minus__sjsr_RuntimeLong = (function() {
  var lo = this.lo$2;
  var hi = this.hi$2;
  return new $c_sjsr_RuntimeLong().init___I__I(((-lo) | 0), ((lo !== 0) ? (~hi) : ((-hi) | 0)))
});
$c_sjsr_RuntimeLong.prototype.shortValue__S = (function() {
  return this.toShort__S()
});
$c_sjsr_RuntimeLong.prototype.$$plus__sjsr_RuntimeLong__sjsr_RuntimeLong = (function(b) {
  var alo = this.lo$2;
  var ahi = this.hi$2;
  var blo = b.lo$2;
  var bhi = b.hi$2;
  var lo = ((alo + blo) | 0);
  var _2$mcI$sp = ((((ahi + bhi) | 0) + ((((-2147483648) ^ lo) < ((-2147483648) ^ alo)) ? 1 : 0)) | 0);
  return new $c_sjsr_RuntimeLong().init___I__I(lo, _2$mcI$sp)
});
$c_sjsr_RuntimeLong.prototype.toDouble__D = (function() {
  var lo = this.lo$2;
  var hi = this.hi$2;
  if ((hi < 0)) {
    var _1$mcI$sp = ((-lo) | 0);
    var _2$mcI$sp = ((lo !== 0) ? (~hi) : ((-hi) | 0));
    return (-((4.294967296E9 * $uD((_2$mcI$sp >>> 0))) + $uD((_1$mcI$sp >>> 0))))
  } else {
    return ((4.294967296E9 * hi) + $uD((lo >>> 0)))
  }
});
$c_sjsr_RuntimeLong.prototype.$$greater$greater__I__sjsr_RuntimeLong = (function(n0) {
  var n = (63 & n0);
  var hi = this.hi$2;
  return ((n === 0) ? this : ((n < 32) ? new $c_sjsr_RuntimeLong().init___I__I((((this.lo$2 >>> n) | 0) | (hi << ((-n) | 0))), (hi >> n)) : new $c_sjsr_RuntimeLong().init___I__I((hi >> n), (hi >> 31))))
});
$c_sjsr_RuntimeLong.prototype.unsigned$und$div__p2__I__I__I__I__sjsr_RuntimeLong = (function(alo, ahi, blo, bhi) {
  if ((((-2097152) & ahi) === 0)) {
    if ((((-2097152) & bhi) === 0)) {
      var aDouble = ((4.294967296E9 * ahi) + $uD((alo >>> 0)));
      var bDouble = ((4.294967296E9 * bhi) + $uD((blo >>> 0)));
      var rDouble = (aDouble / bDouble);
      var jsx$1 = $uI((rDouble | 0));
      var x = (rDouble / 4.294967296E9);
      return new $c_sjsr_RuntimeLong().init___I__I(jsx$1, $uI((x | 0)))
    } else {
      return $m_sjsr_RuntimeLong$().Zero$1
    }
  } else if (((bhi === 0) && ((blo & (((-1) + blo) | 0)) === 0))) {
    var pow = ((31 - $clz32(blo)) | 0);
    return ((pow === 0) ? new $c_sjsr_RuntimeLong().init___I__I(alo, ahi) : new $c_sjsr_RuntimeLong().init___I__I((((alo >>> pow) | 0) | (ahi << ((-pow) | 0))), ((ahi >>> pow) | 0)))
  } else if (((blo === 0) && ((bhi & (((-1) + bhi) | 0)) === 0))) {
    var pow$2 = ((31 - $clz32(bhi)) | 0);
    return new $c_sjsr_RuntimeLong().init___I__I(((ahi >>> pow$2) | 0), 0)
  } else {
    return $as_sjsr_RuntimeLong(this.unsignedDivModHelper__p2__I__I__I__I__I__sjs_js_$bar(alo, ahi, blo, bhi, 0))
  }
});
$c_sjsr_RuntimeLong.prototype.$$div__sjsr_RuntimeLong__sjsr_RuntimeLong = (function(b) {
  var alo = this.lo$2;
  var ahi = this.hi$2;
  var blo = b.lo$2;
  var bhi = b.hi$2;
  if (((blo | bhi) === 0)) {
    throw new $c_jl_ArithmeticException().init___T("/ by zero")
  };
  if ((ahi === (alo >> 31))) {
    return ((bhi === (blo >> 31)) ? (((alo === (-2147483648)) && (blo === (-1))) ? new $c_sjsr_RuntimeLong().init___I__I((-2147483648), 0) : new $c_sjsr_RuntimeLong().init___I(((alo / blo) | 0))) : (((alo === (-2147483648)) && ((blo === (-2147483648)) && (bhi === 0))) ? $m_sjsr_RuntimeLong$().MinusOne$1 : $m_sjsr_RuntimeLong$().Zero$1))
  } else {
    var neg = (ahi < 0);
    var absLo = alo;
    var absHi = ahi;
    if (neg) {
      absLo = ((-alo) | 0);
      absHi = ((alo !== 0) ? (~ahi) : ((-ahi) | 0))
    };
    var _2 = absLo;
    var _3 = absHi;
    var neg$1 = (bhi < 0);
    var absLo$1 = blo;
    var absHi$1 = bhi;
    if (neg$1) {
      absLo$1 = ((-blo) | 0);
      absHi$1 = ((blo !== 0) ? (~bhi) : ((-bhi) | 0))
    };
    var _2$1 = absLo$1;
    var _3$1 = absHi$1;
    var absR = this.unsigned$und$div__p2__I__I__I__I__sjsr_RuntimeLong(_2, _3, _2$1, _3$1);
    if ((neg === neg$1)) {
      return absR
    } else {
      var lo = absR.lo$2;
      var hi = absR.hi$2;
      return new $c_sjsr_RuntimeLong().init___I__I(((-lo) | 0), ((lo !== 0) ? (~hi) : ((-hi) | 0)))
    }
  }
});
$c_sjsr_RuntimeLong.prototype.toByte__B = (function() {
  return ((this.lo$2 << 24) >> 24)
});
$c_sjsr_RuntimeLong.prototype.doubleValue__D = (function() {
  return this.toDouble__D()
});
$c_sjsr_RuntimeLong.prototype.hashCode__I = (function() {
  return (this.lo$2 ^ this.hi$2)
});
$c_sjsr_RuntimeLong.prototype.intValue__I = (function() {
  return this.lo$2
});
$c_sjsr_RuntimeLong.prototype.toUnsignedString__p2__I__I__T = (function(lo, hi) {
  if ((((-2097152) & hi) === 0)) {
    var this$5 = ((4.294967296E9 * hi) + $uD((lo >>> 0)));
    return ("" + this$5)
  } else {
    var quotRem = this.unsignedDivModHelper__p2__I__I__I__I__I__sjs_js_$bar(lo, hi, 1000000000, 0, 2);
    var quotLo = $uI(quotRem["0"]);
    var quotHi = $uI(quotRem["1"]);
    var rem = $uI(quotRem["2"]);
    var quot = ((4.294967296E9 * quotHi) + $uD((quotLo >>> 0)));
    var remStr = ("" + rem);
    return ((("" + quot) + $as_T("000000000".substring($uI(remStr.length)))) + remStr)
  }
});
$c_sjsr_RuntimeLong.prototype.compareTo__jl_Long__I = (function(that) {
  return this.compareTo__sjsr_RuntimeLong__I($as_sjsr_RuntimeLong(that))
});
$c_sjsr_RuntimeLong.prototype.unary$und$tilde__sjsr_RuntimeLong = (function() {
  return new $c_sjsr_RuntimeLong().init___I__I((~this.lo$2), (~this.hi$2))
});
$c_sjsr_RuntimeLong.prototype.floatValue__F = (function() {
  return this.toFloat__F()
});
$c_sjsr_RuntimeLong.prototype.$$minus__sjsr_RuntimeLong__sjsr_RuntimeLong = (function(b) {
  var alo = this.lo$2;
  var ahi = this.hi$2;
  var blo = b.lo$2;
  var bhi = b.hi$2;
  var lo = ((alo - blo) | 0);
  var _2$mcI$sp = ((((ahi - bhi) | 0) + ((((-2147483648) ^ alo) < ((-2147483648) ^ lo)) ? (-1) : 0)) | 0);
  return new $c_sjsr_RuntimeLong().init___I__I(lo, _2$mcI$sp)
});
$c_sjsr_RuntimeLong.prototype.toFloat__F = (function() {
  return $fround(this.toDouble__D())
});
$c_sjsr_RuntimeLong.prototype.$$up__sjsr_RuntimeLong__sjsr_RuntimeLong = (function(b) {
  return new $c_sjsr_RuntimeLong().init___I__I((this.lo$2 ^ b.lo$2), (this.hi$2 ^ b.hi$2))
});
$c_sjsr_RuntimeLong.prototype.equals__sjsr_RuntimeLong__Z = (function(b) {
  return ((this.lo$2 === b.lo$2) && (this.hi$2 === b.hi$2))
});
function $is_sjsr_RuntimeLong(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sjsr_RuntimeLong)))
}
function $as_sjsr_RuntimeLong(obj) {
  return (($is_sjsr_RuntimeLong(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.scalajs.runtime.RuntimeLong"))
}
function $isArrayOf_sjsr_RuntimeLong(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sjsr_RuntimeLong)))
}
function $asArrayOf_sjsr_RuntimeLong(obj, depth) {
  return (($isArrayOf_sjsr_RuntimeLong(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.scalajs.runtime.RuntimeLong;", depth))
}
var $d_sjsr_RuntimeLong = new $TypeData().initClass({
  sjsr_RuntimeLong: 0
}, false, "scala.scalajs.runtime.RuntimeLong", {
  sjsr_RuntimeLong: 1,
  jl_Number: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  jl_Comparable: 1
});
$c_sjsr_RuntimeLong.prototype.$classData = $d_sjsr_RuntimeLong;
/** @constructor */
function $c_jl_ArithmeticException() {
  $c_jl_RuntimeException.call(this)
}
$c_jl_ArithmeticException.prototype = new $h_jl_RuntimeException();
$c_jl_ArithmeticException.prototype.constructor = $c_jl_ArithmeticException;
/** @constructor */
function $h_jl_ArithmeticException() {
  /*<skip>*/
}
$h_jl_ArithmeticException.prototype = $c_jl_ArithmeticException.prototype;
$c_jl_ArithmeticException.prototype.init___T = (function(s) {
  $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, s, null);
  return this
});
var $d_jl_ArithmeticException = new $TypeData().initClass({
  jl_ArithmeticException: 0
}, false, "java.lang.ArithmeticException", {
  jl_ArithmeticException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_ArithmeticException.prototype.$classData = $d_jl_ArithmeticException;
/** @constructor */
function $c_jl_ClassCastException() {
  $c_jl_RuntimeException.call(this)
}
$c_jl_ClassCastException.prototype = new $h_jl_RuntimeException();
$c_jl_ClassCastException.prototype.constructor = $c_jl_ClassCastException;
/** @constructor */
function $h_jl_ClassCastException() {
  /*<skip>*/
}
$h_jl_ClassCastException.prototype = $c_jl_ClassCastException.prototype;
$c_jl_ClassCastException.prototype.init___T = (function(s) {
  $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, s, null);
  return this
});
var $d_jl_ClassCastException = new $TypeData().initClass({
  jl_ClassCastException: 0
}, false, "java.lang.ClassCastException", {
  jl_ClassCastException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_ClassCastException.prototype.$classData = $d_jl_ClassCastException;
/** @constructor */
function $c_jl_IllegalArgumentException() {
  $c_jl_RuntimeException.call(this)
}
$c_jl_IllegalArgumentException.prototype = new $h_jl_RuntimeException();
$c_jl_IllegalArgumentException.prototype.constructor = $c_jl_IllegalArgumentException;
/** @constructor */
function $h_jl_IllegalArgumentException() {
  /*<skip>*/
}
$h_jl_IllegalArgumentException.prototype = $c_jl_IllegalArgumentException.prototype;
$c_jl_IllegalArgumentException.prototype.init___T = (function(s) {
  $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, s, null);
  return this
});
var $d_jl_IllegalArgumentException = new $TypeData().initClass({
  jl_IllegalArgumentException: 0
}, false, "java.lang.IllegalArgumentException", {
  jl_IllegalArgumentException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_IllegalArgumentException.prototype.$classData = $d_jl_IllegalArgumentException;
/** @constructor */
function $c_jl_IndexOutOfBoundsException() {
  $c_jl_RuntimeException.call(this)
}
$c_jl_IndexOutOfBoundsException.prototype = new $h_jl_RuntimeException();
$c_jl_IndexOutOfBoundsException.prototype.constructor = $c_jl_IndexOutOfBoundsException;
/** @constructor */
function $h_jl_IndexOutOfBoundsException() {
  /*<skip>*/
}
$h_jl_IndexOutOfBoundsException.prototype = $c_jl_IndexOutOfBoundsException.prototype;
$c_jl_IndexOutOfBoundsException.prototype.init___T = (function(s) {
  $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, s, null);
  return this
});
var $d_jl_IndexOutOfBoundsException = new $TypeData().initClass({
  jl_IndexOutOfBoundsException: 0
}, false, "java.lang.IndexOutOfBoundsException", {
  jl_IndexOutOfBoundsException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_IndexOutOfBoundsException.prototype.$classData = $d_jl_IndexOutOfBoundsException;
/** @constructor */
function $c_s_MatchError() {
  $c_jl_RuntimeException.call(this);
  this.obj$4 = null;
  this.objString$4 = null;
  this.bitmap$0$4 = false
}
$c_s_MatchError.prototype = new $h_jl_RuntimeException();
$c_s_MatchError.prototype.constructor = $c_s_MatchError;
/** @constructor */
function $h_s_MatchError() {
  /*<skip>*/
}
$h_s_MatchError.prototype = $c_s_MatchError.prototype;
$c_s_MatchError.prototype.objString$lzycompute__p4__T = (function() {
  if ((!this.bitmap$0$4)) {
    this.objString$4 = ((this.obj$4 === null) ? "null" : this.liftedTree1$1__p4__T());
    this.bitmap$0$4 = true
  };
  return this.objString$4
});
$c_s_MatchError.prototype.ofClass$1__p4__T = (function() {
  return ("of class " + $objectGetClass(this.obj$4).getName__T())
});
$c_s_MatchError.prototype.liftedTree1$1__p4__T = (function() {
  try {
    return ((($objectToString(this.obj$4) + " (") + this.ofClass$1__p4__T()) + ")")
  } catch (e) {
    var e$2 = $m_sjsr_package$().wrapJavaScriptException__O__jl_Throwable(e);
    if ((e$2 !== null)) {
      return ("an instance " + this.ofClass$1__p4__T())
    } else {
      throw e
    }
  }
});
$c_s_MatchError.prototype.getMessage__T = (function() {
  return this.objString__p4__T()
});
$c_s_MatchError.prototype.objString__p4__T = (function() {
  return ((!this.bitmap$0$4) ? this.objString$lzycompute__p4__T() : this.objString$4)
});
$c_s_MatchError.prototype.init___O = (function(obj) {
  this.obj$4 = obj;
  $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, null, null);
  return this
});
var $d_s_MatchError = new $TypeData().initClass({
  s_MatchError: 0
}, false, "scala.MatchError", {
  s_MatchError: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_s_MatchError.prototype.$classData = $d_s_MatchError;
/** @constructor */
function $c_T2() {
  $c_O.call(this);
  this.$$und1$f = null;
  this.$$und2$f = null
}
$c_T2.prototype = new $h_O();
$c_T2.prototype.constructor = $c_T2;
/** @constructor */
function $h_T2() {
  /*<skip>*/
}
$h_T2.prototype = $c_T2.prototype;
$c_T2.prototype.productPrefix__T = (function() {
  return "Tuple2"
});
$c_T2.prototype.productArity__I = (function() {
  return 2
});
$c_T2.prototype.init___O__O = (function(_1, _2) {
  this.$$und1$f = _1;
  this.$$und2$f = _2;
  return this
});
$c_T2.prototype.productElement__I__O = (function(n) {
  return $s_s_Product2$class__productElement__s_Product2__I__O(this, n)
});
$c_T2.prototype.toString__T = (function() {
  return (((("(" + this.$$und1__O()) + ",") + this.$$und2__O()) + ")")
});
$c_T2.prototype.hashCode__I = (function() {
  var this$2 = $m_s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
/** @constructor */
function $c_sjsr_UndefinedBehaviorError() {
  $c_jl_Error.call(this)
}
$c_sjsr_UndefinedBehaviorError.prototype = new $h_jl_Error();
$c_sjsr_UndefinedBehaviorError.prototype.constructor = $c_sjsr_UndefinedBehaviorError;
/** @constructor */
function $h_sjsr_UndefinedBehaviorError() {
  /*<skip>*/
}
$h_sjsr_UndefinedBehaviorError.prototype = $c_sjsr_UndefinedBehaviorError.prototype;
$c_sjsr_UndefinedBehaviorError.prototype.fillInStackTrace__jl_Throwable = (function() {
  return $c_jl_Throwable.prototype.fillInStackTrace__jl_Throwable.call(this)
});
$c_sjsr_UndefinedBehaviorError.prototype.init___jl_Throwable = (function(cause) {
  $c_sjsr_UndefinedBehaviorError.prototype.init___T__jl_Throwable.call(this, ("An undefined behavior was detected" + ((cause === null) ? "" : (": " + cause.getMessage__T()))), cause);
  return this
});
$c_sjsr_UndefinedBehaviorError.prototype.init___T__jl_Throwable = (function(message, cause) {
  $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, message, cause);
  return this
});
var $d_sjsr_UndefinedBehaviorError = new $TypeData().initClass({
  sjsr_UndefinedBehaviorError: 0
}, false, "scala.scalajs.runtime.UndefinedBehaviorError", {
  sjsr_UndefinedBehaviorError: 1,
  jl_Error: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  s_util_control_ControlThrowable: 1,
  s_util_control_NoStackTrace: 1
});
$c_sjsr_UndefinedBehaviorError.prototype.$classData = $d_sjsr_UndefinedBehaviorError;
/** @constructor */
function $c_s_Tuple2$mcDD$sp() {
  $c_T2.call(this);
  this.$$und1$mcD$sp$f = 0.0;
  this.$$und2$mcD$sp$f = 0.0
}
$c_s_Tuple2$mcDD$sp.prototype = new $h_T2();
$c_s_Tuple2$mcDD$sp.prototype.constructor = $c_s_Tuple2$mcDD$sp;
/** @constructor */
function $h_s_Tuple2$mcDD$sp() {
  /*<skip>*/
}
$h_s_Tuple2$mcDD$sp.prototype = $c_s_Tuple2$mcDD$sp.prototype;
$c_s_Tuple2$mcDD$sp.prototype.$$und1$mcD$sp__D = (function() {
  return this.$$und1$mcD$sp$f
});
$c_s_Tuple2$mcDD$sp.prototype.$$und2__O = (function() {
  return this.$$und2$mcD$sp$f
});
$c_s_Tuple2$mcDD$sp.prototype.$$und2$mcD$sp__D = (function() {
  return this.$$und2$mcD$sp$f
});
$c_s_Tuple2$mcDD$sp.prototype.init___D__D = (function(_1$mcD$sp, _2$mcD$sp) {
  this.$$und1$mcD$sp$f = _1$mcD$sp;
  this.$$und2$mcD$sp$f = _2$mcD$sp;
  $c_T2.prototype.init___O__O.call(this, null, null);
  return this
});
$c_s_Tuple2$mcDD$sp.prototype.$$und1__O = (function() {
  return this.$$und1$mcD$sp$f
});
var $d_s_Tuple2$mcDD$sp = new $TypeData().initClass({
  s_Tuple2$mcDD$sp: 0
}, false, "scala.Tuple2$mcDD$sp", {
  s_Tuple2$mcDD$sp: 1,
  T2: 1,
  O: 1,
  s_Product2: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Product2$mcDD$sp: 1
});
$c_s_Tuple2$mcDD$sp.prototype.$classData = $d_s_Tuple2$mcDD$sp;
/** @constructor */
function $c_sjs_js_JavaScriptException() {
  $c_jl_RuntimeException.call(this);
  this.exception$4 = null
}
$c_sjs_js_JavaScriptException.prototype = new $h_jl_RuntimeException();
$c_sjs_js_JavaScriptException.prototype.constructor = $c_sjs_js_JavaScriptException;
/** @constructor */
function $h_sjs_js_JavaScriptException() {
  /*<skip>*/
}
$h_sjs_js_JavaScriptException.prototype = $c_sjs_js_JavaScriptException.prototype;
$c_sjs_js_JavaScriptException.prototype.productPrefix__T = (function() {
  return "JavaScriptException"
});
$c_sjs_js_JavaScriptException.prototype.productArity__I = (function() {
  return 1
});
$c_sjs_js_JavaScriptException.prototype.fillInStackTrace__jl_Throwable = (function() {
  var e = this.exception$4;
  this.stackdata = e;
  return this
});
$c_sjs_js_JavaScriptException.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.exception$4;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_sjs_js_JavaScriptException.prototype.toString__T = (function() {
  return $objectToString(this.exception$4)
});
$c_sjs_js_JavaScriptException.prototype.init___O = (function(exception) {
  this.exception$4 = exception;
  $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, null, null);
  return this
});
$c_sjs_js_JavaScriptException.prototype.hashCode__I = (function() {
  var this$2 = $m_s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
function $is_sjs_js_JavaScriptException(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sjs_js_JavaScriptException)))
}
function $as_sjs_js_JavaScriptException(obj) {
  return (($is_sjs_js_JavaScriptException(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.scalajs.js.JavaScriptException"))
}
function $isArrayOf_sjs_js_JavaScriptException(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sjs_js_JavaScriptException)))
}
function $asArrayOf_sjs_js_JavaScriptException(obj, depth) {
  return (($isArrayOf_sjs_js_JavaScriptException(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.scalajs.js.JavaScriptException;", depth))
}
var $d_sjs_js_JavaScriptException = new $TypeData().initClass({
  sjs_js_JavaScriptException: 0
}, false, "scala.scalajs.js.JavaScriptException", {
  sjs_js_JavaScriptException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1
});
$c_sjs_js_JavaScriptException.prototype.$classData = $d_sjs_js_JavaScriptException;
}).call(this);
//# sourceMappingURL=augmented-reality-with-scala-js-fastopt.js.map