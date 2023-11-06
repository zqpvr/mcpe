// Support for growable heap + pthreads, where the buffer may change, so JS views
// must be updated.
function GROWABLE_HEAP_I8() {
  if (wasmMemory.buffer != HEAP8.buffer) {
    updateMemoryViews();
  }
  return HEAP8;
}
function GROWABLE_HEAP_U8() {
  if (wasmMemory.buffer != HEAP8.buffer) {
    updateMemoryViews();
  }
  return HEAPU8;
}
function GROWABLE_HEAP_I16() {
  if (wasmMemory.buffer != HEAP8.buffer) {
    updateMemoryViews();
  }
  return HEAP16;
}
function GROWABLE_HEAP_U16() {
  if (wasmMemory.buffer != HEAP8.buffer) {
    updateMemoryViews();
  }
  return HEAPU16;
}
function GROWABLE_HEAP_I32() {
  if (wasmMemory.buffer != HEAP8.buffer) {
    updateMemoryViews();
  }
  return HEAP32;
}
function GROWABLE_HEAP_U32() {
  if (wasmMemory.buffer != HEAP8.buffer) {
    updateMemoryViews();
  }
  return HEAPU32;
}
function GROWABLE_HEAP_F32() {
  if (wasmMemory.buffer != HEAP8.buffer) {
    updateMemoryViews();
  }
  return HEAPF32;
}
function GROWABLE_HEAP_F64() {
  if (wasmMemory.buffer != HEAP8.buffer) {
    updateMemoryViews();
  }
  return HEAPF64;
}

var Module = typeof Module != "undefined" ? Module : {};

if (!Module.expectedDataFileDownloads) {
 Module.expectedDataFileDownloads = 0;
}

Module.expectedDataFileDownloads++;

(function() {
 if (Module["ENVIRONMENT_IS_PTHREAD"] || Module["$ww"]) return;
 var loadPackage = function(metadata) {
  var PACKAGE_PATH = "";
  if (typeof window === "object") {
   PACKAGE_PATH = window["encodeURIComponent"](window.location.pathname.toString().substring(0, window.location.pathname.toString().lastIndexOf("/")) + "/");
  } else if (typeof process === "undefined" && typeof location !== "undefined") {
   PACKAGE_PATH = encodeURIComponent(location.pathname.toString().substring(0, location.pathname.toString().lastIndexOf("/")) + "/");
  }
  var PACKAGE_NAME = "reminecraftpe.data";
  var REMOTE_PACKAGE_BASE = "reminecraftpe.data";
  if (typeof Module["locateFilePackage"] === "function" && !Module["locateFile"]) {
   Module["locateFile"] = Module["locateFilePackage"];
   err("warning: you defined Module.locateFilePackage, that has been renamed to Module.locateFile (using your locateFilePackage for now)");
  }
  var REMOTE_PACKAGE_NAME = Module["locateFile"] ? Module["locateFile"](REMOTE_PACKAGE_BASE, "") : REMOTE_PACKAGE_BASE;
  var REMOTE_PACKAGE_SIZE = metadata["remote_package_size"];
  function fetchRemotePackage(packageName, packageSize, callback, errback) {
   if (typeof process === "object" && typeof process.versions === "object" && typeof process.versions.node === "string") {
    require("fs").readFile(packageName, function(err, contents) {
     if (err) {
      errback(err);
     } else {
      callback(contents.buffer);
     }
    });
    return;
   }
   var xhr = new XMLHttpRequest;
   xhr.open("GET", packageName, true);
   xhr.responseType = "arraybuffer";
   xhr.onprogress = function(event) {
    var url = packageName;
    var size = packageSize;
    if (event.total) size = event.total;
    if (event.loaded) {
     if (!xhr.addedTotal) {
      xhr.addedTotal = true;
      if (!Module.dataFileDownloads) Module.dataFileDownloads = {};
      Module.dataFileDownloads[url] = {
       loaded: event.loaded,
       total: size
      };
     } else {
      Module.dataFileDownloads[url].loaded = event.loaded;
     }
     var total = 0;
     var loaded = 0;
     var num = 0;
     for (var download in Module.dataFileDownloads) {
      var data = Module.dataFileDownloads[download];
      total += data.total;
      loaded += data.loaded;
      num++;
     }
     total = Math.ceil(total * Module.expectedDataFileDownloads / num);
     if (Module["setStatus"]) Module["setStatus"](`Downloading data... (${loaded}/${total})`);
    } else if (!Module.dataFileDownloads) {
     if (Module["setStatus"]) Module["setStatus"]("Downloading data...");
    }
   };
   xhr.onerror = function(event) {
    throw new Error("NetworkError for: " + packageName);
   };
   xhr.onload = function(event) {
    if (xhr.status == 200 || xhr.status == 304 || xhr.status == 206 || (xhr.status == 0 && xhr.response)) {
     var packageData = xhr.response;
     callback(packageData);
    } else {
     throw new Error(xhr.statusText + " : " + xhr.responseURL);
    }
   };
   xhr.send(null);
  }
  function handleError(error) {
   console.error("package error:", error);
  }
  var fetchedCallback = null;
  var fetched = Module["getPreloadedPackage"] ? Module["getPreloadedPackage"](REMOTE_PACKAGE_NAME, REMOTE_PACKAGE_SIZE) : null;
  if (!fetched) fetchRemotePackage(REMOTE_PACKAGE_NAME, REMOTE_PACKAGE_SIZE, function(data) {
   if (fetchedCallback) {
    fetchedCallback(data);
    fetchedCallback = null;
   } else {
    fetched = data;
   }
  }, handleError);
  function runWithFS() {
   function assert(check, msg) {
    if (!check) throw msg + (new Error).stack;
   }
   Module["FS_createPath"]("/", "assets", true, true);
   Module["FS_createPath"]("/assets", "font", true, true);
   Module["FS_createPath"]("/assets", "gui", true, true);
   Module["FS_createPath"]("/assets", "item", true, true);
   Module["FS_createPath"]("/assets", "mob", true, true);
   Module["FS_createPath"]("/assets", "patches", true, true);
   /** @constructor */ function DataRequest(start, end, audio) {
    this.start = start;
    this.end = end;
    this.audio = audio;
   }
   DataRequest.prototype = {
    requests: {},
    open: function(mode, name) {
     this.name = name;
     this.requests[name] = this;
     Module["addRunDependency"](`fp ${this.name}`);
    },
    send: function() {},
    onload: function() {
     var byteArray = this.byteArray.subarray(this.start, this.end);
     this.finish(byteArray);
    },
    finish: function(byteArray) {
     var that = this;
     Module["FS_createPreloadedFile"](this.name, null, byteArray, true, true, function() {
      Module["removeRunDependency"](`fp ${that.name}`);
     }, function() {
      err(`Preloading file ${that.name} failed`);
     }, false, true);
     this.requests[this.name] = null;
    }
   };
   var files = metadata["files"];
   for (var i = 0; i < files.length; ++i) {
    new DataRequest(files[i]["start"], files[i]["end"], files[i]["audio"] || 0).open("GET", files[i]["filename"]);
   }
   function processPackageData(arrayBuffer) {
    assert(arrayBuffer, "Loading data file failed.");
    assert(arrayBuffer.constructor.name === ArrayBuffer.name, "bad input to processPackageData");
    var byteArray = new Uint8Array(arrayBuffer);
    var curr;
    DataRequest.prototype.byteArray = byteArray;
    var files = metadata["files"];
    for (var i = 0; i < files.length; ++i) {
     DataRequest.prototype.requests[files[i].filename].onload();
    }
    Module["removeRunDependency"]("datafile_reminecraftpe.data");
   }
   Module["addRunDependency"]("datafile_reminecraftpe.data");
   if (!Module.preloadResults) Module.preloadResults = {};
   Module.preloadResults[PACKAGE_NAME] = {
    fromCache: false
   };
   if (fetched) {
    processPackageData(fetched);
    fetched = null;
   } else {
    fetchedCallback = processPackageData;
   }
  }
  if (Module["calledRun"]) {
   runWithFS();
  } else {
   if (!Module["preRun"]) Module["preRun"] = [];
   Module["preRun"].push(runWithFS);
  }
 };
 loadPackage({
  "files": [ {
   "filename": "/assets/font/default.png",
   "start": 0,
   "end": 3716
  }, {
   "filename": "/assets/gui/background.png",
   "start": 3716,
   "end": 4727
  }, {
   "filename": "/assets/gui/default_world.png",
   "start": 4727,
   "end": 29792
  }, {
   "filename": "/assets/gui/gui.png",
   "start": 29792,
   "end": 44002
  }, {
   "filename": "/assets/gui/gui_blocks.png",
   "start": 44002,
   "end": 150245
  }, {
   "filename": "/assets/gui/icons.png",
   "start": 150245,
   "end": 152668
  }, {
   "filename": "/assets/gui/items.png",
   "start": 152668,
   "end": 168391
  }, {
   "filename": "/assets/gui/raknet.png",
   "start": 168391,
   "end": 186763
  }, {
   "filename": "/assets/gui/title.png",
   "start": 186763,
   "end": 192568
  }, {
   "filename": "/assets/icon.png",
   "start": 192568,
   "end": 197660
  }, {
   "filename": "/assets/item/camera.png",
   "start": 197660,
   "end": 198342
  }, {
   "filename": "/assets/mob/char.png",
   "start": 198342,
   "end": 199702
  }, {
   "filename": "/assets/particles.png",
   "start": 199702,
   "end": 200546
  }, {
   "filename": "/assets/patches/patch_data.txt",
   "start": 200546,
   "end": 202529
  }, {
   "filename": "/assets/readme.txt",
   "start": 202529,
   "end": 202639
  }, {
   "filename": "/assets/terrain.png",
   "start": 202639,
   "end": 250398
  } ],
  "remote_package_size": 250398
 });
})();

if (Module["ENVIRONMENT_IS_PTHREAD"] || Module["$ww"]) Module["preRun"] = [];

var necessaryPreJSTasks = Module["preRun"].slice();

if (!Module["preRun"]) throw "Module.preRun should exist because file support used it; did a pre-js delete it?";

necessaryPreJSTasks.forEach(function(task) {
 if (Module["preRun"].indexOf(task) < 0) throw "All preRun tasks that exist before user pre-js code should remain after; did you replace Module or modify Module.preRun?";
});

var moduleOverrides = Object.assign({}, Module);

var arguments_ = [];

var thisProgram = "./this.program";

var quit_ = (status, toThrow) => {
 throw toThrow;
};

var ENVIRONMENT_IS_WEB = typeof window == "object";

var ENVIRONMENT_IS_WORKER = typeof importScripts == "function";

var ENVIRONMENT_IS_NODE = typeof process == "object" && typeof process.versions == "object" && typeof process.versions.node == "string";

var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;

if (Module["ENVIRONMENT"]) {
 throw new Error("Module.ENVIRONMENT has been deprecated. To force the environment, use the ENVIRONMENT compile-time option (for example, -sENVIRONMENT=web or -sENVIRONMENT=node)");
}

var ENVIRONMENT_IS_PTHREAD = Module["ENVIRONMENT_IS_PTHREAD"] || false;

var _scriptDir = (typeof document != "undefined" && document.currentScript) ? document.currentScript.src : undefined;

if (ENVIRONMENT_IS_WORKER) {
 _scriptDir = self.location.href;
} else if (ENVIRONMENT_IS_NODE) {
 _scriptDir = __filename;
}

var scriptDirectory = "";

function locateFile(path) {
 if (Module["locateFile"]) {
  return Module["locateFile"](path, scriptDirectory);
 }
 return scriptDirectory + path;
}

var read_, readAsync, readBinary;

if (ENVIRONMENT_IS_NODE) {
 if (typeof process == "undefined" || !process.release || process.release.name !== "node") throw new Error("not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)");
 var nodeVersion = process.versions.node;
 var numericVersion = nodeVersion.split(".").slice(0, 3);
 numericVersion = (numericVersion[0] * 1e4) + (numericVersion[1] * 100) + (numericVersion[2].split("-")[0] * 1);
 var minVersion = 16e4;
 if (numericVersion < 16e4) {
  throw new Error("This emscripten-generated code requires node v16.0.0 (detected v" + nodeVersion + ")");
 }
 var fs = require("fs");
 var nodePath = require("path");
 if (ENVIRONMENT_IS_WORKER) {
  scriptDirectory = nodePath.dirname(scriptDirectory) + "/";
 } else {
  scriptDirectory = __dirname + "/";
 }
 read_ = (filename, binary) => {
  filename = isFileURI(filename) ? new URL(filename) : nodePath.normalize(filename);
  return fs.readFileSync(filename, binary ? undefined : "utf8");
 };
 readBinary = filename => {
  var ret = read_(filename, true);
  if (!ret.buffer) {
   ret = new Uint8Array(ret);
  }
  assert(ret.buffer);
  return ret;
 };
 readAsync = (filename, onload, onerror, binary = true) => {
  filename = isFileURI(filename) ? new URL(filename) : nodePath.normalize(filename);
  fs.readFile(filename, binary ? undefined : "utf8", (err, data) => {
   if (err) onerror(err); else onload(binary ? data.buffer : data);
  });
 };
 if (!Module["thisProgram"] && process.argv.length > 1) {
  thisProgram = process.argv[1].replace(/\\/g, "/");
 }
 arguments_ = process.argv.slice(2);
 if (typeof module != "undefined") {
  module["exports"] = Module;
 }
 process.on("uncaughtException", ex => {
  if (ex !== "unwind" && !(ex instanceof ExitStatus) && !(ex.context instanceof ExitStatus)) {
   throw ex;
  }
 });
 quit_ = (status, toThrow) => {
  process.exitCode = status;
  throw toThrow;
 };
 Module["inspect"] = () => "[Emscripten Module object]";
 let nodeWorkerThreads;
 try {
  nodeWorkerThreads = require("worker_threads");
 } catch (e) {
  console.error('The "worker_threads" module is not supported in this node.js build - perhaps a newer version is needed?');
  throw e;
 }
 global.Worker = nodeWorkerThreads.Worker;
} else if (ENVIRONMENT_IS_SHELL) {
 if ((typeof process == "object" && typeof require === "function") || typeof window == "object" || typeof importScripts == "function") throw new Error("not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)");
 if (typeof read != "undefined") {
  read_ = read;
 }
 readBinary = f => {
  if (typeof readbuffer == "function") {
   return new Uint8Array(readbuffer(f));
  }
  let data = read(f, "binary");
  assert(typeof data == "object");
  return data;
 };
 readAsync = (f, onload, onerror) => {
  setTimeout(() => onload(readBinary(f)));
 };
 if (typeof clearTimeout == "undefined") {
  globalThis.clearTimeout = id => {};
 }
 if (typeof setTimeout == "undefined") {
  globalThis.setTimeout = f => (typeof f == "function") ? f() : abort();
 }
 if (typeof scriptArgs != "undefined") {
  arguments_ = scriptArgs;
 } else if (typeof arguments != "undefined") {
  arguments_ = arguments;
 }
 if (typeof quit == "function") {
  quit_ = (status, toThrow) => {
   setTimeout(() => {
    if (!(toThrow instanceof ExitStatus)) {
     let toLog = toThrow;
     if (toThrow && typeof toThrow == "object" && toThrow.stack) {
      toLog = [ toThrow, toThrow.stack ];
     }
     err(`exiting due to exception: ${toLog}`);
    }
    quit(status);
   });
   throw toThrow;
  };
 }
 if (typeof print != "undefined") {
  if (typeof console == "undefined") console = /** @type{!Console} */ ({});
  console.log = /** @type{!function(this:Console, ...*): undefined} */ (print);
  console.warn = console.error = /** @type{!function(this:Console, ...*): undefined} */ (typeof printErr != "undefined" ? printErr : print);
 }
} else  if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
 if (ENVIRONMENT_IS_WORKER) {
  scriptDirectory = self.location.href;
 } else if (typeof document != "undefined" && document.currentScript) {
  scriptDirectory = document.currentScript.src;
 }
 if (scriptDirectory.indexOf("blob:") !== 0) {
  scriptDirectory = scriptDirectory.substr(0, scriptDirectory.replace(/[?#].*/, "").lastIndexOf("/") + 1);
 } else {
  scriptDirectory = "";
 }
 if (!(typeof window == "object" || typeof importScripts == "function")) throw new Error("not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)");
 if (!ENVIRONMENT_IS_NODE) {
  read_ = url => {
   var xhr = new XMLHttpRequest;
   xhr.open("GET", url, false);
   xhr.send(null);
   return xhr.responseText;
  };
  if (ENVIRONMENT_IS_WORKER) {
   readBinary = url => {
    var xhr = new XMLHttpRequest;
    xhr.open("GET", url, false);
    xhr.responseType = "arraybuffer";
    xhr.send(null);
    return new Uint8Array(/** @type{!ArrayBuffer} */ (xhr.response));
   };
  }
  readAsync = (url, onload, onerror) => {
   var xhr = new XMLHttpRequest;
   xhr.open("GET", url, true);
   xhr.responseType = "arraybuffer";
   xhr.onload = () => {
    if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) {
     onload(xhr.response);
     return;
    }
    onerror();
   };
   xhr.onerror = onerror;
   xhr.send(null);
  };
 }
} else  {
 throw new Error("environment detection error");
}

if (ENVIRONMENT_IS_NODE) {
 if (typeof performance == "undefined") {
  global.performance = require("perf_hooks").performance;
 }
}

var defaultPrint = console.log.bind(console);

var defaultPrintErr = console.error.bind(console);

if (ENVIRONMENT_IS_NODE) {
 defaultPrint = (...args) => fs.writeSync(1, args.join(" ") + "\n");
 defaultPrintErr = (...args) => fs.writeSync(2, args.join(" ") + "\n");
}

var out = Module["print"] || defaultPrint;

var err = Module["printErr"] || defaultPrintErr;

Object.assign(Module, moduleOverrides);

moduleOverrides = null;

checkIncomingModuleAPI();

if (Module["arguments"]) arguments_ = Module["arguments"];

legacyModuleProp("arguments", "arguments_");

if (Module["thisProgram"]) thisProgram = Module["thisProgram"];

legacyModuleProp("thisProgram", "thisProgram");

if (Module["quit"]) quit_ = Module["quit"];

legacyModuleProp("quit", "quit_");

assert(typeof Module["memoryInitializerPrefixURL"] == "undefined", "Module.memoryInitializerPrefixURL option was removed, use Module.locateFile instead");

assert(typeof Module["pthreadMainPrefixURL"] == "undefined", "Module.pthreadMainPrefixURL option was removed, use Module.locateFile instead");

assert(typeof Module["cdInitializerPrefixURL"] == "undefined", "Module.cdInitializerPrefixURL option was removed, use Module.locateFile instead");

assert(typeof Module["filePackagePrefixURL"] == "undefined", "Module.filePackagePrefixURL option was removed, use Module.locateFile instead");

assert(typeof Module["read"] == "undefined", "Module.read option was removed (modify read_ in JS)");

assert(typeof Module["readAsync"] == "undefined", "Module.readAsync option was removed (modify readAsync in JS)");

assert(typeof Module["readBinary"] == "undefined", "Module.readBinary option was removed (modify readBinary in JS)");

assert(typeof Module["setWindowTitle"] == "undefined", "Module.setWindowTitle option was removed (modify emscripten_set_window_title in JS)");

assert(typeof Module["TOTAL_MEMORY"] == "undefined", "Module.TOTAL_MEMORY has been renamed Module.INITIAL_MEMORY");

legacyModuleProp("asm", "wasmExports");

legacyModuleProp("read", "read_");

legacyModuleProp("readAsync", "readAsync");

legacyModuleProp("readBinary", "readBinary");

legacyModuleProp("setWindowTitle", "setWindowTitle");

var IDBFS = "IDBFS is no longer included by default; build with -lidbfs.js";

var PROXYFS = "PROXYFS is no longer included by default; build with -lproxyfs.js";

var WORKERFS = "WORKERFS is no longer included by default; build with -lworkerfs.js";

var FETCHFS = "FETCHFS is no longer included by default; build with -lfetchfs.js";

var ICASEFS = "ICASEFS is no longer included by default; build with -licasefs.js";

var JSFILEFS = "JSFILEFS is no longer included by default; build with -ljsfilefs.js";

var OPFS = "OPFS is no longer included by default; build with -lopfs.js";

var NODEFS = "NODEFS is no longer included by default; build with -lnodefs.js";

assert(ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER || ENVIRONMENT_IS_NODE, "Pthreads do not work in this environment yet (need Web Workers, or an alternative to them)");

assert(!ENVIRONMENT_IS_SHELL, "shell environment detected but not enabled at build time.  Add 'shell' to `-sENVIRONMENT` to enable.");

var wasmBinary;

if (Module["wasmBinary"]) wasmBinary = Module["wasmBinary"];

legacyModuleProp("wasmBinary", "wasmBinary");

if (typeof WebAssembly != "object") {
 abort("no native wasm support detected");
}

function intArrayFromBase64(s) {
 if (typeof ENVIRONMENT_IS_NODE != "undefined" && ENVIRONMENT_IS_NODE) {
  var buf = Buffer.from(s, "base64");
  return new Uint8Array(buf.buffer, buf.byteOffset, buf.length);
 }
 var decoded = atob(s);
 var bytes = new Uint8Array(decoded.length);
 for (var i = 0; i < decoded.length; ++i) {
  bytes[i] = decoded.charCodeAt(i);
 }
 return bytes;
}

function tryParseAsDataURI(filename) {
 if (!isDataURI(filename)) {
  return;
 }
 return intArrayFromBase64(filename.slice(dataURIPrefix.length));
}

var wasmMemory;

var wasmModule;

var ABORT = false;

var EXITSTATUS;

/** @type {function(*, string=)} */ function assert(condition, text) {
 if (!condition) {
  abort("Assertion failed" + (text ? ": " + text : ""));
 }
}

var HEAP, /** @type {!Int8Array} */ HEAP8, /** @type {!Uint8Array} */ HEAPU8, /** @type {!Int16Array} */ HEAP16, /** @type {!Uint16Array} */ HEAPU16, /** @type {!Int32Array} */ HEAP32, /** @type {!Uint32Array} */ HEAPU32, /** @type {!Float32Array} */ HEAPF32, /** @type {!Float64Array} */ HEAPF64;

function updateMemoryViews() {
 var b = wasmMemory.buffer;
 Module["HEAP8"] = HEAP8 = new Int8Array(b);
 Module["HEAP16"] = HEAP16 = new Int16Array(b);
 Module["HEAPU8"] = HEAPU8 = new Uint8Array(b);
 Module["HEAPU16"] = HEAPU16 = new Uint16Array(b);
 Module["HEAP32"] = HEAP32 = new Int32Array(b);
 Module["HEAPU32"] = HEAPU32 = new Uint32Array(b);
 Module["HEAPF32"] = HEAPF32 = new Float32Array(b);
 Module["HEAPF64"] = HEAPF64 = new Float64Array(b);
}

assert(!Module["STACK_SIZE"], "STACK_SIZE can no longer be set at runtime.  Use -sSTACK_SIZE at link time");

assert(typeof Int32Array != "undefined" && typeof Float64Array !== "undefined" && Int32Array.prototype.subarray != undefined && Int32Array.prototype.set != undefined, "JS engine does not provide full typed array support");

var INITIAL_MEMORY = Module["INITIAL_MEMORY"] || 16777216;

legacyModuleProp("INITIAL_MEMORY", "INITIAL_MEMORY");

assert(INITIAL_MEMORY >= 65536, "INITIAL_MEMORY should be larger than STACK_SIZE, was " + INITIAL_MEMORY + "! (STACK_SIZE=" + 65536 + ")");

if (ENVIRONMENT_IS_PTHREAD) {
 wasmMemory = Module["wasmMemory"];
} else {
 if (Module["wasmMemory"]) {
  wasmMemory = Module["wasmMemory"];
 } else {
  wasmMemory = new WebAssembly.Memory({
   "initial": INITIAL_MEMORY / 65536,
   "maximum": 2147483648 / 65536,
   "shared": true
  });
  if (!(wasmMemory.buffer instanceof SharedArrayBuffer)) {
   err("requested a shared WebAssembly.Memory but the returned buffer is not a SharedArrayBuffer, indicating that while the browser has SharedArrayBuffer it does not have WebAssembly threads support - you may need to set a flag");
   if (ENVIRONMENT_IS_NODE) {
    err("(on node you may need: --experimental-wasm-threads --experimental-wasm-bulk-memory and/or recent version)");
   }
   throw Error("bad memory");
  }
 }
}

updateMemoryViews();

INITIAL_MEMORY = wasmMemory.buffer.byteLength;

assert(INITIAL_MEMORY % 65536 === 0);

function writeStackCookie() {
 var max = _emscripten_stack_get_end();
 assert((max & 3) == 0);
 if (max == 0) {
  max += 4;
 }
 GROWABLE_HEAP_U32()[((max) >> 2)] = 34821223;
 GROWABLE_HEAP_U32()[(((max) + (4)) >> 2)] = 2310721022;
 GROWABLE_HEAP_U32()[((0) >> 2)] = 1668509029;
}

function checkStackCookie() {
 if (ABORT) return;
 var max = _emscripten_stack_get_end();
 if (max == 0) {
  max += 4;
 }
 var cookie1 = GROWABLE_HEAP_U32()[((max) >> 2)];
 var cookie2 = GROWABLE_HEAP_U32()[(((max) + (4)) >> 2)];
 if (cookie1 != 34821223 || cookie2 != 2310721022) {
  abort(`Stack overflow! Stack cookie has been overwritten at ${ptrToString(max)}, expected hex dwords 0x89BACDFE and 0x2135467, but received ${ptrToString(cookie2)} ${ptrToString(cookie1)}`);
 }
 if (GROWABLE_HEAP_U32()[((0) >> 2)] != 1668509029) /* 'emsc' */ {
  abort("Runtime error: The application has corrupted its heap memory area (address zero)!");
 }
}

(function() {
 var h16 = new Int16Array(1);
 var h8 = new Int8Array(h16.buffer);
 h16[0] = 25459;
 if (h8[0] !== 115 || h8[1] !== 99) throw "Runtime error: expected the system to be little-endian! (Run with -sSUPPORT_BIG_ENDIAN to bypass)";
})();

var __ATPRERUN__ = [];

var __ATINIT__ = [];

var __ATMAIN__ = [];

var __ATEXIT__ = [];

var __ATPOSTRUN__ = [];

var runtimeInitialized = false;

function preRun() {
 assert(!ENVIRONMENT_IS_PTHREAD);
 if (Module["preRun"]) {
  if (typeof Module["preRun"] == "function") Module["preRun"] = [ Module["preRun"] ];
  while (Module["preRun"].length) {
   addOnPreRun(Module["preRun"].shift());
  }
 }
 callRuntimeCallbacks(__ATPRERUN__);
}

function initRuntime() {
 assert(!runtimeInitialized);
 runtimeInitialized = true;
 if (ENVIRONMENT_IS_PTHREAD) return;
 checkStackCookie();
 if (!Module["noFSInit"] && !FS.init.initialized) FS.init();
 FS.ignorePermissions = false;
 TTY.init();
 SOCKFS.root = FS.mount(SOCKFS, {}, null);
 callRuntimeCallbacks(__ATINIT__);
}

function preMain() {
 checkStackCookie();
 if (ENVIRONMENT_IS_PTHREAD) return;
 callRuntimeCallbacks(__ATMAIN__);
}

function postRun() {
 checkStackCookie();
 if (ENVIRONMENT_IS_PTHREAD) return;
 if (Module["postRun"]) {
  if (typeof Module["postRun"] == "function") Module["postRun"] = [ Module["postRun"] ];
  while (Module["postRun"].length) {
   addOnPostRun(Module["postRun"].shift());
  }
 }
 callRuntimeCallbacks(__ATPOSTRUN__);
}

function addOnPreRun(cb) {
 __ATPRERUN__.unshift(cb);
}

function addOnInit(cb) {
 __ATINIT__.unshift(cb);
}

function addOnPreMain(cb) {
 __ATMAIN__.unshift(cb);
}

function addOnExit(cb) {}

function addOnPostRun(cb) {
 __ATPOSTRUN__.unshift(cb);
}

assert(Math.imul, "This browser does not support Math.imul(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill");

assert(Math.fround, "This browser does not support Math.fround(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill");

assert(Math.clz32, "This browser does not support Math.clz32(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill");

assert(Math.trunc, "This browser does not support Math.trunc(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill");

var runDependencies = 0;

var runDependencyWatcher = null;

var dependenciesFulfilled = null;

var runDependencyTracking = {};

function getUniqueRunDependency(id) {
 var orig = id;
 while (1) {
  if (!runDependencyTracking[id]) return id;
  id = orig + Math.random();
 }
}

function addRunDependency(id) {
 runDependencies++;
 if (Module["monitorRunDependencies"]) {
  Module["monitorRunDependencies"](runDependencies);
 }
 if (id) {
  assert(!runDependencyTracking[id]);
  runDependencyTracking[id] = 1;
  if (runDependencyWatcher === null && typeof setInterval != "undefined") {
   runDependencyWatcher = setInterval(() => {
    if (ABORT) {
     clearInterval(runDependencyWatcher);
     runDependencyWatcher = null;
     return;
    }
    var shown = false;
    for (var dep in runDependencyTracking) {
     if (!shown) {
      shown = true;
      err("still waiting on run dependencies:");
     }
     err(`dependency: ${dep}`);
    }
    if (shown) {
     err("(end of list)");
    }
   }, 1e4);
  }
 } else {
  err("warning: run dependency added without ID");
 }
}

function removeRunDependency(id) {
 runDependencies--;
 if (Module["monitorRunDependencies"]) {
  Module["monitorRunDependencies"](runDependencies);
 }
 if (id) {
  assert(runDependencyTracking[id]);
  delete runDependencyTracking[id];
 } else {
  err("warning: run dependency removed without ID");
 }
 if (runDependencies == 0) {
  if (runDependencyWatcher !== null) {
   clearInterval(runDependencyWatcher);
   runDependencyWatcher = null;
  }
  if (dependenciesFulfilled) {
   var callback = dependenciesFulfilled;
   dependenciesFulfilled = null;
   callback();
  }
 }
}

/** @param {string|number=} what */ function abort(what) {
 if (Module["onAbort"]) {
  Module["onAbort"](what);
 }
 what = "Aborted(" + what + ")";
 err(what);
 ABORT = true;
 EXITSTATUS = 1;
 /** @suppress {checkTypes} */ var e = new WebAssembly.RuntimeError(what);
 throw e;
}

var dataURIPrefix = "data:application/octet-stream;base64,";

/**
 * Indicates whether filename is a base64 data URI.
 * @noinline
 */ var isDataURI = filename => filename.startsWith(dataURIPrefix);

/**
 * Indicates whether filename is delivered via file protocol (as opposed to http/https)
 * @noinline
 */ var isFileURI = filename => filename.startsWith("file://");

function createExportWrapper(name) {
 return function() {
  assert(runtimeInitialized, `native function \`${name}\` called before runtime initialization`);
  var f = wasmExports[name];
  assert(f, `exported native function \`${name}\` not found`);
  return f.apply(null, arguments);
 };
}

var wasmBinaryFile;

wasmBinaryFile = "reminecraftpe.wasm";

if (!isDataURI(wasmBinaryFile)) {
 wasmBinaryFile = locateFile(wasmBinaryFile);
}

function getBinarySync(file) {
 if (file == wasmBinaryFile && wasmBinary) {
  return new Uint8Array(wasmBinary);
 }
 if (readBinary) {
  return readBinary(file);
 }
 throw "both async and sync fetching of the wasm failed";
}

function getBinaryPromise(binaryFile) {
 if (!wasmBinary && (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER)) {
  if (typeof fetch == "function" && !isFileURI(binaryFile)) {
   return fetch(binaryFile, {
    credentials: "same-origin"
   }).then(response => {
    if (!response["ok"]) {
     throw "failed to load wasm binary file at '" + binaryFile + "'";
    }
    return response["arrayBuffer"]();
   }).catch(() => getBinarySync(binaryFile));
  } else if (readAsync) {
   return new Promise((resolve, reject) => {
    readAsync(binaryFile, response => resolve(new Uint8Array(/** @type{!ArrayBuffer} */ (response))), reject);
   });
  }
 }
 return Promise.resolve().then(() => getBinarySync(binaryFile));
}

function instantiateArrayBuffer(binaryFile, imports, receiver) {
 return getBinaryPromise(binaryFile).then(binary => WebAssembly.instantiate(binary, imports)).then(instance => instance).then(receiver, reason => {
  err(`failed to asynchronously prepare wasm: ${reason}`);
  if (isFileURI(wasmBinaryFile)) {
   err(`warning: Loading from a file URI (${wasmBinaryFile}) is not supported in most browsers. See https://emscripten.org/docs/getting_started/FAQ.html#how-do-i-run-a-local-webserver-for-testing-why-does-my-program-stall-in-downloading-or-preparing`);
  }
  abort(reason);
 });
}

function instantiateAsync(binary, binaryFile, imports, callback) {
 if (!binary && typeof WebAssembly.instantiateStreaming == "function" && !isDataURI(binaryFile) &&  !isFileURI(binaryFile) &&  !ENVIRONMENT_IS_NODE && typeof fetch == "function") {
  return fetch(binaryFile, {
   credentials: "same-origin"
  }).then(response => {
   /** @suppress {checkTypes} */ var result = WebAssembly.instantiateStreaming(response, imports);
   return result.then(callback, function(reason) {
    err(`wasm streaming compile failed: ${reason}`);
    err("falling back to ArrayBuffer instantiation");
    return instantiateArrayBuffer(binaryFile, imports, callback);
   });
  });
 }
 return instantiateArrayBuffer(binaryFile, imports, callback);
}

function createWasm() {
 var info = {
  "env": wasmImports,
  "wasi_snapshot_preview1": wasmImports
 };
 /** @param {WebAssembly.Module=} module*/ function receiveInstance(instance, module) {
  wasmExports = instance.exports;
  registerTLSInit(wasmExports["_emscripten_tls_init"]);
  wasmTable = wasmExports["__indirect_function_table"];
  assert(wasmTable, "table not found in wasm exports");
  addOnInit(wasmExports["__wasm_call_ctors"]);
  wasmModule = module;
  removeRunDependency("wasm-instantiate");
  return wasmExports;
 }
 addRunDependency("wasm-instantiate");
 var trueModule = Module;
 function receiveInstantiationResult(result) {
  assert(Module === trueModule, "the Module object should not be replaced during async compilation - perhaps the order of HTML elements is wrong?");
  trueModule = null;
  receiveInstance(result["instance"], result["module"]);
 }
 if (Module["instantiateWasm"]) {
  try {
   return Module["instantiateWasm"](info, receiveInstance);
  } catch (e) {
   err(`Module.instantiateWasm callback failed with error: ${e}`);
   return false;
  }
 }
 instantiateAsync(wasmBinary, wasmBinaryFile, info, receiveInstantiationResult);
 return {};
}

var tempDouble;

var tempI64;

function legacyModuleProp(prop, newName, incomming = true) {
 if (!Object.getOwnPropertyDescriptor(Module, prop)) {
  Object.defineProperty(Module, prop, {
   configurable: true,
   get() {
    let extra = incomming ? " (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)" : "";
    abort(`\`Module.${prop}\` has been replaced by \`${newName}\`` + extra);
   }
  });
 }
}

function ignoredModuleProp(prop) {
 if (Object.getOwnPropertyDescriptor(Module, prop)) {
  abort(`\`Module.${prop}\` was supplied but \`${prop}\` not included in INCOMING_MODULE_JS_API`);
 }
}

function isExportedByForceFilesystem(name) {
 return name === "FS_createPath" || name === "FS_createDataFile" || name === "FS_createPreloadedFile" || name === "FS_unlink" || name === "addRunDependency" ||  name === "FS_createLazyFile" || name === "FS_createDevice" || name === "removeRunDependency";
}

function missingGlobal(sym, msg) {
 if (typeof globalThis !== "undefined") {
  Object.defineProperty(globalThis, sym, {
   configurable: true,
   get() {
    warnOnce("`" + sym + "` is not longer defined by emscripten. " + msg);
    return undefined;
   }
  });
 }
}

missingGlobal("buffer", "Please use HEAP8.buffer or wasmMemory.buffer");

missingGlobal("asm", "Please use wasmExports instead");

function missingLibrarySymbol(sym) {
 if (typeof globalThis !== "undefined" && !Object.getOwnPropertyDescriptor(globalThis, sym)) {
  Object.defineProperty(globalThis, sym, {
   configurable: true,
   get() {
    var msg = "`" + sym + "` is a library symbol and not included by default; add it to your library.js __deps or to DEFAULT_LIBRARY_FUNCS_TO_INCLUDE on the command line";
    var librarySymbol = sym;
    if (!librarySymbol.startsWith("_")) {
     librarySymbol = "$" + sym;
    }
    msg += " (e.g. -sDEFAULT_LIBRARY_FUNCS_TO_INCLUDE='" + librarySymbol + "')";
    if (isExportedByForceFilesystem(sym)) {
     msg += ". Alternatively, forcing filesystem support (-sFORCE_FILESYSTEM) can export this for you";
    }
    warnOnce(msg);
    return undefined;
   }
  });
 }
 unexportedRuntimeSymbol(sym);
}

function unexportedRuntimeSymbol(sym) {
 if (!Object.getOwnPropertyDescriptor(Module, sym)) {
  Object.defineProperty(Module, sym, {
   configurable: true,
   get() {
    var msg = "'" + sym + "' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the Emscripten FAQ)";
    if (isExportedByForceFilesystem(sym)) {
     msg += ". Alternatively, forcing filesystem support (-sFORCE_FILESYSTEM) can export this for you";
    }
    abort(msg);
   }
  });
 }
}

function dbg(text) {
 if (ENVIRONMENT_IS_NODE) {
  fs.writeSync(2, Array.from(arguments).join(" ") + "\n");
 } else  console.warn.apply(console, arguments);
}

var ASM_CONSTS = {
 1301392: $0 => {
  var str = UTF8ToString($0) + "\n\n" + "Abort/Retry/Ignore/AlwaysIgnore? [ariA] :";
  var reply = window.prompt(str, "i");
  if (reply === null) {
   reply = "i";
  }
  return allocate(intArrayFromString(reply), "i8", ALLOC_NORMAL);
 },
 1301617: () => {
  if (typeof (AudioContext) !== "undefined") {
   return true;
  } else if (typeof (webkitAudioContext) !== "undefined") {
   return true;
  }
  return false;
 },
 1301764: () => {
  if ((typeof (navigator.mediaDevices) !== "undefined") && (typeof (navigator.mediaDevices.getUserMedia) !== "undefined")) {
   return true;
  } else if (typeof (navigator.webkitGetUserMedia) !== "undefined") {
   return true;
  }
  return false;
 },
 1301998: $0 => {
  if (typeof (Module["SDL2"]) === "undefined") {
   Module["SDL2"] = {};
  }
  var SDL2 = Module["SDL2"];
  if (!$0) {
   SDL2.audio = {};
  } else {
   SDL2.capture = {};
  }
  if (!SDL2.audioContext) {
   if (typeof (AudioContext) !== "undefined") {
    SDL2.audioContext = new AudioContext;
   } else if (typeof (webkitAudioContext) !== "undefined") {
    SDL2.audioContext = new webkitAudioContext;
   }
   if (SDL2.audioContext) {
    autoResumeAudioContext(SDL2.audioContext);
   }
  }
  return SDL2.audioContext === undefined ? -1 : 0;
 },
 1302491: () => {
  var SDL2 = Module["SDL2"];
  return SDL2.audioContext.sampleRate;
 },
 1302559: ($0, $1, $2, $3) => {
  var SDL2 = Module["SDL2"];
  var have_microphone = function(stream) {
   if (SDL2.capture.silenceTimer !== undefined) {
    clearTimeout(SDL2.capture.silenceTimer);
    SDL2.capture.silenceTimer = undefined;
   }
   SDL2.capture.mediaStreamNode = SDL2.audioContext.createMediaStreamSource(stream);
   SDL2.capture.scriptProcessorNode = SDL2.audioContext.createScriptProcessor($1, $0, 1);
   SDL2.capture.scriptProcessorNode.onaudioprocess = function(audioProcessingEvent) {
    if ((SDL2 === undefined) || (SDL2.capture === undefined)) {
     return;
    }
    audioProcessingEvent.outputBuffer.getChannelData(0).fill(0);
    SDL2.capture.currentCaptureBuffer = audioProcessingEvent.inputBuffer;
    dynCall("vi", $2, [ $3 ]);
   };
   SDL2.capture.mediaStreamNode.connect(SDL2.capture.scriptProcessorNode);
   SDL2.capture.scriptProcessorNode.connect(SDL2.audioContext.destination);
   SDL2.capture.stream = stream;
  };
  var no_microphone = function(error) {};
  SDL2.capture.silenceBuffer = SDL2.audioContext.createBuffer($0, $1, SDL2.audioContext.sampleRate);
  SDL2.capture.silenceBuffer.getChannelData(0).fill(0);
  var silence_callback = function() {
   SDL2.capture.currentCaptureBuffer = SDL2.capture.silenceBuffer;
   dynCall("vi", $2, [ $3 ]);
  };
  SDL2.capture.silenceTimer = setTimeout(silence_callback, ($1 / SDL2.audioContext.sampleRate) * 1e3);
  if ((navigator.mediaDevices !== undefined) && (navigator.mediaDevices.getUserMedia !== undefined)) {
   navigator.mediaDevices.getUserMedia({
    audio: true,
    video: false
   }).then(have_microphone).catch(no_microphone);
  } else if (navigator.webkitGetUserMedia !== undefined) {
   navigator.webkitGetUserMedia({
    audio: true,
    video: false
   }, have_microphone, no_microphone);
  }
 },
 1304211: ($0, $1, $2, $3) => {
  var SDL2 = Module["SDL2"];
  SDL2.audio.scriptProcessorNode = SDL2.audioContext["createScriptProcessor"]($1, 0, $0);
  SDL2.audio.scriptProcessorNode["onaudioprocess"] = function(e) {
   if ((SDL2 === undefined) || (SDL2.audio === undefined)) {
    return;
   }
   SDL2.audio.currentOutputBuffer = e["outputBuffer"];
   dynCall("vi", $2, [ $3 ]);
  };
  SDL2.audio.scriptProcessorNode["connect"](SDL2.audioContext["destination"]);
 },
 1304621: ($0, $1) => {
  var SDL2 = Module["SDL2"];
  var numChannels = SDL2.capture.currentCaptureBuffer.numberOfChannels;
  for (var c = 0; c < numChannels; ++c) {
   var channelData = SDL2.capture.currentCaptureBuffer.getChannelData(c);
   if (channelData.length != $1) {
    throw "Web Audio capture buffer length mismatch! Destination size: " + channelData.length + " samples vs expected " + $1 + " samples!";
   }
   if (numChannels == 1) {
    for (var j = 0; j < $1; ++j) {
     setValue($0 + (j * 4), channelData[j], "float");
    }
   } else {
    for (var j = 0; j < $1; ++j) {
     setValue($0 + (((j * numChannels) + c) * 4), channelData[j], "float");
    }
   }
  }
 },
 1305226: ($0, $1) => {
  var SDL2 = Module["SDL2"];
  var numChannels = SDL2.audio.currentOutputBuffer["numberOfChannels"];
  for (var c = 0; c < numChannels; ++c) {
   var channelData = SDL2.audio.currentOutputBuffer["getChannelData"](c);
   if (channelData.length != $1) {
    throw "Web Audio output buffer length mismatch! Destination size: " + channelData.length + " samples vs expected " + $1 + " samples!";
   }
   for (var j = 0; j < $1; ++j) {
    channelData[j] = GROWABLE_HEAP_F32()[$0 + ((j * numChannels + c) << 2) >> 2];
   }
  }
 },
 1305706: $0 => {
  var SDL2 = Module["SDL2"];
  if ($0) {
   if (SDL2.capture.silenceTimer !== undefined) {
    clearTimeout(SDL2.capture.silenceTimer);
   }
   if (SDL2.capture.stream !== undefined) {
    var tracks = SDL2.capture.stream.getAudioTracks();
    for (var i = 0; i < tracks.length; i++) {
     SDL2.capture.stream.removeTrack(tracks[i]);
    }
    SDL2.capture.stream = undefined;
   }
   if (SDL2.capture.scriptProcessorNode !== undefined) {
    SDL2.capture.scriptProcessorNode.onaudioprocess = function(audioProcessingEvent) {};
    SDL2.capture.scriptProcessorNode.disconnect();
    SDL2.capture.scriptProcessorNode = undefined;
   }
   if (SDL2.capture.mediaStreamNode !== undefined) {
    SDL2.capture.mediaStreamNode.disconnect();
    SDL2.capture.mediaStreamNode = undefined;
   }
   if (SDL2.capture.silenceBuffer !== undefined) {
    SDL2.capture.silenceBuffer = undefined;
   }
   SDL2.capture = undefined;
  } else {
   if (SDL2.audio.scriptProcessorNode != undefined) {
    SDL2.audio.scriptProcessorNode.disconnect();
    SDL2.audio.scriptProcessorNode = undefined;
   }
   SDL2.audio = undefined;
  }
  if ((SDL2.audioContext !== undefined) && (SDL2.audio === undefined) && (SDL2.capture === undefined)) {
   SDL2.audioContext.close();
   SDL2.audioContext = undefined;
  }
 },
 1306878: ($0, $1, $2) => {
  var w = $0;
  var h = $1;
  var pixels = $2;
  if (!Module["SDL2"]) Module["SDL2"] = {};
  var SDL2 = Module["SDL2"];
  if (SDL2.ctxCanvas !== Module["canvas"]) {
   SDL2.ctx = Module["createContext"](Module["canvas"], false, true);
   SDL2.ctxCanvas = Module["canvas"];
  }
  if (SDL2.w !== w || SDL2.h !== h || SDL2.imageCtx !== SDL2.ctx) {
   SDL2.image = SDL2.ctx.createImageData(w, h);
   SDL2.w = w;
   SDL2.h = h;
   SDL2.imageCtx = SDL2.ctx;
  }
  var data = SDL2.image.data;
  var src = pixels >> 2;
  var dst = 0;
  var num;
  if (typeof CanvasPixelArray !== "undefined" && data instanceof CanvasPixelArray) {
   num = data.length;
   while (dst < num) {
    var val = GROWABLE_HEAP_I32()[src];
    data[dst] = val & 255;
    data[dst + 1] = (val >> 8) & 255;
    data[dst + 2] = (val >> 16) & 255;
    data[dst + 3] = 255;
    src++;
    dst += 4;
   }
  } else {
   if (SDL2.data32Data !== data) {
    SDL2.data32 = new Int32Array(data.buffer);
    SDL2.data8 = new Uint8Array(data.buffer);
    SDL2.data32Data = data;
   }
   var data32 = SDL2.data32;
   num = data32.length;
   data32.set(GROWABLE_HEAP_I32().subarray(src, src + num));
   var data8 = SDL2.data8;
   var i = 3;
   var j = i + 4 * num;
   if (num % 8 == 0) {
    while (i < j) {
     data8[i] = 255;
     i = i + 4 | 0;
     data8[i] = 255;
     i = i + 4 | 0;
     data8[i] = 255;
     i = i + 4 | 0;
     data8[i] = 255;
     i = i + 4 | 0;
     data8[i] = 255;
     i = i + 4 | 0;
     data8[i] = 255;
     i = i + 4 | 0;
     data8[i] = 255;
     i = i + 4 | 0;
     data8[i] = 255;
     i = i + 4 | 0;
    }
   } else {
    while (i < j) {
     data8[i] = 255;
     i = i + 4 | 0;
    }
   }
  }
  SDL2.ctx.putImageData(SDL2.image, 0, 0);
 },
 1308347: ($0, $1, $2, $3, $4) => {
  var w = $0;
  var h = $1;
  var hot_x = $2;
  var hot_y = $3;
  var pixels = $4;
  var canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  var ctx = canvas.getContext("2d");
  var image = ctx.createImageData(w, h);
  var data = image.data;
  var src = pixels >> 2;
  var dst = 0;
  var num;
  if (typeof CanvasPixelArray !== "undefined" && data instanceof CanvasPixelArray) {
   num = data.length;
   while (dst < num) {
    var val = GROWABLE_HEAP_I32()[src];
    data[dst] = val & 255;
    data[dst + 1] = (val >> 8) & 255;
    data[dst + 2] = (val >> 16) & 255;
    data[dst + 3] = (val >> 24) & 255;
    src++;
    dst += 4;
   }
  } else {
   var data32 = new Int32Array(data.buffer);
   num = data32.length;
   data32.set(GROWABLE_HEAP_I32().subarray(src, src + num));
  }
  ctx.putImageData(image, 0, 0);
  var url = hot_x === 0 && hot_y === 0 ? "url(" + canvas.toDataURL() + "), auto" : "url(" + canvas.toDataURL() + ") " + hot_x + " " + hot_y + ", auto";
  var urlBuf = _malloc(url.length + 1);
  stringToUTF8(url, urlBuf, url.length + 1);
  return urlBuf;
 },
 1309336: $0 => {
  if (Module["canvas"]) {
   Module["canvas"].style["cursor"] = UTF8ToString($0);
  }
 },
 1309419: () => {
  if (Module["canvas"]) {
   Module["canvas"].style["cursor"] = "none";
  }
 },
 1309488: () => window.innerWidth,
 1309518: () => window.innerHeight,
 1309549: ($0, $1) => {
  alert(UTF8ToString($0) + "\n\n" + UTF8ToString($1));
 }
};

var runtimeKeepaliveCounter = 0;

var runtimeKeepalivePush = () => {
 runtimeKeepaliveCounter += 1;
};

var _emscripten_set_main_loop_timing = (mode, value) => {
 Browser.mainLoop.timingMode = mode;
 Browser.mainLoop.timingValue = value;
 if (!Browser.mainLoop.func) {
  err("emscripten_set_main_loop_timing: Cannot set timing mode for main loop since a main loop does not exist! Call emscripten_set_main_loop first to set one up.");
  return 1;
 }
 if (!Browser.mainLoop.running) {
  runtimeKeepalivePush();
  Browser.mainLoop.running = true;
 }
 if (mode == 0) {
  Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler_setTimeout() {
   var timeUntilNextTick = Math.max(0, Browser.mainLoop.tickStartTime + value - _emscripten_get_now()) | 0;
   setTimeout(Browser.mainLoop.runner, timeUntilNextTick);
  };
  Browser.mainLoop.method = "timeout";
 } else if (mode == 1) {
  Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler_rAF() {
   Browser.requestAnimationFrame(Browser.mainLoop.runner);
  };
  Browser.mainLoop.method = "rAF";
 } else if (mode == 2) {
  if (typeof Browser.setImmediate == "undefined") {
   if (typeof setImmediate == "undefined") {
    var setImmediates = [];
    var emscriptenMainLoopMessageId = "setimmediate";
    /** @param {Event} event */ var Browser_setImmediate_messageHandler = event => {
     if (event.data === emscriptenMainLoopMessageId || event.data.target === emscriptenMainLoopMessageId) {
      event.stopPropagation();
      setImmediates.shift()();
     }
    };
    addEventListener("message", Browser_setImmediate_messageHandler, true);
    Browser.setImmediate = /** @type{function(function(): ?, ...?): number} */ (function Browser_emulated_setImmediate(func) {
     setImmediates.push(func);
     if (ENVIRONMENT_IS_WORKER) {
      if (Module["setImmediates"] === undefined) Module["setImmediates"] = [];
      Module["setImmediates"].push(func);
      postMessage({
       target: emscriptenMainLoopMessageId
      });
     } else postMessage(emscriptenMainLoopMessageId, "*");
    });
   } else {
    Browser.setImmediate = setImmediate;
   }
  }
  Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler_setImmediate() {
   Browser.setImmediate(Browser.mainLoop.runner);
  };
  Browser.mainLoop.method = "immediate";
 }
 return 0;
};

var _emscripten_get_now;

_emscripten_get_now = () => performance.timeOrigin + performance.now();

var runtimeKeepalivePop = () => {
 assert(runtimeKeepaliveCounter > 0);
 runtimeKeepaliveCounter -= 1;
};

/**
     * @param {number=} arg
     * @param {boolean=} noSetTiming
     */ var setMainLoop = (browserIterationFunc, fps, simulateInfiniteLoop, arg, noSetTiming) => {
 assert(!Browser.mainLoop.func, "emscripten_set_main_loop: there can only be one main loop function at once: call emscripten_cancel_main_loop to cancel the previous one before setting a new one with different parameters.");
 Browser.mainLoop.func = browserIterationFunc;
 Browser.mainLoop.arg = arg;
 /** @type{number} */ var thisMainLoopId = (() => Browser.mainLoop.currentlyRunningMainloop)();
 function checkIsRunning() {
  if (thisMainLoopId < Browser.mainLoop.currentlyRunningMainloop) {
   runtimeKeepalivePop();
   return false;
  }
  return true;
 }
 Browser.mainLoop.running = false;
 Browser.mainLoop.runner = function Browser_mainLoop_runner() {
  if (ABORT) return;
  if (Browser.mainLoop.queue.length > 0) {
   var start = Date.now();
   var blocker = Browser.mainLoop.queue.shift();
   blocker.func(blocker.arg);
   if (Browser.mainLoop.remainingBlockers) {
    var remaining = Browser.mainLoop.remainingBlockers;
    var next = remaining % 1 == 0 ? remaining - 1 : Math.floor(remaining);
    if (blocker.counted) {
     Browser.mainLoop.remainingBlockers = next;
    } else {
     next = next + .5;
     Browser.mainLoop.remainingBlockers = (8 * remaining + next) / 9;
    }
   }
   Browser.mainLoop.updateStatus();
   if (!checkIsRunning()) return;
   setTimeout(Browser.mainLoop.runner, 0);
   return;
  }
  if (!checkIsRunning()) return;
  Browser.mainLoop.currentFrameNumber = Browser.mainLoop.currentFrameNumber + 1 | 0;
  if (Browser.mainLoop.timingMode == 1 && Browser.mainLoop.timingValue > 1 && Browser.mainLoop.currentFrameNumber % Browser.mainLoop.timingValue != 0) {
   Browser.mainLoop.scheduler();
   return;
  } else if (Browser.mainLoop.timingMode == 0) {
   Browser.mainLoop.tickStartTime = _emscripten_get_now();
  }
  if (Browser.mainLoop.method === "timeout" && Module.ctx) {
   warnOnce("Looks like you are rendering without using requestAnimationFrame for the main loop. You should use 0 for the frame rate in emscripten_set_main_loop in order to use requestAnimationFrame, as that can greatly improve your frame rates!");
   Browser.mainLoop.method = "";
  }
  Browser.mainLoop.runIter(browserIterationFunc);
  checkStackCookie();
  if (!checkIsRunning()) return;
  if (typeof SDL == "object" && SDL.audio && SDL.audio.queueNewAudioData) SDL.audio.queueNewAudioData();
  Browser.mainLoop.scheduler();
 };
 if (!noSetTiming) {
  if (fps && fps > 0) {
   _emscripten_set_main_loop_timing(0, 1e3 / fps);
  } else {
   _emscripten_set_main_loop_timing(1, 1);
  }
  Browser.mainLoop.scheduler();
 }
 if (simulateInfiniteLoop) {
  throw "unwind";
 }
};

var handleException = e => {
 if (e instanceof ExitStatus || e == "unwind") {
  return EXITSTATUS;
 }
 checkStackCookie();
 if (e instanceof WebAssembly.RuntimeError) {
  if (_emscripten_stack_get_current() <= 0) {
   err("Stack overflow detected.  You can try increasing -sSTACK_SIZE (currently set to 65536)");
  }
 }
 quit_(1, e);
};

/** @constructor */ function ExitStatus(status) {
 this.name = "ExitStatus";
 this.message = `Program terminated with exit(${status})`;
 this.status = status;
}

var keepRuntimeAlive = () => noExitRuntime || runtimeKeepaliveCounter > 0;

var PATH = {
 isAbs: path => path.charAt(0) === "/",
 splitPath: filename => {
  var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
  return splitPathRe.exec(filename).slice(1);
 },
 normalizeArray: (parts, allowAboveRoot) => {
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
   var last = parts[i];
   if (last === ".") {
    parts.splice(i, 1);
   } else if (last === "..") {
    parts.splice(i, 1);
    up++;
   } else if (up) {
    parts.splice(i, 1);
    up--;
   }
  }
  if (allowAboveRoot) {
   for (;up; up--) {
    parts.unshift("..");
   }
  }
  return parts;
 },
 normalize: path => {
  var isAbsolute = PATH.isAbs(path), trailingSlash = path.substr(-1) === "/";
  path = PATH.normalizeArray(path.split("/").filter(p => !!p), !isAbsolute).join("/");
  if (!path && !isAbsolute) {
   path = ".";
  }
  if (path && trailingSlash) {
   path += "/";
  }
  return (isAbsolute ? "/" : "") + path;
 },
 dirname: path => {
  var result = PATH.splitPath(path), root = result[0], dir = result[1];
  if (!root && !dir) {
   return ".";
  }
  if (dir) {
   dir = dir.substr(0, dir.length - 1);
  }
  return root + dir;
 },
 basename: path => {
  if (path === "/") return "/";
  path = PATH.normalize(path);
  path = path.replace(/\/$/, "");
  var lastSlash = path.lastIndexOf("/");
  if (lastSlash === -1) return path;
  return path.substr(lastSlash + 1);
 },
 join: function() {
  var paths = Array.prototype.slice.call(arguments);
  return PATH.normalize(paths.join("/"));
 },
 join2: (l, r) => PATH.normalize(l + "/" + r)
};

var initRandomFill = () => {
 if (typeof crypto == "object" && typeof crypto["getRandomValues"] == "function") {
  return view => (view.set(crypto.getRandomValues(new Uint8Array(view.byteLength))), 
  view);
 } else if (ENVIRONMENT_IS_NODE) {
  try {
   var crypto_module = require("crypto");
   var randomFillSync = crypto_module["randomFillSync"];
   if (randomFillSync) {
    return view => crypto_module["randomFillSync"](view);
   }
   var randomBytes = crypto_module["randomBytes"];
   return view => (view.set(randomBytes(view.byteLength)),  view);
  } catch (e) {}
 }
 abort("no cryptographic support found for randomDevice. consider polyfilling it if you want to use something insecure like Math.random(), e.g. put this in a --pre-js: var crypto = { getRandomValues: (array) => { for (var i = 0; i < array.length; i++) array[i] = (Math.random()*256)|0 } };");
};

var randomFill = view => (randomFill = initRandomFill())(view);

var PATH_FS = {
 resolve: function() {
  var resolvedPath = "", resolvedAbsolute = false;
  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
   var path = (i >= 0) ? arguments[i] : FS.cwd();
   if (typeof path != "string") {
    throw new TypeError("Arguments to path.resolve must be strings");
   } else if (!path) {
    return "";
   }
   resolvedPath = path + "/" + resolvedPath;
   resolvedAbsolute = PATH.isAbs(path);
  }
  resolvedPath = PATH.normalizeArray(resolvedPath.split("/").filter(p => !!p), !resolvedAbsolute).join("/");
  return ((resolvedAbsolute ? "/" : "") + resolvedPath) || ".";
 },
 relative: (from, to) => {
  from = PATH_FS.resolve(from).substr(1);
  to = PATH_FS.resolve(to).substr(1);
  function trim(arr) {
   var start = 0;
   for (;start < arr.length; start++) {
    if (arr[start] !== "") break;
   }
   var end = arr.length - 1;
   for (;end >= 0; end--) {
    if (arr[end] !== "") break;
   }
   if (start > end) return [];
   return arr.slice(start, end - start + 1);
  }
  var fromParts = trim(from.split("/"));
  var toParts = trim(to.split("/"));
  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
   if (fromParts[i] !== toParts[i]) {
    samePartsLength = i;
    break;
   }
  }
  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
   outputParts.push("..");
  }
  outputParts = outputParts.concat(toParts.slice(samePartsLength));
  return outputParts.join("/");
 }
};

var UTF8Decoder = typeof TextDecoder != "undefined" ? new TextDecoder("utf8") : undefined;

/**
     * Given a pointer 'idx' to a null-terminated UTF8-encoded string in the given
     * array that contains uint8 values, returns a copy of that string as a
     * Javascript String object.
     * heapOrArray is either a regular array, or a JavaScript typed array view.
     * @param {number} idx
     * @param {number=} maxBytesToRead
     * @return {string}
     */ var UTF8ArrayToString = (heapOrArray, idx, maxBytesToRead) => {
 var endIdx = idx + maxBytesToRead;
 var endPtr = idx;
 while (heapOrArray[endPtr] && !(endPtr >= endIdx)) ++endPtr;
 if (endPtr - idx > 16 && heapOrArray.buffer && UTF8Decoder) {
  return UTF8Decoder.decode(heapOrArray.buffer instanceof SharedArrayBuffer ? heapOrArray.slice(idx, endPtr) : heapOrArray.subarray(idx, endPtr));
 }
 var str = "";
 while (idx < endPtr) {
  var u0 = heapOrArray[idx++];
  if (!(u0 & 128)) {
   str += String.fromCharCode(u0);
   continue;
  }
  var u1 = heapOrArray[idx++] & 63;
  if ((u0 & 224) == 192) {
   str += String.fromCharCode(((u0 & 31) << 6) | u1);
   continue;
  }
  var u2 = heapOrArray[idx++] & 63;
  if ((u0 & 240) == 224) {
   u0 = ((u0 & 15) << 12) | (u1 << 6) | u2;
  } else {
   if ((u0 & 248) != 240) warnOnce("Invalid UTF-8 leading byte " + ptrToString(u0) + " encountered when deserializing a UTF-8 string in wasm memory to a JS string!");
   u0 = ((u0 & 7) << 18) | (u1 << 12) | (u2 << 6) | (heapOrArray[idx++] & 63);
  }
  if (u0 < 65536) {
   str += String.fromCharCode(u0);
  } else {
   var ch = u0 - 65536;
   str += String.fromCharCode(55296 | (ch >> 10), 56320 | (ch & 1023));
  }
 }
 return str;
};

var FS_stdin_getChar_buffer = [];

var lengthBytesUTF8 = str => {
 var len = 0;
 for (var i = 0; i < str.length; ++i) {
  var c = str.charCodeAt(i);
  if (c <= 127) {
   len++;
  } else if (c <= 2047) {
   len += 2;
  } else if (c >= 55296 && c <= 57343) {
   len += 4;
   ++i;
  } else {
   len += 3;
  }
 }
 return len;
};

var stringToUTF8Array = (str, heap, outIdx, maxBytesToWrite) => {
 assert(typeof str === "string", `stringToUTF8Array expects a string (got ${typeof str})`);
 if (!(maxBytesToWrite > 0)) return 0;
 var startIdx = outIdx;
 var endIdx = outIdx + maxBytesToWrite - 1;
 for (var i = 0; i < str.length; ++i) {
  var u = str.charCodeAt(i);
  if (u >= 55296 && u <= 57343) {
   var u1 = str.charCodeAt(++i);
   u = 65536 + ((u & 1023) << 10) | (u1 & 1023);
  }
  if (u <= 127) {
   if (outIdx >= endIdx) break;
   heap[outIdx++] = u;
  } else if (u <= 2047) {
   if (outIdx + 1 >= endIdx) break;
   heap[outIdx++] = 192 | (u >> 6);
   heap[outIdx++] = 128 | (u & 63);
  } else if (u <= 65535) {
   if (outIdx + 2 >= endIdx) break;
   heap[outIdx++] = 224 | (u >> 12);
   heap[outIdx++] = 128 | ((u >> 6) & 63);
   heap[outIdx++] = 128 | (u & 63);
  } else {
   if (outIdx + 3 >= endIdx) break;
   if (u > 1114111) warnOnce("Invalid Unicode code point " + ptrToString(u) + " encountered when serializing a JS string to a UTF-8 string in wasm memory! (Valid unicode code points should be in range 0-0x10FFFF).");
   heap[outIdx++] = 240 | (u >> 18);
   heap[outIdx++] = 128 | ((u >> 12) & 63);
   heap[outIdx++] = 128 | ((u >> 6) & 63);
   heap[outIdx++] = 128 | (u & 63);
  }
 }
 heap[outIdx] = 0;
 return outIdx - startIdx;
};

/** @type {function(string, boolean=, number=)} */ function intArrayFromString(stringy, dontAddNull, length) {
 var len = length > 0 ? length : lengthBytesUTF8(stringy) + 1;
 var u8array = new Array(len);
 var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length);
 if (dontAddNull) u8array.length = numBytesWritten;
 return u8array;
}

var FS_stdin_getChar = () => {
 if (!FS_stdin_getChar_buffer.length) {
  var result = null;
  if (ENVIRONMENT_IS_NODE) {
   var BUFSIZE = 256;
   var buf = Buffer.alloc(BUFSIZE);
   var bytesRead = 0;
   /** @suppress {missingProperties} */ var fd = process.stdin.fd;
   try {
    bytesRead = fs.readSync(fd, buf);
   } catch (e) {
    if (e.toString().includes("EOF")) bytesRead = 0; else throw e;
   }
   if (bytesRead > 0) {
    result = buf.slice(0, bytesRead).toString("utf-8");
   } else {
    result = null;
   }
  } else if (typeof window != "undefined" && typeof window.prompt == "function") {
   result = window.prompt("Input: ");
   if (result !== null) {
    result += "\n";
   }
  } else if (typeof readline == "function") {
   result = readline();
   if (result !== null) {
    result += "\n";
   }
  }
  if (!result) {
   return null;
  }
  FS_stdin_getChar_buffer = intArrayFromString(result, true);
 }
 return FS_stdin_getChar_buffer.shift();
};

var TTY = {
 ttys: [],
 init() {},
 shutdown() {},
 register(dev, ops) {
  TTY.ttys[dev] = {
   input: [],
   output: [],
   ops: ops
  };
  FS.registerDevice(dev, TTY.stream_ops);
 },
 stream_ops: {
  open(stream) {
   var tty = TTY.ttys[stream.node.rdev];
   if (!tty) {
    throw new FS.ErrnoError(43);
   }
   stream.tty = tty;
   stream.seekable = false;
  },
  close(stream) {
   stream.tty.ops.fsync(stream.tty);
  },
  fsync(stream) {
   stream.tty.ops.fsync(stream.tty);
  },
  read(stream, buffer, offset, length, pos) {
   /* ignored */ if (!stream.tty || !stream.tty.ops.get_char) {
    throw new FS.ErrnoError(60);
   }
   var bytesRead = 0;
   for (var i = 0; i < length; i++) {
    var result;
    try {
     result = stream.tty.ops.get_char(stream.tty);
    } catch (e) {
     throw new FS.ErrnoError(29);
    }
    if (result === undefined && bytesRead === 0) {
     throw new FS.ErrnoError(6);
    }
    if (result === null || result === undefined) break;
    bytesRead++;
    buffer[offset + i] = result;
   }
   if (bytesRead) {
    stream.node.timestamp = Date.now();
   }
   return bytesRead;
  },
  write(stream, buffer, offset, length, pos) {
   if (!stream.tty || !stream.tty.ops.put_char) {
    throw new FS.ErrnoError(60);
   }
   try {
    for (var i = 0; i < length; i++) {
     stream.tty.ops.put_char(stream.tty, buffer[offset + i]);
    }
   } catch (e) {
    throw new FS.ErrnoError(29);
   }
   if (length) {
    stream.node.timestamp = Date.now();
   }
   return i;
  }
 },
 default_tty_ops: {
  get_char(tty) {
   return FS_stdin_getChar();
  },
  put_char(tty, val) {
   if (val === null || val === 10) {
    out(UTF8ArrayToString(tty.output, 0));
    tty.output = [];
   } else {
    if (val != 0) tty.output.push(val);
   }
  },
  fsync(tty) {
   if (tty.output && tty.output.length > 0) {
    out(UTF8ArrayToString(tty.output, 0));
    tty.output = [];
   }
  },
  ioctl_tcgets(tty) {
   return {
    c_iflag: 25856,
    c_oflag: 5,
    c_cflag: 191,
    c_lflag: 35387,
    c_cc: [ 3, 28, 127, 21, 4, 0, 1, 0, 17, 19, 26, 0, 18, 15, 23, 22, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]
   };
  },
  ioctl_tcsets(tty, optional_actions, data) {
   return 0;
  },
  ioctl_tiocgwinsz(tty) {
   return [ 24, 80 ];
  }
 },
 default_tty1_ops: {
  put_char(tty, val) {
   if (val === null || val === 10) {
    err(UTF8ArrayToString(tty.output, 0));
    tty.output = [];
   } else {
    if (val != 0) tty.output.push(val);
   }
  },
  fsync(tty) {
   if (tty.output && tty.output.length > 0) {
    err(UTF8ArrayToString(tty.output, 0));
    tty.output = [];
   }
  }
 }
};

var zeroMemory = (address, size) => {
 GROWABLE_HEAP_U8().fill(0, address, address + size);
 return address;
};

var alignMemory = (size, alignment) => {
 assert(alignment, "alignment argument is required");
 return Math.ceil(size / alignment) * alignment;
};

var mmapAlloc = size => {
 abort("internal error: mmapAlloc called but `emscripten_builtin_memalign` native symbol not exported");
};

var MEMFS = {
 ops_table: null,
 mount(mount) {
  return MEMFS.createNode(null, "/", 16384 | 511, /* 0777 */ 0);
 },
 createNode(parent, name, mode, dev) {
  if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
   throw new FS.ErrnoError(63);
  }
  if (!MEMFS.ops_table) {
   MEMFS.ops_table = {
    dir: {
     node: {
      getattr: MEMFS.node_ops.getattr,
      setattr: MEMFS.node_ops.setattr,
      lookup: MEMFS.node_ops.lookup,
      mknod: MEMFS.node_ops.mknod,
      rename: MEMFS.node_ops.rename,
      unlink: MEMFS.node_ops.unlink,
      rmdir: MEMFS.node_ops.rmdir,
      readdir: MEMFS.node_ops.readdir,
      symlink: MEMFS.node_ops.symlink
     },
     stream: {
      llseek: MEMFS.stream_ops.llseek
     }
    },
    file: {
     node: {
      getattr: MEMFS.node_ops.getattr,
      setattr: MEMFS.node_ops.setattr
     },
     stream: {
      llseek: MEMFS.stream_ops.llseek,
      read: MEMFS.stream_ops.read,
      write: MEMFS.stream_ops.write,
      allocate: MEMFS.stream_ops.allocate,
      mmap: MEMFS.stream_ops.mmap,
      msync: MEMFS.stream_ops.msync
     }
    },
    link: {
     node: {
      getattr: MEMFS.node_ops.getattr,
      setattr: MEMFS.node_ops.setattr,
      readlink: MEMFS.node_ops.readlink
     },
     stream: {}
    },
    chrdev: {
     node: {
      getattr: MEMFS.node_ops.getattr,
      setattr: MEMFS.node_ops.setattr
     },
     stream: FS.chrdev_stream_ops
    }
   };
  }
  var node = FS.createNode(parent, name, mode, dev);
  if (FS.isDir(node.mode)) {
   node.node_ops = MEMFS.ops_table.dir.node;
   node.stream_ops = MEMFS.ops_table.dir.stream;
   node.contents = {};
  } else if (FS.isFile(node.mode)) {
   node.node_ops = MEMFS.ops_table.file.node;
   node.stream_ops = MEMFS.ops_table.file.stream;
   node.usedBytes = 0;
   node.contents = null;
  } else if (FS.isLink(node.mode)) {
   node.node_ops = MEMFS.ops_table.link.node;
   node.stream_ops = MEMFS.ops_table.link.stream;
  } else if (FS.isChrdev(node.mode)) {
   node.node_ops = MEMFS.ops_table.chrdev.node;
   node.stream_ops = MEMFS.ops_table.chrdev.stream;
  }
  node.timestamp = Date.now();
  if (parent) {
   parent.contents[name] = node;
   parent.timestamp = node.timestamp;
  }
  return node;
 },
 getFileDataAsTypedArray(node) {
  if (!node.contents) return new Uint8Array(0);
  if (node.contents.subarray) return node.contents.subarray(0, node.usedBytes);
  return new Uint8Array(node.contents);
 },
 expandFileStorage(node, newCapacity) {
  var prevCapacity = node.contents ? node.contents.length : 0;
  if (prevCapacity >= newCapacity) return;
  var CAPACITY_DOUBLING_MAX = 1024 * 1024;
  newCapacity = Math.max(newCapacity, (prevCapacity * (prevCapacity < CAPACITY_DOUBLING_MAX ? 2 : 1.125)) >>> 0);
  if (prevCapacity != 0) newCapacity = Math.max(newCapacity, 256);
  var oldContents = node.contents;
  node.contents = new Uint8Array(newCapacity);
  if (node.usedBytes > 0) node.contents.set(oldContents.subarray(0, node.usedBytes), 0);
 },
 resizeFileStorage(node, newSize) {
  if (node.usedBytes == newSize) return;
  if (newSize == 0) {
   node.contents = null;
   node.usedBytes = 0;
  } else {
   var oldContents = node.contents;
   node.contents = new Uint8Array(newSize);
   if (oldContents) {
    node.contents.set(oldContents.subarray(0, Math.min(newSize, node.usedBytes)));
   }
   node.usedBytes = newSize;
  }
 },
 node_ops: {
  getattr(node) {
   var attr = {};
   attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
   attr.ino = node.id;
   attr.mode = node.mode;
   attr.nlink = 1;
   attr.uid = 0;
   attr.gid = 0;
   attr.rdev = node.rdev;
   if (FS.isDir(node.mode)) {
    attr.size = 4096;
   } else if (FS.isFile(node.mode)) {
    attr.size = node.usedBytes;
   } else if (FS.isLink(node.mode)) {
    attr.size = node.link.length;
   } else {
    attr.size = 0;
   }
   attr.atime = new Date(node.timestamp);
   attr.mtime = new Date(node.timestamp);
   attr.ctime = new Date(node.timestamp);
   attr.blksize = 4096;
   attr.blocks = Math.ceil(attr.size / attr.blksize);
   return attr;
  },
  setattr(node, attr) {
   if (attr.mode !== undefined) {
    node.mode = attr.mode;
   }
   if (attr.timestamp !== undefined) {
    node.timestamp = attr.timestamp;
   }
   if (attr.size !== undefined) {
    MEMFS.resizeFileStorage(node, attr.size);
   }
  },
  lookup(parent, name) {
   throw FS.genericErrors[44];
  },
  mknod(parent, name, mode, dev) {
   return MEMFS.createNode(parent, name, mode, dev);
  },
  rename(old_node, new_dir, new_name) {
   if (FS.isDir(old_node.mode)) {
    var new_node;
    try {
     new_node = FS.lookupNode(new_dir, new_name);
    } catch (e) {}
    if (new_node) {
     for (var i in new_node.contents) {
      throw new FS.ErrnoError(55);
     }
    }
   }
   delete old_node.parent.contents[old_node.name];
   old_node.parent.timestamp = Date.now();
   old_node.name = new_name;
   new_dir.contents[new_name] = old_node;
   new_dir.timestamp = old_node.parent.timestamp;
   old_node.parent = new_dir;
  },
  unlink(parent, name) {
   delete parent.contents[name];
   parent.timestamp = Date.now();
  },
  rmdir(parent, name) {
   var node = FS.lookupNode(parent, name);
   for (var i in node.contents) {
    throw new FS.ErrnoError(55);
   }
   delete parent.contents[name];
   parent.timestamp = Date.now();
  },
  readdir(node) {
   var entries = [ ".", ".." ];
   for (var key in node.contents) {
    if (!node.contents.hasOwnProperty(key)) {
     continue;
    }
    entries.push(key);
   }
   return entries;
  },
  symlink(parent, newname, oldpath) {
   var node = MEMFS.createNode(parent, newname, 511 | /* 0777 */ 40960, 0);
   node.link = oldpath;
   return node;
  },
  readlink(node) {
   if (!FS.isLink(node.mode)) {
    throw new FS.ErrnoError(28);
   }
   return node.link;
  }
 },
 stream_ops: {
  read(stream, buffer, offset, length, position) {
   var contents = stream.node.contents;
   if (position >= stream.node.usedBytes) return 0;
   var size = Math.min(stream.node.usedBytes - position, length);
   assert(size >= 0);
   if (size > 8 && contents.subarray) {
    buffer.set(contents.subarray(position, position + size), offset);
   } else {
    for (var i = 0; i < size; i++) buffer[offset + i] = contents[position + i];
   }
   return size;
  },
  write(stream, buffer, offset, length, position, canOwn) {
   assert(!(buffer instanceof ArrayBuffer));
   if (buffer.buffer === GROWABLE_HEAP_I8().buffer) {
    canOwn = false;
   }
   if (!length) return 0;
   var node = stream.node;
   node.timestamp = Date.now();
   if (buffer.subarray && (!node.contents || node.contents.subarray)) {
    if (canOwn) {
     assert(position === 0, "canOwn must imply no weird position inside the file");
     node.contents = buffer.subarray(offset, offset + length);
     node.usedBytes = length;
     return length;
    } else if (node.usedBytes === 0 && position === 0) {
     node.contents = buffer.slice(offset, offset + length);
     node.usedBytes = length;
     return length;
    } else if (position + length <= node.usedBytes) {
     node.contents.set(buffer.subarray(offset, offset + length), position);
     return length;
    }
   }
   MEMFS.expandFileStorage(node, position + length);
   if (node.contents.subarray && buffer.subarray) {
    node.contents.set(buffer.subarray(offset, offset + length), position);
   } else {
    for (var i = 0; i < length; i++) {
     node.contents[position + i] = buffer[offset + i];
    }
   }
   node.usedBytes = Math.max(node.usedBytes, position + length);
   return length;
  },
  llseek(stream, offset, whence) {
   var position = offset;
   if (whence === 1) {
    position += stream.position;
   } else if (whence === 2) {
    if (FS.isFile(stream.node.mode)) {
     position += stream.node.usedBytes;
    }
   }
   if (position < 0) {
    throw new FS.ErrnoError(28);
   }
   return position;
  },
  allocate(stream, offset, length) {
   MEMFS.expandFileStorage(stream.node, offset + length);
   stream.node.usedBytes = Math.max(stream.node.usedBytes, offset + length);
  },
  mmap(stream, length, position, prot, flags) {
   if (!FS.isFile(stream.node.mode)) {
    throw new FS.ErrnoError(43);
   }
   var ptr;
   var allocated;
   var contents = stream.node.contents;
   if (!(flags & 2) && contents.buffer === GROWABLE_HEAP_I8().buffer) {
    allocated = false;
    ptr = contents.byteOffset;
   } else {
    if (position > 0 || position + length < contents.length) {
     if (contents.subarray) {
      contents = contents.subarray(position, position + length);
     } else {
      contents = Array.prototype.slice.call(contents, position, position + length);
     }
    }
    allocated = true;
    ptr = mmapAlloc(length);
    if (!ptr) {
     throw new FS.ErrnoError(48);
    }
    GROWABLE_HEAP_I8().set(contents, ptr);
   }
   return {
    ptr: ptr,
    allocated: allocated
   };
  },
  msync(stream, buffer, offset, length, mmapFlags) {
   MEMFS.stream_ops.write(stream, buffer, 0, length, offset, false);
   return 0;
  }
 }
};

/** @param {boolean=} noRunDep */ var asyncLoad = (url, onload, onerror, noRunDep) => {
 var dep = !noRunDep ? getUniqueRunDependency(`al ${url}`) : "";
 readAsync(url, arrayBuffer => {
  assert(arrayBuffer, `Loading data file "${url}" failed (no arrayBuffer).`);
  onload(new Uint8Array(arrayBuffer));
  if (dep) removeRunDependency(dep);
 }, event => {
  if (onerror) {
   onerror();
  } else {
   throw `Loading data file "${url}" failed.`;
  }
 });
 if (dep) addRunDependency(dep);
};

var FS_createDataFile = (parent, name, fileData, canRead, canWrite, canOwn) => {
 FS.createDataFile(parent, name, fileData, canRead, canWrite, canOwn);
};

var preloadPlugins = Module["preloadPlugins"] || [];

var FS_handledByPreloadPlugin = (byteArray, fullname, finish, onerror) => {
 if (typeof Browser != "undefined") Browser.init();
 var handled = false;
 preloadPlugins.forEach(plugin => {
  if (handled) return;
  if (plugin["canHandle"](fullname)) {
   plugin["handle"](byteArray, fullname, finish, onerror);
   handled = true;
  }
 });
 return handled;
};

var FS_createPreloadedFile = (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn, preFinish) => {
 var fullname = name ? PATH_FS.resolve(PATH.join2(parent, name)) : parent;
 var dep = getUniqueRunDependency(`cp ${fullname}`);
 function processData(byteArray) {
  function finish(byteArray) {
   if (preFinish) preFinish();
   if (!dontCreateFile) {
    FS_createDataFile(parent, name, byteArray, canRead, canWrite, canOwn);
   }
   if (onload) onload();
   removeRunDependency(dep);
  }
  if (FS_handledByPreloadPlugin(byteArray, fullname, finish, () => {
   if (onerror) onerror();
   removeRunDependency(dep);
  })) {
   return;
  }
  finish(byteArray);
 }
 addRunDependency(dep);
 if (typeof url == "string") {
  asyncLoad(url, byteArray => processData(byteArray), onerror);
 } else {
  processData(url);
 }
};

var FS_modeStringToFlags = str => {
 var flagModes = {
  "r": 0,
  "r+": 2,
  "w": 512 | 64 | 1,
  "w+": 512 | 64 | 2,
  "a": 1024 | 64 | 1,
  "a+": 1024 | 64 | 2
 };
 var flags = flagModes[str];
 if (typeof flags == "undefined") {
  throw new Error(`Unknown file open mode: ${str}`);
 }
 return flags;
};

var FS_getMode = (canRead, canWrite) => {
 var mode = 0;
 if (canRead) mode |= 292 | 73;
 if (canWrite) mode |= 146;
 return mode;
};

var ERRNO_MESSAGES = {
 0: "Success",
 1: "Arg list too long",
 2: "Permission denied",
 3: "Address already in use",
 4: "Address not available",
 5: "Address family not supported by protocol family",
 6: "No more processes",
 7: "Socket already connected",
 8: "Bad file number",
 9: "Trying to read unreadable message",
 10: "Mount device busy",
 11: "Operation canceled",
 12: "No children",
 13: "Connection aborted",
 14: "Connection refused",
 15: "Connection reset by peer",
 16: "File locking deadlock error",
 17: "Destination address required",
 18: "Math arg out of domain of func",
 19: "Quota exceeded",
 20: "File exists",
 21: "Bad address",
 22: "File too large",
 23: "Host is unreachable",
 24: "Identifier removed",
 25: "Illegal byte sequence",
 26: "Connection already in progress",
 27: "Interrupted system call",
 28: "Invalid argument",
 29: "I/O error",
 30: "Socket is already connected",
 31: "Is a directory",
 32: "Too many symbolic links",
 33: "Too many open files",
 34: "Too many links",
 35: "Message too long",
 36: "Multihop attempted",
 37: "File or path name too long",
 38: "Network interface is not configured",
 39: "Connection reset by network",
 40: "Network is unreachable",
 41: "Too many open files in system",
 42: "No buffer space available",
 43: "No such device",
 44: "No such file or directory",
 45: "Exec format error",
 46: "No record locks available",
 47: "The link has been severed",
 48: "Not enough core",
 49: "No message of desired type",
 50: "Protocol not available",
 51: "No space left on device",
 52: "Function not implemented",
 53: "Socket is not connected",
 54: "Not a directory",
 55: "Directory not empty",
 56: "State not recoverable",
 57: "Socket operation on non-socket",
 59: "Not a typewriter",
 60: "No such device or address",
 61: "Value too large for defined data type",
 62: "Previous owner died",
 63: "Not super-user",
 64: "Broken pipe",
 65: "Protocol error",
 66: "Unknown protocol",
 67: "Protocol wrong type for socket",
 68: "Math result not representable",
 69: "Read only file system",
 70: "Illegal seek",
 71: "No such process",
 72: "Stale file handle",
 73: "Connection timed out",
 74: "Text file busy",
 75: "Cross-device link",
 100: "Device not a stream",
 101: "Bad font file fmt",
 102: "Invalid slot",
 103: "Invalid request code",
 104: "No anode",
 105: "Block device required",
 106: "Channel number out of range",
 107: "Level 3 halted",
 108: "Level 3 reset",
 109: "Link number out of range",
 110: "Protocol driver not attached",
 111: "No CSI structure available",
 112: "Level 2 halted",
 113: "Invalid exchange",
 114: "Invalid request descriptor",
 115: "Exchange full",
 116: "No data (for no delay io)",
 117: "Timer expired",
 118: "Out of streams resources",
 119: "Machine is not on the network",
 120: "Package not installed",
 121: "The object is remote",
 122: "Advertise error",
 123: "Srmount error",
 124: "Communication error on send",
 125: "Cross mount point (not really error)",
 126: "Given log. name not unique",
 127: "f.d. invalid for this operation",
 128: "Remote address changed",
 129: "Can   access a needed shared lib",
 130: "Accessing a corrupted shared lib",
 131: ".lib section in a.out corrupted",
 132: "Attempting to link in too many libs",
 133: "Attempting to exec a shared library",
 135: "Streams pipe error",
 136: "Too many users",
 137: "Socket type not supported",
 138: "Not supported",
 139: "Protocol family not supported",
 140: "Can't send after socket shutdown",
 141: "Too many references",
 142: "Host is down",
 148: "No medium (in tape drive)",
 156: "Level 2 not synchronized"
};

var ERRNO_CODES = {
 "EPERM": 63,
 "ENOENT": 44,
 "ESRCH": 71,
 "EINTR": 27,
 "EIO": 29,
 "ENXIO": 60,
 "E2BIG": 1,
 "ENOEXEC": 45,
 "EBADF": 8,
 "ECHILD": 12,
 "EAGAIN": 6,
 "EWOULDBLOCK": 6,
 "ENOMEM": 48,
 "EACCES": 2,
 "EFAULT": 21,
 "ENOTBLK": 105,
 "EBUSY": 10,
 "EEXIST": 20,
 "EXDEV": 75,
 "ENODEV": 43,
 "ENOTDIR": 54,
 "EISDIR": 31,
 "EINVAL": 28,
 "ENFILE": 41,
 "EMFILE": 33,
 "ENOTTY": 59,
 "ETXTBSY": 74,
 "EFBIG": 22,
 "ENOSPC": 51,
 "ESPIPE": 70,
 "EROFS": 69,
 "EMLINK": 34,
 "EPIPE": 64,
 "EDOM": 18,
 "ERANGE": 68,
 "ENOMSG": 49,
 "EIDRM": 24,
 "ECHRNG": 106,
 "EL2NSYNC": 156,
 "EL3HLT": 107,
 "EL3RST": 108,
 "ELNRNG": 109,
 "EUNATCH": 110,
 "ENOCSI": 111,
 "EL2HLT": 112,
 "EDEADLK": 16,
 "ENOLCK": 46,
 "EBADE": 113,
 "EBADR": 114,
 "EXFULL": 115,
 "ENOANO": 104,
 "EBADRQC": 103,
 "EBADSLT": 102,
 "EDEADLOCK": 16,
 "EBFONT": 101,
 "ENOSTR": 100,
 "ENODATA": 116,
 "ETIME": 117,
 "ENOSR": 118,
 "ENONET": 119,
 "ENOPKG": 120,
 "EREMOTE": 121,
 "ENOLINK": 47,
 "EADV": 122,
 "ESRMNT": 123,
 "ECOMM": 124,
 "EPROTO": 65,
 "EMULTIHOP": 36,
 "EDOTDOT": 125,
 "EBADMSG": 9,
 "ENOTUNIQ": 126,
 "EBADFD": 127,
 "EREMCHG": 128,
 "ELIBACC": 129,
 "ELIBBAD": 130,
 "ELIBSCN": 131,
 "ELIBMAX": 132,
 "ELIBEXEC": 133,
 "ENOSYS": 52,
 "ENOTEMPTY": 55,
 "ENAMETOOLONG": 37,
 "ELOOP": 32,
 "EOPNOTSUPP": 138,
 "EPFNOSUPPORT": 139,
 "ECONNRESET": 15,
 "ENOBUFS": 42,
 "EAFNOSUPPORT": 5,
 "EPROTOTYPE": 67,
 "ENOTSOCK": 57,
 "ENOPROTOOPT": 50,
 "ESHUTDOWN": 140,
 "ECONNREFUSED": 14,
 "EADDRINUSE": 3,
 "ECONNABORTED": 13,
 "ENETUNREACH": 40,
 "ENETDOWN": 38,
 "ETIMEDOUT": 73,
 "EHOSTDOWN": 142,
 "EHOSTUNREACH": 23,
 "EINPROGRESS": 26,
 "EALREADY": 7,
 "EDESTADDRREQ": 17,
 "EMSGSIZE": 35,
 "EPROTONOSUPPORT": 66,
 "ESOCKTNOSUPPORT": 137,
 "EADDRNOTAVAIL": 4,
 "ENETRESET": 39,
 "EISCONN": 30,
 "ENOTCONN": 53,
 "ETOOMANYREFS": 141,
 "EUSERS": 136,
 "EDQUOT": 19,
 "ESTALE": 72,
 "ENOTSUP": 138,
 "ENOMEDIUM": 148,
 "EILSEQ": 25,
 "EOVERFLOW": 61,
 "ECANCELED": 11,
 "ENOTRECOVERABLE": 56,
 "EOWNERDEAD": 62,
 "ESTRPIPE": 135
};

var demangle = func => {
 warnOnce("warning: build with -sDEMANGLE_SUPPORT to link in libcxxabi demangling");
 return func;
};

var demangleAll = text => {
 var regex = /\b_Z[\w\d_]+/g;
 return text.replace(regex, function(x) {
  var y = demangle(x);
  return x === y ? x : (y + " [" + x + "]");
 });
};

var FS = {
 root: null,
 mounts: [],
 devices: {},
 streams: [],
 nextInode: 1,
 nameTable: null,
 currentPath: "/",
 initialized: false,
 ignorePermissions: true,
 ErrnoError: null,
 genericErrors: {},
 filesystems: null,
 syncFSRequests: 0,
 lookupPath(path, opts = {}) {
  path = PATH_FS.resolve(path);
  if (!path) return {
   path: "",
   node: null
  };
  var defaults = {
   follow_mount: true,
   recurse_count: 0
  };
  opts = Object.assign(defaults, opts);
  if (opts.recurse_count > 8) {
   throw new FS.ErrnoError(32);
  }
  var parts = path.split("/").filter(p => !!p);
  var current = FS.root;
  var current_path = "/";
  for (var i = 0; i < parts.length; i++) {
   var islast = (i === parts.length - 1);
   if (islast && opts.parent) {
    break;
   }
   current = FS.lookupNode(current, parts[i]);
   current_path = PATH.join2(current_path, parts[i]);
   if (FS.isMountpoint(current)) {
    if (!islast || (islast && opts.follow_mount)) {
     current = current.mounted.root;
    }
   }
   if (!islast || opts.follow) {
    var count = 0;
    while (FS.isLink(current.mode)) {
     var link = FS.readlink(current_path);
     current_path = PATH_FS.resolve(PATH.dirname(current_path), link);
     var lookup = FS.lookupPath(current_path, {
      recurse_count: opts.recurse_count + 1
     });
     current = lookup.node;
     if (count++ > 40) {
      throw new FS.ErrnoError(32);
     }
    }
   }
  }
  return {
   path: current_path,
   node: current
  };
 },
 getPath(node) {
  var path;
  while (true) {
   if (FS.isRoot(node)) {
    var mount = node.mount.mountpoint;
    if (!path) return mount;
    return mount[mount.length - 1] !== "/" ? `${mount}/${path}` : mount + path;
   }
   path = path ? `${node.name}/${path}` : node.name;
   node = node.parent;
  }
 },
 hashName(parentid, name) {
  var hash = 0;
  for (var i = 0; i < name.length; i++) {
   hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
  }
  return ((parentid + hash) >>> 0) % FS.nameTable.length;
 },
 hashAddNode(node) {
  var hash = FS.hashName(node.parent.id, node.name);
  node.name_next = FS.nameTable[hash];
  FS.nameTable[hash] = node;
 },
 hashRemoveNode(node) {
  var hash = FS.hashName(node.parent.id, node.name);
  if (FS.nameTable[hash] === node) {
   FS.nameTable[hash] = node.name_next;
  } else {
   var current = FS.nameTable[hash];
   while (current) {
    if (current.name_next === node) {
     current.name_next = node.name_next;
     break;
    }
    current = current.name_next;
   }
  }
 },
 lookupNode(parent, name) {
  var errCode = FS.mayLookup(parent);
  if (errCode) {
   throw new FS.ErrnoError(errCode, parent);
  }
  var hash = FS.hashName(parent.id, name);
  for (var node = FS.nameTable[hash]; node; node = node.name_next) {
   var nodeName = node.name;
   if (node.parent.id === parent.id && nodeName === name) {
    return node;
   }
  }
  return FS.lookup(parent, name);
 },
 createNode(parent, name, mode, rdev) {
  assert(typeof parent == "object");
  var node = new FS.FSNode(parent, name, mode, rdev);
  FS.hashAddNode(node);
  return node;
 },
 destroyNode(node) {
  FS.hashRemoveNode(node);
 },
 isRoot(node) {
  return node === node.parent;
 },
 isMountpoint(node) {
  return !!node.mounted;
 },
 isFile(mode) {
  return (mode & 61440) === 32768;
 },
 isDir(mode) {
  return (mode & 61440) === 16384;
 },
 isLink(mode) {
  return (mode & 61440) === 40960;
 },
 isChrdev(mode) {
  return (mode & 61440) === 8192;
 },
 isBlkdev(mode) {
  return (mode & 61440) === 24576;
 },
 isFIFO(mode) {
  return (mode & 61440) === 4096;
 },
 isSocket(mode) {
  return (mode & 49152) === 49152;
 },
 flagsToPermissionString(flag) {
  var perms = [ "r", "w", "rw" ][flag & 3];
  if ((flag & 512)) {
   perms += "w";
  }
  return perms;
 },
 nodePermissions(node, perms) {
  if (FS.ignorePermissions) {
   return 0;
  }
  if (perms.includes("r") && !(node.mode & 292)) {
   return 2;
  } else if (perms.includes("w") && !(node.mode & 146)) {
   return 2;
  } else if (perms.includes("x") && !(node.mode & 73)) {
   return 2;
  }
  return 0;
 },
 mayLookup(dir) {
  var errCode = FS.nodePermissions(dir, "x");
  if (errCode) return errCode;
  if (!dir.node_ops.lookup) return 2;
  return 0;
 },
 mayCreate(dir, name) {
  try {
   var node = FS.lookupNode(dir, name);
   return 20;
  } catch (e) {}
  return FS.nodePermissions(dir, "wx");
 },
 mayDelete(dir, name, isdir) {
  var node;
  try {
   node = FS.lookupNode(dir, name);
  } catch (e) {
   return e.errno;
  }
  var errCode = FS.nodePermissions(dir, "wx");
  if (errCode) {
   return errCode;
  }
  if (isdir) {
   if (!FS.isDir(node.mode)) {
    return 54;
   }
   if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
    return 10;
   }
  } else {
   if (FS.isDir(node.mode)) {
    return 31;
   }
  }
  return 0;
 },
 mayOpen(node, flags) {
  if (!node) {
   return 44;
  }
  if (FS.isLink(node.mode)) {
   return 32;
  } else if (FS.isDir(node.mode)) {
   if (FS.flagsToPermissionString(flags) !== "r" ||  (flags & 512)) {
    return 31;
   }
  }
  return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
 },
 MAX_OPEN_FDS: 4096,
 nextfd() {
  for (var fd = 0; fd <= FS.MAX_OPEN_FDS; fd++) {
   if (!FS.streams[fd]) {
    return fd;
   }
  }
  throw new FS.ErrnoError(33);
 },
 getStreamChecked(fd) {
  var stream = FS.getStream(fd);
  if (!stream) {
   throw new FS.ErrnoError(8);
  }
  return stream;
 },
 getStream: fd => FS.streams[fd],
 createStream(stream, fd = -1) {
  if (!FS.FSStream) {
   FS.FSStream = /** @constructor */ function() {
    this.shared = {};
   };
   FS.FSStream.prototype = {};
   Object.defineProperties(FS.FSStream.prototype, {
    object: {
     /** @this {FS.FSStream} */ get() {
      return this.node;
     },
     /** @this {FS.FSStream} */ set(val) {
      this.node = val;
     }
    },
    isRead: {
     /** @this {FS.FSStream} */ get() {
      return (this.flags & 2097155) !== 1;
     }
    },
    isWrite: {
     /** @this {FS.FSStream} */ get() {
      return (this.flags & 2097155) !== 0;
     }
    },
    isAppend: {
     /** @this {FS.FSStream} */ get() {
      return (this.flags & 1024);
     }
    },
    flags: {
     /** @this {FS.FSStream} */ get() {
      return this.shared.flags;
     },
     /** @this {FS.FSStream} */ set(val) {
      this.shared.flags = val;
     }
    },
    position: {
     /** @this {FS.FSStream} */ get() {
      return this.shared.position;
     },
     /** @this {FS.FSStream} */ set(val) {
      this.shared.position = val;
     }
    }
   });
  }
  stream = Object.assign(new FS.FSStream, stream);
  if (fd == -1) {
   fd = FS.nextfd();
  }
  stream.fd = fd;
  FS.streams[fd] = stream;
  return stream;
 },
 closeStream(fd) {
  FS.streams[fd] = null;
 },
 chrdev_stream_ops: {
  open(stream) {
   var device = FS.getDevice(stream.node.rdev);
   stream.stream_ops = device.stream_ops;
   if (stream.stream_ops.open) {
    stream.stream_ops.open(stream);
   }
  },
  llseek() {
   throw new FS.ErrnoError(70);
  }
 },
 major: dev => ((dev) >> 8),
 minor: dev => ((dev) & 255),
 makedev: (ma, mi) => ((ma) << 8 | (mi)),
 registerDevice(dev, ops) {
  FS.devices[dev] = {
   stream_ops: ops
  };
 },
 getDevice: dev => FS.devices[dev],
 getMounts(mount) {
  var mounts = [];
  var check = [ mount ];
  while (check.length) {
   var m = check.pop();
   mounts.push(m);
   check.push.apply(check, m.mounts);
  }
  return mounts;
 },
 syncfs(populate, callback) {
  if (typeof populate == "function") {
   callback = populate;
   populate = false;
  }
  FS.syncFSRequests++;
  if (FS.syncFSRequests > 1) {
   err(`warning: ${FS.syncFSRequests} FS.syncfs operations in flight at once, probably just doing extra work`);
  }
  var mounts = FS.getMounts(FS.root.mount);
  var completed = 0;
  function doCallback(errCode) {
   assert(FS.syncFSRequests > 0);
   FS.syncFSRequests--;
   return callback(errCode);
  }
  function done(errCode) {
   if (errCode) {
    if (!done.errored) {
     done.errored = true;
     return doCallback(errCode);
    }
    return;
   }
   if (++completed >= mounts.length) {
    doCallback(null);
   }
  }
  mounts.forEach(mount => {
   if (!mount.type.syncfs) {
    return done(null);
   }
   mount.type.syncfs(mount, populate, done);
  });
 },
 mount(type, opts, mountpoint) {
  if (typeof type == "string") {
   throw type;
  }
  var root = mountpoint === "/";
  var pseudo = !mountpoint;
  var node;
  if (root && FS.root) {
   throw new FS.ErrnoError(10);
  } else if (!root && !pseudo) {
   var lookup = FS.lookupPath(mountpoint, {
    follow_mount: false
   });
   mountpoint = lookup.path;
   node = lookup.node;
   if (FS.isMountpoint(node)) {
    throw new FS.ErrnoError(10);
   }
   if (!FS.isDir(node.mode)) {
    throw new FS.ErrnoError(54);
   }
  }
  var mount = {
   type: type,
   opts: opts,
   mountpoint: mountpoint,
   mounts: []
  };
  var mountRoot = type.mount(mount);
  mountRoot.mount = mount;
  mount.root = mountRoot;
  if (root) {
   FS.root = mountRoot;
  } else if (node) {
   node.mounted = mount;
   if (node.mount) {
    node.mount.mounts.push(mount);
   }
  }
  return mountRoot;
 },
 unmount(mountpoint) {
  var lookup = FS.lookupPath(mountpoint, {
   follow_mount: false
  });
  if (!FS.isMountpoint(lookup.node)) {
   throw new FS.ErrnoError(28);
  }
  var node = lookup.node;
  var mount = node.mounted;
  var mounts = FS.getMounts(mount);
  Object.keys(FS.nameTable).forEach(hash => {
   var current = FS.nameTable[hash];
   while (current) {
    var next = current.name_next;
    if (mounts.includes(current.mount)) {
     FS.destroyNode(current);
    }
    current = next;
   }
  });
  node.mounted = null;
  var idx = node.mount.mounts.indexOf(mount);
  assert(idx !== -1);
  node.mount.mounts.splice(idx, 1);
 },
 lookup(parent, name) {
  return parent.node_ops.lookup(parent, name);
 },
 mknod(path, mode, dev) {
  var lookup = FS.lookupPath(path, {
   parent: true
  });
  var parent = lookup.node;
  var name = PATH.basename(path);
  if (!name || name === "." || name === "..") {
   throw new FS.ErrnoError(28);
  }
  var errCode = FS.mayCreate(parent, name);
  if (errCode) {
   throw new FS.ErrnoError(errCode);
  }
  if (!parent.node_ops.mknod) {
   throw new FS.ErrnoError(63);
  }
  return parent.node_ops.mknod(parent, name, mode, dev);
 },
 create(path, mode) {
  mode = mode !== undefined ? mode : 438;
  /* 0666 */ mode &= 4095;
  mode |= 32768;
  return FS.mknod(path, mode, 0);
 },
 mkdir(path, mode) {
  mode = mode !== undefined ? mode : 511;
  /* 0777 */ mode &= 511 | 512;
  mode |= 16384;
  return FS.mknod(path, mode, 0);
 },
 mkdirTree(path, mode) {
  var dirs = path.split("/");
  var d = "";
  for (var i = 0; i < dirs.length; ++i) {
   if (!dirs[i]) continue;
   d += "/" + dirs[i];
   try {
    FS.mkdir(d, mode);
   } catch (e) {
    if (e.errno != 20) throw e;
   }
  }
 },
 mkdev(path, mode, dev) {
  if (typeof dev == "undefined") {
   dev = mode;
   mode = 438;
  }
  /* 0666 */ mode |= 8192;
  return FS.mknod(path, mode, dev);
 },
 symlink(oldpath, newpath) {
  if (!PATH_FS.resolve(oldpath)) {
   throw new FS.ErrnoError(44);
  }
  var lookup = FS.lookupPath(newpath, {
   parent: true
  });
  var parent = lookup.node;
  if (!parent) {
   throw new FS.ErrnoError(44);
  }
  var newname = PATH.basename(newpath);
  var errCode = FS.mayCreate(parent, newname);
  if (errCode) {
   throw new FS.ErrnoError(errCode);
  }
  if (!parent.node_ops.symlink) {
   throw new FS.ErrnoError(63);
  }
  return parent.node_ops.symlink(parent, newname, oldpath);
 },
 rename(old_path, new_path) {
  var old_dirname = PATH.dirname(old_path);
  var new_dirname = PATH.dirname(new_path);
  var old_name = PATH.basename(old_path);
  var new_name = PATH.basename(new_path);
  var lookup, old_dir, new_dir;
  lookup = FS.lookupPath(old_path, {
   parent: true
  });
  old_dir = lookup.node;
  lookup = FS.lookupPath(new_path, {
   parent: true
  });
  new_dir = lookup.node;
  if (!old_dir || !new_dir) throw new FS.ErrnoError(44);
  if (old_dir.mount !== new_dir.mount) {
   throw new FS.ErrnoError(75);
  }
  var old_node = FS.lookupNode(old_dir, old_name);
  var relative = PATH_FS.relative(old_path, new_dirname);
  if (relative.charAt(0) !== ".") {
   throw new FS.ErrnoError(28);
  }
  relative = PATH_FS.relative(new_path, old_dirname);
  if (relative.charAt(0) !== ".") {
   throw new FS.ErrnoError(55);
  }
  var new_node;
  try {
   new_node = FS.lookupNode(new_dir, new_name);
  } catch (e) {}
  if (old_node === new_node) {
   return;
  }
  var isdir = FS.isDir(old_node.mode);
  var errCode = FS.mayDelete(old_dir, old_name, isdir);
  if (errCode) {
   throw new FS.ErrnoError(errCode);
  }
  errCode = new_node ? FS.mayDelete(new_dir, new_name, isdir) : FS.mayCreate(new_dir, new_name);
  if (errCode) {
   throw new FS.ErrnoError(errCode);
  }
  if (!old_dir.node_ops.rename) {
   throw new FS.ErrnoError(63);
  }
  if (FS.isMountpoint(old_node) || (new_node && FS.isMountpoint(new_node))) {
   throw new FS.ErrnoError(10);
  }
  if (new_dir !== old_dir) {
   errCode = FS.nodePermissions(old_dir, "w");
   if (errCode) {
    throw new FS.ErrnoError(errCode);
   }
  }
  FS.hashRemoveNode(old_node);
  try {
   old_dir.node_ops.rename(old_node, new_dir, new_name);
  } catch (e) {
   throw e;
  } finally {
   FS.hashAddNode(old_node);
  }
 },
 rmdir(path) {
  var lookup = FS.lookupPath(path, {
   parent: true
  });
  var parent = lookup.node;
  var name = PATH.basename(path);
  var node = FS.lookupNode(parent, name);
  var errCode = FS.mayDelete(parent, name, true);
  if (errCode) {
   throw new FS.ErrnoError(errCode);
  }
  if (!parent.node_ops.rmdir) {
   throw new FS.ErrnoError(63);
  }
  if (FS.isMountpoint(node)) {
   throw new FS.ErrnoError(10);
  }
  parent.node_ops.rmdir(parent, name);
  FS.destroyNode(node);
 },
 readdir(path) {
  var lookup = FS.lookupPath(path, {
   follow: true
  });
  var node = lookup.node;
  if (!node.node_ops.readdir) {
   throw new FS.ErrnoError(54);
  }
  return node.node_ops.readdir(node);
 },
 unlink(path) {
  var lookup = FS.lookupPath(path, {
   parent: true
  });
  var parent = lookup.node;
  if (!parent) {
   throw new FS.ErrnoError(44);
  }
  var name = PATH.basename(path);
  var node = FS.lookupNode(parent, name);
  var errCode = FS.mayDelete(parent, name, false);
  if (errCode) {
   throw new FS.ErrnoError(errCode);
  }
  if (!parent.node_ops.unlink) {
   throw new FS.ErrnoError(63);
  }
  if (FS.isMountpoint(node)) {
   throw new FS.ErrnoError(10);
  }
  parent.node_ops.unlink(parent, name);
  FS.destroyNode(node);
 },
 readlink(path) {
  var lookup = FS.lookupPath(path);
  var link = lookup.node;
  if (!link) {
   throw new FS.ErrnoError(44);
  }
  if (!link.node_ops.readlink) {
   throw new FS.ErrnoError(28);
  }
  return PATH_FS.resolve(FS.getPath(link.parent), link.node_ops.readlink(link));
 },
 stat(path, dontFollow) {
  var lookup = FS.lookupPath(path, {
   follow: !dontFollow
  });
  var node = lookup.node;
  if (!node) {
   throw new FS.ErrnoError(44);
  }
  if (!node.node_ops.getattr) {
   throw new FS.ErrnoError(63);
  }
  return node.node_ops.getattr(node);
 },
 lstat(path) {
  return FS.stat(path, true);
 },
 chmod(path, mode, dontFollow) {
  var node;
  if (typeof path == "string") {
   var lookup = FS.lookupPath(path, {
    follow: !dontFollow
   });
   node = lookup.node;
  } else {
   node = path;
  }
  if (!node.node_ops.setattr) {
   throw new FS.ErrnoError(63);
  }
  node.node_ops.setattr(node, {
   mode: (mode & 4095) | (node.mode & ~4095),
   timestamp: Date.now()
  });
 },
 lchmod(path, mode) {
  FS.chmod(path, mode, true);
 },
 fchmod(fd, mode) {
  var stream = FS.getStreamChecked(fd);
  FS.chmod(stream.node, mode);
 },
 chown(path, uid, gid, dontFollow) {
  var node;
  if (typeof path == "string") {
   var lookup = FS.lookupPath(path, {
    follow: !dontFollow
   });
   node = lookup.node;
  } else {
   node = path;
  }
  if (!node.node_ops.setattr) {
   throw new FS.ErrnoError(63);
  }
  node.node_ops.setattr(node, {
   timestamp: Date.now()
  });
 },
 lchown(path, uid, gid) {
  FS.chown(path, uid, gid, true);
 },
 fchown(fd, uid, gid) {
  var stream = FS.getStreamChecked(fd);
  FS.chown(stream.node, uid, gid);
 },
 truncate(path, len) {
  if (len < 0) {
   throw new FS.ErrnoError(28);
  }
  var node;
  if (typeof path == "string") {
   var lookup = FS.lookupPath(path, {
    follow: true
   });
   node = lookup.node;
  } else {
   node = path;
  }
  if (!node.node_ops.setattr) {
   throw new FS.ErrnoError(63);
  }
  if (FS.isDir(node.mode)) {
   throw new FS.ErrnoError(31);
  }
  if (!FS.isFile(node.mode)) {
   throw new FS.ErrnoError(28);
  }
  var errCode = FS.nodePermissions(node, "w");
  if (errCode) {
   throw new FS.ErrnoError(errCode);
  }
  node.node_ops.setattr(node, {
   size: len,
   timestamp: Date.now()
  });
 },
 ftruncate(fd, len) {
  var stream = FS.getStreamChecked(fd);
  if ((stream.flags & 2097155) === 0) {
   throw new FS.ErrnoError(28);
  }
  FS.truncate(stream.node, len);
 },
 utime(path, atime, mtime) {
  var lookup = FS.lookupPath(path, {
   follow: true
  });
  var node = lookup.node;
  node.node_ops.setattr(node, {
   timestamp: Math.max(atime, mtime)
  });
 },
 open(path, flags, mode) {
  if (path === "") {
   throw new FS.ErrnoError(44);
  }
  flags = typeof flags == "string" ? FS_modeStringToFlags(flags) : flags;
  mode = typeof mode == "undefined" ? 438 : /* 0666 */ mode;
  if ((flags & 64)) {
   mode = (mode & 4095) | 32768;
  } else {
   mode = 0;
  }
  var node;
  if (typeof path == "object") {
   node = path;
  } else {
   path = PATH.normalize(path);
   try {
    var lookup = FS.lookupPath(path, {
     follow: !(flags & 131072)
    });
    node = lookup.node;
   } catch (e) {}
  }
  var created = false;
  if ((flags & 64)) {
   if (node) {
    if ((flags & 128)) {
     throw new FS.ErrnoError(20);
    }
   } else {
    node = FS.mknod(path, mode, 0);
    created = true;
   }
  }
  if (!node) {
   throw new FS.ErrnoError(44);
  }
  if (FS.isChrdev(node.mode)) {
   flags &= ~512;
  }
  if ((flags & 65536) && !FS.isDir(node.mode)) {
   throw new FS.ErrnoError(54);
  }
  if (!created) {
   var errCode = FS.mayOpen(node, flags);
   if (errCode) {
    throw new FS.ErrnoError(errCode);
   }
  }
  if ((flags & 512) && !created) {
   FS.truncate(node, 0);
  }
  flags &= ~(128 | 512 | 131072);
  var stream = FS.createStream({
   node: node,
   path: FS.getPath(node),
   flags: flags,
   seekable: true,
   position: 0,
   stream_ops: node.stream_ops,
   ungotten: [],
   error: false
  });
  if (stream.stream_ops.open) {
   stream.stream_ops.open(stream);
  }
  if (Module["logReadFiles"] && !(flags & 1)) {
   if (!FS.readFiles) FS.readFiles = {};
   if (!(path in FS.readFiles)) {
    FS.readFiles[path] = 1;
   }
  }
  return stream;
 },
 close(stream) {
  if (FS.isClosed(stream)) {
   throw new FS.ErrnoError(8);
  }
  if (stream.getdents) stream.getdents = null;
  try {
   if (stream.stream_ops.close) {
    stream.stream_ops.close(stream);
   }
  } catch (e) {
   throw e;
  } finally {
   FS.closeStream(stream.fd);
  }
  stream.fd = null;
 },
 isClosed(stream) {
  return stream.fd === null;
 },
 llseek(stream, offset, whence) {
  if (FS.isClosed(stream)) {
   throw new FS.ErrnoError(8);
  }
  if (!stream.seekable || !stream.stream_ops.llseek) {
   throw new FS.ErrnoError(70);
  }
  if (whence != 0 && whence != 1 && whence != 2) {
   throw new FS.ErrnoError(28);
  }
  stream.position = stream.stream_ops.llseek(stream, offset, whence);
  stream.ungotten = [];
  return stream.position;
 },
 read(stream, buffer, offset, length, position) {
  assert(offset >= 0);
  if (length < 0 || position < 0) {
   throw new FS.ErrnoError(28);
  }
  if (FS.isClosed(stream)) {
   throw new FS.ErrnoError(8);
  }
  if ((stream.flags & 2097155) === 1) {
   throw new FS.ErrnoError(8);
  }
  if (FS.isDir(stream.node.mode)) {
   throw new FS.ErrnoError(31);
  }
  if (!stream.stream_ops.read) {
   throw new FS.ErrnoError(28);
  }
  var seeking = typeof position != "undefined";
  if (!seeking) {
   position = stream.position;
  } else if (!stream.seekable) {
   throw new FS.ErrnoError(70);
  }
  var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
  if (!seeking) stream.position += bytesRead;
  return bytesRead;
 },
 write(stream, buffer, offset, length, position, canOwn) {
  assert(offset >= 0);
  if (length < 0 || position < 0) {
   throw new FS.ErrnoError(28);
  }
  if (FS.isClosed(stream)) {
   throw new FS.ErrnoError(8);
  }
  if ((stream.flags & 2097155) === 0) {
   throw new FS.ErrnoError(8);
  }
  if (FS.isDir(stream.node.mode)) {
   throw new FS.ErrnoError(31);
  }
  if (!stream.stream_ops.write) {
   throw new FS.ErrnoError(28);
  }
  if (stream.seekable && stream.flags & 1024) {
   FS.llseek(stream, 0, 2);
  }
  var seeking = typeof position != "undefined";
  if (!seeking) {
   position = stream.position;
  } else if (!stream.seekable) {
   throw new FS.ErrnoError(70);
  }
  var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
  if (!seeking) stream.position += bytesWritten;
  return bytesWritten;
 },
 allocate(stream, offset, length) {
  if (FS.isClosed(stream)) {
   throw new FS.ErrnoError(8);
  }
  if (offset < 0 || length <= 0) {
   throw new FS.ErrnoError(28);
  }
  if ((stream.flags & 2097155) === 0) {
   throw new FS.ErrnoError(8);
  }
  if (!FS.isFile(stream.node.mode) && !FS.isDir(stream.node.mode)) {
   throw new FS.ErrnoError(43);
  }
  if (!stream.stream_ops.allocate) {
   throw new FS.ErrnoError(138);
  }
  stream.stream_ops.allocate(stream, offset, length);
 },
 mmap(stream, length, position, prot, flags) {
  if ((prot & 2) !== 0 && (flags & 2) === 0 && (stream.flags & 2097155) !== 2) {
   throw new FS.ErrnoError(2);
  }
  if ((stream.flags & 2097155) === 1) {
   throw new FS.ErrnoError(2);
  }
  if (!stream.stream_ops.mmap) {
   throw new FS.ErrnoError(43);
  }
  return stream.stream_ops.mmap(stream, length, position, prot, flags);
 },
 msync(stream, buffer, offset, length, mmapFlags) {
  assert(offset >= 0);
  if (!stream.stream_ops.msync) {
   return 0;
  }
  return stream.stream_ops.msync(stream, buffer, offset, length, mmapFlags);
 },
 munmap: stream => 0,
 ioctl(stream, cmd, arg) {
  if (!stream.stream_ops.ioctl) {
   throw new FS.ErrnoError(59);
  }
  return stream.stream_ops.ioctl(stream, cmd, arg);
 },
 readFile(path, opts = {}) {
  opts.flags = opts.flags || 0;
  opts.encoding = opts.encoding || "binary";
  if (opts.encoding !== "utf8" && opts.encoding !== "binary") {
   throw new Error(`Invalid encoding type "${opts.encoding}"`);
  }
  var ret;
  var stream = FS.open(path, opts.flags);
  var stat = FS.stat(path);
  var length = stat.size;
  var buf = new Uint8Array(length);
  FS.read(stream, buf, 0, length, 0);
  if (opts.encoding === "utf8") {
   ret = UTF8ArrayToString(buf, 0);
  } else if (opts.encoding === "binary") {
   ret = buf;
  }
  FS.close(stream);
  return ret;
 },
 writeFile(path, data, opts = {}) {
  opts.flags = opts.flags || 577;
  var stream = FS.open(path, opts.flags, opts.mode);
  if (typeof data == "string") {
   var buf = new Uint8Array(lengthBytesUTF8(data) + 1);
   var actualNumBytes = stringToUTF8Array(data, buf, 0, buf.length);
   FS.write(stream, buf, 0, actualNumBytes, undefined, opts.canOwn);
  } else if (ArrayBuffer.isView(data)) {
   FS.write(stream, data, 0, data.byteLength, undefined, opts.canOwn);
  } else {
   throw new Error("Unsupported data type");
  }
  FS.close(stream);
 },
 cwd: () => FS.currentPath,
 chdir(path) {
  var lookup = FS.lookupPath(path, {
   follow: true
  });
  if (lookup.node === null) {
   throw new FS.ErrnoError(44);
  }
  if (!FS.isDir(lookup.node.mode)) {
   throw new FS.ErrnoError(54);
  }
  var errCode = FS.nodePermissions(lookup.node, "x");
  if (errCode) {
   throw new FS.ErrnoError(errCode);
  }
  FS.currentPath = lookup.path;
 },
 createDefaultDirectories() {
  FS.mkdir("/tmp");
  FS.mkdir("/home");
  FS.mkdir("/home/web_user");
 },
 createDefaultDevices() {
  FS.mkdir("/dev");
  FS.registerDevice(FS.makedev(1, 3), {
   read: () => 0,
   write: (stream, buffer, offset, length, pos) => length
  });
  FS.mkdev("/dev/null", FS.makedev(1, 3));
  TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
  TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
  FS.mkdev("/dev/tty", FS.makedev(5, 0));
  FS.mkdev("/dev/tty1", FS.makedev(6, 0));
  var randomBuffer = new Uint8Array(1024), randomLeft = 0;
  var randomByte = () => {
   if (randomLeft === 0) {
    randomLeft = randomFill(randomBuffer).byteLength;
   }
   return randomBuffer[--randomLeft];
  };
  FS.createDevice("/dev", "random", randomByte);
  FS.createDevice("/dev", "urandom", randomByte);
  FS.mkdir("/dev/shm");
  FS.mkdir("/dev/shm/tmp");
 },
 createSpecialDirectories() {
  FS.mkdir("/proc");
  var proc_self = FS.mkdir("/proc/self");
  FS.mkdir("/proc/self/fd");
  FS.mount({
   mount() {
    var node = FS.createNode(proc_self, "fd", 16384 | 511, /* 0777 */ 73);
    node.node_ops = {
     lookup(parent, name) {
      var fd = +name;
      var stream = FS.getStreamChecked(fd);
      var ret = {
       parent: null,
       mount: {
        mountpoint: "fake"
       },
       node_ops: {
        readlink: () => stream.path
       }
      };
      ret.parent = ret;
      return ret;
     }
    };
    return node;
   }
  }, {}, "/proc/self/fd");
 },
 createStandardStreams() {
  if (Module["stdin"]) {
   FS.createDevice("/dev", "stdin", Module["stdin"]);
  } else {
   FS.symlink("/dev/tty", "/dev/stdin");
  }
  if (Module["stdout"]) {
   FS.createDevice("/dev", "stdout", null, Module["stdout"]);
  } else {
   FS.symlink("/dev/tty", "/dev/stdout");
  }
  if (Module["stderr"]) {
   FS.createDevice("/dev", "stderr", null, Module["stderr"]);
  } else {
   FS.symlink("/dev/tty1", "/dev/stderr");
  }
  var stdin = FS.open("/dev/stdin", 0);
  var stdout = FS.open("/dev/stdout", 1);
  var stderr = FS.open("/dev/stderr", 1);
  assert(stdin.fd === 0, `invalid handle for stdin (${stdin.fd})`);
  assert(stdout.fd === 1, `invalid handle for stdout (${stdout.fd})`);
  assert(stderr.fd === 2, `invalid handle for stderr (${stderr.fd})`);
 },
 ensureErrnoError() {
  if (FS.ErrnoError) return;
  FS.ErrnoError = /** @this{Object} */ function ErrnoError(errno, node) {
   this.name = "ErrnoError";
   this.node = node;
   this.setErrno = /** @this{Object} */ function(errno) {
    this.errno = errno;
    for (var key in ERRNO_CODES) {
     if (ERRNO_CODES[key] === errno) {
      this.code = key;
      break;
     }
    }
   };
   this.setErrno(errno);
   this.message = ERRNO_MESSAGES[errno];
   if (this.stack) {
    Object.defineProperty(this, "stack", {
     value: (new Error).stack,
     writable: true
    });
    this.stack = demangleAll(this.stack);
   }
  };
  FS.ErrnoError.prototype = new Error;
  FS.ErrnoError.prototype.constructor = FS.ErrnoError;
  [ 44 ].forEach(code => {
   FS.genericErrors[code] = new FS.ErrnoError(code);
   FS.genericErrors[code].stack = "<generic error, no stack>";
  });
 },
 staticInit() {
  FS.ensureErrnoError();
  FS.nameTable = new Array(4096);
  FS.mount(MEMFS, {}, "/");
  FS.createDefaultDirectories();
  FS.createDefaultDevices();
  FS.createSpecialDirectories();
  FS.filesystems = {
   "MEMFS": MEMFS
  };
 },
 init(input, output, error) {
  assert(!FS.init.initialized, "FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)");
  FS.init.initialized = true;
  FS.ensureErrnoError();
  Module["stdin"] = input || Module["stdin"];
  Module["stdout"] = output || Module["stdout"];
  Module["stderr"] = error || Module["stderr"];
  FS.createStandardStreams();
 },
 quit() {
  FS.init.initialized = false;
  _fflush(0);
  for (var i = 0; i < FS.streams.length; i++) {
   var stream = FS.streams[i];
   if (!stream) {
    continue;
   }
   FS.close(stream);
  }
 },
 findObject(path, dontResolveLastLink) {
  var ret = FS.analyzePath(path, dontResolveLastLink);
  if (!ret.exists) {
   return null;
  }
  return ret.object;
 },
 analyzePath(path, dontResolveLastLink) {
  try {
   var lookup = FS.lookupPath(path, {
    follow: !dontResolveLastLink
   });
   path = lookup.path;
  } catch (e) {}
  var ret = {
   isRoot: false,
   exists: false,
   error: 0,
   name: null,
   path: null,
   object: null,
   parentExists: false,
   parentPath: null,
   parentObject: null
  };
  try {
   var lookup = FS.lookupPath(path, {
    parent: true
   });
   ret.parentExists = true;
   ret.parentPath = lookup.path;
   ret.parentObject = lookup.node;
   ret.name = PATH.basename(path);
   lookup = FS.lookupPath(path, {
    follow: !dontResolveLastLink
   });
   ret.exists = true;
   ret.path = lookup.path;
   ret.object = lookup.node;
   ret.name = lookup.node.name;
   ret.isRoot = lookup.path === "/";
  } catch (e) {
   ret.error = e.errno;
  }
  return ret;
 },
 createPath(parent, path, canRead, canWrite) {
  parent = typeof parent == "string" ? parent : FS.getPath(parent);
  var parts = path.split("/").reverse();
  while (parts.length) {
   var part = parts.pop();
   if (!part) continue;
   var current = PATH.join2(parent, part);
   try {
    FS.mkdir(current);
   } catch (e) {}
   parent = current;
  }
  return current;
 },
 createFile(parent, name, properties, canRead, canWrite) {
  var path = PATH.join2(typeof parent == "string" ? parent : FS.getPath(parent), name);
  var mode = FS_getMode(canRead, canWrite);
  return FS.create(path, mode);
 },
 createDataFile(parent, name, data, canRead, canWrite, canOwn) {
  var path = name;
  if (parent) {
   parent = typeof parent == "string" ? parent : FS.getPath(parent);
   path = name ? PATH.join2(parent, name) : parent;
  }
  var mode = FS_getMode(canRead, canWrite);
  var node = FS.create(path, mode);
  if (data) {
   if (typeof data == "string") {
    var arr = new Array(data.length);
    for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
    data = arr;
   }
   FS.chmod(node, mode | 146);
   var stream = FS.open(node, 577);
   FS.write(stream, data, 0, data.length, 0, canOwn);
   FS.close(stream);
   FS.chmod(node, mode);
  }
 },
 createDevice(parent, name, input, output) {
  var path = PATH.join2(typeof parent == "string" ? parent : FS.getPath(parent), name);
  var mode = FS_getMode(!!input, !!output);
  if (!FS.createDevice.major) FS.createDevice.major = 64;
  var dev = FS.makedev(FS.createDevice.major++, 0);
  FS.registerDevice(dev, {
   open(stream) {
    stream.seekable = false;
   },
   close(stream) {
    if (output && output.buffer && output.buffer.length) {
     output(10);
    }
   },
   read(stream, buffer, offset, length, pos) {
    /* ignored */ var bytesRead = 0;
    for (var i = 0; i < length; i++) {
     var result;
     try {
      result = input();
     } catch (e) {
      throw new FS.ErrnoError(29);
     }
     if (result === undefined && bytesRead === 0) {
      throw new FS.ErrnoError(6);
     }
     if (result === null || result === undefined) break;
     bytesRead++;
     buffer[offset + i] = result;
    }
    if (bytesRead) {
     stream.node.timestamp = Date.now();
    }
    return bytesRead;
   },
   write(stream, buffer, offset, length, pos) {
    for (var i = 0; i < length; i++) {
     try {
      output(buffer[offset + i]);
     } catch (e) {
      throw new FS.ErrnoError(29);
     }
    }
    if (length) {
     stream.node.timestamp = Date.now();
    }
    return i;
   }
  });
  return FS.mkdev(path, mode, dev);
 },
 forceLoadFile(obj) {
  if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
  if (typeof XMLHttpRequest != "undefined") {
   throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
  } else if (read_) {
   try {
    obj.contents = intArrayFromString(read_(obj.url), true);
    obj.usedBytes = obj.contents.length;
   } catch (e) {
    throw new FS.ErrnoError(29);
   }
  } else {
   throw new Error("Cannot load without read() or XMLHttpRequest.");
  }
 },
 createLazyFile(parent, name, url, canRead, canWrite) {
  /** @constructor */ function LazyUint8Array() {
   this.lengthKnown = false;
   this.chunks = [];
  }
  LazyUint8Array.prototype.get = /** @this{Object} */ function LazyUint8Array_get(idx) {
   if (idx > this.length - 1 || idx < 0) {
    return undefined;
   }
   var chunkOffset = idx % this.chunkSize;
   var chunkNum = (idx / this.chunkSize) | 0;
   return this.getter(chunkNum)[chunkOffset];
  };
  LazyUint8Array.prototype.setDataGetter = function LazyUint8Array_setDataGetter(getter) {
   this.getter = getter;
  };
  LazyUint8Array.prototype.cacheLength = function LazyUint8Array_cacheLength() {
   var xhr = new XMLHttpRequest;
   xhr.open("HEAD", url, false);
   xhr.send(null);
   if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
   var datalength = Number(xhr.getResponseHeader("Content-length"));
   var header;
   var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
   var usesGzip = (header = xhr.getResponseHeader("Content-Encoding")) && header === "gzip";
   var chunkSize = 1024 * 1024;
   if (!hasByteServing) chunkSize = datalength;
   var doXHR = (from, to) => {
    if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
    if (to > datalength - 1) throw new Error("only " + datalength + " bytes available! programmer error!");
    var xhr = new XMLHttpRequest;
    xhr.open("GET", url, false);
    if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
    xhr.responseType = "arraybuffer";
    if (xhr.overrideMimeType) {
     xhr.overrideMimeType("text/plain; charset=x-user-defined");
    }
    xhr.send(null);
    if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
    if (xhr.response !== undefined) {
     return new Uint8Array(/** @type{Array<number>} */ (xhr.response || []));
    }
    return intArrayFromString(xhr.responseText || "", true);
   };
   var lazyArray = this;
   lazyArray.setDataGetter(chunkNum => {
    var start = chunkNum * chunkSize;
    var end = (chunkNum + 1) * chunkSize - 1;
    end = Math.min(end, datalength - 1);
    if (typeof lazyArray.chunks[chunkNum] == "undefined") {
     lazyArray.chunks[chunkNum] = doXHR(start, end);
    }
    if (typeof lazyArray.chunks[chunkNum] == "undefined") throw new Error("doXHR failed!");
    return lazyArray.chunks[chunkNum];
   });
   if (usesGzip || !datalength) {
    chunkSize = datalength = 1;
    datalength = this.getter(0).length;
    chunkSize = datalength;
    out("LazyFiles on gzip forces download of the whole file when length is accessed");
   }
   this._length = datalength;
   this._chunkSize = chunkSize;
   this.lengthKnown = true;
  };
  if (typeof XMLHttpRequest != "undefined") {
   if (!ENVIRONMENT_IS_WORKER) throw "Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc";
   var lazyArray = new LazyUint8Array;
   Object.defineProperties(lazyArray, {
    length: {
     get: /** @this{Object} */ function() {
      if (!this.lengthKnown) {
       this.cacheLength();
      }
      return this._length;
     }
    },
    chunkSize: {
     get: /** @this{Object} */ function() {
      if (!this.lengthKnown) {
       this.cacheLength();
      }
      return this._chunkSize;
     }
    }
   });
   var properties = {
    isDevice: false,
    contents: lazyArray
   };
  } else {
   var properties = {
    isDevice: false,
    url: url
   };
  }
  var node = FS.createFile(parent, name, properties, canRead, canWrite);
  if (properties.contents) {
   node.contents = properties.contents;
  } else if (properties.url) {
   node.contents = null;
   node.url = properties.url;
  }
  Object.defineProperties(node, {
   usedBytes: {
    get: /** @this {FSNode} */ function() {
     return this.contents.length;
    }
   }
  });
  var stream_ops = {};
  var keys = Object.keys(node.stream_ops);
  keys.forEach(key => {
   var fn = node.stream_ops[key];
   stream_ops[key] = function forceLoadLazyFile() {
    FS.forceLoadFile(node);
    return fn.apply(null, arguments);
   };
  });
  function writeChunks(stream, buffer, offset, length, position) {
   var contents = stream.node.contents;
   if (position >= contents.length) return 0;
   var size = Math.min(contents.length - position, length);
   assert(size >= 0);
   if (contents.slice) {
    for (var i = 0; i < size; i++) {
     buffer[offset + i] = contents[position + i];
    }
   } else {
    for (var i = 0; i < size; i++) {
     buffer[offset + i] = contents.get(position + i);
    }
   }
   return size;
  }
  stream_ops.read = (stream, buffer, offset, length, position) => {
   FS.forceLoadFile(node);
   return writeChunks(stream, buffer, offset, length, position);
  };
  stream_ops.mmap = (stream, length, position, prot, flags) => {
   FS.forceLoadFile(node);
   var ptr = mmapAlloc(length);
   if (!ptr) {
    throw new FS.ErrnoError(48);
   }
   writeChunks(stream, GROWABLE_HEAP_I8(), ptr, length, position);
   return {
    ptr: ptr,
    allocated: true
   };
  };
  node.stream_ops = stream_ops;
  return node;
 },
 absolutePath() {
  abort("FS.absolutePath has been removed; use PATH_FS.resolve instead");
 },
 createFolder() {
  abort("FS.createFolder has been removed; use FS.mkdir instead");
 },
 createLink() {
  abort("FS.createLink has been removed; use FS.symlink instead");
 },
 joinPath() {
  abort("FS.joinPath has been removed; use PATH.join instead");
 },
 mmapAlloc() {
  abort("FS.mmapAlloc has been replaced by the top level function mmapAlloc");
 },
 standardizePath() {
  abort("FS.standardizePath has been removed; use PATH.normalize instead");
 }
};

/**
     * Given a pointer 'ptr' to a null-terminated UTF8-encoded string in the
     * emscripten HEAP, returns a copy of that string as a Javascript String object.
     *
     * @param {number} ptr
     * @param {number=} maxBytesToRead - An optional length that specifies the
     *   maximum number of bytes to read. You can omit this parameter to scan the
     *   string until the first 0 byte. If maxBytesToRead is passed, and the string
     *   at [ptr, ptr+maxBytesToReadr[ contains a null byte in the middle, then the
     *   string will cut short at that byte index (i.e. maxBytesToRead will not
     *   produce a string of exact length [ptr, ptr+maxBytesToRead[) N.B. mixing
     *   frequent uses of UTF8ToString() with and without maxBytesToRead may throw
     *   JS JIT optimizations off, so it is worth to consider consistently using one
     * @return {string}
     */ var UTF8ToString = (ptr, maxBytesToRead) => {
 assert(typeof ptr == "number", `UTF8ToString expects a number (got ${typeof ptr})`);
 return ptr ? UTF8ArrayToString(GROWABLE_HEAP_U8(), ptr, maxBytesToRead) : "";
};

var SYSCALLS = {
 DEFAULT_POLLMASK: 5,
 calculateAt(dirfd, path, allowEmpty) {
  if (PATH.isAbs(path)) {
   return path;
  }
  var dir;
  if (dirfd === -100) {
   dir = FS.cwd();
  } else {
   var dirstream = SYSCALLS.getStreamFromFD(dirfd);
   dir = dirstream.path;
  }
  if (path.length == 0) {
   if (!allowEmpty) {
    throw new FS.ErrnoError(44);
   }
   return dir;
  }
  return PATH.join2(dir, path);
 },
 doStat(func, path, buf) {
  try {
   var stat = func(path);
  } catch (e) {
   if (e && e.node && PATH.normalize(path) !== PATH.normalize(FS.getPath(e.node))) {
    return -54;
   }
   throw e;
  }
  GROWABLE_HEAP_I32()[((buf) >> 2)] = stat.dev;
  GROWABLE_HEAP_I32()[(((buf) + (4)) >> 2)] = stat.mode;
  GROWABLE_HEAP_U32()[(((buf) + (8)) >> 2)] = stat.nlink;
  GROWABLE_HEAP_I32()[(((buf) + (12)) >> 2)] = stat.uid;
  GROWABLE_HEAP_I32()[(((buf) + (16)) >> 2)] = stat.gid;
  GROWABLE_HEAP_I32()[(((buf) + (20)) >> 2)] = stat.rdev;
  (tempI64 = [ stat.size >>> 0, (tempDouble = stat.size, (+(Math.abs(tempDouble))) >= 1 ? (tempDouble > 0 ? (+(Math.floor((tempDouble) / 4294967296))) >>> 0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble))) >>> 0)) / 4294967296))))) >>> 0) : 0) ], 
  GROWABLE_HEAP_I32()[(((buf) + (24)) >> 2)] = tempI64[0], GROWABLE_HEAP_I32()[(((buf) + (28)) >> 2)] = tempI64[1]);
  GROWABLE_HEAP_I32()[(((buf) + (32)) >> 2)] = 4096;
  GROWABLE_HEAP_I32()[(((buf) + (36)) >> 2)] = stat.blocks;
  var atime = stat.atime.getTime();
  var mtime = stat.mtime.getTime();
  var ctime = stat.ctime.getTime();
  (tempI64 = [ Math.floor(atime / 1e3) >>> 0, (tempDouble = Math.floor(atime / 1e3), 
  (+(Math.abs(tempDouble))) >= 1 ? (tempDouble > 0 ? (+(Math.floor((tempDouble) / 4294967296))) >>> 0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble))) >>> 0)) / 4294967296))))) >>> 0) : 0) ], 
  GROWABLE_HEAP_I32()[(((buf) + (40)) >> 2)] = tempI64[0], GROWABLE_HEAP_I32()[(((buf) + (44)) >> 2)] = tempI64[1]);
  GROWABLE_HEAP_U32()[(((buf) + (48)) >> 2)] = (atime % 1e3) * 1e3;
  (tempI64 = [ Math.floor(mtime / 1e3) >>> 0, (tempDouble = Math.floor(mtime / 1e3), 
  (+(Math.abs(tempDouble))) >= 1 ? (tempDouble > 0 ? (+(Math.floor((tempDouble) / 4294967296))) >>> 0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble))) >>> 0)) / 4294967296))))) >>> 0) : 0) ], 
  GROWABLE_HEAP_I32()[(((buf) + (56)) >> 2)] = tempI64[0], GROWABLE_HEAP_I32()[(((buf) + (60)) >> 2)] = tempI64[1]);
  GROWABLE_HEAP_U32()[(((buf) + (64)) >> 2)] = (mtime % 1e3) * 1e3;
  (tempI64 = [ Math.floor(ctime / 1e3) >>> 0, (tempDouble = Math.floor(ctime / 1e3), 
  (+(Math.abs(tempDouble))) >= 1 ? (tempDouble > 0 ? (+(Math.floor((tempDouble) / 4294967296))) >>> 0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble))) >>> 0)) / 4294967296))))) >>> 0) : 0) ], 
  GROWABLE_HEAP_I32()[(((buf) + (72)) >> 2)] = tempI64[0], GROWABLE_HEAP_I32()[(((buf) + (76)) >> 2)] = tempI64[1]);
  GROWABLE_HEAP_U32()[(((buf) + (80)) >> 2)] = (ctime % 1e3) * 1e3;
  (tempI64 = [ stat.ino >>> 0, (tempDouble = stat.ino, (+(Math.abs(tempDouble))) >= 1 ? (tempDouble > 0 ? (+(Math.floor((tempDouble) / 4294967296))) >>> 0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble))) >>> 0)) / 4294967296))))) >>> 0) : 0) ], 
  GROWABLE_HEAP_I32()[(((buf) + (88)) >> 2)] = tempI64[0], GROWABLE_HEAP_I32()[(((buf) + (92)) >> 2)] = tempI64[1]);
  return 0;
 },
 doMsync(addr, stream, len, flags, offset) {
  if (!FS.isFile(stream.node.mode)) {
   throw new FS.ErrnoError(43);
  }
  if (flags & 2) {
   return 0;
  }
  var buffer = GROWABLE_HEAP_U8().slice(addr, addr + len);
  FS.msync(stream, buffer, offset, len, flags);
 },
 varargs: undefined,
 get() {
  assert(SYSCALLS.varargs != undefined);
  var ret = GROWABLE_HEAP_I32()[((+SYSCALLS.varargs) >> 2)];
  SYSCALLS.varargs += 4;
  return ret;
 },
 getp() {
  return SYSCALLS.get();
 },
 getStr(ptr) {
  var ret = UTF8ToString(ptr);
  return ret;
 },
 getStreamFromFD(fd) {
  var stream = FS.getStreamChecked(fd);
  return stream;
 }
};

var withStackSave = f => {
 var stack = stackSave();
 var ret = f();
 stackRestore(stack);
 return ret;
};

var convertI32PairToI53Checked = (lo, hi) => {
 assert(lo == (lo >>> 0) || lo == (lo | 0));
 assert(hi === (hi | 0));
 return ((hi + 2097152) >>> 0 < 4194305 - !!lo) ? (lo >>> 0) + hi * 4294967296 : NaN;
};

var terminateWorker = worker => {
 worker.terminate();
 worker.onmessage = e => {
  var cmd = e["data"]["cmd"];
  err(`received "${cmd}" command from terminated worker: ${worker.workerID}`);
 };
};

var killThread = pthread_ptr => {
 assert(!ENVIRONMENT_IS_PTHREAD, "Internal Error! killThread() can only ever be called from main application thread!");
 assert(pthread_ptr, "Internal Error! Null pthread_ptr in killThread!");
 var worker = PThread.pthreads[pthread_ptr];
 delete PThread.pthreads[pthread_ptr];
 terminateWorker(worker);
 __emscripten_thread_free_data(pthread_ptr);
 PThread.runningWorkers.splice(PThread.runningWorkers.indexOf(worker), 1);
 worker.pthread_ptr = 0;
};

var cancelThread = pthread_ptr => {
 assert(!ENVIRONMENT_IS_PTHREAD, "Internal Error! cancelThread() can only ever be called from main application thread!");
 assert(pthread_ptr, "Internal Error! Null pthread_ptr in cancelThread!");
 var worker = PThread.pthreads[pthread_ptr];
 worker.postMessage({
  "cmd": "cancel"
 });
};

var cleanupThread = pthread_ptr => {
 assert(!ENVIRONMENT_IS_PTHREAD, "Internal Error! cleanupThread() can only ever be called from main application thread!");
 assert(pthread_ptr, "Internal Error! Null pthread_ptr in cleanupThread!");
 var worker = PThread.pthreads[pthread_ptr];
 assert(worker);
 PThread.returnWorkerToPool(worker);
};

var spawnThread = threadParams => {
 assert(!ENVIRONMENT_IS_PTHREAD, "Internal Error! spawnThread() can only ever be called from main application thread!");
 assert(threadParams.pthread_ptr, "Internal error, no pthread ptr!");
 var worker = PThread.getNewWorker();
 if (!worker) {
  return 6;
 }
 assert(!worker.pthread_ptr, "Internal error!");
 PThread.runningWorkers.push(worker);
 PThread.pthreads[threadParams.pthread_ptr] = worker;
 worker.pthread_ptr = threadParams.pthread_ptr;
 var msg = {
  "cmd": "run",
  "start_routine": threadParams.startRoutine,
  "arg": threadParams.arg,
  "pthread_ptr": threadParams.pthread_ptr
 };
 if (ENVIRONMENT_IS_NODE) {
  worker.unref();
 }
 worker.postMessage(msg, threadParams.transferList);
 return 0;
};

var ptrToString = ptr => {
 assert(typeof ptr === "number");
 ptr >>>= 0;
 return "0x" + ptr.toString(16).padStart(8, "0");
};

var PThread = {
 unusedWorkers: [],
 runningWorkers: [],
 tlsInitFunctions: [],
 pthreads: {},
 nextWorkerID: 1,
 debugInit() {
  function pthreadLogPrefix() {
   var t = 0;
   if (runtimeInitialized && typeof _pthread_self != "undefined") {
    t = _pthread_self();
   }
   return "w:" + (Module["workerID"] || 0) + ",t:" + ptrToString(t) + ": ";
  }
  var origDbg = dbg;
  dbg = message => origDbg(pthreadLogPrefix() + message);
 },
 init() {
  PThread.debugInit();
  if (ENVIRONMENT_IS_PTHREAD) {
   PThread.initWorker();
  } else {
   PThread.initMainThread();
  }
 },
 initMainThread() {
  addOnPreRun(() => {
   addRunDependency("loading-workers");
   PThread.loadWasmModuleToAllWorkers(() => removeRunDependency("loading-workers"));
  });
 },
 initWorker() {
  PThread["receiveObjectTransfer"] = PThread.receiveObjectTransfer;
  PThread["threadInitTLS"] = PThread.threadInitTLS;
  PThread["setExitStatus"] = PThread.setExitStatus;
  noExitRuntime = false;
 },
 setExitStatus: status => {
  EXITSTATUS = status;
 },
 terminateAllThreads__deps: [ "$terminateWorker" ],
 terminateAllThreads: () => {
  assert(!ENVIRONMENT_IS_PTHREAD, "Internal Error! terminateAllThreads() can only ever be called from main application thread!");
  for (var worker of PThread.runningWorkers) {
   terminateWorker(worker);
  }
  for (var worker of PThread.unusedWorkers) {
   terminateWorker(worker);
  }
  PThread.unusedWorkers = [];
  PThread.runningWorkers = [];
  PThread.pthreads = [];
 },
 returnWorkerToPool: worker => {
  var pthread_ptr = worker.pthread_ptr;
  delete PThread.pthreads[pthread_ptr];
  PThread.unusedWorkers.push(worker);
  PThread.runningWorkers.splice(PThread.runningWorkers.indexOf(worker), 1);
  worker.pthread_ptr = 0;
  __emscripten_thread_free_data(pthread_ptr);
 },
 receiveObjectTransfer(data) {},
 threadInitTLS() {
  PThread.tlsInitFunctions.forEach(f => f());
 },
 loadWasmModuleToWorker: worker => new Promise(onFinishedLoading => {
  worker.onmessage = e => {
   var d = e["data"];
   var cmd = d["cmd"];
   if (d["targetThread"] && d["targetThread"] != _pthread_self()) {
    var targetWorker = PThread.pthreads[d["targetThread"]];
    if (targetWorker) {
     targetWorker.postMessage(d, d["transferList"]);
    } else {
     err(`Internal error! Worker sent a message "${cmd}" to target pthread ${d["targetThread"]}, but that thread no longer exists!`);
    }
    return;
   }
   if (cmd === "checkMailbox") {
    checkMailbox();
   } else if (cmd === "spawnThread") {
    spawnThread(d);
   } else if (cmd === "cleanupThread") {
    cleanupThread(d["thread"]);
   } else if (cmd === "killThread") {
    killThread(d["thread"]);
   } else if (cmd === "cancelThread") {
    cancelThread(d["thread"]);
   } else if (cmd === "loaded") {
    worker.loaded = true;
    onFinishedLoading(worker);
   } else if (cmd === "alert") {
    alert(`Thread ${d["threadId"]}: ${d["text"]}`);
   } else if (d.target === "setimmediate") {
    worker.postMessage(d);
   } else if (cmd === "callHandler") {
    Module[d["handler"]](...d["args"]);
   } else if (cmd) {
    err(`worker sent an unknown command ${cmd}`);
   }
  };
  worker.onerror = e => {
   var message = "worker sent an error!";
   if (worker.pthread_ptr) {
    message = `Pthread ${ptrToString(worker.pthread_ptr)} sent an error!`;
   }
   err(`${message} ${e.filename}:${e.lineno}: ${e.message}`);
   throw e;
  };
  if (ENVIRONMENT_IS_NODE) {
   worker.on("message", data => worker.onmessage({
    data: data
   }));
   worker.on("error", e => worker.onerror(e));
  }
  assert(wasmMemory instanceof WebAssembly.Memory, "WebAssembly memory should have been loaded by now!");
  assert(wasmModule instanceof WebAssembly.Module, "WebAssembly Module should have been loaded by now!");
  var handlers = [];
  var knownHandlers = [ "onExit", "onAbort", "print", "printErr" ];
  for (var handler of knownHandlers) {
   if (Module.hasOwnProperty(handler)) {
    handlers.push(handler);
   }
  }
  worker.workerID = PThread.nextWorkerID++;
  worker.postMessage({
   "cmd": "load",
   "handlers": handlers,
   "urlOrBlob": Module["mainScriptUrlOrBlob"] || _scriptDir,
   "wasmMemory": wasmMemory,
   "wasmModule": wasmModule,
   "workerID": worker.workerID
  });
 }),
 loadWasmModuleToAllWorkers(onMaybeReady) {
  onMaybeReady();
 },
 allocateUnusedWorker() {
  var worker;
  var pthreadMainJs = locateFile("reminecraftpe.worker.js");
  worker = new Worker(pthreadMainJs);
  PThread.unusedWorkers.push(worker);
 },
 getNewWorker() {
  if (PThread.unusedWorkers.length == 0) {
   if (!ENVIRONMENT_IS_NODE) {
    err("Tried to spawn a new thread, but the thread pool is exhausted.\n" + "This might result in a deadlock unless some threads eventually exit or the code explicitly breaks out to the event loop.\n" + "If you want to increase the pool size, use setting `-sPTHREAD_POOL_SIZE=...`." + "\nIf you want to throw an explicit error instead of the risk of deadlocking in those cases, use setting `-sPTHREAD_POOL_SIZE_STRICT=2`.");
   }
   PThread.allocateUnusedWorker();
   PThread.loadWasmModuleToWorker(PThread.unusedWorkers[0]);
  }
  return PThread.unusedWorkers.pop();
 }
};

Module["PThread"] = PThread;

/** @type{function(number, (number|boolean), ...(number|boolean))} */ var proxyToMainThread = function(index, sync) {
 var numCallArgs = arguments.length - 2;
 var outerArgs = arguments;
 return withStackSave(() => {
  var serializedNumCallArgs = numCallArgs;
  var args = stackAlloc(serializedNumCallArgs * 8);
  var b = ((args) >> 3);
  for (var i = 0; i < numCallArgs; i++) {
   var arg = outerArgs[2 + i];
   GROWABLE_HEAP_F64()[b + i] = arg;
  }
  return __emscripten_run_on_main_thread_js(index, serializedNumCallArgs, args, sync);
 });
};

function _proc_exit(code) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(0, 1, code);
 EXITSTATUS = code;
 if (!keepRuntimeAlive()) {
  PThread.terminateAllThreads();
  if (Module["onExit"]) Module["onExit"](code);
  ABORT = true;
 }
 quit_(code, new ExitStatus(code));
}

/** @param {boolean|number=} implicit */ var exitJS = (status, implicit) => {
 EXITSTATUS = status;
 checkUnflushedContent();
 if (ENVIRONMENT_IS_PTHREAD) {
  assert(!implicit);
  exitOnMainThread(status);
  throw "unwind";
 }
 if (keepRuntimeAlive() && !implicit) {
  var msg = `program exited (with status: ${status}), but keepRuntimeAlive() is set (counter=${runtimeKeepaliveCounter}) due to an async operation, so halting execution but not exiting the runtime or preventing further async execution (you can use emscripten_force_exit, if you want to force a true shutdown)`;
  err(msg);
 }
 _proc_exit(status);
};

var _exit = exitJS;

var maybeExit = () => {
 if (!keepRuntimeAlive()) {
  try {
   if (ENVIRONMENT_IS_PTHREAD) __emscripten_thread_exit(EXITSTATUS); else _exit(EXITSTATUS);
  } catch (e) {
   handleException(e);
  }
 }
};

var callUserCallback = func => {
 if (ABORT) {
  err("user callback triggered after runtime exited or application aborted.  Ignoring.");
  return;
 }
 try {
  func();
  maybeExit();
 } catch (e) {
  handleException(e);
 }
};

/** @param {number=} timeout */ var safeSetTimeout = (func, timeout) => {
 runtimeKeepalivePush();
 return setTimeout(() => {
  runtimeKeepalivePop();
  callUserCallback(func);
 }, timeout);
};

var warnOnce = text => {
 if (!warnOnce.shown) warnOnce.shown = {};
 if (!warnOnce.shown[text]) {
  warnOnce.shown[text] = 1;
  if (ENVIRONMENT_IS_NODE) text = "warning: " + text;
  err(text);
 }
};

var Browser = {
 mainLoop: {
  running: false,
  scheduler: null,
  method: "",
  currentlyRunningMainloop: 0,
  func: null,
  arg: 0,
  timingMode: 0,
  timingValue: 0,
  currentFrameNumber: 0,
  queue: [],
  pause() {
   Browser.mainLoop.scheduler = null;
   Browser.mainLoop.currentlyRunningMainloop++;
  },
  resume() {
   Browser.mainLoop.currentlyRunningMainloop++;
   var timingMode = Browser.mainLoop.timingMode;
   var timingValue = Browser.mainLoop.timingValue;
   var func = Browser.mainLoop.func;
   Browser.mainLoop.func = null;
   setMainLoop(func, 0, false, Browser.mainLoop.arg, true);
   _emscripten_set_main_loop_timing(timingMode, timingValue);
   Browser.mainLoop.scheduler();
  },
  updateStatus() {
   if (Module["setStatus"]) {
    var message = Module["statusMessage"] || "Please wait...";
    var remaining = Browser.mainLoop.remainingBlockers;
    var expected = Browser.mainLoop.expectedBlockers;
    if (remaining) {
     if (remaining < expected) {
      Module["setStatus"](message + " (" + (expected - remaining) + "/" + expected + ")");
     } else {
      Module["setStatus"](message);
     }
    } else {
     Module["setStatus"]("");
    }
   }
  },
  runIter(func) {
   if (ABORT) return;
   if (Module["preMainLoop"]) {
    var preRet = Module["preMainLoop"]();
    if (preRet === false) {
     return;
    }
   }
   callUserCallback(func);
   if (Module["postMainLoop"]) Module["postMainLoop"]();
  }
 },
 isFullscreen: false,
 pointerLock: false,
 moduleContextCreatedCallbacks: [],
 workers: [],
 init() {
  if (Browser.initted) return;
  Browser.initted = true;
  var imagePlugin = {};
  imagePlugin["canHandle"] = function imagePlugin_canHandle(name) {
   return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/i.test(name);
  };
  imagePlugin["handle"] = function imagePlugin_handle(byteArray, name, onload, onerror) {
   var b = new Blob([ byteArray ], {
    type: Browser.getMimetype(name)
   });
   if (b.size !== byteArray.length) {
    b = new Blob([ (new Uint8Array(byteArray)).buffer ], {
     type: Browser.getMimetype(name)
    });
   }
   var url = URL.createObjectURL(b);
   assert(typeof url == "string", "createObjectURL must return a url as a string");
   var img = new Image;
   img.onload = () => {
    assert(img.complete, `Image ${name} could not be decoded`);
    var canvas = /** @type {!HTMLCanvasElement} */ (document.createElement("canvas"));
    canvas.width = img.width;
    canvas.height = img.height;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    preloadedImages[name] = canvas;
    URL.revokeObjectURL(url);
    if (onload) onload(byteArray);
   };
   img.onerror = event => {
    err(`Image ${url} could not be decoded`);
    if (onerror) onerror();
   };
   img.src = url;
  };
  preloadPlugins.push(imagePlugin);
  var audioPlugin = {};
  audioPlugin["canHandle"] = function audioPlugin_canHandle(name) {
   return !Module.noAudioDecoding && name.substr(-4) in {
    ".ogg": 1,
    ".wav": 1,
    ".mp3": 1
   };
  };
  audioPlugin["handle"] = function audioPlugin_handle(byteArray, name, onload, onerror) {
   var done = false;
   function finish(audio) {
    if (done) return;
    done = true;
    preloadedAudios[name] = audio;
    if (onload) onload(byteArray);
   }
   function fail() {
    if (done) return;
    done = true;
    preloadedAudios[name] = new Audio;
    if (onerror) onerror();
   }
   var b = new Blob([ byteArray ], {
    type: Browser.getMimetype(name)
   });
   var url = URL.createObjectURL(b);
   assert(typeof url == "string", "createObjectURL must return a url as a string");
   var audio = new Audio;
   audio.addEventListener("canplaythrough", () => finish(audio), false);
   audio.onerror = function audio_onerror(event) {
    if (done) return;
    err(`warning: browser could not fully decode audio ${name}, trying slower base64 approach`);
    function encode64(data) {
     var BASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
     var PAD = "=";
     var ret = "";
     var leftchar = 0;
     var leftbits = 0;
     for (var i = 0; i < data.length; i++) {
      leftchar = (leftchar << 8) | data[i];
      leftbits += 8;
      while (leftbits >= 6) {
       var curr = (leftchar >> (leftbits - 6)) & 63;
       leftbits -= 6;
       ret += BASE[curr];
      }
     }
     if (leftbits == 2) {
      ret += BASE[(leftchar & 3) << 4];
      ret += PAD + PAD;
     } else if (leftbits == 4) {
      ret += BASE[(leftchar & 15) << 2];
      ret += PAD;
     }
     return ret;
    }
    audio.src = "data:audio/x-" + name.substr(-3) + ";base64," + encode64(byteArray);
    finish(audio);
   };
   audio.src = url;
   safeSetTimeout(() => {
    finish(audio);
   },  1e4);
  };
  preloadPlugins.push(audioPlugin);
  function pointerLockChange() {
   Browser.pointerLock = document["pointerLockElement"] === Module["canvas"] || document["mozPointerLockElement"] === Module["canvas"] || document["webkitPointerLockElement"] === Module["canvas"] || document["msPointerLockElement"] === Module["canvas"];
  }
  var canvas = Module["canvas"];
  if (canvas) {
   canvas.requestPointerLock = canvas["requestPointerLock"] || canvas["mozRequestPointerLock"] || canvas["webkitRequestPointerLock"] || canvas["msRequestPointerLock"] || (() => {});
   canvas.exitPointerLock = document["exitPointerLock"] || document["mozExitPointerLock"] || document["webkitExitPointerLock"] || document["msExitPointerLock"] || (() => {});
   canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
   document.addEventListener("pointerlockchange", pointerLockChange, false);
   document.addEventListener("mozpointerlockchange", pointerLockChange, false);
   document.addEventListener("webkitpointerlockchange", pointerLockChange, false);
   document.addEventListener("mspointerlockchange", pointerLockChange, false);
   if (Module["elementPointerLock"]) {
    canvas.addEventListener("click", ev => {
     if (!Browser.pointerLock && Module["canvas"].requestPointerLock) {
      Module["canvas"].requestPointerLock();
      ev.preventDefault();
     }
    }, false);
   }
  }
 },
 createContext(/** @type {HTMLCanvasElement} */ canvas, useWebGL, setInModule, webGLContextAttributes) {
  if (useWebGL && Module.ctx && canvas == Module.canvas) return Module.ctx;
  var ctx;
  var contextHandle;
  if (useWebGL) {
   var contextAttributes = {
    antialias: false,
    alpha: false,
    majorVersion: 2
   };
   if (webGLContextAttributes) {
    for (var attribute in webGLContextAttributes) {
     contextAttributes[attribute] = webGLContextAttributes[attribute];
    }
   }
   if (typeof GL != "undefined") {
    contextHandle = GL.createContext(canvas, contextAttributes);
    if (contextHandle) {
     ctx = GL.getContext(contextHandle).GLctx;
    }
   }
  } else {
   ctx = canvas.getContext("2d");
  }
  if (!ctx) return null;
  if (setInModule) {
   if (!useWebGL) assert(typeof GLctx == "undefined", "cannot set in module if GLctx is used, but we are a non-GL context that would replace it");
   Module.ctx = ctx;
   if (useWebGL) GL.makeContextCurrent(contextHandle);
   Module.useWebGL = useWebGL;
   Browser.moduleContextCreatedCallbacks.forEach(callback => callback());
   Browser.init();
  }
  return ctx;
 },
 destroyContext(canvas, useWebGL, setInModule) {},
 fullscreenHandlersInstalled: false,
 lockPointer: undefined,
 resizeCanvas: undefined,
 requestFullscreen(lockPointer, resizeCanvas) {
  Browser.lockPointer = lockPointer;
  Browser.resizeCanvas = resizeCanvas;
  if (typeof Browser.lockPointer == "undefined") Browser.lockPointer = true;
  if (typeof Browser.resizeCanvas == "undefined") Browser.resizeCanvas = false;
  var canvas = Module["canvas"];
  function fullscreenChange() {
   Browser.isFullscreen = false;
   var canvasContainer = canvas.parentNode;
   if ((document["fullscreenElement"] || document["mozFullScreenElement"] || document["msFullscreenElement"] || document["webkitFullscreenElement"] || document["webkitCurrentFullScreenElement"]) === canvasContainer) {
    canvas.exitFullscreen = Browser.exitFullscreen;
    if (Browser.lockPointer) canvas.requestPointerLock();
    Browser.isFullscreen = true;
    if (Browser.resizeCanvas) {
     Browser.setFullscreenCanvasSize();
    } else {
     Browser.updateCanvasDimensions(canvas);
    }
   } else {
    canvasContainer.parentNode.insertBefore(canvas, canvasContainer);
    canvasContainer.parentNode.removeChild(canvasContainer);
    if (Browser.resizeCanvas) {
     Browser.setWindowedCanvasSize();
    } else {
     Browser.updateCanvasDimensions(canvas);
    }
   }
   if (Module["onFullScreen"]) Module["onFullScreen"](Browser.isFullscreen);
   if (Module["onFullscreen"]) Module["onFullscreen"](Browser.isFullscreen);
  }
  if (!Browser.fullscreenHandlersInstalled) {
   Browser.fullscreenHandlersInstalled = true;
   document.addEventListener("fullscreenchange", fullscreenChange, false);
   document.addEventListener("mozfullscreenchange", fullscreenChange, false);
   document.addEventListener("webkitfullscreenchange", fullscreenChange, false);
   document.addEventListener("MSFullscreenChange", fullscreenChange, false);
  }
  var canvasContainer = document.createElement("div");
  canvas.parentNode.insertBefore(canvasContainer, canvas);
  canvasContainer.appendChild(canvas);
  canvasContainer.requestFullscreen = canvasContainer["requestFullscreen"] || canvasContainer["mozRequestFullScreen"] || canvasContainer["msRequestFullscreen"] || (canvasContainer["webkitRequestFullscreen"] ? () => canvasContainer["webkitRequestFullscreen"](Element["ALLOW_KEYBOARD_INPUT"]) : null) || (canvasContainer["webkitRequestFullScreen"] ? () => canvasContainer["webkitRequestFullScreen"](Element["ALLOW_KEYBOARD_INPUT"]) : null);
  canvasContainer.requestFullscreen();
 },
 requestFullScreen() {
  abort("Module.requestFullScreen has been replaced by Module.requestFullscreen (without a capital S)");
 },
 exitFullscreen() {
  if (!Browser.isFullscreen) {
   return false;
  }
  var CFS = document["exitFullscreen"] || document["cancelFullScreen"] || document["mozCancelFullScreen"] || document["msExitFullscreen"] || document["webkitCancelFullScreen"] || (() => {});
  CFS.apply(document, []);
  return true;
 },
 nextRAF: 0,
 fakeRequestAnimationFrame(func) {
  var now = Date.now();
  if (Browser.nextRAF === 0) {
   Browser.nextRAF = now + 1e3 / 60;
  } else {
   while (now + 2 >= Browser.nextRAF) {
    Browser.nextRAF += 1e3 / 60;
   }
  }
  var delay = Math.max(Browser.nextRAF - now, 0);
  setTimeout(func, delay);
 },
 requestAnimationFrame(func) {
  if (typeof requestAnimationFrame == "function") {
   requestAnimationFrame(func);
   return;
  }
  var RAF = Browser.fakeRequestAnimationFrame;
  RAF(func);
 },
 safeSetTimeout(func, timeout) {
  return safeSetTimeout(func, timeout);
 },
 safeRequestAnimationFrame(func) {
  runtimeKeepalivePush();
  return Browser.requestAnimationFrame(() => {
   runtimeKeepalivePop();
   callUserCallback(func);
  });
 },
 getMimetype(name) {
  return {
   "jpg": "image/jpeg",
   "jpeg": "image/jpeg",
   "png": "image/png",
   "bmp": "image/bmp",
   "ogg": "audio/ogg",
   "wav": "audio/wav",
   "mp3": "audio/mpeg"
  }[name.substr(name.lastIndexOf(".") + 1)];
 },
 getUserMedia(func) {
  if (!window.getUserMedia) {
   window.getUserMedia = navigator["getUserMedia"] || navigator["mozGetUserMedia"];
  }
  window.getUserMedia(func);
 },
 getMovementX(event) {
  return event["movementX"] || event["mozMovementX"] || event["webkitMovementX"] || 0;
 },
 getMovementY(event) {
  return event["movementY"] || event["mozMovementY"] || event["webkitMovementY"] || 0;
 },
 getMouseWheelDelta(event) {
  var delta = 0;
  switch (event.type) {
  case "DOMMouseScroll":
   delta = event.detail / 3;
   break;

  case "mousewheel":
   delta = event.wheelDelta / 120;
   break;

  case "wheel":
   delta = event.deltaY;
   switch (event.deltaMode) {
   case 0:
    delta /= 100;
    break;

   case 1:
    delta /= 3;
    break;

   case 2:
    delta *= 80;
    break;

   default:
    throw "unrecognized mouse wheel delta mode: " + event.deltaMode;
   }
   break;

  default:
   throw "unrecognized mouse wheel event: " + event.type;
  }
  return delta;
 },
 mouseX: 0,
 mouseY: 0,
 mouseMovementX: 0,
 mouseMovementY: 0,
 touches: {},
 lastTouches: {},
 calculateMouseEvent(event) {
  if (Browser.pointerLock) {
   if (event.type != "mousemove" && ("mozMovementX" in event)) {
    Browser.mouseMovementX = Browser.mouseMovementY = 0;
   } else {
    Browser.mouseMovementX = Browser.getMovementX(event);
    Browser.mouseMovementY = Browser.getMovementY(event);
   }
   if (typeof SDL != "undefined") {
    Browser.mouseX = SDL.mouseX + Browser.mouseMovementX;
    Browser.mouseY = SDL.mouseY + Browser.mouseMovementY;
   } else {
    Browser.mouseX += Browser.mouseMovementX;
    Browser.mouseY += Browser.mouseMovementY;
   }
  } else {
   var rect = Module["canvas"].getBoundingClientRect();
   var cw = Module["canvas"].width;
   var ch = Module["canvas"].height;
   var scrollX = ((typeof window.scrollX != "undefined") ? window.scrollX : window.pageXOffset);
   var scrollY = ((typeof window.scrollY != "undefined") ? window.scrollY : window.pageYOffset);
   assert((typeof scrollX != "undefined") && (typeof scrollY != "undefined"), "Unable to retrieve scroll position, mouse positions likely broken.");
   if (event.type === "touchstart" || event.type === "touchend" || event.type === "touchmove") {
    var touch = event.touch;
    if (touch === undefined) {
     return;
    }
    var adjustedX = touch.pageX - (scrollX + rect.left);
    var adjustedY = touch.pageY - (scrollY + rect.top);
    adjustedX = adjustedX * (cw / rect.width);
    adjustedY = adjustedY * (ch / rect.height);
    var coords = {
     x: adjustedX,
     y: adjustedY
    };
    if (event.type === "touchstart") {
     Browser.lastTouches[touch.identifier] = coords;
     Browser.touches[touch.identifier] = coords;
    } else if (event.type === "touchend" || event.type === "touchmove") {
     var last = Browser.touches[touch.identifier];
     if (!last) last = coords;
     Browser.lastTouches[touch.identifier] = last;
     Browser.touches[touch.identifier] = coords;
    }
    return;
   }
   var x = event.pageX - (scrollX + rect.left);
   var y = event.pageY - (scrollY + rect.top);
   x = x * (cw / rect.width);
   y = y * (ch / rect.height);
   Browser.mouseMovementX = x - Browser.mouseX;
   Browser.mouseMovementY = y - Browser.mouseY;
   Browser.mouseX = x;
   Browser.mouseY = y;
  }
 },
 resizeListeners: [],
 updateResizeListeners() {
  var canvas = Module["canvas"];
  Browser.resizeListeners.forEach(listener => listener(canvas.width, canvas.height));
 },
 setCanvasSize(width, height, noUpdates) {
  var canvas = Module["canvas"];
  Browser.updateCanvasDimensions(canvas, width, height);
  if (!noUpdates) Browser.updateResizeListeners();
 },
 windowedWidth: 0,
 windowedHeight: 0,
 setFullscreenCanvasSize() {
  if (typeof SDL != "undefined") {
   var flags = GROWABLE_HEAP_U32()[((SDL.screen) >> 2)];
   flags = flags | 8388608;
   GROWABLE_HEAP_I32()[((SDL.screen) >> 2)] = flags;
  }
  Browser.updateCanvasDimensions(Module["canvas"]);
  Browser.updateResizeListeners();
 },
 setWindowedCanvasSize() {
  if (typeof SDL != "undefined") {
   var flags = GROWABLE_HEAP_U32()[((SDL.screen) >> 2)];
   flags = flags & ~8388608;
   GROWABLE_HEAP_I32()[((SDL.screen) >> 2)] = flags;
  }
  Browser.updateCanvasDimensions(Module["canvas"]);
  Browser.updateResizeListeners();
 },
 updateCanvasDimensions(canvas, wNative, hNative) {
  if (wNative && hNative) {
   canvas.widthNative = wNative;
   canvas.heightNative = hNative;
  } else {
   wNative = canvas.widthNative;
   hNative = canvas.heightNative;
  }
  var w = wNative;
  var h = hNative;
  if (Module["forcedAspectRatio"] && Module["forcedAspectRatio"] > 0) {
   if (w / h < Module["forcedAspectRatio"]) {
    w = Math.round(h * Module["forcedAspectRatio"]);
   } else {
    h = Math.round(w / Module["forcedAspectRatio"]);
   }
  }
  if (((document["fullscreenElement"] || document["mozFullScreenElement"] || document["msFullscreenElement"] || document["webkitFullscreenElement"] || document["webkitCurrentFullScreenElement"]) === canvas.parentNode) && (typeof screen != "undefined")) {
   var factor = Math.min(screen.width / w, screen.height / h);
   w = Math.round(w * factor);
   h = Math.round(h * factor);
  }
  if (Browser.resizeCanvas) {
   if (canvas.width != w) canvas.width = w;
   if (canvas.height != h) canvas.height = h;
   if (typeof canvas.style != "undefined") {
    canvas.style.removeProperty("width");
    canvas.style.removeProperty("height");
   }
  } else {
   if (canvas.width != wNative) canvas.width = wNative;
   if (canvas.height != hNative) canvas.height = hNative;
   if (typeof canvas.style != "undefined") {
    if (w != wNative || h != hNative) {
     canvas.style.setProperty("width", w + "px", "important");
     canvas.style.setProperty("height", h + "px", "important");
    } else {
     canvas.style.removeProperty("width");
     canvas.style.removeProperty("height");
    }
   }
  }
 }
};

var listenOnce = (object, event, func) => {
 object.addEventListener(event, func, {
  "once": true
 });
};

/** @param {Object=} elements */ var autoResumeAudioContext = (ctx, elements) => {
 if (!elements) {
  elements = [ document, document.getElementById("canvas") ];
 }
 [ "keydown", "mousedown", "touchstart" ].forEach(event => {
  elements.forEach(element => {
   if (element) {
    listenOnce(element, event, () => {
     if (ctx.state === "suspended") ctx.resume();
    });
   }
  });
 });
};

var callRuntimeCallbacks = callbacks => {
 while (callbacks.length > 0) {
  callbacks.shift()(Module);
 }
};

var dynCallLegacy = (sig, ptr, args) => {
 assert(("dynCall_" + sig) in Module, `bad function pointer type - dynCall function not found for sig '${sig}'`);
 if (args && args.length) {
  assert(args.length === sig.substring(1).replace(/j/g, "--").length);
 } else {
  assert(sig.length == 1);
 }
 var f = Module["dynCall_" + sig];
 return args && args.length ? f.apply(null, [ ptr ].concat(args)) : f.call(null, ptr);
};

var wasmTableMirror = [];

var wasmTable;

var getWasmTableEntry = funcPtr => {
 var func = wasmTableMirror[funcPtr];
 if (!func) {
  if (funcPtr >= wasmTableMirror.length) wasmTableMirror.length = funcPtr + 1;
  wasmTableMirror[funcPtr] = func = wasmTable.get(funcPtr);
 }
 assert(wasmTable.get(funcPtr) == func, "JavaScript-side Wasm function table mirror is out of date!");
 return func;
};

/** @param {Object=} args */ var dynCall = (sig, ptr, args) => {
 if (sig.includes("j")) {
  return dynCallLegacy(sig, ptr, args);
 }
 assert(getWasmTableEntry(ptr), `missing table entry in dynCall: ${ptr}`);
 var rtn = getWasmTableEntry(ptr).apply(null, args);
 return rtn;
};

var establishStackSpace = () => {
 var pthread_ptr = _pthread_self();
 var stackHigh = GROWABLE_HEAP_U32()[(((pthread_ptr) + (52)) >> 2)];
 var stackSize = GROWABLE_HEAP_U32()[(((pthread_ptr) + (56)) >> 2)];
 var stackLow = stackHigh - stackSize;
 assert(stackHigh != 0);
 assert(stackLow != 0);
 assert(stackHigh > stackLow, "stackHigh must be higher then stackLow");
 _emscripten_stack_set_limits(stackHigh, stackLow);
 stackRestore(stackHigh);
 writeStackCookie();
};

Module["establishStackSpace"] = establishStackSpace;

function exitOnMainThread(returnCode) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(1, 0, returnCode);
 _exit(returnCode);
}

/**
     * @param {number} ptr
     * @param {string} type
     */ function getValue(ptr, type = "i8") {
 if (type.endsWith("*")) type = "*";
 switch (type) {
 case "i1":
  return GROWABLE_HEAP_I8()[((ptr) >> 0)];

 case "i8":
  return GROWABLE_HEAP_I8()[((ptr) >> 0)];

 case "i16":
  return GROWABLE_HEAP_I16()[((ptr) >> 1)];

 case "i32":
  return GROWABLE_HEAP_I32()[((ptr) >> 2)];

 case "i64":
  abort("to do getValue(i64) use WASM_BIGINT");

 case "float":
  return GROWABLE_HEAP_F32()[((ptr) >> 2)];

 case "double":
  return GROWABLE_HEAP_F64()[((ptr) >> 3)];

 case "*":
  return GROWABLE_HEAP_U32()[((ptr) >> 2)];

 default:
  abort(`invalid type for getValue: ${type}`);
 }
}

var invokeEntryPoint = (ptr, arg) => {
 var result = getWasmTableEntry(ptr)(arg);
 checkStackCookie();
 function finish(result) {
  if (keepRuntimeAlive()) {
   PThread.setExitStatus(result);
  } else {
   __emscripten_thread_exit(result);
  }
 }
 finish(result);
};

Module["invokeEntryPoint"] = invokeEntryPoint;

var noExitRuntime = Module["noExitRuntime"] || true;

var registerTLSInit = tlsInitFunc => {
 PThread.tlsInitFunctions.push(tlsInitFunc);
};

/**
     * @param {number} ptr
     * @param {number} value
     * @param {string} type
     */ function setValue(ptr, value, type = "i8") {
 if (type.endsWith("*")) type = "*";
 switch (type) {
 case "i1":
  GROWABLE_HEAP_I8()[((ptr) >> 0)] = value;
  break;

 case "i8":
  GROWABLE_HEAP_I8()[((ptr) >> 0)] = value;
  break;

 case "i16":
  GROWABLE_HEAP_I16()[((ptr) >> 1)] = value;
  break;

 case "i32":
  GROWABLE_HEAP_I32()[((ptr) >> 2)] = value;
  break;

 case "i64":
  abort("to do setValue(i64) use WASM_BIGINT");

 case "float":
  GROWABLE_HEAP_F32()[((ptr) >> 2)] = value;
  break;

 case "double":
  GROWABLE_HEAP_F64()[((ptr) >> 3)] = value;
  break;

 case "*":
  GROWABLE_HEAP_U32()[((ptr) >> 2)] = value;
  break;

 default:
  abort(`invalid type for setValue: ${type}`);
 }
}

var ___assert_fail = (condition, filename, line, func) => {
 abort(`Assertion failed: ${UTF8ToString(condition)}, at: ` + [ filename ? UTF8ToString(filename) : "unknown filename", line, func ? UTF8ToString(func) : "unknown function" ]);
};

var ___call_sighandler = (fp, sig) => getWasmTableEntry(fp)(sig);

/** @constructor */ function ExceptionInfo(excPtr) {
 this.excPtr = excPtr;
 this.ptr = excPtr - 24;
 this.set_type = function(type) {
  GROWABLE_HEAP_U32()[(((this.ptr) + (4)) >> 2)] = type;
 };
 this.get_type = function() {
  return GROWABLE_HEAP_U32()[(((this.ptr) + (4)) >> 2)];
 };
 this.set_destructor = function(destructor) {
  GROWABLE_HEAP_U32()[(((this.ptr) + (8)) >> 2)] = destructor;
 };
 this.get_destructor = function() {
  return GROWABLE_HEAP_U32()[(((this.ptr) + (8)) >> 2)];
 };
 this.set_caught = function(caught) {
  caught = caught ? 1 : 0;
  GROWABLE_HEAP_I8()[(((this.ptr) + (12)) >> 0)] = caught;
 };
 this.get_caught = function() {
  return GROWABLE_HEAP_I8()[(((this.ptr) + (12)) >> 0)] != 0;
 };
 this.set_rethrown = function(rethrown) {
  rethrown = rethrown ? 1 : 0;
  GROWABLE_HEAP_I8()[(((this.ptr) + (13)) >> 0)] = rethrown;
 };
 this.get_rethrown = function() {
  return GROWABLE_HEAP_I8()[(((this.ptr) + (13)) >> 0)] != 0;
 };
 this.init = function(type, destructor) {
  this.set_adjusted_ptr(0);
  this.set_type(type);
  this.set_destructor(destructor);
 };
 this.set_adjusted_ptr = function(adjustedPtr) {
  GROWABLE_HEAP_U32()[(((this.ptr) + (16)) >> 2)] = adjustedPtr;
 };
 this.get_adjusted_ptr = function() {
  return GROWABLE_HEAP_U32()[(((this.ptr) + (16)) >> 2)];
 };
 this.get_exception_ptr = function() {
  var isPointer = ___cxa_is_pointer_type(this.get_type());
  if (isPointer) {
   return GROWABLE_HEAP_U32()[((this.excPtr) >> 2)];
  }
  var adjusted = this.get_adjusted_ptr();
  if (adjusted !== 0) return adjusted;
  return this.excPtr;
 };
}

var exceptionLast = 0;

var uncaughtExceptionCount = 0;

var ___cxa_throw = (ptr, type, destructor) => {
 var info = new ExceptionInfo(ptr);
 info.init(type, destructor);
 exceptionLast = ptr;
 uncaughtExceptionCount++;
 assert(false, "Exception thrown, but exception catching is not enabled. Compile with -sNO_DISABLE_EXCEPTION_CATCHING or -sEXCEPTION_CATCHING_ALLOWED=[..] to catch.");
};

var ___emscripten_init_main_thread_js = tb => {
 __emscripten_thread_init(tb, /*is_main=*/ !ENVIRONMENT_IS_WORKER, /*is_runtime=*/ 1, /*can_block=*/ !ENVIRONMENT_IS_WEB, /*default_stacksize=*/ 65536, /*start_profiling=*/ false);
 PThread.threadInitTLS();
};

var ___emscripten_thread_cleanup = thread => {
 if (!ENVIRONMENT_IS_PTHREAD) cleanupThread(thread); else postMessage({
  "cmd": "cleanupThread",
  "thread": thread
 });
};

function pthreadCreateProxied(pthread_ptr, attr, startRoutine, arg) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(2, 1, pthread_ptr, attr, startRoutine, arg);
 return ___pthread_create_js(pthread_ptr, attr, startRoutine, arg);
}

var ___pthread_create_js = (pthread_ptr, attr, startRoutine, arg) => {
 if (typeof SharedArrayBuffer == "undefined") {
  err("Current environment does not support SharedArrayBuffer, pthreads are not available!");
  return 6;
 }
 var transferList = [];
 var error = 0;
 if (ENVIRONMENT_IS_PTHREAD && (transferList.length === 0 || error)) {
  return pthreadCreateProxied(pthread_ptr, attr, startRoutine, arg);
 }
 if (error) return error;
 var threadParams = {
  startRoutine: startRoutine,
  pthread_ptr: pthread_ptr,
  arg: arg,
  transferList: transferList
 };
 if (ENVIRONMENT_IS_PTHREAD) {
  threadParams.cmd = "spawnThread";
  postMessage(threadParams, transferList);
  return 0;
 }
 return spawnThread(threadParams);
};

var SOCKFS = {
 mount(mount) {
  Module["websocket"] = (Module["websocket"] && ("object" === typeof Module["websocket"])) ? Module["websocket"] : {};
  Module["websocket"]._callbacks = {};
  Module["websocket"]["on"] = /** @this{Object} */ function(event, callback) {
   if ("function" === typeof callback) {
    this._callbacks[event] = callback;
   }
   return this;
  };
  Module["websocket"].emit = /** @this{Object} */ function(event, param) {
   if ("function" === typeof this._callbacks[event]) {
    this._callbacks[event].call(this, param);
   }
  };
  return FS.createNode(null, "/", 16384 | 511, /* 0777 */ 0);
 },
 createSocket(family, type, protocol) {
  type &= ~526336;
  var streaming = type == 1;
  if (streaming && protocol && protocol != 6) {
   throw new FS.ErrnoError(66);
  }
  var sock = {
   family: family,
   type: type,
   protocol: protocol,
   server: null,
   error: null,
   peers: {},
   pending: [],
   recv_queue: [],
   sock_ops: SOCKFS.websocket_sock_ops
  };
  var name = SOCKFS.nextname();
  var node = FS.createNode(SOCKFS.root, name, 49152, 0);
  node.sock = sock;
  var stream = FS.createStream({
   path: name,
   node: node,
   flags: 2,
   seekable: false,
   stream_ops: SOCKFS.stream_ops
  });
  sock.stream = stream;
  return sock;
 },
 getSocket(fd) {
  var stream = FS.getStream(fd);
  if (!stream || !FS.isSocket(stream.node.mode)) {
   return null;
  }
  return stream.node.sock;
 },
 stream_ops: {
  poll(stream) {
   var sock = stream.node.sock;
   return sock.sock_ops.poll(sock);
  },
  ioctl(stream, request, varargs) {
   var sock = stream.node.sock;
   return sock.sock_ops.ioctl(sock, request, varargs);
  },
  read(stream, buffer, offset, length, position) {
   /* ignored */ var sock = stream.node.sock;
   var msg = sock.sock_ops.recvmsg(sock, length);
   if (!msg) {
    return 0;
   }
   buffer.set(msg.buffer, offset);
   return msg.buffer.length;
  },
  write(stream, buffer, offset, length, position) {
   /* ignored */ var sock = stream.node.sock;
   return sock.sock_ops.sendmsg(sock, buffer, offset, length);
  },
  close(stream) {
   var sock = stream.node.sock;
   sock.sock_ops.close(sock);
  }
 },
 nextname() {
  if (!SOCKFS.nextname.current) {
   SOCKFS.nextname.current = 0;
  }
  return "socket[" + (SOCKFS.nextname.current++) + "]";
 },
 websocket_sock_ops: {
  createPeer(sock, addr, port) {
   var ws;
   if (typeof addr == "object") {
    ws = addr;
    addr = null;
    port = null;
   }
   if (ws) {
    if (ws._socket) {
     addr = ws._socket.remoteAddress;
     port = ws._socket.remotePort;
    } else  {
     var result = /ws[s]?:\/\/([^:]+):(\d+)/.exec(ws.url);
     if (!result) {
      throw new Error("WebSocket URL must be in the format ws(s)://address:port");
     }
     addr = result[1];
     port = parseInt(result[2], 10);
    }
   } else {
    try {
     var runtimeConfig = (Module["websocket"] && ("object" === typeof Module["websocket"]));
     var url = "ws:#".replace("#", "//");
     if (runtimeConfig) {
      if ("string" === typeof Module["websocket"]["url"]) {
       url = Module["websocket"]["url"];
      }
     }
     if (url === "ws://" || url === "wss://") {
      var parts = addr.split("/");
      url = url + parts[0] + ":" + port + "/" + parts.slice(1).join("/");
     }
     var subProtocols = "binary";
     if (runtimeConfig) {
      if ("string" === typeof Module["websocket"]["subprotocol"]) {
       subProtocols = Module["websocket"]["subprotocol"];
      }
     }
     var opts = undefined;
     if (subProtocols !== "null") {
      subProtocols = subProtocols.replace(/^ +| +$/g, "").split(/ *, */);
      opts = subProtocols;
     }
     if (runtimeConfig && null === Module["websocket"]["subprotocol"]) {
      subProtocols = "null";
      opts = undefined;
     }
     var WebSocketConstructor;
     if (ENVIRONMENT_IS_NODE) {
      WebSocketConstructor = /** @type{(typeof WebSocket)} */ (require("ws"));
     } else {
      WebSocketConstructor = WebSocket;
     }
     ws = new WebSocketConstructor(url, opts);
     ws.binaryType = "arraybuffer";
    } catch (e) {
     throw new FS.ErrnoError(23);
    }
   }
   var peer = {
    addr: addr,
    port: port,
    socket: ws,
    dgram_send_queue: []
   };
   SOCKFS.websocket_sock_ops.addPeer(sock, peer);
   SOCKFS.websocket_sock_ops.handlePeerEvents(sock, peer);
   if (sock.type === 2 && typeof sock.sport != "undefined") {
    peer.dgram_send_queue.push(new Uint8Array([ 255, 255, 255, 255, "p".charCodeAt(0), "o".charCodeAt(0), "r".charCodeAt(0), "t".charCodeAt(0), ((sock.sport & 65280) >> 8), (sock.sport & 255) ]));
   }
   return peer;
  },
  getPeer(sock, addr, port) {
   return sock.peers[addr + ":" + port];
  },
  addPeer(sock, peer) {
   sock.peers[peer.addr + ":" + peer.port] = peer;
  },
  removePeer(sock, peer) {
   delete sock.peers[peer.addr + ":" + peer.port];
  },
  handlePeerEvents(sock, peer) {
   var first = true;
   var handleOpen = function() {
    Module["websocket"].emit("open", sock.stream.fd);
    try {
     var queued = peer.dgram_send_queue.shift();
     while (queued) {
      peer.socket.send(queued);
      queued = peer.dgram_send_queue.shift();
     }
    } catch (e) {
     peer.socket.close();
    }
   };
   function handleMessage(data) {
    if (typeof data == "string") {
     var encoder = new TextEncoder;
     data = encoder.encode(data);
    } else  {
     assert(data.byteLength !== undefined);
     if (data.byteLength == 0) {
      return;
     }
     data = new Uint8Array(data);
    }
    var wasfirst = first;
    first = false;
    if (wasfirst && data.length === 10 && data[0] === 255 && data[1] === 255 && data[2] === 255 && data[3] === 255 && data[4] === "p".charCodeAt(0) && data[5] === "o".charCodeAt(0) && data[6] === "r".charCodeAt(0) && data[7] === "t".charCodeAt(0)) {
     var newport = ((data[8] << 8) | data[9]);
     SOCKFS.websocket_sock_ops.removePeer(sock, peer);
     peer.port = newport;
     SOCKFS.websocket_sock_ops.addPeer(sock, peer);
     return;
    }
    sock.recv_queue.push({
     addr: peer.addr,
     port: peer.port,
     data: data
    });
    Module["websocket"].emit("message", sock.stream.fd);
   }
   if (ENVIRONMENT_IS_NODE) {
    peer.socket.on("open", handleOpen);
    peer.socket.on("message", function(data, isBinary) {
     if (!isBinary) {
      return;
     }
     handleMessage((new Uint8Array(data)).buffer);
    });
    peer.socket.on("close", function() {
     Module["websocket"].emit("close", sock.stream.fd);
    });
    peer.socket.on("error", function(error) {
     sock.error = 14;
     Module["websocket"].emit("error", [ sock.stream.fd, sock.error, "ECONNREFUSED: Connection refused" ]);
    });
   } else {
    peer.socket.onopen = handleOpen;
    peer.socket.onclose = function() {
     Module["websocket"].emit("close", sock.stream.fd);
    };
    peer.socket.onmessage = function peer_socket_onmessage(event) {
     handleMessage(event.data);
    };
    peer.socket.onerror = function(error) {
     sock.error = 14;
     Module["websocket"].emit("error", [ sock.stream.fd, sock.error, "ECONNREFUSED: Connection refused" ]);
    };
   }
  },
  poll(sock) {
   if (sock.type === 1 && sock.server) {
    return sock.pending.length ? (64 | 1) : 0;
   }
   var mask = 0;
   var dest = sock.type === 1 ?  SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport) : null;
   if (sock.recv_queue.length || !dest ||  (dest && dest.socket.readyState === dest.socket.CLOSING) || (dest && dest.socket.readyState === dest.socket.CLOSED)) {
    mask |= (64 | 1);
   }
   if (!dest ||  (dest && dest.socket.readyState === dest.socket.OPEN)) {
    mask |= 4;
   }
   if ((dest && dest.socket.readyState === dest.socket.CLOSING) || (dest && dest.socket.readyState === dest.socket.CLOSED)) {
    mask |= 16;
   }
   return mask;
  },
  ioctl(sock, request, arg) {
   switch (request) {
   case 21531:
    var bytes = 0;
    if (sock.recv_queue.length) {
     bytes = sock.recv_queue[0].data.length;
    }
    GROWABLE_HEAP_I32()[((arg) >> 2)] = bytes;
    return 0;

   default:
    return 28;
   }
  },
  close(sock) {
   if (sock.server) {
    try {
     sock.server.close();
    } catch (e) {}
    sock.server = null;
   }
   var peers = Object.keys(sock.peers);
   for (var i = 0; i < peers.length; i++) {
    var peer = sock.peers[peers[i]];
    try {
     peer.socket.close();
    } catch (e) {}
    SOCKFS.websocket_sock_ops.removePeer(sock, peer);
   }
   return 0;
  },
  bind(sock, addr, port) {
   if (typeof sock.saddr != "undefined" || typeof sock.sport != "undefined") {
    throw new FS.ErrnoError(28);
   }
   sock.saddr = addr;
   sock.sport = port;
   if (sock.type === 2) {
    if (sock.server) {
     sock.server.close();
     sock.server = null;
    }
    try {
     sock.sock_ops.listen(sock, 0);
    } catch (e) {
     if (!(e.name === "ErrnoError")) throw e;
     if (e.errno !== 138) throw e;
    }
   }
  },
  connect(sock, addr, port) {
   if (sock.server) {
    throw new FS.ErrnoError(138);
   }
   if (typeof sock.daddr != "undefined" && typeof sock.dport != "undefined") {
    var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
    if (dest) {
     if (dest.socket.readyState === dest.socket.CONNECTING) {
      throw new FS.ErrnoError(7);
     } else {
      throw new FS.ErrnoError(30);
     }
    }
   }
   var peer = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
   sock.daddr = peer.addr;
   sock.dport = peer.port;
   throw new FS.ErrnoError(26);
  },
  listen(sock, backlog) {
   if (!ENVIRONMENT_IS_NODE) {
    throw new FS.ErrnoError(138);
   }
   if (sock.server) {
    throw new FS.ErrnoError(28);
   }
   var WebSocketServer = require("ws").Server;
   var host = sock.saddr;
   sock.server = new WebSocketServer({
    host: host,
    port: sock.sport
   });
   Module["websocket"].emit("listen", sock.stream.fd);
   sock.server.on("connection", function(ws) {
    if (sock.type === 1) {
     var newsock = SOCKFS.createSocket(sock.family, sock.type, sock.protocol);
     var peer = SOCKFS.websocket_sock_ops.createPeer(newsock, ws);
     newsock.daddr = peer.addr;
     newsock.dport = peer.port;
     sock.pending.push(newsock);
     Module["websocket"].emit("connection", newsock.stream.fd);
    } else {
     SOCKFS.websocket_sock_ops.createPeer(sock, ws);
     Module["websocket"].emit("connection", sock.stream.fd);
    }
   });
   sock.server.on("close", function() {
    Module["websocket"].emit("close", sock.stream.fd);
    sock.server = null;
   });
   sock.server.on("error", function(error) {
    sock.error = 23;
    Module["websocket"].emit("error", [ sock.stream.fd, sock.error, "EHOSTUNREACH: Host is unreachable" ]);
   });
  },
  accept(listensock) {
   if (!listensock.server || !listensock.pending.length) {
    throw new FS.ErrnoError(28);
   }
   var newsock = listensock.pending.shift();
   newsock.stream.flags = listensock.stream.flags;
   return newsock;
  },
  getname(sock, peer) {
   var addr, port;
   if (peer) {
    if (sock.daddr === undefined || sock.dport === undefined) {
     throw new FS.ErrnoError(53);
    }
    addr = sock.daddr;
    port = sock.dport;
   } else {
    addr = sock.saddr || 0;
    port = sock.sport || 0;
   }
   return {
    addr: addr,
    port: port
   };
  },
  sendmsg(sock, buffer, offset, length, addr, port) {
   if (sock.type === 2) {
    if (addr === undefined || port === undefined) {
     addr = sock.daddr;
     port = sock.dport;
    }
    if (addr === undefined || port === undefined) {
     throw new FS.ErrnoError(17);
    }
   } else {
    addr = sock.daddr;
    port = sock.dport;
   }
   var dest = SOCKFS.websocket_sock_ops.getPeer(sock, addr, port);
   if (sock.type === 1) {
    if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
     throw new FS.ErrnoError(53);
    } else if (dest.socket.readyState === dest.socket.CONNECTING) {
     throw new FS.ErrnoError(6);
    }
   }
   if (ArrayBuffer.isView(buffer)) {
    offset += buffer.byteOffset;
    buffer = buffer.buffer;
   }
   var data;
   if (buffer instanceof SharedArrayBuffer) {
    data = new Uint8Array(new Uint8Array(buffer.slice(offset, offset + length))).buffer;
   } else {
    data = buffer.slice(offset, offset + length);
   }
   if (sock.type === 2) {
    if (!dest || dest.socket.readyState !== dest.socket.OPEN) {
     if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
      dest = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
     }
     dest.dgram_send_queue.push(data);
     return length;
    }
   }
   try {
    dest.socket.send(data);
    return length;
   } catch (e) {
    throw new FS.ErrnoError(28);
   }
  },
  recvmsg(sock, length) {
   if (sock.type === 1 && sock.server) {
    throw new FS.ErrnoError(53);
   }
   var queued = sock.recv_queue.shift();
   if (!queued) {
    if (sock.type === 1) {
     var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
     if (!dest) {
      throw new FS.ErrnoError(53);
     }
     if (dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
      return null;
     }
     throw new FS.ErrnoError(6);
    }
    throw new FS.ErrnoError(6);
   }
   var queuedLength = queued.data.byteLength || queued.data.length;
   var queuedOffset = queued.data.byteOffset || 0;
   var queuedBuffer = queued.data.buffer || queued.data;
   var bytesRead = Math.min(length, queuedLength);
   var res = {
    buffer: new Uint8Array(queuedBuffer, queuedOffset, bytesRead),
    addr: queued.addr,
    port: queued.port
   };
   if (sock.type === 1 && bytesRead < queuedLength) {
    var bytesRemaining = queuedLength - bytesRead;
    queued.data = new Uint8Array(queuedBuffer, queuedOffset + bytesRead, bytesRemaining);
    sock.recv_queue.unshift(queued);
   }
   return res;
  }
 }
};

var getSocketFromFD = fd => {
 var socket = SOCKFS.getSocket(fd);
 if (!socket) throw new FS.ErrnoError(8);
 return socket;
};

var setErrNo = value => {
 GROWABLE_HEAP_I32()[((___errno_location()) >> 2)] = value;
 return value;
};

var Sockets = {
 BUFFER_SIZE: 10240,
 MAX_BUFFER_SIZE: 10485760,
 nextFd: 1,
 fds: {},
 nextport: 1,
 maxport: 65535,
 peer: null,
 connections: {},
 portmap: {},
 localAddr: 4261412874,
 addrPool: [ 33554442, 50331658, 67108874, 83886090, 100663306, 117440522, 134217738, 150994954, 167772170, 184549386, 201326602, 218103818, 234881034 ]
};

var inetNtop4 = addr => (addr & 255) + "." + ((addr >> 8) & 255) + "." + ((addr >> 16) & 255) + "." + ((addr >> 24) & 255);

var inetNtop6 = ints => {
 var str = "";
 var word = 0;
 var longest = 0;
 var lastzero = 0;
 var zstart = 0;
 var len = 0;
 var i = 0;
 var parts = [ ints[0] & 65535, (ints[0] >> 16), ints[1] & 65535, (ints[1] >> 16), ints[2] & 65535, (ints[2] >> 16), ints[3] & 65535, (ints[3] >> 16) ];
 var hasipv4 = true;
 var v4part = "";
 for (i = 0; i < 5; i++) {
  if (parts[i] !== 0) {
   hasipv4 = false;
   break;
  }
 }
 if (hasipv4) {
  v4part = inetNtop4(parts[6] | (parts[7] << 16));
  if (parts[5] === -1) {
   str = "::ffff:";
   str += v4part;
   return str;
  }
  if (parts[5] === 0) {
   str = "::";
   if (v4part === "0.0.0.0") v4part = "";
   if (v4part === "0.0.0.1") v4part = "1";
   str += v4part;
   return str;
  }
 }
 for (word = 0; word < 8; word++) {
  if (parts[word] === 0) {
   if (word - lastzero > 1) {
    len = 0;
   }
   lastzero = word;
   len++;
  }
  if (len > longest) {
   longest = len;
   zstart = word - longest + 1;
  }
 }
 for (word = 0; word < 8; word++) {
  if (longest > 1) {
   if (parts[word] === 0 && word >= zstart && word < (zstart + longest)) {
    if (word === zstart) {
     str += ":";
     if (zstart === 0) str += ":";
    }
    continue;
   }
  }
  str += Number(_ntohs(parts[word] & 65535)).toString(16);
  str += word < 7 ? ":" : "";
 }
 return str;
};

var readSockaddr = (sa, salen) => {
 var family = GROWABLE_HEAP_I16()[((sa) >> 1)];
 var port = _ntohs(GROWABLE_HEAP_U16()[(((sa) + (2)) >> 1)]);
 var addr;
 switch (family) {
 case 2:
  if (salen !== 16) {
   return {
    errno: 28
   };
  }
  addr = GROWABLE_HEAP_I32()[(((sa) + (4)) >> 2)];
  addr = inetNtop4(addr);
  break;

 case 10:
  if (salen !== 28) {
   return {
    errno: 28
   };
  }
  addr = [ GROWABLE_HEAP_I32()[(((sa) + (8)) >> 2)], GROWABLE_HEAP_I32()[(((sa) + (12)) >> 2)], GROWABLE_HEAP_I32()[(((sa) + (16)) >> 2)], GROWABLE_HEAP_I32()[(((sa) + (20)) >> 2)] ];
  addr = inetNtop6(addr);
  break;

 default:
  return {
   errno: 5
  };
 }
 return {
  family: family,
  addr: addr,
  port: port
 };
};

var inetPton4 = str => {
 var b = str.split(".");
 for (var i = 0; i < 4; i++) {
  var tmp = Number(b[i]);
  if (isNaN(tmp)) return null;
  b[i] = tmp;
 }
 return (b[0] | (b[1] << 8) | (b[2] << 16) | (b[3] << 24)) >>> 0;
};

/** @suppress {checkTypes} */ var jstoi_q = str => parseInt(str);

var inetPton6 = str => {
 var words;
 var w, offset, z, i;
 /* http://home.deds.nl/~aeron/regex/ */ var valid6regx = /^((?=.*::)(?!.*::.+::)(::)?([\dA-F]{1,4}:(:|\b)|){5}|([\dA-F]{1,4}:){6})((([\dA-F]{1,4}((?!\3)::|:\b|$))|(?!\2\3)){2}|(((2[0-4]|1\d|[1-9])?\d|25[0-5])\.?\b){4})$/i;
 var parts = [];
 if (!valid6regx.test(str)) {
  return null;
 }
 if (str === "::") {
  return [ 0, 0, 0, 0, 0, 0, 0, 0 ];
 }
 if (str.startsWith("::")) {
  str = str.replace("::", "Z:");
 } else  {
  str = str.replace("::", ":Z:");
 }
 if (str.indexOf(".") > 0) {
  str = str.replace(new RegExp("[.]", "g"), ":");
  words = str.split(":");
  words[words.length - 4] = jstoi_q(words[words.length - 4]) + jstoi_q(words[words.length - 3]) * 256;
  words[words.length - 3] = jstoi_q(words[words.length - 2]) + jstoi_q(words[words.length - 1]) * 256;
  words = words.slice(0, words.length - 2);
 } else {
  words = str.split(":");
 }
 offset = 0;
 z = 0;
 for (w = 0; w < words.length; w++) {
  if (typeof words[w] == "string") {
   if (words[w] === "Z") {
    for (z = 0; z < (8 - words.length + 1); z++) {
     parts[w + z] = 0;
    }
    offset = z - 1;
   } else {
    parts[w + offset] = _htons(parseInt(words[w], 16));
   }
  } else {
   parts[w + offset] = words[w];
  }
 }
 return [ (parts[1] << 16) | parts[0], (parts[3] << 16) | parts[2], (parts[5] << 16) | parts[4], (parts[7] << 16) | parts[6] ];
};

var DNS = {
 address_map: {
  id: 1,
  addrs: {},
  names: {}
 },
 lookup_name(name) {
  var res = inetPton4(name);
  if (res !== null) {
   return name;
  }
  res = inetPton6(name);
  if (res !== null) {
   return name;
  }
  var addr;
  if (DNS.address_map.addrs[name]) {
   addr = DNS.address_map.addrs[name];
  } else {
   var id = DNS.address_map.id++;
   assert(id < 65535, "exceeded max address mappings of 65535");
   addr = "172.29." + (id & 255) + "." + (id & 65280);
   DNS.address_map.names[addr] = name;
   DNS.address_map.addrs[name] = addr;
  }
  return addr;
 },
 lookup_addr(addr) {
  if (DNS.address_map.names[addr]) {
   return DNS.address_map.names[addr];
  }
  return null;
 }
};

/** @param {boolean=} allowNull */ var getSocketAddress = (addrp, addrlen, allowNull) => {
 if (allowNull && addrp === 0) return null;
 var info = readSockaddr(addrp, addrlen);
 if (info.errno) throw new FS.ErrnoError(info.errno);
 info.addr = DNS.lookup_addr(info.addr) || info.addr;
 return info;
};

function ___syscall_bind(fd, addr, addrlen, d1, d2, d3) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(3, 1, fd, addr, addrlen, d1, d2, d3);
 try {
  var sock = getSocketFromFD(fd);
  var info = getSocketAddress(addr, addrlen);
  sock.sock_ops.bind(sock, info.addr, info.port);
  return 0;
 } catch (e) {
  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
  return -e.errno;
 }
}

function ___syscall_faccessat(dirfd, path, amode, flags) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(4, 1, dirfd, path, amode, flags);
 try {
  path = SYSCALLS.getStr(path);
  assert(flags === 0);
  path = SYSCALLS.calculateAt(dirfd, path);
  if (amode & ~7) {
   return -28;
  }
  var lookup = FS.lookupPath(path, {
   follow: true
  });
  var node = lookup.node;
  if (!node) {
   return -44;
  }
  var perms = "";
  if (amode & 4) perms += "r";
  if (amode & 2) perms += "w";
  if (amode & 1) perms += "x";
  if (perms && /* otherwise, they've just passed F_OK */ FS.nodePermissions(node, perms)) {
   return -2;
  }
  return 0;
 } catch (e) {
  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
  return -e.errno;
 }
}

function ___syscall_fcntl64(fd, cmd, varargs) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(5, 1, fd, cmd, varargs);
 SYSCALLS.varargs = varargs;
 try {
  var stream = SYSCALLS.getStreamFromFD(fd);
  switch (cmd) {
  case 0:
   {
    var arg = SYSCALLS.get();
    if (arg < 0) {
     return -28;
    }
    while (FS.streams[arg]) {
     arg++;
    }
    var newStream;
    newStream = FS.createStream(stream, arg);
    return newStream.fd;
   }

  case 1:
  case 2:
   return 0;

  case 3:
   return stream.flags;

  case 4:
   {
    var arg = SYSCALLS.get();
    stream.flags |= arg;
    return 0;
   }

  case 5:
   {
    var arg = SYSCALLS.getp();
    var offset = 0;
    GROWABLE_HEAP_I16()[(((arg) + (offset)) >> 1)] = 2;
    return 0;
   }

  case 6:
  case 7:
   return 0;

  case 16:
  case 8:
   return -28;

  case 9:
   setErrNo(28);
   return -1;

  default:
   {
    return -28;
   }
  }
 } catch (e) {
  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
  return -e.errno;
 }
}

var stringToUTF8 = (str, outPtr, maxBytesToWrite) => {
 assert(typeof maxBytesToWrite == "number", "stringToUTF8(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!");
 return stringToUTF8Array(str, GROWABLE_HEAP_U8(), outPtr, maxBytesToWrite);
};

function ___syscall_getdents64(fd, dirp, count) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(6, 1, fd, dirp, count);
 try {
  var stream = SYSCALLS.getStreamFromFD(fd);
  if (!stream.getdents) {
   stream.getdents = FS.readdir(stream.path);
  }
  var struct_size = 280;
  var pos = 0;
  var off = FS.llseek(stream, 0, 1);
  var idx = Math.floor(off / struct_size);
  while (idx < stream.getdents.length && pos + struct_size <= count) {
   var id;
   var type;
   var name = stream.getdents[idx];
   if (name === ".") {
    id = stream.node.id;
    type = 4;
   } else if (name === "..") {
    var lookup = FS.lookupPath(stream.path, {
     parent: true
    });
    id = lookup.node.id;
    type = 4;
   } else {
    var child = FS.lookupNode(stream.node, name);
    id = child.id;
    type = FS.isChrdev(child.mode) ? 2 :  FS.isDir(child.mode) ? 4 :  FS.isLink(child.mode) ? 10 :  8;
   }
   assert(id);
   (tempI64 = [ id >>> 0, (tempDouble = id, (+(Math.abs(tempDouble))) >= 1 ? (tempDouble > 0 ? (+(Math.floor((tempDouble) / 4294967296))) >>> 0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble))) >>> 0)) / 4294967296))))) >>> 0) : 0) ], 
   GROWABLE_HEAP_I32()[((dirp + pos) >> 2)] = tempI64[0], GROWABLE_HEAP_I32()[(((dirp + pos) + (4)) >> 2)] = tempI64[1]);
   (tempI64 = [ (idx + 1) * struct_size >>> 0, (tempDouble = (idx + 1) * struct_size, 
   (+(Math.abs(tempDouble))) >= 1 ? (tempDouble > 0 ? (+(Math.floor((tempDouble) / 4294967296))) >>> 0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble))) >>> 0)) / 4294967296))))) >>> 0) : 0) ], 
   GROWABLE_HEAP_I32()[(((dirp + pos) + (8)) >> 2)] = tempI64[0], GROWABLE_HEAP_I32()[(((dirp + pos) + (12)) >> 2)] = tempI64[1]);
   GROWABLE_HEAP_I16()[(((dirp + pos) + (16)) >> 1)] = 280;
   GROWABLE_HEAP_I8()[(((dirp + pos) + (18)) >> 0)] = type;
   stringToUTF8(name, dirp + pos + 19, 256);
   pos += struct_size;
   idx += 1;
  }
  FS.llseek(stream, idx * struct_size, 0);
  return pos;
 } catch (e) {
  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
  return -e.errno;
 }
}

/** @param {number=} addrlen */ var writeSockaddr = (sa, family, addr, port, addrlen) => {
 switch (family) {
 case 2:
  addr = inetPton4(addr);
  zeroMemory(sa, 16);
  if (addrlen) {
   GROWABLE_HEAP_I32()[((addrlen) >> 2)] = 16;
  }
  GROWABLE_HEAP_I16()[((sa) >> 1)] = family;
  GROWABLE_HEAP_I32()[(((sa) + (4)) >> 2)] = addr;
  GROWABLE_HEAP_I16()[(((sa) + (2)) >> 1)] = _htons(port);
  break;

 case 10:
  addr = inetPton6(addr);
  zeroMemory(sa, 28);
  if (addrlen) {
   GROWABLE_HEAP_I32()[((addrlen) >> 2)] = 28;
  }
  GROWABLE_HEAP_I32()[((sa) >> 2)] = family;
  GROWABLE_HEAP_I32()[(((sa) + (8)) >> 2)] = addr[0];
  GROWABLE_HEAP_I32()[(((sa) + (12)) >> 2)] = addr[1];
  GROWABLE_HEAP_I32()[(((sa) + (16)) >> 2)] = addr[2];
  GROWABLE_HEAP_I32()[(((sa) + (20)) >> 2)] = addr[3];
  GROWABLE_HEAP_I16()[(((sa) + (2)) >> 1)] = _htons(port);
  break;

 default:
  return 5;
 }
 return 0;
};

function ___syscall_getsockname(fd, addr, addrlen, d1, d2, d3) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(7, 1, fd, addr, addrlen, d1, d2, d3);
 try {
  var sock = getSocketFromFD(fd);
  var errno = writeSockaddr(addr, sock.family, DNS.lookup_name(sock.saddr || "0.0.0.0"), sock.sport, addrlen);
  assert(!errno);
  return 0;
 } catch (e) {
  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
  return -e.errno;
 }
}

function ___syscall_getsockopt(fd, level, optname, optval, optlen, d1) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(8, 1, fd, level, optname, optval, optlen, d1);
 try {
  var sock = getSocketFromFD(fd);
  if (level === 1) {
   if (optname === 4) {
    GROWABLE_HEAP_I32()[((optval) >> 2)] = sock.error;
    GROWABLE_HEAP_I32()[((optlen) >> 2)] = 4;
    sock.error = null;
    return 0;
   }
  }
  return -50;
 }  catch (e) {
  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
  return -e.errno;
 }
}

function ___syscall_ioctl(fd, op, varargs) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(9, 1, fd, op, varargs);
 SYSCALLS.varargs = varargs;
 try {
  var stream = SYSCALLS.getStreamFromFD(fd);
  switch (op) {
  case 21509:
   {
    if (!stream.tty) return -59;
    return 0;
   }

  case 21505:
   {
    if (!stream.tty) return -59;
    if (stream.tty.ops.ioctl_tcgets) {
     var termios = stream.tty.ops.ioctl_tcgets(stream);
     var argp = SYSCALLS.getp();
     GROWABLE_HEAP_I32()[((argp) >> 2)] = termios.c_iflag || 0;
     GROWABLE_HEAP_I32()[(((argp) + (4)) >> 2)] = termios.c_oflag || 0;
     GROWABLE_HEAP_I32()[(((argp) + (8)) >> 2)] = termios.c_cflag || 0;
     GROWABLE_HEAP_I32()[(((argp) + (12)) >> 2)] = termios.c_lflag || 0;
     for (var i = 0; i < 32; i++) {
      GROWABLE_HEAP_I8()[(((argp + i) + (17)) >> 0)] = termios.c_cc[i] || 0;
     }
     return 0;
    }
    return 0;
   }

  case 21510:
  case 21511:
  case 21512:
   {
    if (!stream.tty) return -59;
    return 0;
   }

  case 21506:
  case 21507:
  case 21508:
   {
    if (!stream.tty) return -59;
    if (stream.tty.ops.ioctl_tcsets) {
     var argp = SYSCALLS.getp();
     var c_iflag = GROWABLE_HEAP_I32()[((argp) >> 2)];
     var c_oflag = GROWABLE_HEAP_I32()[(((argp) + (4)) >> 2)];
     var c_cflag = GROWABLE_HEAP_I32()[(((argp) + (8)) >> 2)];
     var c_lflag = GROWABLE_HEAP_I32()[(((argp) + (12)) >> 2)];
     var c_cc = [];
     for (var i = 0; i < 32; i++) {
      c_cc.push(GROWABLE_HEAP_I8()[(((argp + i) + (17)) >> 0)]);
     }
     return stream.tty.ops.ioctl_tcsets(stream.tty, op, {
      c_iflag: c_iflag,
      c_oflag: c_oflag,
      c_cflag: c_cflag,
      c_lflag: c_lflag,
      c_cc: c_cc
     });
    }
    return 0;
   }

  case 21519:
   {
    if (!stream.tty) return -59;
    var argp = SYSCALLS.getp();
    GROWABLE_HEAP_I32()[((argp) >> 2)] = 0;
    return 0;
   }

  case 21520:
   {
    if (!stream.tty) return -59;
    return -28;
   }

  case 21531:
   {
    var argp = SYSCALLS.getp();
    return FS.ioctl(stream, op, argp);
   }

  case 21523:
   {
    if (!stream.tty) return -59;
    if (stream.tty.ops.ioctl_tiocgwinsz) {
     var winsize = stream.tty.ops.ioctl_tiocgwinsz(stream.tty);
     var argp = SYSCALLS.getp();
     GROWABLE_HEAP_I16()[((argp) >> 1)] = winsize[0];
     GROWABLE_HEAP_I16()[(((argp) + (2)) >> 1)] = winsize[1];
    }
    return 0;
   }

  case 21524:
   {
    if (!stream.tty) return -59;
    return 0;
   }

  case 21515:
   {
    if (!stream.tty) return -59;
    return 0;
   }

  default:
   return -28;
  }
 }  catch (e) {
  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
  return -e.errno;
 }
}

function ___syscall_mkdirat(dirfd, path, mode) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(10, 1, dirfd, path, mode);
 try {
  path = SYSCALLS.getStr(path);
  path = SYSCALLS.calculateAt(dirfd, path);
  path = PATH.normalize(path);
  if (path[path.length - 1] === "/") path = path.substr(0, path.length - 1);
  FS.mkdir(path, mode, 0);
  return 0;
 } catch (e) {
  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
  return -e.errno;
 }
}

function ___syscall_openat(dirfd, path, flags, varargs) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(11, 1, dirfd, path, flags, varargs);
 SYSCALLS.varargs = varargs;
 try {
  path = SYSCALLS.getStr(path);
  path = SYSCALLS.calculateAt(dirfd, path);
  var mode = varargs ? SYSCALLS.get() : 0;
  return FS.open(path, flags, mode).fd;
 } catch (e) {
  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
  return -e.errno;
 }
}

function ___syscall_recvfrom(fd, buf, len, flags, addr, addrlen) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(12, 1, fd, buf, len, flags, addr, addrlen);
 try {
  var sock = getSocketFromFD(fd);
  var msg = sock.sock_ops.recvmsg(sock, len);
  if (!msg) return 0;
  if (addr) {
   var errno = writeSockaddr(addr, sock.family, DNS.lookup_name(msg.addr), msg.port, addrlen);
   assert(!errno);
  }
  GROWABLE_HEAP_U8().set(msg.buffer, buf);
  return msg.buffer.byteLength;
 } catch (e) {
  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
  return -e.errno;
 }
}

function ___syscall_renameat(olddirfd, oldpath, newdirfd, newpath) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(13, 1, olddirfd, oldpath, newdirfd, newpath);
 try {
  oldpath = SYSCALLS.getStr(oldpath);
  newpath = SYSCALLS.getStr(newpath);
  oldpath = SYSCALLS.calculateAt(olddirfd, oldpath);
  newpath = SYSCALLS.calculateAt(newdirfd, newpath);
  FS.rename(oldpath, newpath);
  return 0;
 } catch (e) {
  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
  return -e.errno;
 }
}

function ___syscall_rmdir(path) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(14, 1, path);
 try {
  path = SYSCALLS.getStr(path);
  FS.rmdir(path);
  return 0;
 } catch (e) {
  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
  return -e.errno;
 }
}

function ___syscall_sendto(fd, message, length, flags, addr, addr_len) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(15, 1, fd, message, length, flags, addr, addr_len);
 try {
  var sock = getSocketFromFD(fd);
  var dest = getSocketAddress(addr, addr_len, true);
  if (!dest) {
   return FS.write(sock.stream, GROWABLE_HEAP_I8(), message, length);
  }
  return sock.sock_ops.sendmsg(sock, GROWABLE_HEAP_I8(), message, length, dest.addr, dest.port);
 } catch (e) {
  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
  return -e.errno;
 }
}

function ___syscall_socket(domain, type, protocol) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(16, 1, domain, type, protocol);
 try {
  var sock = SOCKFS.createSocket(domain, type, protocol);
  assert(sock.stream.fd < 64);
  return sock.stream.fd;
 } catch (e) {
  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
  return -e.errno;
 }
}

function ___syscall_unlinkat(dirfd, path, flags) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(17, 1, dirfd, path, flags);
 try {
  path = SYSCALLS.getStr(path);
  path = SYSCALLS.calculateAt(dirfd, path);
  if (flags === 0) {
   FS.unlink(path);
  } else if (flags === 512) {
   FS.rmdir(path);
  } else {
   abort("Invalid flags passed to unlinkat");
  }
  return 0;
 } catch (e) {
  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
  return -e.errno;
 }
}

var nowIsMonotonic = true;

var __emscripten_get_now_is_monotonic = () => nowIsMonotonic;

var __emscripten_thread_mailbox_await = pthread_ptr => {
 if (typeof Atomics.waitAsync === "function") {
  var wait = Atomics.waitAsync(GROWABLE_HEAP_I32(), ((pthread_ptr) >> 2), pthread_ptr);
  assert(wait.async);
  wait.value.then(checkMailbox);
  var waitingAsync = pthread_ptr + 128;
  Atomics.store(GROWABLE_HEAP_I32(), ((waitingAsync) >> 2), 1);
 }
};

Module["__emscripten_thread_mailbox_await"] = __emscripten_thread_mailbox_await;

var checkMailbox = () => {
 var pthread_ptr = _pthread_self();
 if (pthread_ptr) {
  __emscripten_thread_mailbox_await(pthread_ptr);
  callUserCallback(__emscripten_check_mailbox);
 }
};

Module["checkMailbox"] = checkMailbox;

var __emscripten_notify_mailbox_postmessage = (targetThreadId, currThreadId, mainThreadId) => {
 if (targetThreadId == currThreadId) {
  setTimeout(() => checkMailbox());
 } else if (ENVIRONMENT_IS_PTHREAD) {
  postMessage({
   "targetThread": targetThreadId,
   "cmd": "checkMailbox"
  });
 } else {
  var worker = PThread.pthreads[targetThreadId];
  if (!worker) {
   err(`Cannot send message to thread with ID ${targetThreadId}, unknown thread ID!`);
   return;
  }
  worker.postMessage({
   "cmd": "checkMailbox"
  });
 }
};

var proxiedJSCallArgs = [];

var __emscripten_receive_on_main_thread_js = (index, callingThread, numCallArgs, args) => {
 proxiedJSCallArgs.length = numCallArgs;
 var b = ((args) >> 3);
 for (var i = 0; i < numCallArgs; i++) {
  proxiedJSCallArgs[i] = GROWABLE_HEAP_F64()[b + i];
 }
 var isEmAsmConst = index < 0;
 var func = !isEmAsmConst ? proxiedFunctionTable[index] : ASM_CONSTS[-index - 1];
 assert(func.length == numCallArgs, "Call args mismatch in _emscripten_receive_on_main_thread_js");
 PThread.currentProxiedOperationCallerThread = callingThread;
 var rtn = func.apply(null, proxiedJSCallArgs);
 PThread.currentProxiedOperationCallerThread = 0;
 assert(typeof rtn != "bigint");
 return rtn;
};

function __emscripten_runtime_keepalive_clear() {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(18, 1);
 noExitRuntime = false;
 runtimeKeepaliveCounter = 0;
}

var __emscripten_thread_set_strongref = thread => {
 if (ENVIRONMENT_IS_NODE) {
  PThread.pthreads[thread].ref();
 }
};

var _abort = () => {
 abort("native code called abort()");
};

var AL = {
 QUEUE_INTERVAL: 25,
 QUEUE_LOOKAHEAD: .1,
 DEVICE_NAME: "Emscripten OpenAL",
 CAPTURE_DEVICE_NAME: "Emscripten OpenAL capture",
 ALC_EXTENSIONS: {
  ALC_SOFT_pause_device: true,
  ALC_SOFT_HRTF: true
 },
 AL_EXTENSIONS: {
  AL_EXT_float32: true,
  AL_SOFT_loop_points: true,
  AL_SOFT_source_length: true,
  AL_EXT_source_distance_model: true,
  AL_SOFT_source_spatialize: true
 },
 _alcErr: 0,
 alcErr: 0,
 deviceRefCounts: {},
 alcStringCache: {},
 paused: false,
 stringCache: {},
 contexts: {},
 currentCtx: null,
 buffers: {
  0: {
   id: 0,
   refCount: 0,
   audioBuf: null,
   frequency: 0,
   bytesPerSample: 2,
   channels: 1,
   length: 0
  }
 },
 paramArray: [],
 _nextId: 1,
 newId: () => AL.freeIds.length > 0 ? AL.freeIds.pop() : AL._nextId++,
 freeIds: [],
 scheduleContextAudio: ctx => {
  if (Browser.mainLoop.timingMode === 1 && document["visibilityState"] != "visible") {
   return;
  }
  for (var i in ctx.sources) {
   AL.scheduleSourceAudio(ctx.sources[i]);
  }
 },
 scheduleSourceAudio: (src, lookahead) => {
  if (Browser.mainLoop.timingMode === 1 && document["visibilityState"] != "visible") {
   return;
  }
  if (src.state !== 4114) {
   return;
  }
  var currentTime = AL.updateSourceTime(src);
  var startTime = src.bufStartTime;
  var startOffset = src.bufOffset;
  var bufCursor = src.bufsProcessed;
  for (var i = 0; i < src.audioQueue.length; i++) {
   var audioSrc = src.audioQueue[i];
   startTime = audioSrc._startTime + audioSrc._duration;
   startOffset = 0;
   bufCursor += audioSrc._skipCount + 1;
  }
  if (!lookahead) {
   lookahead = AL.QUEUE_LOOKAHEAD;
  }
  var lookaheadTime = currentTime + lookahead;
  var skipCount = 0;
  while (startTime < lookaheadTime) {
   if (bufCursor >= src.bufQueue.length) {
    if (src.looping) {
     bufCursor %= src.bufQueue.length;
    } else {
     break;
    }
   }
   var buf = src.bufQueue[bufCursor % src.bufQueue.length];
   if (buf.length === 0) {
    skipCount++;
    if (skipCount === src.bufQueue.length) {
     break;
    }
   } else {
    var audioSrc = src.context.audioCtx.createBufferSource();
    audioSrc.buffer = buf.audioBuf;
    audioSrc.playbackRate.value = src.playbackRate;
    if (buf.audioBuf._loopStart || buf.audioBuf._loopEnd) {
     audioSrc.loopStart = buf.audioBuf._loopStart;
     audioSrc.loopEnd = buf.audioBuf._loopEnd;
    }
    var duration = 0;
    if (src.type === 4136 && src.looping) {
     duration = Number.POSITIVE_INFINITY;
     audioSrc.loop = true;
     if (buf.audioBuf._loopStart) {
      audioSrc.loopStart = buf.audioBuf._loopStart;
     }
     if (buf.audioBuf._loopEnd) {
      audioSrc.loopEnd = buf.audioBuf._loopEnd;
     }
    } else {
     duration = (buf.audioBuf.duration - startOffset) / src.playbackRate;
    }
    audioSrc._startOffset = startOffset;
    audioSrc._duration = duration;
    audioSrc._skipCount = skipCount;
    skipCount = 0;
    audioSrc.connect(src.gain);
    if (typeof audioSrc.start != "undefined") {
     startTime = Math.max(startTime, src.context.audioCtx.currentTime);
     audioSrc.start(startTime, startOffset);
    } else if (typeof audioSrc.noteOn != "undefined") {
     startTime = Math.max(startTime, src.context.audioCtx.currentTime);
     audioSrc.noteOn(startTime);
    }
    audioSrc._startTime = startTime;
    src.audioQueue.push(audioSrc);
    startTime += duration;
   }
   startOffset = 0;
   bufCursor++;
  }
 },
 updateSourceTime: src => {
  var currentTime = src.context.audioCtx.currentTime;
  if (src.state !== 4114) {
   return currentTime;
  }
  if (!isFinite(src.bufStartTime)) {
   src.bufStartTime = currentTime - src.bufOffset / src.playbackRate;
   src.bufOffset = 0;
  }
  var nextStartTime = 0;
  while (src.audioQueue.length) {
   var audioSrc = src.audioQueue[0];
   src.bufsProcessed += audioSrc._skipCount;
   nextStartTime = audioSrc._startTime + audioSrc._duration;
   if (currentTime < nextStartTime) {
    break;
   }
   src.audioQueue.shift();
   src.bufStartTime = nextStartTime;
   src.bufOffset = 0;
   src.bufsProcessed++;
  }
  if (src.bufsProcessed >= src.bufQueue.length && !src.looping) {
   AL.setSourceState(src, 4116);
  } else if (src.type === 4136 && src.looping) {
   var buf = src.bufQueue[0];
   if (buf.length === 0) {
    src.bufOffset = 0;
   } else {
    var delta = (currentTime - src.bufStartTime) * src.playbackRate;
    var loopStart = buf.audioBuf._loopStart || 0;
    var loopEnd = buf.audioBuf._loopEnd || buf.audioBuf.duration;
    if (loopEnd <= loopStart) {
     loopEnd = buf.audioBuf.duration;
    }
    if (delta < loopEnd) {
     src.bufOffset = delta;
    } else {
     src.bufOffset = loopStart + (delta - loopStart) % (loopEnd - loopStart);
    }
   }
  } else if (src.audioQueue[0]) {
   src.bufOffset = (currentTime - src.audioQueue[0]._startTime) * src.playbackRate;
  } else {
   if (src.type !== 4136 && src.looping) {
    var srcDuration = AL.sourceDuration(src) / src.playbackRate;
    if (srcDuration > 0) {
     src.bufStartTime += Math.floor((currentTime - src.bufStartTime) / srcDuration) * srcDuration;
    }
   }
   for (var i = 0; i < src.bufQueue.length; i++) {
    if (src.bufsProcessed >= src.bufQueue.length) {
     if (src.looping) {
      src.bufsProcessed %= src.bufQueue.length;
     } else {
      AL.setSourceState(src, 4116);
      break;
     }
    }
    var buf = src.bufQueue[src.bufsProcessed];
    if (buf.length > 0) {
     nextStartTime = src.bufStartTime + buf.audioBuf.duration / src.playbackRate;
     if (currentTime < nextStartTime) {
      src.bufOffset = (currentTime - src.bufStartTime) * src.playbackRate;
      break;
     }
     src.bufStartTime = nextStartTime;
    }
    src.bufOffset = 0;
    src.bufsProcessed++;
   }
  }
  return currentTime;
 },
 cancelPendingSourceAudio: src => {
  AL.updateSourceTime(src);
  for (var i = 1; i < src.audioQueue.length; i++) {
   var audioSrc = src.audioQueue[i];
   audioSrc.stop();
  }
  if (src.audioQueue.length > 1) {
   src.audioQueue.length = 1;
  }
 },
 stopSourceAudio: src => {
  for (var i = 0; i < src.audioQueue.length; i++) {
   src.audioQueue[i].stop();
  }
  src.audioQueue.length = 0;
 },
 setSourceState: (src, state) => {
  if (state === 4114) {
   if (src.state === 4114 || src.state == 4116) {
    src.bufsProcessed = 0;
    src.bufOffset = 0;
   } else {}
   AL.stopSourceAudio(src);
   src.state = 4114;
   src.bufStartTime = Number.NEGATIVE_INFINITY;
   AL.scheduleSourceAudio(src);
  } else if (state === 4115) {
   if (src.state === 4114) {
    AL.updateSourceTime(src);
    AL.stopSourceAudio(src);
    src.state = 4115;
   }
  } else if (state === 4116) {
   if (src.state !== 4113) {
    src.state = 4116;
    src.bufsProcessed = src.bufQueue.length;
    src.bufStartTime = Number.NEGATIVE_INFINITY;
    src.bufOffset = 0;
    AL.stopSourceAudio(src);
   }
  } else if (state === 4113) {
   if (src.state !== 4113) {
    src.state = 4113;
    src.bufsProcessed = 0;
    src.bufStartTime = Number.NEGATIVE_INFINITY;
    src.bufOffset = 0;
    AL.stopSourceAudio(src);
   }
  }
 },
 initSourcePanner: src => {
  if (src.type === 4144) /* AL_UNDETERMINED */ {
   return;
  }
  var templateBuf = AL.buffers[0];
  for (var i = 0; i < src.bufQueue.length; i++) {
   if (src.bufQueue[i].id !== 0) {
    templateBuf = src.bufQueue[i];
    break;
   }
  }
  if (src.spatialize === 1 || (src.spatialize === 2 && /* AL_AUTO_SOFT */ templateBuf.channels === 1)) {
   if (src.panner) {
    return;
   }
   src.panner = src.context.audioCtx.createPanner();
   AL.updateSourceGlobal(src);
   AL.updateSourceSpace(src);
   src.panner.connect(src.context.gain);
   src.gain.disconnect();
   src.gain.connect(src.panner);
  } else {
   if (!src.panner) {
    return;
   }
   src.panner.disconnect();
   src.gain.disconnect();
   src.gain.connect(src.context.gain);
   src.panner = null;
  }
 },
 updateContextGlobal: ctx => {
  for (var i in ctx.sources) {
   AL.updateSourceGlobal(ctx.sources[i]);
  }
 },
 updateSourceGlobal: src => {
  var panner = src.panner;
  if (!panner) {
   return;
  }
  panner.refDistance = src.refDistance;
  panner.maxDistance = src.maxDistance;
  panner.rolloffFactor = src.rolloffFactor;
  panner.panningModel = src.context.hrtf ? "HRTF" : "equalpower";
  var distanceModel = src.context.sourceDistanceModel ? src.distanceModel : src.context.distanceModel;
  switch (distanceModel) {
  case 0:
   panner.distanceModel = "inverse";
   panner.refDistance = 340282e33;
   /* FLT_MAX */ break;

  case 53249:
  /* AL_INVERSE_DISTANCE */ case 53250:
   /* AL_INVERSE_DISTANCE_CLAMPED */ panner.distanceModel = "inverse";
   break;

  case 53251:
  /* AL_LINEAR_DISTANCE */ case 53252:
   /* AL_LINEAR_DISTANCE_CLAMPED */ panner.distanceModel = "linear";
   break;

  case 53253:
  /* AL_EXPONENT_DISTANCE */ case 53254:
   /* AL_EXPONENT_DISTANCE_CLAMPED */ panner.distanceModel = "exponential";
   break;
  }
 },
 updateListenerSpace: ctx => {
  var listener = ctx.audioCtx.listener;
  if (listener.positionX) {
   listener.positionX.value = ctx.listener.position[0];
   listener.positionY.value = ctx.listener.position[1];
   listener.positionZ.value = ctx.listener.position[2];
  } else {
   listener.setPosition(ctx.listener.position[0], ctx.listener.position[1], ctx.listener.position[2]);
  }
  if (listener.forwardX) {
   listener.forwardX.value = ctx.listener.direction[0];
   listener.forwardY.value = ctx.listener.direction[1];
   listener.forwardZ.value = ctx.listener.direction[2];
   listener.upX.value = ctx.listener.up[0];
   listener.upY.value = ctx.listener.up[1];
   listener.upZ.value = ctx.listener.up[2];
  } else {
   listener.setOrientation(ctx.listener.direction[0], ctx.listener.direction[1], ctx.listener.direction[2], ctx.listener.up[0], ctx.listener.up[1], ctx.listener.up[2]);
  }
  for (var i in ctx.sources) {
   AL.updateSourceSpace(ctx.sources[i]);
  }
 },
 updateSourceSpace: src => {
  if (!src.panner) {
   return;
  }
  var panner = src.panner;
  var posX = src.position[0];
  var posY = src.position[1];
  var posZ = src.position[2];
  var dirX = src.direction[0];
  var dirY = src.direction[1];
  var dirZ = src.direction[2];
  var listener = src.context.listener;
  var lPosX = listener.position[0];
  var lPosY = listener.position[1];
  var lPosZ = listener.position[2];
  if (src.relative) {
   var lBackX = -listener.direction[0];
   var lBackY = -listener.direction[1];
   var lBackZ = -listener.direction[2];
   var lUpX = listener.up[0];
   var lUpY = listener.up[1];
   var lUpZ = listener.up[2];
   var inverseMagnitude = (x, y, z) => {
    var length = Math.sqrt(x * x + y * y + z * z);
    if (length < Number.EPSILON) {
     return 0;
    }
    return 1 / length;
   };
   var invMag = inverseMagnitude(lBackX, lBackY, lBackZ);
   lBackX *= invMag;
   lBackY *= invMag;
   lBackZ *= invMag;
   invMag = inverseMagnitude(lUpX, lUpY, lUpZ);
   lUpX *= invMag;
   lUpY *= invMag;
   lUpZ *= invMag;
   var lRightX = (lUpY * lBackZ - lUpZ * lBackY);
   var lRightY = (lUpZ * lBackX - lUpX * lBackZ);
   var lRightZ = (lUpX * lBackY - lUpY * lBackX);
   invMag = inverseMagnitude(lRightX, lRightY, lRightZ);
   lRightX *= invMag;
   lRightY *= invMag;
   lRightZ *= invMag;
   lUpX = (lBackY * lRightZ - lBackZ * lRightY);
   lUpY = (lBackZ * lRightX - lBackX * lRightZ);
   lUpZ = (lBackX * lRightY - lBackY * lRightX);
   var oldX = dirX;
   var oldY = dirY;
   var oldZ = dirZ;
   dirX = oldX * lRightX + oldY * lUpX + oldZ * lBackX;
   dirY = oldX * lRightY + oldY * lUpY + oldZ * lBackY;
   dirZ = oldX * lRightZ + oldY * lUpZ + oldZ * lBackZ;
   oldX = posX;
   oldY = posY;
   oldZ = posZ;
   posX = oldX * lRightX + oldY * lUpX + oldZ * lBackX;
   posY = oldX * lRightY + oldY * lUpY + oldZ * lBackY;
   posZ = oldX * lRightZ + oldY * lUpZ + oldZ * lBackZ;
   posX += lPosX;
   posY += lPosY;
   posZ += lPosZ;
  }
  if (panner.positionX) {
   if (posX != panner.positionX.value) panner.positionX.value = posX;
   if (posY != panner.positionY.value) panner.positionY.value = posY;
   if (posZ != panner.positionZ.value) panner.positionZ.value = posZ;
  } else {
   panner.setPosition(posX, posY, posZ);
  }
  if (panner.orientationX) {
   if (dirX != panner.orientationX.value) panner.orientationX.value = dirX;
   if (dirY != panner.orientationY.value) panner.orientationY.value = dirY;
   if (dirZ != panner.orientationZ.value) panner.orientationZ.value = dirZ;
  } else {
   panner.setOrientation(dirX, dirY, dirZ);
  }
  var oldShift = src.dopplerShift;
  var velX = src.velocity[0];
  var velY = src.velocity[1];
  var velZ = src.velocity[2];
  var lVelX = listener.velocity[0];
  var lVelY = listener.velocity[1];
  var lVelZ = listener.velocity[2];
  if (posX === lPosX && posY === lPosY && posZ === lPosZ || velX === lVelX && velY === lVelY && velZ === lVelZ) {
   src.dopplerShift = 1;
  } else {
   var speedOfSound = src.context.speedOfSound;
   var dopplerFactor = src.context.dopplerFactor;
   var slX = lPosX - posX;
   var slY = lPosY - posY;
   var slZ = lPosZ - posZ;
   var magSl = Math.sqrt(slX * slX + slY * slY + slZ * slZ);
   var vls = (slX * lVelX + slY * lVelY + slZ * lVelZ) / magSl;
   var vss = (slX * velX + slY * velY + slZ * velZ) / magSl;
   vls = Math.min(vls, speedOfSound / dopplerFactor);
   vss = Math.min(vss, speedOfSound / dopplerFactor);
   src.dopplerShift = (speedOfSound - dopplerFactor * vls) / (speedOfSound - dopplerFactor * vss);
  }
  if (src.dopplerShift !== oldShift) {
   AL.updateSourceRate(src);
  }
 },
 updateSourceRate: src => {
  if (src.state === 4114) {
   AL.cancelPendingSourceAudio(src);
   var audioSrc = src.audioQueue[0];
   if (!audioSrc) {
    return;
   }
   var duration;
   if (src.type === 4136 && src.looping) {
    duration = Number.POSITIVE_INFINITY;
   } else {
    duration = (audioSrc.buffer.duration - audioSrc._startOffset) / src.playbackRate;
   }
   audioSrc._duration = duration;
   audioSrc.playbackRate.value = src.playbackRate;
   AL.scheduleSourceAudio(src);
  }
 },
 sourceDuration: src => {
  var length = 0;
  for (var i = 0; i < src.bufQueue.length; i++) {
   var audioBuf = src.bufQueue[i].audioBuf;
   length += audioBuf ? audioBuf.duration : 0;
  }
  return length;
 },
 sourceTell: src => {
  AL.updateSourceTime(src);
  var offset = 0;
  for (var i = 0; i < src.bufsProcessed; i++) {
   if (src.bufQueue[i].audioBuf) {
    offset += src.bufQueue[i].audioBuf.duration;
   }
  }
  offset += src.bufOffset;
  return offset;
 },
 sourceSeek: (src, offset) => {
  var playing = src.state == 4114;
  if (playing) {
   AL.setSourceState(src, 4113);
  }
  if (src.bufQueue[src.bufsProcessed].audioBuf !== null) {
   src.bufsProcessed = 0;
   while (offset > src.bufQueue[src.bufsProcessed].audioBuf.duration) {
    offset -= src.bufQueue[src.bufsProcessed].audiobuf.duration;
    src.bufsProcessed++;
   }
   src.bufOffset = offset;
  }
  if (playing) {
   AL.setSourceState(src, 4114);
  }
 },
 getGlobalParam: (funcname, param) => {
  if (!AL.currentCtx) {
   return null;
  }
  switch (param) {
  case 49152:
   return AL.currentCtx.dopplerFactor;

  case 49155:
   return AL.currentCtx.speedOfSound;

  case 53248:
   return AL.currentCtx.distanceModel;

  default:
   AL.currentCtx.err = 40962;
   return null;
  }
 },
 setGlobalParam: (funcname, param, value) => {
  if (!AL.currentCtx) {
   return;
  }
  switch (param) {
  case 49152:
   if (!Number.isFinite(value) || value < 0) {
    AL.currentCtx.err = 40963;
    return;
   }
   AL.currentCtx.dopplerFactor = value;
   AL.updateListenerSpace(AL.currentCtx);
   break;

  case 49155:
   if (!Number.isFinite(value) || value <= 0) {
    AL.currentCtx.err = 40963;
    return;
   }
   AL.currentCtx.speedOfSound = value;
   AL.updateListenerSpace(AL.currentCtx);
   break;

  case 53248:
   switch (value) {
   case 0:
   case 53249:
   /* AL_INVERSE_DISTANCE */ case 53250:
   /* AL_INVERSE_DISTANCE_CLAMPED */ case 53251:
   /* AL_LINEAR_DISTANCE */ case 53252:
   /* AL_LINEAR_DISTANCE_CLAMPED */ case 53253:
   /* AL_EXPONENT_DISTANCE */ case 53254:
    /* AL_EXPONENT_DISTANCE_CLAMPED */ AL.currentCtx.distanceModel = value;
    AL.updateContextGlobal(AL.currentCtx);
    break;

   default:
    AL.currentCtx.err = 40963;
    return;
   }
   break;

  default:
   AL.currentCtx.err = 40962;
   return;
  }
 },
 getListenerParam: (funcname, param) => {
  if (!AL.currentCtx) {
   return null;
  }
  switch (param) {
  case 4100:
   return AL.currentCtx.listener.position;

  case 4102:
   return AL.currentCtx.listener.velocity;

  case 4111:
   return AL.currentCtx.listener.direction.concat(AL.currentCtx.listener.up);

  case 4106:
   return AL.currentCtx.gain.gain.value;

  default:
   AL.currentCtx.err = 40962;
   return null;
  }
 },
 setListenerParam: (funcname, param, value) => {
  if (!AL.currentCtx) {
   return;
  }
  if (value === null) {
   AL.currentCtx.err = 40962;
   return;
  }
  var listener = AL.currentCtx.listener;
  switch (param) {
  case 4100:
   if (!Number.isFinite(value[0]) || !Number.isFinite(value[1]) || !Number.isFinite(value[2])) {
    AL.currentCtx.err = 40963;
    return;
   }
   listener.position[0] = value[0];
   listener.position[1] = value[1];
   listener.position[2] = value[2];
   AL.updateListenerSpace(AL.currentCtx);
   break;

  case 4102:
   if (!Number.isFinite(value[0]) || !Number.isFinite(value[1]) || !Number.isFinite(value[2])) {
    AL.currentCtx.err = 40963;
    return;
   }
   listener.velocity[0] = value[0];
   listener.velocity[1] = value[1];
   listener.velocity[2] = value[2];
   AL.updateListenerSpace(AL.currentCtx);
   break;

  case 4106:
   if (!Number.isFinite(value) || value < 0) {
    AL.currentCtx.err = 40963;
    return;
   }
   AL.currentCtx.gain.gain.value = value;
   break;

  case 4111:
   if (!Number.isFinite(value[0]) || !Number.isFinite(value[1]) || !Number.isFinite(value[2]) || !Number.isFinite(value[3]) || !Number.isFinite(value[4]) || !Number.isFinite(value[5])) {
    AL.currentCtx.err = 40963;
    return;
   }
   listener.direction[0] = value[0];
   listener.direction[1] = value[1];
   listener.direction[2] = value[2];
   listener.up[0] = value[3];
   listener.up[1] = value[4];
   listener.up[2] = value[5];
   AL.updateListenerSpace(AL.currentCtx);
   break;

  default:
   AL.currentCtx.err = 40962;
   return;
  }
 },
 getBufferParam: (funcname, bufferId, param) => {
  if (!AL.currentCtx) {
   return;
  }
  var buf = AL.buffers[bufferId];
  if (!buf || bufferId === 0) {
   AL.currentCtx.err = 40961;
   return;
  }
  switch (param) {
  case 8193:
   /* AL_FREQUENCY */ return buf.frequency;

  case 8194:
   /* AL_BITS */ return buf.bytesPerSample * 8;

  case 8195:
   /* AL_CHANNELS */ return buf.channels;

  case 8196:
   /* AL_SIZE */ return buf.length * buf.bytesPerSample * buf.channels;

  case 8213:
   /* AL_LOOP_POINTS_SOFT */ if (buf.length === 0) {
    return [ 0, 0 ];
   }
   return [ (buf.audioBuf._loopStart || 0) * buf.frequency, (buf.audioBuf._loopEnd || buf.length) * buf.frequency ];

  default:
   AL.currentCtx.err = 40962;
   return null;
  }
 },
 setBufferParam: (funcname, bufferId, param, value) => {
  if (!AL.currentCtx) {
   return;
  }
  var buf = AL.buffers[bufferId];
  if (!buf || bufferId === 0) {
   AL.currentCtx.err = 40961;
   return;
  }
  if (value === null) {
   AL.currentCtx.err = 40962;
   return;
  }
  switch (param) {
  case 8196:
   /* AL_SIZE */ if (value !== 0) {
    AL.currentCtx.err = 40963;
    return;
   }
   break;

  case 8213:
   /* AL_LOOP_POINTS_SOFT */ if (value[0] < 0 || value[0] > buf.length || value[1] < 0 || value[1] > buf.Length || value[0] >= value[1]) {
    AL.currentCtx.err = 40963;
    return;
   }
   if (buf.refCount > 0) {
    AL.currentCtx.err = 40964;
    return;
   }
   if (buf.audioBuf) {
    buf.audioBuf._loopStart = value[0] / buf.frequency;
    buf.audioBuf._loopEnd = value[1] / buf.frequency;
   }
   break;

  default:
   AL.currentCtx.err = 40962;
   return;
  }
 },
 getSourceParam: (funcname, sourceId, param) => {
  if (!AL.currentCtx) {
   return null;
  }
  var src = AL.currentCtx.sources[sourceId];
  if (!src) {
   AL.currentCtx.err = 40961;
   return null;
  }
  switch (param) {
  case 514:
   /* AL_SOURCE_RELATIVE */ return src.relative;

  case 4097:
   /* AL_CONE_INNER_ANGLE */ return src.coneInnerAngle;

  case 4098:
   /* AL_CONE_OUTER_ANGLE */ return src.coneOuterAngle;

  case 4099:
   /* AL_PITCH */ return src.pitch;

  case 4100:
   return src.position;

  case 4101:
   return src.direction;

  case 4102:
   return src.velocity;

  case 4103:
   /* AL_LOOPING */ return src.looping;

  case 4105:
   /* AL_BUFFER */ if (src.type === 4136) {
    return src.bufQueue[0].id;
   }
   return 0;

  case 4106:
   return src.gain.gain.value;

  case 4109:
   /* AL_MIN_GAIN */ return src.minGain;

  case 4110:
   /* AL_MAX_GAIN */ return src.maxGain;

  case 4112:
   /* AL_SOURCE_STATE */ return src.state;

  case 4117:
   /* AL_BUFFERS_QUEUED */ if (src.bufQueue.length === 1 && src.bufQueue[0].id === 0) {
    return 0;
   }
   return src.bufQueue.length;

  case 4118:
   /* AL_BUFFERS_PROCESSED */ if ((src.bufQueue.length === 1 && src.bufQueue[0].id === 0) || src.looping) {
    return 0;
   }
   return src.bufsProcessed;

  case 4128:
   /* AL_REFERENCE_DISTANCE */ return src.refDistance;

  case 4129:
   /* AL_ROLLOFF_FACTOR */ return src.rolloffFactor;

  case 4130:
   /* AL_CONE_OUTER_GAIN */ return src.coneOuterGain;

  case 4131:
   /* AL_MAX_DISTANCE */ return src.maxDistance;

  case 4132:
   /* AL_SEC_OFFSET */ return AL.sourceTell(src);

  case 4133:
   /* AL_SAMPLE_OFFSET */ var offset = AL.sourceTell(src);
   if (offset > 0) {
    offset *= src.bufQueue[0].frequency;
   }
   return offset;

  case 4134:
   /* AL_BYTE_OFFSET */ var offset = AL.sourceTell(src);
   if (offset > 0) {
    offset *= src.bufQueue[0].frequency * src.bufQueue[0].bytesPerSample;
   }
   return offset;

  case 4135:
   /* AL_SOURCE_TYPE */ return src.type;

  case 4628:
   /* AL_SOURCE_SPATIALIZE_SOFT */ return src.spatialize;

  case 8201:
   /* AL_BYTE_LENGTH_SOFT */ var length = 0;
   var bytesPerFrame = 0;
   for (var i = 0; i < src.bufQueue.length; i++) {
    length += src.bufQueue[i].length;
    if (src.bufQueue[i].id !== 0) {
     bytesPerFrame = src.bufQueue[i].bytesPerSample * src.bufQueue[i].channels;
    }
   }
   return length * bytesPerFrame;

  case 8202:
   /* AL_SAMPLE_LENGTH_SOFT */ var length = 0;
   for (var i = 0; i < src.bufQueue.length; i++) {
    length += src.bufQueue[i].length;
   }
   return length;

  case 8203:
   /* AL_SEC_LENGTH_SOFT */ return AL.sourceDuration(src);

  case 53248:
   return src.distanceModel;

  default:
   AL.currentCtx.err = 40962;
   return null;
  }
 },
 setSourceParam: (funcname, sourceId, param, value) => {
  if (!AL.currentCtx) {
   return;
  }
  var src = AL.currentCtx.sources[sourceId];
  if (!src) {
   AL.currentCtx.err = 40961;
   return;
  }
  if (value === null) {
   AL.currentCtx.err = 40962;
   return;
  }
  switch (param) {
  case 514:
   /* AL_SOURCE_RELATIVE */ if (value === 1) {
    src.relative = true;
    AL.updateSourceSpace(src);
   } else if (value === 0) {
    src.relative = false;
    AL.updateSourceSpace(src);
   } else {
    AL.currentCtx.err = 40963;
    return;
   }
   break;

  case 4097:
   /* AL_CONE_INNER_ANGLE */ if (!Number.isFinite(value)) {
    AL.currentCtx.err = 40963;
    return;
   }
   src.coneInnerAngle = value;
   if (src.panner) {
    src.panner.coneInnerAngle = value % 360;
   }
   break;

  case 4098:
   /* AL_CONE_OUTER_ANGLE */ if (!Number.isFinite(value)) {
    AL.currentCtx.err = 40963;
    return;
   }
   src.coneOuterAngle = value;
   if (src.panner) {
    src.panner.coneOuterAngle = value % 360;
   }
   break;

  case 4099:
   /* AL_PITCH */ if (!Number.isFinite(value) || value <= 0) {
    AL.currentCtx.err = 40963;
    return;
   }
   if (src.pitch === value) {
    break;
   }
   src.pitch = value;
   AL.updateSourceRate(src);
   break;

  case 4100:
   if (!Number.isFinite(value[0]) || !Number.isFinite(value[1]) || !Number.isFinite(value[2])) {
    AL.currentCtx.err = 40963;
    return;
   }
   src.position[0] = value[0];
   src.position[1] = value[1];
   src.position[2] = value[2];
   AL.updateSourceSpace(src);
   break;

  case 4101:
   if (!Number.isFinite(value[0]) || !Number.isFinite(value[1]) || !Number.isFinite(value[2])) {
    AL.currentCtx.err = 40963;
    return;
   }
   src.direction[0] = value[0];
   src.direction[1] = value[1];
   src.direction[2] = value[2];
   AL.updateSourceSpace(src);
   break;

  case 4102:
   if (!Number.isFinite(value[0]) || !Number.isFinite(value[1]) || !Number.isFinite(value[2])) {
    AL.currentCtx.err = 40963;
    return;
   }
   src.velocity[0] = value[0];
   src.velocity[1] = value[1];
   src.velocity[2] = value[2];
   AL.updateSourceSpace(src);
   break;

  case 4103:
   /* AL_LOOPING */ if (value === 1) {
    src.looping = true;
    AL.updateSourceTime(src);
    if (src.type === 4136 && src.audioQueue.length > 0) {
     var audioSrc = src.audioQueue[0];
     audioSrc.loop = true;
     audioSrc._duration = Number.POSITIVE_INFINITY;
    }
   } else if (value === 0) {
    src.looping = false;
    var currentTime = AL.updateSourceTime(src);
    if (src.type === 4136 && src.audioQueue.length > 0) {
     var audioSrc = src.audioQueue[0];
     audioSrc.loop = false;
     audioSrc._duration = src.bufQueue[0].audioBuf.duration / src.playbackRate;
     audioSrc._startTime = currentTime - src.bufOffset / src.playbackRate;
    }
   } else {
    AL.currentCtx.err = 40963;
    return;
   }
   break;

  case 4105:
   /* AL_BUFFER */ if (src.state === 4114 || src.state === 4115) {
    AL.currentCtx.err = 40964;
    return;
   }
   if (value === 0) {
    for (var i in src.bufQueue) {
     src.bufQueue[i].refCount--;
    }
    src.bufQueue.length = 1;
    src.bufQueue[0] = AL.buffers[0];
    src.bufsProcessed = 0;
    src.type = 4144;
   } else /* AL_UNDETERMINED */ {
    var buf = AL.buffers[value];
    if (!buf) {
     AL.currentCtx.err = 40963;
     return;
    }
    for (var i in src.bufQueue) {
     src.bufQueue[i].refCount--;
    }
    src.bufQueue.length = 0;
    buf.refCount++;
    src.bufQueue = [ buf ];
    src.bufsProcessed = 0;
    src.type = 4136;
   }
   AL.initSourcePanner(src);
   AL.scheduleSourceAudio(src);
   break;

  case 4106:
   if (!Number.isFinite(value) || value < 0) {
    AL.currentCtx.err = 40963;
    return;
   }
   src.gain.gain.value = value;
   break;

  case 4109:
   /* AL_MIN_GAIN */ if (!Number.isFinite(value) || value < 0 || value > Math.min(src.maxGain, 1)) {
    AL.currentCtx.err = 40963;
    return;
   }
   src.minGain = value;
   break;

  case 4110:
   /* AL_MAX_GAIN */ if (!Number.isFinite(value) || value < Math.max(0, src.minGain) || value > 1) {
    AL.currentCtx.err = 40963;
    return;
   }
   src.maxGain = value;
   break;

  case 4128:
   /* AL_REFERENCE_DISTANCE */ if (!Number.isFinite(value) || value < 0) {
    AL.currentCtx.err = 40963;
    return;
   }
   src.refDistance = value;
   if (src.panner) {
    src.panner.refDistance = value;
   }
   break;

  case 4129:
   /* AL_ROLLOFF_FACTOR */ if (!Number.isFinite(value) || value < 0) {
    AL.currentCtx.err = 40963;
    return;
   }
   src.rolloffFactor = value;
   if (src.panner) {
    src.panner.rolloffFactor = value;
   }
   break;

  case 4130:
   /* AL_CONE_OUTER_GAIN */ if (!Number.isFinite(value) || value < 0 || value > 1) {
    AL.currentCtx.err = 40963;
    return;
   }
   src.coneOuterGain = value;
   if (src.panner) {
    src.panner.coneOuterGain = value;
   }
   break;

  case 4131:
   /* AL_MAX_DISTANCE */ if (!Number.isFinite(value) || value < 0) {
    AL.currentCtx.err = 40963;
    return;
   }
   src.maxDistance = value;
   if (src.panner) {
    src.panner.maxDistance = value;
   }
   break;

  case 4132:
   /* AL_SEC_OFFSET */ if (value < 0 || value > AL.sourceDuration(src)) {
    AL.currentCtx.err = 40963;
    return;
   }
   AL.sourceSeek(src, value);
   break;

  case 4133:
   /* AL_SAMPLE_OFFSET */ var srcLen = AL.sourceDuration(src);
   if (srcLen > 0) {
    var frequency;
    for (var bufId in src.bufQueue) {
     if (bufId) {
      frequency = src.bufQueue[bufId].frequency;
      break;
     }
    }
    value /= frequency;
   }
   if (value < 0 || value > srcLen) {
    AL.currentCtx.err = 40963;
    return;
   }
   AL.sourceSeek(src, value);
   break;

  case 4134:
   /* AL_BYTE_OFFSET */ var srcLen = AL.sourceDuration(src);
   if (srcLen > 0) {
    var bytesPerSec;
    for (var bufId in src.bufQueue) {
     if (bufId) {
      var buf = src.bufQueue[bufId];
      bytesPerSec = buf.frequency * buf.bytesPerSample * buf.channels;
      break;
     }
    }
    value /= bytesPerSec;
   }
   if (value < 0 || value > srcLen) {
    AL.currentCtx.err = 40963;
    return;
   }
   AL.sourceSeek(src, value);
   break;

  case 4628:
   /* AL_SOURCE_SPATIALIZE_SOFT */ if (value !== 0 && value !== 1 && value !== 2) /* AL_AUTO_SOFT */ {
    AL.currentCtx.err = 40963;
    return;
   }
   src.spatialize = value;
   AL.initSourcePanner(src);
   break;

  case 8201:
  /* AL_BYTE_LENGTH_SOFT */ case 8202:
  /* AL_SAMPLE_LENGTH_SOFT */ case 8203:
   /* AL_SEC_LENGTH_SOFT */ AL.currentCtx.err = 40964;
   break;

  case 53248:
   switch (value) {
   case 0:
   case 53249:
   /* AL_INVERSE_DISTANCE */ case 53250:
   /* AL_INVERSE_DISTANCE_CLAMPED */ case 53251:
   /* AL_LINEAR_DISTANCE */ case 53252:
   /* AL_LINEAR_DISTANCE_CLAMPED */ case 53253:
   /* AL_EXPONENT_DISTANCE */ case 53254:
    /* AL_EXPONENT_DISTANCE_CLAMPED */ src.distanceModel = value;
    if (AL.currentCtx.sourceDistanceModel) {
     AL.updateContextGlobal(AL.currentCtx);
    }
    break;

   default:
    AL.currentCtx.err = 40963;
    return;
   }
   break;

  default:
   AL.currentCtx.err = 40962;
   return;
  }
 },
 captures: {},
 sharedCaptureAudioCtx: null,
 requireValidCaptureDevice: (deviceId, funcname) => {
  if (deviceId === 0) {
   AL.alcErr = 40961;
   return null;
  }
  var c = AL.captures[deviceId];
  if (!c) {
   AL.alcErr = 40961;
   return null;
  }
  var err = c.mediaStreamError;
  if (err) {
   AL.alcErr = 40961;
   return null;
  }
  return c;
 }
};

function _alBufferData(bufferId, format, pData, size, freq) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(19, 1, bufferId, format, pData, size, freq);
 if (!AL.currentCtx) {
  return;
 }
 var buf = AL.buffers[bufferId];
 if (!buf) {
  AL.currentCtx.err = 40963;
  return;
 }
 if (freq <= 0) {
  AL.currentCtx.err = 40963;
  return;
 }
 var audioBuf = null;
 try {
  switch (format) {
  case 4352:
   /* AL_FORMAT_MONO8 */ if (size > 0) {
    audioBuf = AL.currentCtx.audioCtx.createBuffer(1, size, freq);
    var channel0 = audioBuf.getChannelData(0);
    for (var i = 0; i < size; ++i) {
     channel0[i] = GROWABLE_HEAP_U8()[pData++] * .0078125 - /* 1/128 */ 1;
    }
   }
   buf.bytesPerSample = 1;
   buf.channels = 1;
   buf.length = size;
   break;

  case 4353:
   /* AL_FORMAT_MONO16 */ if (size > 0) {
    audioBuf = AL.currentCtx.audioCtx.createBuffer(1, size >> 1, freq);
    var channel0 = audioBuf.getChannelData(0);
    pData >>= 1;
    for (var i = 0; i < size >> 1; ++i) {
     channel0[i] = GROWABLE_HEAP_I16()[pData++] * 30517578125e-15;
    }
   }
   buf.bytesPerSample = 2;
   buf.channels = 1;
   buf.length = size >> 1;
   break;

  case 4354:
   /* AL_FORMAT_STEREO8 */ if (size > 0) {
    audioBuf = AL.currentCtx.audioCtx.createBuffer(2, size >> 1, freq);
    var channel0 = audioBuf.getChannelData(0);
    var channel1 = audioBuf.getChannelData(1);
    for (var i = 0; i < size >> 1; ++i) {
     channel0[i] = GROWABLE_HEAP_U8()[pData++] * .0078125 - /* 1/128 */ 1;
     channel1[i] = GROWABLE_HEAP_U8()[pData++] * .0078125 - /* 1/128 */ 1;
    }
   }
   buf.bytesPerSample = 1;
   buf.channels = 2;
   buf.length = size >> 1;
   break;

  case 4355:
   /* AL_FORMAT_STEREO16 */ if (size > 0) {
    audioBuf = AL.currentCtx.audioCtx.createBuffer(2, size >> 2, freq);
    var channel0 = audioBuf.getChannelData(0);
    var channel1 = audioBuf.getChannelData(1);
    pData >>= 1;
    for (var i = 0; i < size >> 2; ++i) {
     channel0[i] = GROWABLE_HEAP_I16()[pData++] * 30517578125e-15;
     /* 1/32768 */ channel1[i] = GROWABLE_HEAP_I16()[pData++] * 30517578125e-15;
    }
   }
   buf.bytesPerSample = 2;
   buf.channels = 2;
   buf.length = size >> 2;
   break;

  case 65552:
   /* AL_FORMAT_MONO_FLOAT32 */ if (size > 0) {
    audioBuf = AL.currentCtx.audioCtx.createBuffer(1, size >> 2, freq);
    var channel0 = audioBuf.getChannelData(0);
    pData >>= 2;
    for (var i = 0; i < size >> 2; ++i) {
     channel0[i] = GROWABLE_HEAP_F32()[pData++];
    }
   }
   buf.bytesPerSample = 4;
   buf.channels = 1;
   buf.length = size >> 2;
   break;

  case 65553:
   /* AL_FORMAT_STEREO_FLOAT32 */ if (size > 0) {
    audioBuf = AL.currentCtx.audioCtx.createBuffer(2, size >> 3, freq);
    var channel0 = audioBuf.getChannelData(0);
    var channel1 = audioBuf.getChannelData(1);
    pData >>= 2;
    for (var i = 0; i < size >> 3; ++i) {
     channel0[i] = GROWABLE_HEAP_F32()[pData++];
     channel1[i] = GROWABLE_HEAP_F32()[pData++];
    }
   }
   buf.bytesPerSample = 4;
   buf.channels = 2;
   buf.length = size >> 3;
   break;

  default:
   AL.currentCtx.err = 40963;
   return;
  }
  buf.frequency = freq;
  buf.audioBuf = audioBuf;
 } catch (e) {
  AL.currentCtx.err = 40963;
  return;
 }
}

function _alDeleteBuffers(count, pBufferIds) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(20, 1, count, pBufferIds);
 if (!AL.currentCtx) {
  return;
 }
 for (var i = 0; i < count; ++i) {
  var bufId = GROWABLE_HEAP_I32()[(((pBufferIds) + (i * 4)) >> 2)];
  if (bufId === 0) {
   continue;
  }
  if (!AL.buffers[bufId]) {
   AL.currentCtx.err = 40961;
   return;
  }
  if (AL.buffers[bufId].refCount) {
   AL.currentCtx.err = 40964;
   return;
  }
 }
 for (var i = 0; i < count; ++i) {
  var bufId = GROWABLE_HEAP_I32()[(((pBufferIds) + (i * 4)) >> 2)];
  if (bufId === 0) {
   continue;
  }
  AL.deviceRefCounts[AL.buffers[bufId].deviceId]--;
  delete AL.buffers[bufId];
  AL.freeIds.push(bufId);
 }
}

function _alSourcei(sourceId, param, value) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(22, 1, sourceId, param, value);
 switch (param) {
 case 514:
 /* AL_SOURCE_RELATIVE */ case 4097:
 /* AL_CONE_INNER_ANGLE */ case 4098:
 /* AL_CONE_OUTER_ANGLE */ case 4103:
 /* AL_LOOPING */ case 4105:
 /* AL_BUFFER */ case 4128:
 /* AL_REFERENCE_DISTANCE */ case 4129:
 /* AL_ROLLOFF_FACTOR */ case 4131:
 /* AL_MAX_DISTANCE */ case 4132:
 /* AL_SEC_OFFSET */ case 4133:
 /* AL_SAMPLE_OFFSET */ case 4134:
 /* AL_BYTE_OFFSET */ case 4628:
 /* AL_SOURCE_SPATIALIZE_SOFT */ case 8201:
 /* AL_BYTE_LENGTH_SOFT */ case 8202:
 /* AL_SAMPLE_LENGTH_SOFT */ case 53248:
  AL.setSourceParam("alSourcei", sourceId, param, value);
  break;

 default:
  AL.setSourceParam("alSourcei", sourceId, param, null);
  break;
 }
}

function _alDeleteSources(count, pSourceIds) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(21, 1, count, pSourceIds);
 if (!AL.currentCtx) {
  return;
 }
 for (var i = 0; i < count; ++i) {
  var srcId = GROWABLE_HEAP_I32()[(((pSourceIds) + (i * 4)) >> 2)];
  if (!AL.currentCtx.sources[srcId]) {
   AL.currentCtx.err = 40961;
   return;
  }
 }
 for (var i = 0; i < count; ++i) {
  var srcId = GROWABLE_HEAP_I32()[(((pSourceIds) + (i * 4)) >> 2)];
  AL.setSourceState(AL.currentCtx.sources[srcId], 4116);
  _alSourcei(srcId, 4105, /* AL_BUFFER */ 0);
  delete AL.currentCtx.sources[srcId];
  AL.freeIds.push(srcId);
 }
}

function _alDistanceModel(model) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(23, 1, model);
 AL.setGlobalParam("alDistanceModel", 53248, model);
}

function _alGenBuffers(count, pBufferIds) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(24, 1, count, pBufferIds);
 if (!AL.currentCtx) {
  return;
 }
 for (var i = 0; i < count; ++i) {
  var buf = {
   deviceId: AL.currentCtx.deviceId,
   id: AL.newId(),
   refCount: 0,
   audioBuf: null,
   frequency: 0,
   bytesPerSample: 2,
   channels: 1,
   length: 0
  };
  AL.deviceRefCounts[buf.deviceId]++;
  AL.buffers[buf.id] = buf;
  GROWABLE_HEAP_I32()[(((pBufferIds) + (i * 4)) >> 2)] = buf.id;
 }
}

function _alGenSources(count, pSourceIds) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(25, 1, count, pSourceIds);
 if (!AL.currentCtx) {
  return;
 }
 for (var i = 0; i < count; ++i) {
  var gain = AL.currentCtx.audioCtx.createGain();
  gain.connect(AL.currentCtx.gain);
  var src = {
   context: AL.currentCtx,
   id: AL.newId(),
   type: 4144,
   /* AL_UNDETERMINED */ state: 4113,
   bufQueue: [ AL.buffers[0] ],
   audioQueue: [],
   looping: false,
   pitch: 1,
   dopplerShift: 1,
   gain: gain,
   minGain: 0,
   maxGain: 1,
   panner: null,
   bufsProcessed: 0,
   bufStartTime: Number.NEGATIVE_INFINITY,
   bufOffset: 0,
   relative: false,
   refDistance: 1,
   maxDistance: 340282e33,
   /* FLT_MAX */ rolloffFactor: 1,
   position: [ 0, 0, 0 ],
   velocity: [ 0, 0, 0 ],
   direction: [ 0, 0, 0 ],
   coneOuterGain: 0,
   coneInnerAngle: 360,
   coneOuterAngle: 360,
   distanceModel: 53250,
   /* AL_INVERSE_DISTANCE_CLAMPED */ spatialize: 2,
   /* AL_AUTO_SOFT */ get playbackRate() {
    return this.pitch * this.dopplerShift;
   }
  };
  AL.currentCtx.sources[src.id] = src;
  GROWABLE_HEAP_I32()[(((pSourceIds) + (i * 4)) >> 2)] = src.id;
 }
}

function _alGetError() {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(26, 1);
 if (!AL.currentCtx) {
  return 40964;
 }
 var err = AL.currentCtx.err;
 AL.currentCtx.err = 0;
 return err;
}

function _alGetSourcei(sourceId, param, pValue) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(27, 1, sourceId, param, pValue);
 var val = AL.getSourceParam("alGetSourcei", sourceId, param);
 if (val === null) {
  return;
 }
 if (!pValue) {
  AL.currentCtx.err = 40963;
  return;
 }
 switch (param) {
 case 514:
 /* AL_SOURCE_RELATIVE */ case 4097:
 /* AL_CONE_INNER_ANGLE */ case 4098:
 /* AL_CONE_OUTER_ANGLE */ case 4103:
 /* AL_LOOPING */ case 4105:
 /* AL_BUFFER */ case 4112:
 /* AL_SOURCE_STATE */ case 4117:
 /* AL_BUFFERS_QUEUED */ case 4118:
 /* AL_BUFFERS_PROCESSED */ case 4128:
 /* AL_REFERENCE_DISTANCE */ case 4129:
 /* AL_ROLLOFF_FACTOR */ case 4131:
 /* AL_MAX_DISTANCE */ case 4132:
 /* AL_SEC_OFFSET */ case 4133:
 /* AL_SAMPLE_OFFSET */ case 4134:
 /* AL_BYTE_OFFSET */ case 4135:
 /* AL_SOURCE_TYPE */ case 4628:
 /* AL_SOURCE_SPATIALIZE_SOFT */ case 8201:
 /* AL_BYTE_LENGTH_SOFT */ case 8202:
 /* AL_SAMPLE_LENGTH_SOFT */ case 53248:
  GROWABLE_HEAP_I32()[((pValue) >> 2)] = val;
  break;

 default:
  AL.currentCtx.err = 40962;
  return;
 }
}

function _alIsBuffer(bufferId) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(28, 1, bufferId);
 if (!AL.currentCtx) {
  return false;
 }
 if (bufferId > AL.buffers.length) {
  return false;
 }
 if (!AL.buffers[bufferId]) {
  return false;
 }
 return true;
}

function _alIsSource(sourceId) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(29, 1, sourceId);
 if (!AL.currentCtx) {
  return false;
 }
 if (!AL.currentCtx.sources[sourceId]) {
  return false;
 }
 return true;
}

function _alListener3f(param, value0, value1, value2) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(30, 1, param, value0, value1, value2);
 switch (param) {
 case 4100:
 case 4102:
  AL.paramArray[0] = value0;
  AL.paramArray[1] = value1;
  AL.paramArray[2] = value2;
  AL.setListenerParam("alListener3f", param, AL.paramArray);
  break;

 default:
  AL.setListenerParam("alListener3f", param, null);
  break;
 }
}

function _alListenerf(param, value) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(31, 1, param, value);
 switch (param) {
 case 4106:
  AL.setListenerParam("alListenerf", param, value);
  break;

 default:
  AL.setListenerParam("alListenerf", param, null);
  break;
 }
}

function _alListenerfv(param, pValues) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(32, 1, param, pValues);
 if (!AL.currentCtx) {
  return;
 }
 if (!pValues) {
  AL.currentCtx.err = 40963;
  return;
 }
 switch (param) {
 case 4100:
 case 4102:
  AL.paramArray[0] = GROWABLE_HEAP_F32()[((pValues) >> 2)];
  AL.paramArray[1] = GROWABLE_HEAP_F32()[(((pValues) + (4)) >> 2)];
  AL.paramArray[2] = GROWABLE_HEAP_F32()[(((pValues) + (8)) >> 2)];
  AL.setListenerParam("alListenerfv", param, AL.paramArray);
  break;

 case 4111:
  AL.paramArray[0] = GROWABLE_HEAP_F32()[((pValues) >> 2)];
  AL.paramArray[1] = GROWABLE_HEAP_F32()[(((pValues) + (4)) >> 2)];
  AL.paramArray[2] = GROWABLE_HEAP_F32()[(((pValues) + (8)) >> 2)];
  AL.paramArray[3] = GROWABLE_HEAP_F32()[(((pValues) + (12)) >> 2)];
  AL.paramArray[4] = GROWABLE_HEAP_F32()[(((pValues) + (16)) >> 2)];
  AL.paramArray[5] = GROWABLE_HEAP_F32()[(((pValues) + (20)) >> 2)];
  AL.setListenerParam("alListenerfv", param, AL.paramArray);
  break;

 default:
  AL.setListenerParam("alListenerfv", param, null);
  break;
 }
}

function _alSource3f(sourceId, param, value0, value1, value2) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(33, 1, sourceId, param, value0, value1, value2);
 switch (param) {
 case 4100:
 case 4101:
 case 4102:
  AL.paramArray[0] = value0;
  AL.paramArray[1] = value1;
  AL.paramArray[2] = value2;
  AL.setSourceParam("alSource3f", sourceId, param, AL.paramArray);
  break;

 default:
  AL.setSourceParam("alSource3f", sourceId, param, null);
  break;
 }
}

function _alSourcePlay(sourceId) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(34, 1, sourceId);
 if (!AL.currentCtx) {
  return;
 }
 var src = AL.currentCtx.sources[sourceId];
 if (!src) {
  AL.currentCtx.err = 40961;
  return;
 }
 AL.setSourceState(src, 4114);
}

function _alSourcef(sourceId, param, value) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(35, 1, sourceId, param, value);
 switch (param) {
 case 4097:
 /* AL_CONE_INNER_ANGLE */ case 4098:
 /* AL_CONE_OUTER_ANGLE */ case 4099:
 /* AL_PITCH */ case 4106:
 case 4109:
 /* AL_MIN_GAIN */ case 4110:
 /* AL_MAX_GAIN */ case 4128:
 /* AL_REFERENCE_DISTANCE */ case 4129:
 /* AL_ROLLOFF_FACTOR */ case 4130:
 /* AL_CONE_OUTER_GAIN */ case 4131:
 /* AL_MAX_DISTANCE */ case 4132:
 /* AL_SEC_OFFSET */ case 4133:
 /* AL_SAMPLE_OFFSET */ case 4134:
 /* AL_BYTE_OFFSET */ case 8203:
  /* AL_SEC_LENGTH_SOFT */ AL.setSourceParam("alSourcef", sourceId, param, value);
  break;

 default:
  AL.setSourceParam("alSourcef", sourceId, param, null);
  break;
 }
}

function _alcCloseDevice(deviceId) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(36, 1, deviceId);
 if (!(deviceId in AL.deviceRefCounts) || AL.deviceRefCounts[deviceId] > 0) {
  return 0;
 }
 delete AL.deviceRefCounts[deviceId];
 AL.freeIds.push(deviceId);
 return 1;
}

function _alcCreateContext(deviceId, pAttrList) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(37, 1, deviceId, pAttrList);
 if (!(deviceId in AL.deviceRefCounts)) {
  AL.alcErr = 40961;
  /* ALC_INVALID_DEVICE */ return 0;
 }
 var options = null;
 var attrs = [];
 var hrtf = null;
 pAttrList >>= 2;
 if (pAttrList) {
  var attr = 0;
  var val = 0;
  while (true) {
   attr = GROWABLE_HEAP_I32()[pAttrList++];
   attrs.push(attr);
   if (attr === 0) {
    break;
   }
   val = GROWABLE_HEAP_I32()[pAttrList++];
   attrs.push(val);
   switch (attr) {
   case 4103:
    /* ALC_FREQUENCY */ if (!options) {
     options = {};
    }
    options.sampleRate = val;
    break;

   case 4112:
   case 4113:
    break;

   case 6546:
    /* ALC_HRTF_SOFT */ switch (val) {
    case 0:
     hrtf = false;
     break;

    case 1:
     hrtf = true;
     break;

    case 2:
     /* ALC_DONT_CARE_SOFT */ break;

    default:
     AL.alcErr = 40964;
     return 0;
    }
    break;

   case 6550:
    /* ALC_HRTF_ID_SOFT */ if (val !== 0) {
     AL.alcErr = 40964;
     return 0;
    }
    break;

   default:
    AL.alcErr = 40964;
    /* ALC_INVALID_VALUE */ return 0;
   }
  }
 }
 var AudioContext = window.AudioContext || window.webkitAudioContext;
 var ac = null;
 try {
  if (options) {
   ac = new AudioContext(options);
  } else {
   ac = new AudioContext;
  }
 } catch (e) {
  if (e.name === "NotSupportedError") {
   AL.alcErr = 40964;
  } else /* ALC_INVALID_VALUE */ {
   AL.alcErr = 40961;
  }
  return 0;
 }
 autoResumeAudioContext(ac);
 if (typeof ac.createGain == "undefined") {
  ac.createGain = ac.createGainNode;
 }
 var gain = ac.createGain();
 gain.connect(ac.destination);
 var ctx = {
  deviceId: deviceId,
  id: AL.newId(),
  attrs: attrs,
  audioCtx: ac,
  listener: {
   position: [ 0, 0, 0 ],
   velocity: [ 0, 0, 0 ],
   direction: [ 0, 0, 0 ],
   up: [ 0, 0, 0 ]
  },
  sources: [],
  interval: setInterval(() => AL.scheduleContextAudio(ctx), AL.QUEUE_INTERVAL),
  gain: gain,
  distanceModel: 53250,
  /* AL_INVERSE_DISTANCE_CLAMPED */ speedOfSound: 343.3,
  dopplerFactor: 1,
  sourceDistanceModel: false,
  hrtf: hrtf || false,
  _err: 0,
  get err() {
   return this._err;
  },
  set err(val) {
   if (this._err === 0 || val === 0) {
    this._err = val;
   }
  }
 };
 AL.deviceRefCounts[deviceId]++;
 AL.contexts[ctx.id] = ctx;
 if (hrtf !== null) {
  for (var ctxId in AL.contexts) {
   var c = AL.contexts[ctxId];
   if (c.deviceId === deviceId) {
    c.hrtf = hrtf;
    AL.updateContextGlobal(c);
   }
  }
 }
 return ctx.id;
}

function _alcDestroyContext(contextId) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(38, 1, contextId);
 var ctx = AL.contexts[contextId];
 if (AL.currentCtx === ctx) {
  AL.alcErr = 40962;
  /* ALC_INVALID_CONTEXT */ return;
 }
 if (AL.contexts[contextId].interval) {
  clearInterval(AL.contexts[contextId].interval);
 }
 AL.deviceRefCounts[ctx.deviceId]--;
 delete AL.contexts[contextId];
 AL.freeIds.push(contextId);
}

function _alcGetError(deviceId) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(39, 1, deviceId);
 var err = AL.alcErr;
 AL.alcErr = 0;
 return err;
}

function _alcMakeContextCurrent(contextId) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(40, 1, contextId);
 if (contextId === 0) {
  AL.currentCtx = null;
 } else {
  AL.currentCtx = AL.contexts[contextId];
 }
 return 1;
}

function _alcOpenDevice(pDeviceName) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(41, 1, pDeviceName);
 if (pDeviceName) {
  var name = UTF8ToString(pDeviceName);
  if (name !== AL.DEVICE_NAME) {
   return 0;
  }
 }
 if (typeof AudioContext != "undefined" || typeof webkitAudioContext != "undefined") {
  var deviceId = AL.newId();
  AL.deviceRefCounts[deviceId] = 0;
  return deviceId;
 }
 return 0;
}

var EGL = {
 errorCode: 12288,
 defaultDisplayInitialized: false,
 currentContext: 0,
 currentReadSurface: 0,
 currentDrawSurface: 0,
 contextAttributes: {
  alpha: false,
  depth: false,
  stencil: false,
  antialias: false
 },
 stringCache: {},
 setErrorCode(code) {
  EGL.errorCode = code;
 },
 chooseConfig(display, attribList, config, config_size, numConfigs) {
  if (display != 62e3) /* Magic ID for Emscripten 'default display' */ {
   EGL.setErrorCode(12296);
   /* EGL_BAD_DISPLAY */ return 0;
  }
  if (attribList) {
   for (;;) {
    var param = GROWABLE_HEAP_I32()[((attribList) >> 2)];
    if (param == 12321) /*EGL_ALPHA_SIZE*/ {
     var alphaSize = GROWABLE_HEAP_I32()[(((attribList) + (4)) >> 2)];
     EGL.contextAttributes.alpha = (alphaSize > 0);
    } else if (param == 12325) /*EGL_DEPTH_SIZE*/ {
     var depthSize = GROWABLE_HEAP_I32()[(((attribList) + (4)) >> 2)];
     EGL.contextAttributes.depth = (depthSize > 0);
    } else if (param == 12326) /*EGL_STENCIL_SIZE*/ {
     var stencilSize = GROWABLE_HEAP_I32()[(((attribList) + (4)) >> 2)];
     EGL.contextAttributes.stencil = (stencilSize > 0);
    } else if (param == 12337) /*EGL_SAMPLES*/ {
     var samples = GROWABLE_HEAP_I32()[(((attribList) + (4)) >> 2)];
     EGL.contextAttributes.antialias = (samples > 0);
    } else if (param == 12338) /*EGL_SAMPLE_BUFFERS*/ {
     var samples = GROWABLE_HEAP_I32()[(((attribList) + (4)) >> 2)];
     EGL.contextAttributes.antialias = (samples == 1);
    } else if (param == 12544) /*EGL_CONTEXT_PRIORITY_LEVEL_IMG*/ {
     var requestedPriority = GROWABLE_HEAP_I32()[(((attribList) + (4)) >> 2)];
     EGL.contextAttributes.lowLatency = (requestedPriority != 12547);
    } else if (param == 12344) /*EGL_NONE*/ {
     break;
    }
    attribList += 8;
   }
  }
  if ((!config || !config_size) && !numConfigs) {
   EGL.setErrorCode(12300);
   /* EGL_BAD_PARAMETER */ return 0;
  }
  if (numConfigs) {
   GROWABLE_HEAP_I32()[((numConfigs) >> 2)] = 1;
  }
  if (config && config_size > 0) {
   GROWABLE_HEAP_U32()[((config) >> 2)] = 62002;
  }
  EGL.setErrorCode(12288);
  /* EGL_SUCCESS */ return 1;
 }
};

function _eglBindAPI(api) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(42, 1, api);
 if (api == 12448) /* EGL_OPENGL_ES_API */ {
  EGL.setErrorCode(12288);
  /* EGL_SUCCESS */ return 1;
 }
 EGL.setErrorCode(12300);
 /* EGL_BAD_PARAMETER */ return 0;
}

function _eglChooseConfig(display, attrib_list, configs, config_size, numConfigs) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(43, 1, display, attrib_list, configs, config_size, numConfigs);
 return EGL.chooseConfig(display, attrib_list, configs, config_size, numConfigs);
}

var webgl_enable_WEBGL_draw_instanced_base_vertex_base_instance = ctx =>  !!(ctx.dibvbi = ctx.getExtension("WEBGL_draw_instanced_base_vertex_base_instance"));

var webgl_enable_WEBGL_multi_draw_instanced_base_vertex_base_instance = ctx => !!(ctx.mdibvbi = ctx.getExtension("WEBGL_multi_draw_instanced_base_vertex_base_instance"));

var webgl_enable_WEBGL_multi_draw = ctx => !!(ctx.multiDrawWebgl = ctx.getExtension("WEBGL_multi_draw"));

var GL = {
 counter: 1,
 buffers: [],
 programs: [],
 framebuffers: [],
 renderbuffers: [],
 textures: [],
 shaders: [],
 vaos: [],
 contexts: {},
 offscreenCanvases: {},
 queries: [],
 samplers: [],
 transformFeedbacks: [],
 syncs: [],
 stringCache: {},
 stringiCache: {},
 unpackAlignment: 4,
 recordError: function recordError(errorCode) {
  if (!GL.lastError) {
   GL.lastError = errorCode;
  }
 },
 getNewId: table => {
  var ret = GL.counter++;
  for (var i = table.length; i < ret; i++) {
   table[i] = null;
  }
  return ret;
 },
 getSource: (shader, count, string, length) => {
  var source = "";
  for (var i = 0; i < count; ++i) {
   var len = length ? GROWABLE_HEAP_I32()[(((length) + (i * 4)) >> 2)] : -1;
   source += UTF8ToString(GROWABLE_HEAP_I32()[(((string) + (i * 4)) >> 2)], len < 0 ? undefined : len);
  }
  return source;
 },
 createContext: (/** @type {HTMLCanvasElement} */ canvas, webGLContextAttributes) => {
  if (!canvas.getContextSafariWebGL2Fixed) {
   canvas.getContextSafariWebGL2Fixed = canvas.getContext;
   /** @type {function(this:HTMLCanvasElement, string, (Object|null)=): (Object|null)} */ function fixedGetContext(ver, attrs) {
    var gl = canvas.getContextSafariWebGL2Fixed(ver, attrs);
    return ((ver == "webgl") == (gl instanceof WebGLRenderingContext)) ? gl : null;
   }
   canvas.getContext = fixedGetContext;
  }
  var ctx = canvas.getContext("webgl2", webGLContextAttributes);
  if (!ctx) return 0;
  var handle = GL.registerContext(ctx, webGLContextAttributes);
  return handle;
 },
 registerContext: (ctx, webGLContextAttributes) => {
  var handle = _malloc(8);
  GROWABLE_HEAP_I32()[(((handle) + (4)) >> 2)] = _pthread_self();
  var context = {
   handle: handle,
   attributes: webGLContextAttributes,
   version: webGLContextAttributes.majorVersion,
   GLctx: ctx
  };
  if (ctx.canvas) ctx.canvas.GLctxObject = context;
  GL.contexts[handle] = context;
  if (typeof webGLContextAttributes.enableExtensionsByDefault == "undefined" || webGLContextAttributes.enableExtensionsByDefault) {
   GL.initExtensions(context);
  }
  return handle;
 },
 makeContextCurrent: contextHandle => {
  GL.currentContext = GL.contexts[contextHandle];
  Module.ctx = GLctx = GL.currentContext && GL.currentContext.GLctx;
  return !(contextHandle && !GLctx);
 },
 getContext: contextHandle => GL.contexts[contextHandle],
 deleteContext: contextHandle => {
  if (GL.currentContext === GL.contexts[contextHandle]) GL.currentContext = null;
  if (typeof JSEvents == "object") JSEvents.removeAllHandlersOnTarget(GL.contexts[contextHandle].GLctx.canvas);
  if (GL.contexts[contextHandle] && GL.contexts[contextHandle].GLctx.canvas) GL.contexts[contextHandle].GLctx.canvas.GLctxObject = undefined;
  _free(GL.contexts[contextHandle].handle);
  GL.contexts[contextHandle] = null;
 },
 initExtensions: context => {
  if (!context) context = GL.currentContext;
  if (context.initExtensionsDone) return;
  context.initExtensionsDone = true;
  var GLctx = context.GLctx;
  webgl_enable_WEBGL_draw_instanced_base_vertex_base_instance(GLctx);
  webgl_enable_WEBGL_multi_draw_instanced_base_vertex_base_instance(GLctx);
  if (context.version >= 2) {
   GLctx.disjointTimerQueryExt = GLctx.getExtension("EXT_disjoint_timer_query_webgl2");
  }
  if (context.version < 2 || !GLctx.disjointTimerQueryExt) {
   GLctx.disjointTimerQueryExt = GLctx.getExtension("EXT_disjoint_timer_query");
  }
  webgl_enable_WEBGL_multi_draw(GLctx);
  var exts = GLctx.getSupportedExtensions() || [];
  exts.forEach(ext => {
   if (!ext.includes("lose_context") && !ext.includes("debug")) {
    GLctx.getExtension(ext);
   }
  });
 },
 getExtensions() {
  var exts = GLctx.getSupportedExtensions() || [];
  exts = exts.concat(exts.map(e => "GL_" + e));
  return exts;
 }
};

function _eglCreateContext(display, config, hmm, contextAttribs) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(44, 1, display, config, hmm, contextAttribs);
 if (display != 62e3) /* Magic ID for Emscripten 'default display' */ {
  EGL.setErrorCode(12296);
  /* EGL_BAD_DISPLAY */ return 0;
 }
 var glesContextVersion = 1;
 for (;;) {
  var param = GROWABLE_HEAP_I32()[((contextAttribs) >> 2)];
  if (param == 12440) /*EGL_CONTEXT_CLIENT_VERSION*/ {
   glesContextVersion = GROWABLE_HEAP_I32()[(((contextAttribs) + (4)) >> 2)];
  } else if (param == 12344) /*EGL_NONE*/ {
   break;
  } else {
   /* EGL1.4 specifies only EGL_CONTEXT_CLIENT_VERSION as supported attribute */ EGL.setErrorCode(12292);
   /*EGL_BAD_ATTRIBUTE*/ return 0;
  }
  contextAttribs += 8;
 }
 if (glesContextVersion < 2 || glesContextVersion > 3) {
  EGL.setErrorCode(12293);
  /* EGL_BAD_CONFIG */ return 0;
 }
 /* EGL_NO_CONTEXT */ EGL.contextAttributes.majorVersion = glesContextVersion - 1;
 EGL.contextAttributes.minorVersion = 0;
 EGL.context = GL.createContext(Module["canvas"], EGL.contextAttributes);
 if (EGL.context != 0) {
  EGL.setErrorCode(12288);
  GL.makeContextCurrent(EGL.context);
  Module.useWebGL = true;
  Browser.moduleContextCreatedCallbacks.forEach(function(callback) {
   callback();
  });
  GL.makeContextCurrent(null);
  return 62004;
 } else  {
  EGL.setErrorCode(12297);
  return 0;
 }
}

function _eglCreateWindowSurface(display, config, win, attrib_list) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(45, 1, display, config, win, attrib_list);
 if (display != 62e3) /* Magic ID for Emscripten 'default display' */ {
  EGL.setErrorCode(12296);
  /* EGL_BAD_DISPLAY */ return 0;
 }
 if (config != 62002) /* Magic ID for the only EGLConfig supported by Emscripten */ {
  EGL.setErrorCode(12293);
  /* EGL_BAD_CONFIG */ return 0;
 }
 EGL.setErrorCode(12288);
 /* EGL_SUCCESS */ return 62006;
}

function _eglDestroyContext(display, context) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(46, 1, display, context);
 if (display != 62e3) /* Magic ID for Emscripten 'default display' */ {
  EGL.setErrorCode(12296);
  /* EGL_BAD_DISPLAY */ return 0;
 }
 if (context != 62004) /* Magic ID for Emscripten EGLContext */ {
  EGL.setErrorCode(12294);
  /* EGL_BAD_CONTEXT */ return 0;
 }
 GL.deleteContext(EGL.context);
 EGL.setErrorCode(12288);
 /* EGL_SUCCESS */ if (EGL.currentContext == context) {
  EGL.currentContext = 0;
 }
 return 1;
}

function _eglDestroySurface(display, surface) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(47, 1, display, surface);
 if (display != 62e3) /* Magic ID for Emscripten 'default display' */ {
  EGL.setErrorCode(12296);
  /* EGL_BAD_DISPLAY */ return 0;
 }
 if (surface != 62006) /* Magic ID for the only EGLSurface supported by Emscripten */ {
  EGL.setErrorCode(12301);
  /* EGL_BAD_SURFACE */ return 1;
 }
 if (EGL.currentReadSurface == surface) {
  EGL.currentReadSurface = 0;
 }
 if (EGL.currentDrawSurface == surface) {
  EGL.currentDrawSurface = 0;
 }
 EGL.setErrorCode(12288);
 /* EGL_SUCCESS */ return 1;
}

function _eglGetConfigAttrib(display, config, attribute, value) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(48, 1, display, config, attribute, value);
 if (display != 62e3) /* Magic ID for Emscripten 'default display' */ {
  EGL.setErrorCode(12296);
  /* EGL_BAD_DISPLAY */ return 0;
 }
 if (config != 62002) /* Magic ID for the only EGLConfig supported by Emscripten */ {
  EGL.setErrorCode(12293);
  /* EGL_BAD_CONFIG */ return 0;
 }
 if (!value) {
  EGL.setErrorCode(12300);
  /* EGL_BAD_PARAMETER */ return 0;
 }
 EGL.setErrorCode(12288);
 /* EGL_SUCCESS */ switch (attribute) {
 case 12320:
  GROWABLE_HEAP_I32()[((value) >> 2)] = EGL.contextAttributes.alpha ? 32 : 24;
  return 1;

 case 12321:
  GROWABLE_HEAP_I32()[((value) >> 2)] = EGL.contextAttributes.alpha ? 8 : 0;
  return 1;

 case 12322:
  GROWABLE_HEAP_I32()[((value) >> 2)] = 8;
  return 1;

 case 12323:
  GROWABLE_HEAP_I32()[((value) >> 2)] = 8;
  return 1;

 case 12324:
  GROWABLE_HEAP_I32()[((value) >> 2)] = 8;
  return 1;

 case 12325:
  GROWABLE_HEAP_I32()[((value) >> 2)] = EGL.contextAttributes.depth ? 24 : 0;
  return 1;

 case 12326:
  GROWABLE_HEAP_I32()[((value) >> 2)] = EGL.contextAttributes.stencil ? 8 : 0;
  return 1;

 case 12327:
  GROWABLE_HEAP_I32()[((value) >> 2)] = 12344;
  return 1;

 case 12328:
  GROWABLE_HEAP_I32()[((value) >> 2)] = 62002;
  return 1;

 case 12329:
  GROWABLE_HEAP_I32()[((value) >> 2)] = 0;
  return 1;

 case 12330:
  GROWABLE_HEAP_I32()[((value) >> 2)] = 4096;
  return 1;

 case 12331:
  GROWABLE_HEAP_I32()[((value) >> 2)] = 16777216;
  return 1;

 case 12332:
  GROWABLE_HEAP_I32()[((value) >> 2)] = 4096;
  return 1;

 case 12333:
  GROWABLE_HEAP_I32()[((value) >> 2)] = 0;
  return 1;

 case 12334:
  GROWABLE_HEAP_I32()[((value) >> 2)] = 0;
  return 1;

 case 12335:
  GROWABLE_HEAP_I32()[((value) >> 2)] = 12344;
  return 1;

 case 12337:
  GROWABLE_HEAP_I32()[((value) >> 2)] = EGL.contextAttributes.antialias ? 4 : 0;
  return 1;

 case 12338:
  GROWABLE_HEAP_I32()[((value) >> 2)] = EGL.contextAttributes.antialias ? 1 : 0;
  return 1;

 case 12339:
  GROWABLE_HEAP_I32()[((value) >> 2)] = 4;
  return 1;

 case 12340:
  GROWABLE_HEAP_I32()[((value) >> 2)] = 12344;
  return 1;

 case 12341:
 case 12342:
 case 12343:
  GROWABLE_HEAP_I32()[((value) >> 2)] = -1;
  return 1;

 case 12345:
 case 12346:
  GROWABLE_HEAP_I32()[((value) >> 2)] = 0;
  return 1;

 case 12347:
  GROWABLE_HEAP_I32()[((value) >> 2)] = 0;
  return 1;

 case 12348:
  GROWABLE_HEAP_I32()[((value) >> 2)] = 1;
  return 1;

 case 12349:
 case 12350:
  GROWABLE_HEAP_I32()[((value) >> 2)] = 0;
  return 1;

 case 12351:
  GROWABLE_HEAP_I32()[((value) >> 2)] = 12430;
  return 1;

 case 12352:
  GROWABLE_HEAP_I32()[((value) >> 2)] = 4;
  return 1;

 case 12354:
  GROWABLE_HEAP_I32()[((value) >> 2)] = 0;
  return 1;

 default:
  EGL.setErrorCode(12292);
  /* EGL_BAD_ATTRIBUTE */ return 0;
 }
}

function _eglGetDisplay(nativeDisplayType) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(49, 1, nativeDisplayType);
 EGL.setErrorCode(12288);
 return 62e3;
}

function _eglGetError() {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(50, 1);
 return EGL.errorCode;
}

function _eglInitialize(display, majorVersion, minorVersion) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(51, 1, display, majorVersion, minorVersion);
 if (display != 62e3) /* Magic ID for Emscripten 'default display' */ {
  EGL.setErrorCode(12296);
  /* EGL_BAD_DISPLAY */ return 0;
 }
 if (majorVersion) {
  GROWABLE_HEAP_I32()[((majorVersion) >> 2)] = 1;
 }
 if (minorVersion) {
  GROWABLE_HEAP_I32()[((minorVersion) >> 2)] = 4;
 }
 EGL.defaultDisplayInitialized = true;
 EGL.setErrorCode(12288);
 /* EGL_SUCCESS */ return 1;
}

function _eglMakeCurrent(display, draw, read, context) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(52, 1, display, draw, read, context);
 if (display != 62e3) /* Magic ID for Emscripten 'default display' */ {
  EGL.setErrorCode(12296);
  /* EGL_BAD_DISPLAY */ return 0;
 }
 if (context != 0 && context != 62004) /* Magic ID for Emscripten EGLContext */ {
  EGL.setErrorCode(12294);
  /* EGL_BAD_CONTEXT */ return 0;
 }
 if ((read != 0 && read != 62006) || (draw != 0 && draw != 62006)) /* Magic ID for Emscripten 'default surface' */ {
  EGL.setErrorCode(12301);
  /* EGL_BAD_SURFACE */ return 0;
 }
 GL.makeContextCurrent(context ? EGL.context : null);
 EGL.currentContext = context;
 EGL.currentDrawSurface = draw;
 EGL.currentReadSurface = read;
 EGL.setErrorCode(12288);
 /* EGL_SUCCESS */ return 1;
}

var stringToNewUTF8 = str => {
 var size = lengthBytesUTF8(str) + 1;
 var ret = _malloc(size);
 if (ret) stringToUTF8(str, ret, size);
 return ret;
};

function _eglQueryString(display, name) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(53, 1, display, name);
 if (display != 62e3) /* Magic ID for Emscripten 'default display' */ {
  EGL.setErrorCode(12296);
  /* EGL_BAD_DISPLAY */ return 0;
 }
 EGL.setErrorCode(12288);
 /* EGL_SUCCESS */ if (EGL.stringCache[name]) return EGL.stringCache[name];
 var ret;
 switch (name) {
 case 12371:
  /* EGL_VENDOR */ ret = stringToNewUTF8("Emscripten");
  break;

 case 12372:
  /* EGL_VERSION */ ret = stringToNewUTF8("1.4 Emscripten EGL");
  break;

 case 12373:
  /* EGL_EXTENSIONS */ ret = stringToNewUTF8("");
  break;

 case 12429:
  /* EGL_CLIENT_APIS */ ret = stringToNewUTF8("OpenGL_ES");
  break;

 default:
  EGL.setErrorCode(12300);
  /* EGL_BAD_PARAMETER */ return 0;
 }
 EGL.stringCache[name] = ret;
 return ret;
}

function _eglSwapBuffers(dpy, surface) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(54, 1, dpy, surface);
 if (!EGL.defaultDisplayInitialized) {
  EGL.setErrorCode(12289);
 } else /* EGL_NOT_INITIALIZED */ if (!Module.ctx) {
  EGL.setErrorCode(12290);
 } else /* EGL_BAD_ACCESS */ if (Module.ctx.isContextLost()) {
  EGL.setErrorCode(12302);
 } else /* EGL_CONTEXT_LOST */ {
  EGL.setErrorCode(12288);
  /* EGL_SUCCESS */ return 1;
 }
 /* EGL_TRUE */ return 0;
}

function _eglSwapInterval(display, interval) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(55, 1, display, interval);
 if (display != 62e3) /* Magic ID for Emscripten 'default display' */ {
  EGL.setErrorCode(12296);
  /* EGL_BAD_DISPLAY */ return 0;
 }
 if (interval == 0) _emscripten_set_main_loop_timing(0, 0); else _emscripten_set_main_loop_timing(1, interval);
 EGL.setErrorCode(12288);
 /* EGL_SUCCESS */ return 1;
}

function _eglTerminate(display) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(56, 1, display);
 if (display != 62e3) /* Magic ID for Emscripten 'default display' */ {
  EGL.setErrorCode(12296);
  /* EGL_BAD_DISPLAY */ return 0;
 }
 EGL.currentContext = 0;
 EGL.currentReadSurface = 0;
 EGL.currentDrawSurface = 0;
 EGL.defaultDisplayInitialized = false;
 EGL.setErrorCode(12288);
 /* EGL_SUCCESS */ return 1;
}

/** @suppress {duplicate } */ function _eglWaitClient() {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(57, 1);
 EGL.setErrorCode(12288);
 /* EGL_SUCCESS */ return 1;
}

var _eglWaitGL = _eglWaitClient;

function _eglWaitNative(nativeEngineId) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(58, 1, nativeEngineId);
 EGL.setErrorCode(12288);
 /* EGL_SUCCESS */ return 1;
}

var readEmAsmArgsArray = [];

var readEmAsmArgs = (sigPtr, buf) => {
 assert(Array.isArray(readEmAsmArgsArray));
 assert(buf % 16 == 0);
 readEmAsmArgsArray.length = 0;
 var ch;
 while (ch = GROWABLE_HEAP_U8()[sigPtr++]) {
  var chr = String.fromCharCode(ch);
  var validChars = [ "d", "f", "i", "p" ];
  assert(validChars.includes(chr), `Invalid character ${ch}("${chr}") in readEmAsmArgs! Use only [${validChars}], and do not specify "v" for void return argument.`);
  var wide = (ch != 105);
  wide &= (ch != 112);
  buf += wide && (buf % 8) ? 4 : 0;
  readEmAsmArgsArray.push( ch == 112 ? GROWABLE_HEAP_U32()[((buf) >> 2)] : ch == 105 ? GROWABLE_HEAP_I32()[((buf) >> 2)] : GROWABLE_HEAP_F64()[((buf) >> 3)]);
  buf += wide ? 8 : 4;
 }
 return readEmAsmArgsArray;
};

var runEmAsmFunction = (code, sigPtr, argbuf) => {
 var args = readEmAsmArgs(sigPtr, argbuf);
 assert(ASM_CONSTS.hasOwnProperty(code), `No EM_ASM constant found at address ${code}.  The loaded WebAssembly file is likely out of sync with the generated JavaScript.`);
 return ASM_CONSTS[code].apply(null, args);
};

var _emscripten_asm_const_int = (code, sigPtr, argbuf) => runEmAsmFunction(code, sigPtr, argbuf);

var runMainThreadEmAsm = (code, sigPtr, argbuf, sync) => {
 var args = readEmAsmArgs(sigPtr, argbuf);
 if (ENVIRONMENT_IS_PTHREAD) {
  return proxyToMainThread.apply(null, [ -1 - code, sync ].concat(args));
 }
 assert(ASM_CONSTS.hasOwnProperty(code), `No EM_ASM constant found at address ${code}.  The loaded WebAssembly file is likely out of sync with the generated JavaScript.`);
 return ASM_CONSTS[code].apply(null, args);
};

var _emscripten_asm_const_int_sync_on_main_thread = (code, sigPtr, argbuf) => runMainThreadEmAsm(code, sigPtr, argbuf, 1);

var _emscripten_check_blocking_allowed = () => {
 if (ENVIRONMENT_IS_NODE) return;
 if (ENVIRONMENT_IS_WORKER) return;
 warnOnce("Blocking on the main thread is very dangerous, see https://emscripten.org/docs/porting/pthreads.html#blocking-on-the-main-browser-thread");
};

var _emscripten_date_now = () => Date.now();

var _emscripten_err = str => err(UTF8ToString(str));

var JSEvents = {
 inEventHandler: 0,
 removeAllEventListeners() {
  for (var i = JSEvents.eventHandlers.length - 1; i >= 0; --i) {
   JSEvents._removeHandler(i);
  }
  JSEvents.eventHandlers = [];
  JSEvents.deferredCalls = [];
 },
 registerRemoveEventListeners() {
  if (!JSEvents.removeEventListenersRegistered) {
   __ATEXIT__.push(JSEvents.removeAllEventListeners);
   JSEvents.removeEventListenersRegistered = true;
  }
 },
 deferredCalls: [],
 deferCall(targetFunction, precedence, argsList) {
  function arraysHaveEqualContent(arrA, arrB) {
   if (arrA.length != arrB.length) return false;
   for (var i in arrA) {
    if (arrA[i] != arrB[i]) return false;
   }
   return true;
  }
  for (var i in JSEvents.deferredCalls) {
   var call = JSEvents.deferredCalls[i];
   if (call.targetFunction == targetFunction && arraysHaveEqualContent(call.argsList, argsList)) {
    return;
   }
  }
  JSEvents.deferredCalls.push({
   targetFunction: targetFunction,
   precedence: precedence,
   argsList: argsList
  });
  JSEvents.deferredCalls.sort((x, y) => x.precedence < y.precedence);
 },
 removeDeferredCalls(targetFunction) {
  for (var i = 0; i < JSEvents.deferredCalls.length; ++i) {
   if (JSEvents.deferredCalls[i].targetFunction == targetFunction) {
    JSEvents.deferredCalls.splice(i, 1);
    --i;
   }
  }
 },
 canPerformEventHandlerRequests() {
  if (navigator.userActivation) {
   return navigator.userActivation.isActive;
  }
  return JSEvents.inEventHandler && JSEvents.currentEventHandler.allowsDeferredCalls;
 },
 runDeferredCalls() {
  if (!JSEvents.canPerformEventHandlerRequests()) {
   return;
  }
  for (var i = 0; i < JSEvents.deferredCalls.length; ++i) {
   var call = JSEvents.deferredCalls[i];
   JSEvents.deferredCalls.splice(i, 1);
   --i;
   call.targetFunction.apply(null, call.argsList);
  }
 },
 eventHandlers: [],
 removeAllHandlersOnTarget: (target, eventTypeString) => {
  for (var i = 0; i < JSEvents.eventHandlers.length; ++i) {
   if (JSEvents.eventHandlers[i].target == target && (!eventTypeString || eventTypeString == JSEvents.eventHandlers[i].eventTypeString)) {
    JSEvents._removeHandler(i--);
   }
  }
 },
 _removeHandler(i) {
  var h = JSEvents.eventHandlers[i];
  h.target.removeEventListener(h.eventTypeString, h.eventListenerFunc, h.useCapture);
  JSEvents.eventHandlers.splice(i, 1);
 },
 registerOrRemoveHandler(eventHandler) {
  if (!eventHandler.target) {
   err("registerOrRemoveHandler: the target element for event handler registration does not exist, when processing the following event handler registration:");
   console.dir(eventHandler);
   return -4;
  }
  var jsEventHandler = function jsEventHandler(event) {
   ++JSEvents.inEventHandler;
   JSEvents.currentEventHandler = eventHandler;
   JSEvents.runDeferredCalls();
   eventHandler.handlerFunc(event);
   JSEvents.runDeferredCalls();
   --JSEvents.inEventHandler;
  };
  if (eventHandler.callbackfunc) {
   eventHandler.eventListenerFunc = jsEventHandler;
   eventHandler.target.addEventListener(eventHandler.eventTypeString, jsEventHandler, eventHandler.useCapture);
   JSEvents.eventHandlers.push(eventHandler);
   JSEvents.registerRemoveEventListeners();
  } else {
   for (var i = 0; i < JSEvents.eventHandlers.length; ++i) {
    if (JSEvents.eventHandlers[i].target == eventHandler.target && JSEvents.eventHandlers[i].eventTypeString == eventHandler.eventTypeString) {
     JSEvents._removeHandler(i--);
    }
   }
  }
  return 0;
 },
 getTargetThreadForEventCallback(targetThread) {
  switch (targetThread) {
  case 1:
   return 0;

  case 2:
   return PThread.currentProxiedOperationCallerThread;

  default:
   return targetThread;
  }
 },
 getNodeNameForTarget(target) {
  if (!target) return "";
  if (target == window) return "#window";
  if (target == screen) return "#screen";
  return (target && target.nodeName) ? target.nodeName : "";
 },
 fullscreenEnabled() {
  return document.fullscreenEnabled ||  document.webkitFullscreenEnabled;
 }
};

var currentFullscreenStrategy = {};

var maybeCStringToJsString = cString => cString > 2 ? UTF8ToString(cString) : cString;

var specialHTMLTargets = [ 0, typeof document != "undefined" ? document : 0, typeof window != "undefined" ? window : 0 ];

var findEventTarget = target => {
 target = maybeCStringToJsString(target);
 var domElement = specialHTMLTargets[target] || (typeof document != "undefined" ? document.querySelector(target) : undefined);
 return domElement;
};

var findCanvasEventTarget = target => findEventTarget(target);

var getCanvasSizeCallingThread = (target, width, height) => {
 var canvas = findCanvasEventTarget(target);
 if (!canvas) return -4;
 if (!canvas.controlTransferredOffscreen) {
  GROWABLE_HEAP_I32()[((width) >> 2)] = canvas.width;
  GROWABLE_HEAP_I32()[((height) >> 2)] = canvas.height;
 } else {
  return -4;
 }
 return 0;
};

function getCanvasSizeMainThread(target, width, height) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(60, 1, target, width, height);
 return getCanvasSizeCallingThread(target, width, height);
}

var _emscripten_get_canvas_element_size = (target, width, height) => {
 var canvas = findCanvasEventTarget(target);
 if (canvas) {
  return getCanvasSizeCallingThread(target, width, height);
 }
 return getCanvasSizeMainThread(target, width, height);
};

var stringToUTF8OnStack = str => {
 var size = lengthBytesUTF8(str) + 1;
 var ret = stackAlloc(size);
 stringToUTF8(str, ret, size);
 return ret;
};

var getCanvasElementSize = target => withStackSave(() => {
 var w = stackAlloc(8);
 var h = w + 4;
 var targetInt = stringToUTF8OnStack(target.id);
 var ret = _emscripten_get_canvas_element_size(targetInt, w, h);
 var size = [ GROWABLE_HEAP_I32()[((w) >> 2)], GROWABLE_HEAP_I32()[((h) >> 2)] ];
 return size;
});

var setCanvasElementSizeCallingThread = (target, width, height) => {
 var canvas = findCanvasEventTarget(target);
 if (!canvas) return -4;
 if (!canvas.controlTransferredOffscreen) {
  var autoResizeViewport = false;
  if (canvas.GLctxObject && canvas.GLctxObject.GLctx) {
   var prevViewport = canvas.GLctxObject.GLctx.getParameter(2978);
   autoResizeViewport = (prevViewport[0] === 0 && prevViewport[1] === 0 && prevViewport[2] === canvas.width && prevViewport[3] === canvas.height);
  }
  canvas.width = width;
  canvas.height = height;
  if (autoResizeViewport) {
   canvas.GLctxObject.GLctx.viewport(0, 0, width, height);
  }
 } else {
  return -4;
 }
 return 0;
};

function setCanvasElementSizeMainThread(target, width, height) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(61, 1, target, width, height);
 return setCanvasElementSizeCallingThread(target, width, height);
}

var _emscripten_set_canvas_element_size = (target, width, height) => {
 var canvas = findCanvasEventTarget(target);
 if (canvas) {
  return setCanvasElementSizeCallingThread(target, width, height);
 }
 return setCanvasElementSizeMainThread(target, width, height);
};

var setCanvasElementSize = (target, width, height) => {
 if (!target.controlTransferredOffscreen) {
  target.width = width;
  target.height = height;
 } else {
  withStackSave(() => {
   var targetInt = stringToUTF8OnStack(target.id);
   _emscripten_set_canvas_element_size(targetInt, width, height);
  });
 }
};

var registerRestoreOldStyle = canvas => {
 var canvasSize = getCanvasElementSize(canvas);
 var oldWidth = canvasSize[0];
 var oldHeight = canvasSize[1];
 var oldCssWidth = canvas.style.width;
 var oldCssHeight = canvas.style.height;
 var oldBackgroundColor = canvas.style.backgroundColor;
 var oldDocumentBackgroundColor = document.body.style.backgroundColor;
 var oldPaddingLeft = canvas.style.paddingLeft;
 var oldPaddingRight = canvas.style.paddingRight;
 var oldPaddingTop = canvas.style.paddingTop;
 var oldPaddingBottom = canvas.style.paddingBottom;
 var oldMarginLeft = canvas.style.marginLeft;
 var oldMarginRight = canvas.style.marginRight;
 var oldMarginTop = canvas.style.marginTop;
 var oldMarginBottom = canvas.style.marginBottom;
 var oldDocumentBodyMargin = document.body.style.margin;
 var oldDocumentOverflow = document.documentElement.style.overflow;
 var oldDocumentScroll = document.body.scroll;
 var oldImageRendering = canvas.style.imageRendering;
 function restoreOldStyle() {
  var fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement;
  if (!fullscreenElement) {
   document.removeEventListener("fullscreenchange", restoreOldStyle);
   document.removeEventListener("webkitfullscreenchange", restoreOldStyle);
   setCanvasElementSize(canvas, oldWidth, oldHeight);
   canvas.style.width = oldCssWidth;
   canvas.style.height = oldCssHeight;
   canvas.style.backgroundColor = oldBackgroundColor;
   if (!oldDocumentBackgroundColor) document.body.style.backgroundColor = "white";
   document.body.style.backgroundColor = oldDocumentBackgroundColor;
   canvas.style.paddingLeft = oldPaddingLeft;
   canvas.style.paddingRight = oldPaddingRight;
   canvas.style.paddingTop = oldPaddingTop;
   canvas.style.paddingBottom = oldPaddingBottom;
   canvas.style.marginLeft = oldMarginLeft;
   canvas.style.marginRight = oldMarginRight;
   canvas.style.marginTop = oldMarginTop;
   canvas.style.marginBottom = oldMarginBottom;
   document.body.style.margin = oldDocumentBodyMargin;
   document.documentElement.style.overflow = oldDocumentOverflow;
   document.body.scroll = oldDocumentScroll;
   canvas.style.imageRendering = oldImageRendering;
   if (canvas.GLctxObject) canvas.GLctxObject.GLctx.viewport(0, 0, oldWidth, oldHeight);
   if (currentFullscreenStrategy.canvasResizedCallback) {
    if (currentFullscreenStrategy.canvasResizedCallbackTargetThread) __emscripten_run_callback_on_thread(currentFullscreenStrategy.canvasResizedCallbackTargetThread, currentFullscreenStrategy.canvasResizedCallback, 37, 0, currentFullscreenStrategy.canvasResizedCallbackUserData); else getWasmTableEntry(currentFullscreenStrategy.canvasResizedCallback)(37, 0, currentFullscreenStrategy.canvasResizedCallbackUserData);
   }
  }
 }
 document.addEventListener("fullscreenchange", restoreOldStyle);
 document.addEventListener("webkitfullscreenchange", restoreOldStyle);
 return restoreOldStyle;
};

var setLetterbox = (element, topBottom, leftRight) => {
 element.style.paddingLeft = element.style.paddingRight = leftRight + "px";
 element.style.paddingTop = element.style.paddingBottom = topBottom + "px";
};

var getBoundingClientRect = e => specialHTMLTargets.indexOf(e) < 0 ? e.getBoundingClientRect() : {
 "left": 0,
 "top": 0
};

var JSEvents_resizeCanvasForFullscreen = (target, strategy) => {
 var restoreOldStyle = registerRestoreOldStyle(target);
 var cssWidth = strategy.softFullscreen ? innerWidth : screen.width;
 var cssHeight = strategy.softFullscreen ? innerHeight : screen.height;
 var rect = getBoundingClientRect(target);
 var windowedCssWidth = rect.width;
 var windowedCssHeight = rect.height;
 var canvasSize = getCanvasElementSize(target);
 var windowedRttWidth = canvasSize[0];
 var windowedRttHeight = canvasSize[1];
 if (strategy.scaleMode == 3) {
  setLetterbox(target, (cssHeight - windowedCssHeight) / 2, (cssWidth - windowedCssWidth) / 2);
  cssWidth = windowedCssWidth;
  cssHeight = windowedCssHeight;
 } else if (strategy.scaleMode == 2) {
  if (cssWidth * windowedRttHeight < windowedRttWidth * cssHeight) {
   var desiredCssHeight = windowedRttHeight * cssWidth / windowedRttWidth;
   setLetterbox(target, (cssHeight - desiredCssHeight) / 2, 0);
   cssHeight = desiredCssHeight;
  } else {
   var desiredCssWidth = windowedRttWidth * cssHeight / windowedRttHeight;
   setLetterbox(target, 0, (cssWidth - desiredCssWidth) / 2);
   cssWidth = desiredCssWidth;
  }
 }
 if (!target.style.backgroundColor) target.style.backgroundColor = "black";
 if (!document.body.style.backgroundColor) document.body.style.backgroundColor = "black";
 target.style.width = cssWidth + "px";
 target.style.height = cssHeight + "px";
 if (strategy.filteringMode == 1) {
  target.style.imageRendering = "optimizeSpeed";
  target.style.imageRendering = "-moz-crisp-edges";
  target.style.imageRendering = "-o-crisp-edges";
  target.style.imageRendering = "-webkit-optimize-contrast";
  target.style.imageRendering = "optimize-contrast";
  target.style.imageRendering = "crisp-edges";
  target.style.imageRendering = "pixelated";
 }
 var dpiScale = (strategy.canvasResolutionScaleMode == 2) ? devicePixelRatio : 1;
 if (strategy.canvasResolutionScaleMode != 0) {
  var newWidth = (cssWidth * dpiScale) | 0;
  var newHeight = (cssHeight * dpiScale) | 0;
  setCanvasElementSize(target, newWidth, newHeight);
  if (target.GLctxObject) target.GLctxObject.GLctx.viewport(0, 0, newWidth, newHeight);
 }
 return restoreOldStyle;
};

var JSEvents_requestFullscreen = (target, strategy) => {
 if (strategy.scaleMode != 0 || strategy.canvasResolutionScaleMode != 0) {
  JSEvents_resizeCanvasForFullscreen(target, strategy);
 }
 if (target.requestFullscreen) {
  target.requestFullscreen();
 } else if (target.webkitRequestFullscreen) {
  target.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
 } else {
  return JSEvents.fullscreenEnabled() ? -3 : -1;
 }
 currentFullscreenStrategy = strategy;
 if (strategy.canvasResizedCallback) {
  if (strategy.canvasResizedCallbackTargetThread) __emscripten_run_callback_on_thread(strategy.canvasResizedCallbackTargetThread, strategy.canvasResizedCallback, 37, 0, strategy.canvasResizedCallbackUserData); else getWasmTableEntry(strategy.canvasResizedCallback)(37, 0, strategy.canvasResizedCallbackUserData);
 }
 return 0;
};

function _emscripten_exit_fullscreen() {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(59, 1);
 if (!JSEvents.fullscreenEnabled()) return -1;
 JSEvents.removeDeferredCalls(JSEvents_requestFullscreen);
 var d = specialHTMLTargets[1];
 if (d.exitFullscreen) {
  d.fullscreenElement && d.exitFullscreen();
 } else if (d.webkitExitFullscreen) {
  d.webkitFullscreenElement && d.webkitExitFullscreen();
 } else {
  return -1;
 }
 return 0;
}

var requestPointerLock = target => {
 if (target.requestPointerLock) {
  target.requestPointerLock();
 } else {
  if (document.body.requestPointerLock) {
   return -3;
  }
  return -1;
 }
 return 0;
};

function _emscripten_exit_pointerlock() {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(62, 1);
 JSEvents.removeDeferredCalls(requestPointerLock);
 if (document.exitPointerLock) {
  document.exitPointerLock();
 } else {
  return -1;
 }
 return 0;
}

var _emscripten_exit_with_live_runtime = () => {
 runtimeKeepalivePush();
 throw "unwind";
};

function _emscripten_get_device_pixel_ratio() {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(63, 1);
 return (typeof devicePixelRatio == "number" && devicePixelRatio) || 1;
}

function _emscripten_get_element_css_size(target, width, height) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(64, 1, target, width, height);
 target = findEventTarget(target);
 if (!target) return -4;
 var rect = getBoundingClientRect(target);
 GROWABLE_HEAP_F64()[((width) >> 3)] = rect.width;
 GROWABLE_HEAP_F64()[((height) >> 3)] = rect.height;
 return 0;
}

var fillGamepadEventData = (eventStruct, e) => {
 GROWABLE_HEAP_F64()[((eventStruct) >> 3)] = e.timestamp;
 for (var i = 0; i < e.axes.length; ++i) {
  GROWABLE_HEAP_F64()[(((eventStruct + i * 8) + (16)) >> 3)] = e.axes[i];
 }
 for (var i = 0; i < e.buttons.length; ++i) {
  if (typeof e.buttons[i] == "object") {
   GROWABLE_HEAP_F64()[(((eventStruct + i * 8) + (528)) >> 3)] = e.buttons[i].value;
  } else {
   GROWABLE_HEAP_F64()[(((eventStruct + i * 8) + (528)) >> 3)] = e.buttons[i];
  }
 }
 for (var i = 0; i < e.buttons.length; ++i) {
  if (typeof e.buttons[i] == "object") {
   GROWABLE_HEAP_I32()[(((eventStruct + i * 4) + (1040)) >> 2)] = e.buttons[i].pressed;
  } else {
   /** @suppress {checkTypes} */ GROWABLE_HEAP_I32()[(((eventStruct + i * 4) + (1040)) >> 2)] = e.buttons[i] == 1;
  }
 }
 GROWABLE_HEAP_I32()[(((eventStruct) + (1296)) >> 2)] = e.connected;
 GROWABLE_HEAP_I32()[(((eventStruct) + (1300)) >> 2)] = e.index;
 GROWABLE_HEAP_I32()[(((eventStruct) + (8)) >> 2)] = e.axes.length;
 GROWABLE_HEAP_I32()[(((eventStruct) + (12)) >> 2)] = e.buttons.length;
 stringToUTF8(e.id, eventStruct + 1304, 64);
 stringToUTF8(e.mapping, eventStruct + 1368, 64);
};

function _emscripten_get_gamepad_status(index, gamepadState) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(65, 1, index, gamepadState);
 if (!JSEvents.lastGamepadState) throw "emscripten_get_gamepad_status() can only be called after having first called emscripten_sample_gamepad_data() and that function has returned EMSCRIPTEN_RESULT_SUCCESS!";
 if (index < 0 || index >= JSEvents.lastGamepadState.length) return -5;
 if (!JSEvents.lastGamepadState[index]) return -7;
 fillGamepadEventData(gamepadState, JSEvents.lastGamepadState[index]);
 return 0;
}

function _emscripten_get_num_gamepads() {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(66, 1);
 if (!JSEvents.lastGamepadState) throw "emscripten_get_num_gamepads() can only be called after having first called emscripten_sample_gamepad_data() and that function has returned EMSCRIPTEN_RESULT_SUCCESS!";
 return JSEvents.lastGamepadState.length;
}

function _emscripten_get_preloaded_image_data(path, w, h) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(67, 1, path, w, h);
 if ((path | 0) === path) path = UTF8ToString(path);
 path = PATH_FS.resolve(path);
 var canvas = /** @type {HTMLCanvasElement} */ (preloadedImages[path]);
 if (canvas) {
  var ctx = canvas.getContext("2d");
  var image = ctx.getImageData(0, 0, canvas.width, canvas.height);
  var buf = _malloc(canvas.width * canvas.height * 4);
  GROWABLE_HEAP_U8().set(image.data, buf);
  GROWABLE_HEAP_I32()[((w) >> 2)] = canvas.width;
  GROWABLE_HEAP_I32()[((h) >> 2)] = canvas.height;
  return buf;
 }
 return 0;
}

function _emscripten_get_screen_size(width, height) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(68, 1, width, height);
 GROWABLE_HEAP_I32()[((width) >> 2)] = screen.width;
 GROWABLE_HEAP_I32()[((height) >> 2)] = screen.height;
}

/** @suppress {duplicate } */ function _glActiveTexture(x0) {
 GLctx.activeTexture(x0);
}

var _emscripten_glActiveTexture = _glActiveTexture;

/** @suppress {duplicate } */ var _glAttachShader = (program, shader) => {
 GLctx.attachShader(GL.programs[program], GL.shaders[shader]);
};

var _emscripten_glAttachShader = _glAttachShader;

/** @suppress {duplicate } */ var _glBeginQuery = (target, id) => {
 GLctx.beginQuery(target, GL.queries[id]);
};

var _emscripten_glBeginQuery = _glBeginQuery;

/** @suppress {duplicate } */ var _glBeginQueryEXT = (target, id) => {
 GLctx.disjointTimerQueryExt["beginQueryEXT"](target, GL.queries[id]);
};

var _emscripten_glBeginQueryEXT = _glBeginQueryEXT;

/** @suppress {duplicate } */ function _glBeginTransformFeedback(x0) {
 GLctx.beginTransformFeedback(x0);
}

var _emscripten_glBeginTransformFeedback = _glBeginTransformFeedback;

/** @suppress {duplicate } */ var _glBindAttribLocation = (program, index, name) => {
 GLctx.bindAttribLocation(GL.programs[program], index, UTF8ToString(name));
};

var _emscripten_glBindAttribLocation = _glBindAttribLocation;

/** @suppress {duplicate } */ var _glBindBuffer = (target, buffer) => {
 if (target == 35051) /*GL_PIXEL_PACK_BUFFER*/ {
  GLctx.currentPixelPackBufferBinding = buffer;
 } else if (target == 35052) /*GL_PIXEL_UNPACK_BUFFER*/ {
  GLctx.currentPixelUnpackBufferBinding = buffer;
 }
 GLctx.bindBuffer(target, GL.buffers[buffer]);
};

var _emscripten_glBindBuffer = _glBindBuffer;

/** @suppress {duplicate } */ var _glBindBufferBase = (target, index, buffer) => {
 GLctx.bindBufferBase(target, index, GL.buffers[buffer]);
};

var _emscripten_glBindBufferBase = _glBindBufferBase;

/** @suppress {duplicate } */ var _glBindBufferRange = (target, index, buffer, offset, ptrsize) => {
 GLctx.bindBufferRange(target, index, GL.buffers[buffer], offset, ptrsize);
};

var _emscripten_glBindBufferRange = _glBindBufferRange;

/** @suppress {duplicate } */ var _glBindFramebuffer = (target, framebuffer) => {
 GLctx.bindFramebuffer(target, GL.framebuffers[framebuffer]);
};

var _emscripten_glBindFramebuffer = _glBindFramebuffer;

/** @suppress {duplicate } */ var _glBindRenderbuffer = (target, renderbuffer) => {
 GLctx.bindRenderbuffer(target, GL.renderbuffers[renderbuffer]);
};

var _emscripten_glBindRenderbuffer = _glBindRenderbuffer;

/** @suppress {duplicate } */ var _glBindSampler = (unit, sampler) => {
 GLctx.bindSampler(unit, GL.samplers[sampler]);
};

var _emscripten_glBindSampler = _glBindSampler;

/** @suppress {duplicate } */ var _glBindTexture = (target, texture) => {
 GLctx.bindTexture(target, GL.textures[texture]);
};

var _emscripten_glBindTexture = _glBindTexture;

/** @suppress {duplicate } */ var _glBindTransformFeedback = (target, id) => {
 GLctx.bindTransformFeedback(target, GL.transformFeedbacks[id]);
};

var _emscripten_glBindTransformFeedback = _glBindTransformFeedback;

/** @suppress {duplicate } */ var _glBindVertexArray = vao => {
 GLctx.bindVertexArray(GL.vaos[vao]);
};

var _emscripten_glBindVertexArray = _glBindVertexArray;

/** @suppress {duplicate } */ var _glBindVertexArrayOES = _glBindVertexArray;

var _emscripten_glBindVertexArrayOES = _glBindVertexArrayOES;

/** @suppress {duplicate } */ function _glBlendColor(x0, x1, x2, x3) {
 GLctx.blendColor(x0, x1, x2, x3);
}

var _emscripten_glBlendColor = _glBlendColor;

/** @suppress {duplicate } */ function _glBlendEquation(x0) {
 GLctx.blendEquation(x0);
}

var _emscripten_glBlendEquation = _glBlendEquation;

/** @suppress {duplicate } */ function _glBlendEquationSeparate(x0, x1) {
 GLctx.blendEquationSeparate(x0, x1);
}

var _emscripten_glBlendEquationSeparate = _glBlendEquationSeparate;

/** @suppress {duplicate } */ function _glBlendFunc(x0, x1) {
 GLctx.blendFunc(x0, x1);
}

var _emscripten_glBlendFunc = _glBlendFunc;

/** @suppress {duplicate } */ function _glBlendFuncSeparate(x0, x1, x2, x3) {
 GLctx.blendFuncSeparate(x0, x1, x2, x3);
}

var _emscripten_glBlendFuncSeparate = _glBlendFuncSeparate;

/** @suppress {duplicate } */ function _glBlitFramebuffer(x0, x1, x2, x3, x4, x5, x6, x7, x8, x9) {
 GLctx.blitFramebuffer(x0, x1, x2, x3, x4, x5, x6, x7, x8, x9);
}

var _emscripten_glBlitFramebuffer = _glBlitFramebuffer;

/** @suppress {duplicate } */ var _glBufferData = (target, size, data, usage) => {
 if (true) {
  if (data && size) {
   GLctx.bufferData(target, GROWABLE_HEAP_U8(), usage, data, size);
  } else {
   GLctx.bufferData(target, size, usage);
  }
 } else {
  GLctx.bufferData(target, data ? GROWABLE_HEAP_U8().subarray(data, data + size) : size, usage);
 }
};

var _emscripten_glBufferData = _glBufferData;

/** @suppress {duplicate } */ var _glBufferSubData = (target, offset, size, data) => {
 if (true) {
  size && GLctx.bufferSubData(target, offset, GROWABLE_HEAP_U8(), data, size);
  return;
 }
 GLctx.bufferSubData(target, offset, GROWABLE_HEAP_U8().subarray(data, data + size));
};

var _emscripten_glBufferSubData = _glBufferSubData;

/** @suppress {duplicate } */ function _glCheckFramebufferStatus(x0) {
 return GLctx.checkFramebufferStatus(x0);
}

var _emscripten_glCheckFramebufferStatus = _glCheckFramebufferStatus;

/** @suppress {duplicate } */ function _glClear(x0) {
 GLctx.clear(x0);
}

var _emscripten_glClear = _glClear;

/** @suppress {duplicate } */ function _glClearBufferfi(x0, x1, x2, x3) {
 GLctx.clearBufferfi(x0, x1, x2, x3);
}

var _emscripten_glClearBufferfi = _glClearBufferfi;

/** @suppress {duplicate } */ var _glClearBufferfv = (buffer, drawbuffer, value) => {
 GLctx.clearBufferfv(buffer, drawbuffer, GROWABLE_HEAP_F32(), value >> 2);
};

var _emscripten_glClearBufferfv = _glClearBufferfv;

/** @suppress {duplicate } */ var _glClearBufferiv = (buffer, drawbuffer, value) => {
 GLctx.clearBufferiv(buffer, drawbuffer, GROWABLE_HEAP_I32(), value >> 2);
};

var _emscripten_glClearBufferiv = _glClearBufferiv;

/** @suppress {duplicate } */ var _glClearBufferuiv = (buffer, drawbuffer, value) => {
 GLctx.clearBufferuiv(buffer, drawbuffer, GROWABLE_HEAP_U32(), value >> 2);
};

var _emscripten_glClearBufferuiv = _glClearBufferuiv;

/** @suppress {duplicate } */ function _glClearColor(x0, x1, x2, x3) {
 GLctx.clearColor(x0, x1, x2, x3);
}

var _emscripten_glClearColor = _glClearColor;

/** @suppress {duplicate } */ function _glClearDepthf(x0) {
 GLctx.clearDepth(x0);
}

var _emscripten_glClearDepthf = _glClearDepthf;

/** @suppress {duplicate } */ function _glClearStencil(x0) {
 GLctx.clearStencil(x0);
}

var _emscripten_glClearStencil = _glClearStencil;

var convertI32PairToI53 = (lo, hi) => {
 assert(hi === (hi | 0));
 return (lo >>> 0) + hi * 4294967296;
};

/** @suppress {duplicate } */ var _glClientWaitSync = (sync, flags, timeout_low, timeout_high) => {
 var timeout = convertI32PairToI53(timeout_low, timeout_high);
 return GLctx.clientWaitSync(GL.syncs[sync], flags, timeout);
};

var _emscripten_glClientWaitSync = _glClientWaitSync;

/** @suppress {duplicate } */ var _glColorMask = (red, green, blue, alpha) => {
 GLctx.colorMask(!!red, !!green, !!blue, !!alpha);
};

var _emscripten_glColorMask = _glColorMask;

/** @suppress {duplicate } */ var _glCompileShader = shader => {
 GLctx.compileShader(GL.shaders[shader]);
};

var _emscripten_glCompileShader = _glCompileShader;

/** @suppress {duplicate } */ var _glCompressedTexImage2D = (target, level, internalFormat, width, height, border, imageSize, data) => {
 if (true) {
  if (GLctx.currentPixelUnpackBufferBinding || !imageSize) {
   GLctx.compressedTexImage2D(target, level, internalFormat, width, height, border, imageSize, data);
  } else {
   GLctx.compressedTexImage2D(target, level, internalFormat, width, height, border, GROWABLE_HEAP_U8(), data, imageSize);
  }
  return;
 }
 GLctx.compressedTexImage2D(target, level, internalFormat, width, height, border, data ? GROWABLE_HEAP_U8().subarray((data), (data + imageSize)) : null);
};

var _emscripten_glCompressedTexImage2D = _glCompressedTexImage2D;

/** @suppress {duplicate } */ var _glCompressedTexImage3D = (target, level, internalFormat, width, height, depth, border, imageSize, data) => {
 if (GLctx.currentPixelUnpackBufferBinding) {
  GLctx.compressedTexImage3D(target, level, internalFormat, width, height, depth, border, imageSize, data);
 } else {
  GLctx.compressedTexImage3D(target, level, internalFormat, width, height, depth, border, GROWABLE_HEAP_U8(), data, imageSize);
 }
};

var _emscripten_glCompressedTexImage3D = _glCompressedTexImage3D;

/** @suppress {duplicate } */ var _glCompressedTexSubImage2D = (target, level, xoffset, yoffset, width, height, format, imageSize, data) => {
 if (true) {
  if (GLctx.currentPixelUnpackBufferBinding || !imageSize) {
   GLctx.compressedTexSubImage2D(target, level, xoffset, yoffset, width, height, format, imageSize, data);
  } else {
   GLctx.compressedTexSubImage2D(target, level, xoffset, yoffset, width, height, format, GROWABLE_HEAP_U8(), data, imageSize);
  }
  return;
 }
 GLctx.compressedTexSubImage2D(target, level, xoffset, yoffset, width, height, format, data ? GROWABLE_HEAP_U8().subarray((data), (data + imageSize)) : null);
};

var _emscripten_glCompressedTexSubImage2D = _glCompressedTexSubImage2D;

/** @suppress {duplicate } */ var _glCompressedTexSubImage3D = (target, level, xoffset, yoffset, zoffset, width, height, depth, format, imageSize, data) => {
 if (GLctx.currentPixelUnpackBufferBinding) {
  GLctx.compressedTexSubImage3D(target, level, xoffset, yoffset, zoffset, width, height, depth, format, imageSize, data);
 } else {
  GLctx.compressedTexSubImage3D(target, level, xoffset, yoffset, zoffset, width, height, depth, format, GROWABLE_HEAP_U8(), data, imageSize);
 }
};

var _emscripten_glCompressedTexSubImage3D = _glCompressedTexSubImage3D;

/** @suppress {duplicate } */ function _glCopyBufferSubData(x0, x1, x2, x3, x4) {
 GLctx.copyBufferSubData(x0, x1, x2, x3, x4);
}

var _emscripten_glCopyBufferSubData = _glCopyBufferSubData;

/** @suppress {duplicate } */ function _glCopyTexImage2D(x0, x1, x2, x3, x4, x5, x6, x7) {
 GLctx.copyTexImage2D(x0, x1, x2, x3, x4, x5, x6, x7);
}

var _emscripten_glCopyTexImage2D = _glCopyTexImage2D;

/** @suppress {duplicate } */ function _glCopyTexSubImage2D(x0, x1, x2, x3, x4, x5, x6, x7) {
 GLctx.copyTexSubImage2D(x0, x1, x2, x3, x4, x5, x6, x7);
}

var _emscripten_glCopyTexSubImage2D = _glCopyTexSubImage2D;

/** @suppress {duplicate } */ function _glCopyTexSubImage3D(x0, x1, x2, x3, x4, x5, x6, x7, x8) {
 GLctx.copyTexSubImage3D(x0, x1, x2, x3, x4, x5, x6, x7, x8);
}

var _emscripten_glCopyTexSubImage3D = _glCopyTexSubImage3D;

/** @suppress {duplicate } */ var _glCreateProgram = () => {
 var id = GL.getNewId(GL.programs);
 var program = GLctx.createProgram();
 program.name = id;
 program.maxUniformLength = program.maxAttributeLength = program.maxUniformBlockNameLength = 0;
 program.uniformIdCounter = 1;
 GL.programs[id] = program;
 return id;
};

var _emscripten_glCreateProgram = _glCreateProgram;

/** @suppress {duplicate } */ var _glCreateShader = shaderType => {
 var id = GL.getNewId(GL.shaders);
 GL.shaders[id] = GLctx.createShader(shaderType);
 return id;
};

var _emscripten_glCreateShader = _glCreateShader;

/** @suppress {duplicate } */ function _glCullFace(x0) {
 GLctx.cullFace(x0);
}

var _emscripten_glCullFace = _glCullFace;

/** @suppress {duplicate } */ var _glDeleteBuffers = (n, buffers) => {
 for (var i = 0; i < n; i++) {
  var id = GROWABLE_HEAP_I32()[(((buffers) + (i * 4)) >> 2)];
  var buffer = GL.buffers[id];
  if (!buffer) continue;
  GLctx.deleteBuffer(buffer);
  buffer.name = 0;
  GL.buffers[id] = null;
  if (id == GLctx.currentPixelPackBufferBinding) GLctx.currentPixelPackBufferBinding = 0;
  if (id == GLctx.currentPixelUnpackBufferBinding) GLctx.currentPixelUnpackBufferBinding = 0;
 }
};

var _emscripten_glDeleteBuffers = _glDeleteBuffers;

/** @suppress {duplicate } */ var _glDeleteFramebuffers = (n, framebuffers) => {
 for (var i = 0; i < n; ++i) {
  var id = GROWABLE_HEAP_I32()[(((framebuffers) + (i * 4)) >> 2)];
  var framebuffer = GL.framebuffers[id];
  if (!framebuffer) continue;
  GLctx.deleteFramebuffer(framebuffer);
  framebuffer.name = 0;
  GL.framebuffers[id] = null;
 }
};

var _emscripten_glDeleteFramebuffers = _glDeleteFramebuffers;

/** @suppress {duplicate } */ var _glDeleteProgram = id => {
 if (!id) return;
 var program = GL.programs[id];
 if (!program) {
  GL.recordError(1281);
  /* GL_INVALID_VALUE */ return;
 }
 GLctx.deleteProgram(program);
 program.name = 0;
 GL.programs[id] = null;
};

var _emscripten_glDeleteProgram = _glDeleteProgram;

/** @suppress {duplicate } */ var _glDeleteQueries = (n, ids) => {
 for (var i = 0; i < n; i++) {
  var id = GROWABLE_HEAP_I32()[(((ids) + (i * 4)) >> 2)];
  var query = GL.queries[id];
  if (!query) continue;
  GLctx.deleteQuery(query);
  GL.queries[id] = null;
 }
};

var _emscripten_glDeleteQueries = _glDeleteQueries;

/** @suppress {duplicate } */ var _glDeleteQueriesEXT = (n, ids) => {
 for (var i = 0; i < n; i++) {
  var id = GROWABLE_HEAP_I32()[(((ids) + (i * 4)) >> 2)];
  var query = GL.queries[id];
  if (!query) continue;
  GLctx.disjointTimerQueryExt["deleteQueryEXT"](query);
  GL.queries[id] = null;
 }
};

var _emscripten_glDeleteQueriesEXT = _glDeleteQueriesEXT;

/** @suppress {duplicate } */ var _glDeleteRenderbuffers = (n, renderbuffers) => {
 for (var i = 0; i < n; i++) {
  var id = GROWABLE_HEAP_I32()[(((renderbuffers) + (i * 4)) >> 2)];
  var renderbuffer = GL.renderbuffers[id];
  if (!renderbuffer) continue;
  GLctx.deleteRenderbuffer(renderbuffer);
  renderbuffer.name = 0;
  GL.renderbuffers[id] = null;
 }
};

var _emscripten_glDeleteRenderbuffers = _glDeleteRenderbuffers;

/** @suppress {duplicate } */ var _glDeleteSamplers = (n, samplers) => {
 for (var i = 0; i < n; i++) {
  var id = GROWABLE_HEAP_I32()[(((samplers) + (i * 4)) >> 2)];
  var sampler = GL.samplers[id];
  if (!sampler) continue;
  GLctx.deleteSampler(sampler);
  sampler.name = 0;
  GL.samplers[id] = null;
 }
};

var _emscripten_glDeleteSamplers = _glDeleteSamplers;

/** @suppress {duplicate } */ var _glDeleteShader = id => {
 if (!id) return;
 var shader = GL.shaders[id];
 if (!shader) {
  GL.recordError(1281);
  /* GL_INVALID_VALUE */ return;
 }
 GLctx.deleteShader(shader);
 GL.shaders[id] = null;
};

var _emscripten_glDeleteShader = _glDeleteShader;

/** @suppress {duplicate } */ var _glDeleteSync = id => {
 if (!id) return;
 var sync = GL.syncs[id];
 if (!sync) {
  GL.recordError(1281);
  /* GL_INVALID_VALUE */ return;
 }
 GLctx.deleteSync(sync);
 sync.name = 0;
 GL.syncs[id] = null;
};

var _emscripten_glDeleteSync = _glDeleteSync;

/** @suppress {duplicate } */ var _glDeleteTextures = (n, textures) => {
 for (var i = 0; i < n; i++) {
  var id = GROWABLE_HEAP_I32()[(((textures) + (i * 4)) >> 2)];
  var texture = GL.textures[id];
  if (!texture) continue;
  GLctx.deleteTexture(texture);
  texture.name = 0;
  GL.textures[id] = null;
 }
};

var _emscripten_glDeleteTextures = _glDeleteTextures;

/** @suppress {duplicate } */ var _glDeleteTransformFeedbacks = (n, ids) => {
 for (var i = 0; i < n; i++) {
  var id = GROWABLE_HEAP_I32()[(((ids) + (i * 4)) >> 2)];
  var transformFeedback = GL.transformFeedbacks[id];
  if (!transformFeedback) continue;
  GLctx.deleteTransformFeedback(transformFeedback);
  transformFeedback.name = 0;
  GL.transformFeedbacks[id] = null;
 }
};

var _emscripten_glDeleteTransformFeedbacks = _glDeleteTransformFeedbacks;

/** @suppress {duplicate } */ var _glDeleteVertexArrays = (n, vaos) => {
 for (var i = 0; i < n; i++) {
  var id = GROWABLE_HEAP_I32()[(((vaos) + (i * 4)) >> 2)];
  GLctx.deleteVertexArray(GL.vaos[id]);
  GL.vaos[id] = null;
 }
};

var _emscripten_glDeleteVertexArrays = _glDeleteVertexArrays;

/** @suppress {duplicate } */ var _glDeleteVertexArraysOES = _glDeleteVertexArrays;

var _emscripten_glDeleteVertexArraysOES = _glDeleteVertexArraysOES;

/** @suppress {duplicate } */ function _glDepthFunc(x0) {
 GLctx.depthFunc(x0);
}

var _emscripten_glDepthFunc = _glDepthFunc;

/** @suppress {duplicate } */ var _glDepthMask = flag => {
 GLctx.depthMask(!!flag);
};

var _emscripten_glDepthMask = _glDepthMask;

/** @suppress {duplicate } */ function _glDepthRangef(x0, x1) {
 GLctx.depthRange(x0, x1);
}

var _emscripten_glDepthRangef = _glDepthRangef;

/** @suppress {duplicate } */ var _glDetachShader = (program, shader) => {
 GLctx.detachShader(GL.programs[program], GL.shaders[shader]);
};

var _emscripten_glDetachShader = _glDetachShader;

/** @suppress {duplicate } */ function _glDisable(x0) {
 GLctx.disable(x0);
}

var _emscripten_glDisable = _glDisable;

/** @suppress {duplicate } */ var _glDisableVertexAttribArray = index => {
 GLctx.disableVertexAttribArray(index);
};

var _emscripten_glDisableVertexAttribArray = _glDisableVertexAttribArray;

/** @suppress {duplicate } */ var _glDrawArrays = (mode, first, count) => {
 GLctx.drawArrays(mode, first, count);
};

var _emscripten_glDrawArrays = _glDrawArrays;

/** @suppress {duplicate } */ var _glDrawArraysInstanced = (mode, first, count, primcount) => {
 GLctx.drawArraysInstanced(mode, first, count, primcount);
};

var _emscripten_glDrawArraysInstanced = _glDrawArraysInstanced;

/** @suppress {duplicate } */ var _glDrawArraysInstancedANGLE = _glDrawArraysInstanced;

var _emscripten_glDrawArraysInstancedANGLE = _glDrawArraysInstancedANGLE;

/** @suppress {duplicate } */ var _glDrawArraysInstancedARB = _glDrawArraysInstanced;

var _emscripten_glDrawArraysInstancedARB = _glDrawArraysInstancedARB;

/** @suppress {duplicate } */ var _glDrawArraysInstancedEXT = _glDrawArraysInstanced;

var _emscripten_glDrawArraysInstancedEXT = _glDrawArraysInstancedEXT;

/** @suppress {duplicate } */ var _glDrawArraysInstancedNV = _glDrawArraysInstanced;

var _emscripten_glDrawArraysInstancedNV = _glDrawArraysInstancedNV;

var tempFixedLengthArray = [];

/** @suppress {duplicate } */ var _glDrawBuffers = (n, bufs) => {
 var bufArray = tempFixedLengthArray[n];
 for (var i = 0; i < n; i++) {
  bufArray[i] = GROWABLE_HEAP_I32()[(((bufs) + (i * 4)) >> 2)];
 }
 GLctx.drawBuffers(bufArray);
};

var _emscripten_glDrawBuffers = _glDrawBuffers;

/** @suppress {duplicate } */ var _glDrawBuffersEXT = _glDrawBuffers;

var _emscripten_glDrawBuffersEXT = _glDrawBuffersEXT;

/** @suppress {duplicate } */ var _glDrawBuffersWEBGL = _glDrawBuffers;

var _emscripten_glDrawBuffersWEBGL = _glDrawBuffersWEBGL;

/** @suppress {duplicate } */ var _glDrawElements = (mode, count, type, indices) => {
 GLctx.drawElements(mode, count, type, indices);
};

var _emscripten_glDrawElements = _glDrawElements;

/** @suppress {duplicate } */ var _glDrawElementsInstanced = (mode, count, type, indices, primcount) => {
 GLctx.drawElementsInstanced(mode, count, type, indices, primcount);
};

var _emscripten_glDrawElementsInstanced = _glDrawElementsInstanced;

/** @suppress {duplicate } */ var _glDrawElementsInstancedANGLE = _glDrawElementsInstanced;

var _emscripten_glDrawElementsInstancedANGLE = _glDrawElementsInstancedANGLE;

/** @suppress {duplicate } */ var _glDrawElementsInstancedARB = _glDrawElementsInstanced;

var _emscripten_glDrawElementsInstancedARB = _glDrawElementsInstancedARB;

/** @suppress {duplicate } */ var _glDrawElementsInstancedEXT = _glDrawElementsInstanced;

var _emscripten_glDrawElementsInstancedEXT = _glDrawElementsInstancedEXT;

/** @suppress {duplicate } */ var _glDrawElementsInstancedNV = _glDrawElementsInstanced;

var _emscripten_glDrawElementsInstancedNV = _glDrawElementsInstancedNV;

/** @suppress {duplicate } */ var _glDrawRangeElements = (mode, start, end, count, type, indices) => {
 _glDrawElements(mode, count, type, indices);
};

var _emscripten_glDrawRangeElements = _glDrawRangeElements;

/** @suppress {duplicate } */ function _glEnable(x0) {
 GLctx.enable(x0);
}

var _emscripten_glEnable = _glEnable;

/** @suppress {duplicate } */ var _glEnableVertexAttribArray = index => {
 GLctx.enableVertexAttribArray(index);
};

var _emscripten_glEnableVertexAttribArray = _glEnableVertexAttribArray;

/** @suppress {duplicate } */ function _glEndQuery(x0) {
 GLctx.endQuery(x0);
}

var _emscripten_glEndQuery = _glEndQuery;

/** @suppress {duplicate } */ var _glEndQueryEXT = target => {
 GLctx.disjointTimerQueryExt["endQueryEXT"](target);
};

var _emscripten_glEndQueryEXT = _glEndQueryEXT;

/** @suppress {duplicate } */ function _glEndTransformFeedback() {
 GLctx.endTransformFeedback();
}

var _emscripten_glEndTransformFeedback = _glEndTransformFeedback;

/** @suppress {duplicate } */ var _glFenceSync = (condition, flags) => {
 var sync = GLctx.fenceSync(condition, flags);
 if (sync) {
  var id = GL.getNewId(GL.syncs);
  sync.name = id;
  GL.syncs[id] = sync;
  return id;
 }
 return 0;
};

var _emscripten_glFenceSync = _glFenceSync;

/** @suppress {duplicate } */ function _glFinish() {
 GLctx.finish();
}

var _emscripten_glFinish = _glFinish;

/** @suppress {duplicate } */ function _glFlush() {
 GLctx.flush();
}

var _emscripten_glFlush = _glFlush;

/** @suppress {duplicate } */ var _glFramebufferRenderbuffer = (target, attachment, renderbuffertarget, renderbuffer) => {
 GLctx.framebufferRenderbuffer(target, attachment, renderbuffertarget, GL.renderbuffers[renderbuffer]);
};

var _emscripten_glFramebufferRenderbuffer = _glFramebufferRenderbuffer;

/** @suppress {duplicate } */ var _glFramebufferTexture2D = (target, attachment, textarget, texture, level) => {
 GLctx.framebufferTexture2D(target, attachment, textarget, GL.textures[texture], level);
};

var _emscripten_glFramebufferTexture2D = _glFramebufferTexture2D;

/** @suppress {duplicate } */ var _glFramebufferTextureLayer = (target, attachment, texture, level, layer) => {
 GLctx.framebufferTextureLayer(target, attachment, GL.textures[texture], level, layer);
};

var _emscripten_glFramebufferTextureLayer = _glFramebufferTextureLayer;

/** @suppress {duplicate } */ function _glFrontFace(x0) {
 GLctx.frontFace(x0);
}

var _emscripten_glFrontFace = _glFrontFace;

var __glGenObject = (n, buffers, createFunction, objectTable) => {
 for (var i = 0; i < n; i++) {
  var buffer = GLctx[createFunction]();
  var id = buffer && GL.getNewId(objectTable);
  if (buffer) {
   buffer.name = id;
   objectTable[id] = buffer;
  } else {
   GL.recordError(1282);
  }
  GROWABLE_HEAP_I32()[(((buffers) + (i * 4)) >> 2)] = id;
 }
};

/** @suppress {duplicate } */ var _glGenBuffers = (n, buffers) => {
 __glGenObject(n, buffers, "createBuffer", GL.buffers);
};

var _emscripten_glGenBuffers = _glGenBuffers;

/** @suppress {duplicate } */ var _glGenFramebuffers = (n, ids) => {
 __glGenObject(n, ids, "createFramebuffer", GL.framebuffers);
};

var _emscripten_glGenFramebuffers = _glGenFramebuffers;

/** @suppress {duplicate } */ var _glGenQueries = (n, ids) => {
 __glGenObject(n, ids, "createQuery", GL.queries);
};

var _emscripten_glGenQueries = _glGenQueries;

/** @suppress {duplicate } */ var _glGenQueriesEXT = (n, ids) => {
 for (var i = 0; i < n; i++) {
  var query = GLctx.disjointTimerQueryExt["createQueryEXT"]();
  if (!query) {
   GL.recordError(1282);
   /* GL_INVALID_OPERATION */ while (i < n) GROWABLE_HEAP_I32()[(((ids) + (i++ * 4)) >> 2)] = 0;
   return;
  }
  var id = GL.getNewId(GL.queries);
  query.name = id;
  GL.queries[id] = query;
  GROWABLE_HEAP_I32()[(((ids) + (i * 4)) >> 2)] = id;
 }
};

var _emscripten_glGenQueriesEXT = _glGenQueriesEXT;

/** @suppress {duplicate } */ var _glGenRenderbuffers = (n, renderbuffers) => {
 __glGenObject(n, renderbuffers, "createRenderbuffer", GL.renderbuffers);
};

var _emscripten_glGenRenderbuffers = _glGenRenderbuffers;

/** @suppress {duplicate } */ var _glGenSamplers = (n, samplers) => {
 __glGenObject(n, samplers, "createSampler", GL.samplers);
};

var _emscripten_glGenSamplers = _glGenSamplers;

/** @suppress {duplicate } */ var _glGenTextures = (n, textures) => {
 __glGenObject(n, textures, "createTexture", GL.textures);
};

var _emscripten_glGenTextures = _glGenTextures;

/** @suppress {duplicate } */ var _glGenTransformFeedbacks = (n, ids) => {
 __glGenObject(n, ids, "createTransformFeedback", GL.transformFeedbacks);
};

var _emscripten_glGenTransformFeedbacks = _glGenTransformFeedbacks;

/** @suppress {duplicate } */ function _glGenVertexArrays(n, arrays) {
 __glGenObject(n, arrays, "createVertexArray", GL.vaos);
}

var _emscripten_glGenVertexArrays = _glGenVertexArrays;

/** @suppress {duplicate } */ var _glGenVertexArraysOES = _glGenVertexArrays;

var _emscripten_glGenVertexArraysOES = _glGenVertexArraysOES;

/** @suppress {duplicate } */ function _glGenerateMipmap(x0) {
 GLctx.generateMipmap(x0);
}

var _emscripten_glGenerateMipmap = _glGenerateMipmap;

var __glGetActiveAttribOrUniform = (funcName, program, index, bufSize, length, size, type, name) => {
 program = GL.programs[program];
 var info = GLctx[funcName](program, index);
 if (info) {
  var numBytesWrittenExclNull = name && stringToUTF8(info.name, name, bufSize);
  if (length) GROWABLE_HEAP_I32()[((length) >> 2)] = numBytesWrittenExclNull;
  if (size) GROWABLE_HEAP_I32()[((size) >> 2)] = info.size;
  if (type) GROWABLE_HEAP_I32()[((type) >> 2)] = info.type;
 }
};

/** @suppress {duplicate } */ var _glGetActiveAttrib = (program, index, bufSize, length, size, type, name) => {
 __glGetActiveAttribOrUniform("getActiveAttrib", program, index, bufSize, length, size, type, name);
};

var _emscripten_glGetActiveAttrib = _glGetActiveAttrib;

/** @suppress {duplicate } */ var _glGetActiveUniform = (program, index, bufSize, length, size, type, name) => {
 __glGetActiveAttribOrUniform("getActiveUniform", program, index, bufSize, length, size, type, name);
};

var _emscripten_glGetActiveUniform = _glGetActiveUniform;

/** @suppress {duplicate } */ var _glGetActiveUniformBlockName = (program, uniformBlockIndex, bufSize, length, uniformBlockName) => {
 program = GL.programs[program];
 var result = GLctx.getActiveUniformBlockName(program, uniformBlockIndex);
 if (!result) return;
 if (uniformBlockName && bufSize > 0) {
  var numBytesWrittenExclNull = stringToUTF8(result, uniformBlockName, bufSize);
  if (length) GROWABLE_HEAP_I32()[((length) >> 2)] = numBytesWrittenExclNull;
 } else {
  if (length) GROWABLE_HEAP_I32()[((length) >> 2)] = 0;
 }
};

var _emscripten_glGetActiveUniformBlockName = _glGetActiveUniformBlockName;

/** @suppress {duplicate } */ var _glGetActiveUniformBlockiv = (program, uniformBlockIndex, pname, params) => {
 if (!params) {
  GL.recordError(1281);
  /* GL_INVALID_VALUE */ return;
 }
 program = GL.programs[program];
 if (pname == 35393) /* GL_UNIFORM_BLOCK_NAME_LENGTH */ {
  var name = GLctx.getActiveUniformBlockName(program, uniformBlockIndex);
  GROWABLE_HEAP_I32()[((params) >> 2)] = name.length + 1;
  return;
 }
 var result = GLctx.getActiveUniformBlockParameter(program, uniformBlockIndex, pname);
 if (result === null) return;
 if (pname == 35395) /*GL_UNIFORM_BLOCK_ACTIVE_UNIFORM_INDICES*/ {
  for (var i = 0; i < result.length; i++) {
   GROWABLE_HEAP_I32()[(((params) + (i * 4)) >> 2)] = result[i];
  }
 } else {
  GROWABLE_HEAP_I32()[((params) >> 2)] = result;
 }
};

var _emscripten_glGetActiveUniformBlockiv = _glGetActiveUniformBlockiv;

/** @suppress {duplicate } */ var _glGetActiveUniformsiv = (program, uniformCount, uniformIndices, pname, params) => {
 if (!params) {
  GL.recordError(1281);
  /* GL_INVALID_VALUE */ return;
 }
 if (uniformCount > 0 && uniformIndices == 0) {
  GL.recordError(1281);
  /* GL_INVALID_VALUE */ return;
 }
 program = GL.programs[program];
 var ids = [];
 for (var i = 0; i < uniformCount; i++) {
  ids.push(GROWABLE_HEAP_I32()[(((uniformIndices) + (i * 4)) >> 2)]);
 }
 var result = GLctx.getActiveUniforms(program, ids, pname);
 if (!result) return;
 var len = result.length;
 for (var i = 0; i < len; i++) {
  GROWABLE_HEAP_I32()[(((params) + (i * 4)) >> 2)] = result[i];
 }
};

var _emscripten_glGetActiveUniformsiv = _glGetActiveUniformsiv;

/** @suppress {duplicate } */ var _glGetAttachedShaders = (program, maxCount, count, shaders) => {
 var result = GLctx.getAttachedShaders(GL.programs[program]);
 var len = result.length;
 if (len > maxCount) {
  len = maxCount;
 }
 GROWABLE_HEAP_I32()[((count) >> 2)] = len;
 for (var i = 0; i < len; ++i) {
  var id = GL.shaders.indexOf(result[i]);
  GROWABLE_HEAP_I32()[(((shaders) + (i * 4)) >> 2)] = id;
 }
};

var _emscripten_glGetAttachedShaders = _glGetAttachedShaders;

/** @suppress {duplicate } */ var _glGetAttribLocation = (program, name) => GLctx.getAttribLocation(GL.programs[program], UTF8ToString(name));

var _emscripten_glGetAttribLocation = _glGetAttribLocation;

var readI53FromI64 = ptr => GROWABLE_HEAP_U32()[((ptr) >> 2)] + GROWABLE_HEAP_I32()[(((ptr) + (4)) >> 2)] * 4294967296;

var readI53FromU64 = ptr => GROWABLE_HEAP_U32()[((ptr) >> 2)] + GROWABLE_HEAP_U32()[(((ptr) + (4)) >> 2)] * 4294967296;

var writeI53ToI64 = (ptr, num) => {
 GROWABLE_HEAP_U32()[((ptr) >> 2)] = num;
 var lower = GROWABLE_HEAP_U32()[((ptr) >> 2)];
 GROWABLE_HEAP_U32()[(((ptr) + (4)) >> 2)] = (num - lower) / 4294967296;
 var deserialized = (num >= 0) ? readI53FromU64(ptr) : readI53FromI64(ptr);
 var offset = ((ptr) >> 2);
 if (deserialized != num) warnOnce(`writeI53ToI64() out of range: serialized JS Number ${num} to Wasm heap as bytes lo=${ptrToString(GROWABLE_HEAP_U32()[offset])}, hi=${ptrToString(GROWABLE_HEAP_U32()[offset + 1])}, which deserializes back to ${deserialized} instead!`);
};

var emscriptenWebGLGet = (name_, p, type) => {
 if (!p) {
  GL.recordError(1281);
  /* GL_INVALID_VALUE */ return;
 }
 var ret = undefined;
 switch (name_) {
 case 36346:
  ret = 1;
  break;

 case 36344:
  if (type != 0 && type != 1) {
   GL.recordError(1280);
  }
  return;

 case 34814:
 case 36345:
  ret = 0;
  break;

 case 34466:
  var formats = GLctx.getParameter(34467);
  /*GL_COMPRESSED_TEXTURE_FORMATS*/ ret = formats ? formats.length : 0;
  break;

 case 33309:
  if (GL.currentContext.version < 2) {
   GL.recordError(1282);
   return;
  }
  var exts = GLctx.getSupportedExtensions() || [];
  ret = 2 * exts.length;
  break;

 case 33307:
 case 33308:
  if (GL.currentContext.version < 2) {
   GL.recordError(1280);
   return;
  }
  ret = name_ == 33307 ? 3 : 0;
  break;
 }
 if (ret === undefined) {
  var result = GLctx.getParameter(name_);
  switch (typeof result) {
  case "number":
   ret = result;
   break;

  case "boolean":
   ret = result ? 1 : 0;
   break;

  case "string":
   GL.recordError(1280);
   return;

  case "object":
   if (result === null) {
    switch (name_) {
    case 34964:
    case 35725:
    case 34965:
    case 36006:
    case 36007:
    case 32873:
    case 34229:
    case 36662:
    case 36663:
    case 35053:
    case 35055:
    case 36010:
    case 35097:
    case 35869:
    case 32874:
    case 36389:
    case 35983:
    case 35368:
    case 34068:
     {
      ret = 0;
      break;
     }

    default:
     {
      GL.recordError(1280);
      return;
     }
    }
   } else if (result instanceof Float32Array || result instanceof Uint32Array || result instanceof Int32Array || result instanceof Array) {
    for (var i = 0; i < result.length; ++i) {
     switch (type) {
     case 0:
      GROWABLE_HEAP_I32()[(((p) + (i * 4)) >> 2)] = result[i];
      break;

     case 2:
      GROWABLE_HEAP_F32()[(((p) + (i * 4)) >> 2)] = result[i];
      break;

     case 4:
      GROWABLE_HEAP_I8()[(((p) + (i)) >> 0)] = result[i] ? 1 : 0;
      break;
     }
    }
    return;
   } else {
    try {
     ret = result.name | 0;
    } catch (e) {
     GL.recordError(1280);
     err("GL_INVALID_ENUM in glGet" + type + "v: Unknown object returned from WebGL getParameter(" + name_ + ")! (error: " + e + ")");
     return;
    }
   }
   break;

  default:
   GL.recordError(1280);
   err("GL_INVALID_ENUM in glGet" + type + "v: Native code calling glGet" + type + "v(" + name_ + ") and it returns " + result + " of type " + typeof (result) + "!");
   return;
  }
 }
 switch (type) {
 case 1:
  writeI53ToI64(p, ret);
  break;

 case 0:
  GROWABLE_HEAP_I32()[((p) >> 2)] = ret;
  break;

 case 2:
  GROWABLE_HEAP_F32()[((p) >> 2)] = ret;
  break;

 case 4:
  GROWABLE_HEAP_I8()[((p) >> 0)] = ret ? 1 : 0;
  break;
 }
};

/** @suppress {duplicate } */ var _glGetBooleanv = (name_, p) => {
 emscriptenWebGLGet(name_, p, 4);
};

var _emscripten_glGetBooleanv = _glGetBooleanv;

/** @suppress {duplicate } */ var _glGetBufferParameteri64v = (target, value, data) => {
 if (!data) {
  GL.recordError(1281);
  /* GL_INVALID_VALUE */ return;
 }
 writeI53ToI64(data, GLctx.getBufferParameter(target, value));
};

var _emscripten_glGetBufferParameteri64v = _glGetBufferParameteri64v;

/** @suppress {duplicate } */ var _glGetBufferParameteriv = (target, value, data) => {
 if (!data) {
  GL.recordError(1281);
  /* GL_INVALID_VALUE */ return;
 }
 GROWABLE_HEAP_I32()[((data) >> 2)] = GLctx.getBufferParameter(target, value);
};

var _emscripten_glGetBufferParameteriv = _glGetBufferParameteriv;

/** @suppress {duplicate } */ var _glGetError = () => {
 var error = GLctx.getError() || GL.lastError;
 GL.lastError = 0;
 /*GL_NO_ERROR*/ return error;
};

var _emscripten_glGetError = _glGetError;

/** @suppress {duplicate } */ var _glGetFloatv = (name_, p) => {
 emscriptenWebGLGet(name_, p, 2);
};

var _emscripten_glGetFloatv = _glGetFloatv;

/** @suppress {duplicate } */ var _glGetFragDataLocation = (program, name) => GLctx.getFragDataLocation(GL.programs[program], UTF8ToString(name));

var _emscripten_glGetFragDataLocation = _glGetFragDataLocation;

/** @suppress {duplicate } */ var _glGetFramebufferAttachmentParameteriv = (target, attachment, pname, params) => {
 var result = GLctx.getFramebufferAttachmentParameter(target, attachment, pname);
 if (result instanceof WebGLRenderbuffer || result instanceof WebGLTexture) {
  result = result.name | 0;
 }
 GROWABLE_HEAP_I32()[((params) >> 2)] = result;
};

var _emscripten_glGetFramebufferAttachmentParameteriv = _glGetFramebufferAttachmentParameteriv;

var emscriptenWebGLGetIndexed = (target, index, data, type) => {
 if (!data) {
  GL.recordError(1281);
  /* GL_INVALID_VALUE */ return;
 }
 var result = GLctx.getIndexedParameter(target, index);
 var ret;
 switch (typeof result) {
 case "boolean":
  ret = result ? 1 : 0;
  break;

 case "number":
  ret = result;
  break;

 case "object":
  if (result === null) {
   switch (target) {
   case 35983:
   case 35368:
    ret = 0;
    break;

   default:
    {
     GL.recordError(1280);
     return;
    }
   }
  } else if (result instanceof WebGLBuffer) {
   ret = result.name | 0;
  } else {
   GL.recordError(1280);
   return;
  }
  break;

 default:
  GL.recordError(1280);
  return;
 }
 switch (type) {
 case 1:
  writeI53ToI64(data, ret);
  break;

 case 0:
  GROWABLE_HEAP_I32()[((data) >> 2)] = ret;
  break;

 case 2:
  GROWABLE_HEAP_F32()[((data) >> 2)] = ret;
  break;

 case 4:
  GROWABLE_HEAP_I8()[((data) >> 0)] = ret ? 1 : 0;
  break;

 default:
  throw "internal emscriptenWebGLGetIndexed() error, bad type: " + type;
 }
};

/** @suppress {duplicate } */ var _glGetInteger64i_v = (target, index, data) => emscriptenWebGLGetIndexed(target, index, data, 1);

var _emscripten_glGetInteger64i_v = _glGetInteger64i_v;

/** @suppress {duplicate } */ var _glGetInteger64v = (name_, p) => {
 emscriptenWebGLGet(name_, p, 1);
};

var _emscripten_glGetInteger64v = _glGetInteger64v;

/** @suppress {duplicate } */ var _glGetIntegeri_v = (target, index, data) => emscriptenWebGLGetIndexed(target, index, data, 0);

var _emscripten_glGetIntegeri_v = _glGetIntegeri_v;

/** @suppress {duplicate } */ var _glGetIntegerv = (name_, p) => {
 emscriptenWebGLGet(name_, p, 0);
};

var _emscripten_glGetIntegerv = _glGetIntegerv;

/** @suppress {duplicate } */ var _glGetInternalformativ = (target, internalformat, pname, bufSize, params) => {
 if (bufSize < 0) {
  GL.recordError(1281);
  /* GL_INVALID_VALUE */ return;
 }
 if (!params) {
  GL.recordError(1281);
  /* GL_INVALID_VALUE */ return;
 }
 var ret = GLctx.getInternalformatParameter(target, internalformat, pname);
 if (ret === null) return;
 for (var i = 0; i < ret.length && i < bufSize; ++i) {
  GROWABLE_HEAP_I32()[(((params) + (i * 4)) >> 2)] = ret[i];
 }
};

var _emscripten_glGetInternalformativ = _glGetInternalformativ;

/** @suppress {duplicate } */ var _glGetProgramBinary = (program, bufSize, length, binaryFormat, binary) => {
 GL.recordError(1282);
};

/*GL_INVALID_OPERATION*/ var _emscripten_glGetProgramBinary = _glGetProgramBinary;

/** @suppress {duplicate } */ var _glGetProgramInfoLog = (program, maxLength, length, infoLog) => {
 var log = GLctx.getProgramInfoLog(GL.programs[program]);
 if (log === null) log = "(unknown error)";
 var numBytesWrittenExclNull = (maxLength > 0 && infoLog) ? stringToUTF8(log, infoLog, maxLength) : 0;
 if (length) GROWABLE_HEAP_I32()[((length) >> 2)] = numBytesWrittenExclNull;
};

var _emscripten_glGetProgramInfoLog = _glGetProgramInfoLog;

/** @suppress {duplicate } */ var _glGetProgramiv = (program, pname, p) => {
 if (!p) {
  GL.recordError(1281);
  /* GL_INVALID_VALUE */ return;
 }
 if (program >= GL.counter) {
  GL.recordError(1281);
  /* GL_INVALID_VALUE */ return;
 }
 program = GL.programs[program];
 if (pname == 35716) {
  var log = GLctx.getProgramInfoLog(program);
  if (log === null) log = "(unknown error)";
  GROWABLE_HEAP_I32()[((p) >> 2)] = log.length + 1;
 } else if (pname == 35719) /* GL_ACTIVE_UNIFORM_MAX_LENGTH */ {
  if (!program.maxUniformLength) {
   for (var i = 0; i < GLctx.getProgramParameter(program, 35718); /*GL_ACTIVE_UNIFORMS*/ ++i) {
    program.maxUniformLength = Math.max(program.maxUniformLength, GLctx.getActiveUniform(program, i).name.length + 1);
   }
  }
  GROWABLE_HEAP_I32()[((p) >> 2)] = program.maxUniformLength;
 } else if (pname == 35722) /* GL_ACTIVE_ATTRIBUTE_MAX_LENGTH */ {
  if (!program.maxAttributeLength) {
   for (var i = 0; i < GLctx.getProgramParameter(program, 35721); /*GL_ACTIVE_ATTRIBUTES*/ ++i) {
    program.maxAttributeLength = Math.max(program.maxAttributeLength, GLctx.getActiveAttrib(program, i).name.length + 1);
   }
  }
  GROWABLE_HEAP_I32()[((p) >> 2)] = program.maxAttributeLength;
 } else if (pname == 35381) /* GL_ACTIVE_UNIFORM_BLOCK_MAX_NAME_LENGTH */ {
  if (!program.maxUniformBlockNameLength) {
   for (var i = 0; i < GLctx.getProgramParameter(program, 35382); /*GL_ACTIVE_UNIFORM_BLOCKS*/ ++i) {
    program.maxUniformBlockNameLength = Math.max(program.maxUniformBlockNameLength, GLctx.getActiveUniformBlockName(program, i).length + 1);
   }
  }
  GROWABLE_HEAP_I32()[((p) >> 2)] = program.maxUniformBlockNameLength;
 } else {
  GROWABLE_HEAP_I32()[((p) >> 2)] = GLctx.getProgramParameter(program, pname);
 }
};

var _emscripten_glGetProgramiv = _glGetProgramiv;

/** @suppress {duplicate } */ var _glGetQueryObjecti64vEXT = (id, pname, params) => {
 if (!params) {
  GL.recordError(1281);
  /* GL_INVALID_VALUE */ return;
 }
 var query = GL.queries[id];
 var param;
 if (GL.currentContext.version < 2) {
  param = GLctx.disjointTimerQueryExt["getQueryObjectEXT"](query, pname);
 } else {
  param = GLctx.getQueryParameter(query, pname);
 }
 var ret;
 if (typeof param == "boolean") {
  ret = param ? 1 : 0;
 } else {
  ret = param;
 }
 writeI53ToI64(params, ret);
};

var _emscripten_glGetQueryObjecti64vEXT = _glGetQueryObjecti64vEXT;

/** @suppress {duplicate } */ var _glGetQueryObjectivEXT = (id, pname, params) => {
 if (!params) {
  GL.recordError(1281);
  /* GL_INVALID_VALUE */ return;
 }
 var query = GL.queries[id];
 var param = GLctx.disjointTimerQueryExt["getQueryObjectEXT"](query, pname);
 var ret;
 if (typeof param == "boolean") {
  ret = param ? 1 : 0;
 } else {
  ret = param;
 }
 GROWABLE_HEAP_I32()[((params) >> 2)] = ret;
};

var _emscripten_glGetQueryObjectivEXT = _glGetQueryObjectivEXT;

/** @suppress {duplicate } */ var _glGetQueryObjectui64vEXT = _glGetQueryObjecti64vEXT;

var _emscripten_glGetQueryObjectui64vEXT = _glGetQueryObjectui64vEXT;

/** @suppress {duplicate } */ var _glGetQueryObjectuiv = (id, pname, params) => {
 if (!params) {
  GL.recordError(1281);
  /* GL_INVALID_VALUE */ return;
 }
 var query = GL.queries[id];
 var param = GLctx.getQueryParameter(query, pname);
 var ret;
 if (typeof param == "boolean") {
  ret = param ? 1 : 0;
 } else {
  ret = param;
 }
 GROWABLE_HEAP_I32()[((params) >> 2)] = ret;
};

var _emscripten_glGetQueryObjectuiv = _glGetQueryObjectuiv;

/** @suppress {duplicate } */ var _glGetQueryObjectuivEXT = _glGetQueryObjectivEXT;

var _emscripten_glGetQueryObjectuivEXT = _glGetQueryObjectuivEXT;

/** @suppress {duplicate } */ var _glGetQueryiv = (target, pname, params) => {
 if (!params) {
  GL.recordError(1281);
  /* GL_INVALID_VALUE */ return;
 }
 GROWABLE_HEAP_I32()[((params) >> 2)] = GLctx.getQuery(target, pname);
};

var _emscripten_glGetQueryiv = _glGetQueryiv;

/** @suppress {duplicate } */ var _glGetQueryivEXT = (target, pname, params) => {
 if (!params) {
  GL.recordError(1281);
  /* GL_INVALID_VALUE */ return;
 }
 GROWABLE_HEAP_I32()[((params) >> 2)] = GLctx.disjointTimerQueryExt["getQueryEXT"](target, pname);
};

var _emscripten_glGetQueryivEXT = _glGetQueryivEXT;

/** @suppress {duplicate } */ var _glGetRenderbufferParameteriv = (target, pname, params) => {
 if (!params) {
  GL.recordError(1281);
  /* GL_INVALID_VALUE */ return;
 }
 GROWABLE_HEAP_I32()[((params) >> 2)] = GLctx.getRenderbufferParameter(target, pname);
};

var _emscripten_glGetRenderbufferParameteriv = _glGetRenderbufferParameteriv;

/** @suppress {duplicate } */ var _glGetSamplerParameterfv = (sampler, pname, params) => {
 if (!params) {
  GL.recordError(1281);
  /* GL_INVALID_VALUE */ return;
 }
 GROWABLE_HEAP_F32()[((params) >> 2)] = GLctx.getSamplerParameter(GL.samplers[sampler], pname);
};

var _emscripten_glGetSamplerParameterfv = _glGetSamplerParameterfv;

/** @suppress {duplicate } */ var _glGetSamplerParameteriv = (sampler, pname, params) => {
 if (!params) {
  GL.recordError(1281);
  /* GL_INVALID_VALUE */ return;
 }
 GROWABLE_HEAP_I32()[((params) >> 2)] = GLctx.getSamplerParameter(GL.samplers[sampler], pname);
};

var _emscripten_glGetSamplerParameteriv = _glGetSamplerParameteriv;

/** @suppress {duplicate } */ var _glGetShaderInfoLog = (shader, maxLength, length, infoLog) => {
 var log = GLctx.getShaderInfoLog(GL.shaders[shader]);
 if (log === null) log = "(unknown error)";
 var numBytesWrittenExclNull = (maxLength > 0 && infoLog) ? stringToUTF8(log, infoLog, maxLength) : 0;
 if (length) GROWABLE_HEAP_I32()[((length) >> 2)] = numBytesWrittenExclNull;
};

var _emscripten_glGetShaderInfoLog = _glGetShaderInfoLog;

/** @suppress {duplicate } */ var _glGetShaderPrecisionFormat = (shaderType, precisionType, range, precision) => {
 var result = GLctx.getShaderPrecisionFormat(shaderType, precisionType);
 GROWABLE_HEAP_I32()[((range) >> 2)] = result.rangeMin;
 GROWABLE_HEAP_I32()[(((range) + (4)) >> 2)] = result.rangeMax;
 GROWABLE_HEAP_I32()[((precision) >> 2)] = result.precision;
};

var _emscripten_glGetShaderPrecisionFormat = _glGetShaderPrecisionFormat;

/** @suppress {duplicate } */ var _glGetShaderSource = (shader, bufSize, length, source) => {
 var result = GLctx.getShaderSource(GL.shaders[shader]);
 if (!result) return;
 var numBytesWrittenExclNull = (bufSize > 0 && source) ? stringToUTF8(result, source, bufSize) : 0;
 if (length) GROWABLE_HEAP_I32()[((length) >> 2)] = numBytesWrittenExclNull;
};

var _emscripten_glGetShaderSource = _glGetShaderSource;

/** @suppress {duplicate } */ var _glGetShaderiv = (shader, pname, p) => {
 if (!p) {
  GL.recordError(1281);
  /* GL_INVALID_VALUE */ return;
 }
 if (pname == 35716) {
  var log = GLctx.getShaderInfoLog(GL.shaders[shader]);
  if (log === null) log = "(unknown error)";
  var logLength = log ? log.length + 1 : 0;
  GROWABLE_HEAP_I32()[((p) >> 2)] = logLength;
 } else if (pname == 35720) {
  var source = GLctx.getShaderSource(GL.shaders[shader]);
  var sourceLength = source ? source.length + 1 : 0;
  GROWABLE_HEAP_I32()[((p) >> 2)] = sourceLength;
 } else {
  GROWABLE_HEAP_I32()[((p) >> 2)] = GLctx.getShaderParameter(GL.shaders[shader], pname);
 }
};

var _emscripten_glGetShaderiv = _glGetShaderiv;

/** @suppress {duplicate } */ var _glGetString = name_ => {
 var ret = GL.stringCache[name_];
 if (!ret) {
  switch (name_) {
  case 7939:
   /* GL_EXTENSIONS */ ret = stringToNewUTF8(GL.getExtensions().join(" "));
   break;

  case 7936:
  /* GL_VENDOR */ case 7937:
  /* GL_RENDERER */ case 37445:
  /* UNMASKED_VENDOR_WEBGL */ case 37446:
   /* UNMASKED_RENDERER_WEBGL */ var s = GLctx.getParameter(name_);
   if (!s) {
    GL.recordError(1280);
   }
   ret = s ? stringToNewUTF8(s) : 0;
   break;

  case 7938:
   /* GL_VERSION */ var glVersion = GLctx.getParameter(7938);
   if (true) glVersion = "OpenGL ES 3.0 (" + glVersion + ")"; else {
    glVersion = "OpenGL ES 2.0 (" + glVersion + ")";
   }
   ret = stringToNewUTF8(glVersion);
   break;

  case 35724:
   /* GL_SHADING_LANGUAGE_VERSION */ var glslVersion = GLctx.getParameter(35724);
   var ver_re = /^WebGL GLSL ES ([0-9]\.[0-9][0-9]?)(?:$| .*)/;
   var ver_num = glslVersion.match(ver_re);
   if (ver_num !== null) {
    if (ver_num[1].length == 3) ver_num[1] = ver_num[1] + "0";
    glslVersion = "OpenGL ES GLSL ES " + ver_num[1] + " (" + glslVersion + ")";
   }
   ret = stringToNewUTF8(glslVersion);
   break;

  default:
   GL.recordError(1280);
  }
  GL.stringCache[name_] = ret;
 }
 return ret;
};

var _emscripten_glGetString = _glGetString;

/** @suppress {duplicate } */ var _glGetStringi = (name, index) => {
 if (GL.currentContext.version < 2) {
  GL.recordError(1282);
  return 0;
 }
 var stringiCache = GL.stringiCache[name];
 if (stringiCache) {
  if (index < 0 || index >= stringiCache.length) {
   GL.recordError(1281);
   /*GL_INVALID_VALUE*/ return 0;
  }
  return stringiCache[index];
 }
 switch (name) {
 case 7939:
  /* GL_EXTENSIONS */ var exts = GL.getExtensions().map(e => stringToNewUTF8(e));
  stringiCache = GL.stringiCache[name] = exts;
  if (index < 0 || index >= stringiCache.length) {
   GL.recordError(1281);
   /*GL_INVALID_VALUE*/ return 0;
  }
  return stringiCache[index];

 default:
  GL.recordError(1280);
  /*GL_INVALID_ENUM*/ return 0;
 }
};

var _emscripten_glGetStringi = _glGetStringi;

/** @suppress {duplicate } */ var _glGetSynciv = (sync, pname, bufSize, length, values) => {
 if (bufSize < 0) {
  GL.recordError(1281);
  /* GL_INVALID_VALUE */ return;
 }
 if (!values) {
  GL.recordError(1281);
  /* GL_INVALID_VALUE */ return;
 }
 var ret = GLctx.getSyncParameter(GL.syncs[sync], pname);
 if (ret !== null) {
  GROWABLE_HEAP_I32()[((values) >> 2)] = ret;
  if (length) GROWABLE_HEAP_I32()[((length) >> 2)] = 1;
 }
};

var _emscripten_glGetSynciv = _glGetSynciv;

/** @suppress {duplicate } */ var _glGetTexParameterfv = (target, pname, params) => {
 if (!params) {
  GL.recordError(1281);
  /* GL_INVALID_VALUE */ return;
 }
 GROWABLE_HEAP_F32()[((params) >> 2)] = GLctx.getTexParameter(target, pname);
};

var _emscripten_glGetTexParameterfv = _glGetTexParameterfv;

/** @suppress {duplicate } */ var _glGetTexParameteriv = (target, pname, params) => {
 if (!params) {
  GL.recordError(1281);
  /* GL_INVALID_VALUE */ return;
 }
 GROWABLE_HEAP_I32()[((params) >> 2)] = GLctx.getTexParameter(target, pname);
};

var _emscripten_glGetTexParameteriv = _glGetTexParameteriv;

/** @suppress {duplicate } */ var _glGetTransformFeedbackVarying = (program, index, bufSize, length, size, type, name) => {
 program = GL.programs[program];
 var info = GLctx.getTransformFeedbackVarying(program, index);
 if (!info) return;
 if (name && bufSize > 0) {
  var numBytesWrittenExclNull = stringToUTF8(info.name, name, bufSize);
  if (length) GROWABLE_HEAP_I32()[((length) >> 2)] = numBytesWrittenExclNull;
 } else {
  if (length) GROWABLE_HEAP_I32()[((length) >> 2)] = 0;
 }
 if (size) GROWABLE_HEAP_I32()[((size) >> 2)] = info.size;
 if (type) GROWABLE_HEAP_I32()[((type) >> 2)] = info.type;
};

var _emscripten_glGetTransformFeedbackVarying = _glGetTransformFeedbackVarying;

/** @suppress {duplicate } */ var _glGetUniformBlockIndex = (program, uniformBlockName) => GLctx.getUniformBlockIndex(GL.programs[program], UTF8ToString(uniformBlockName));

var _emscripten_glGetUniformBlockIndex = _glGetUniformBlockIndex;

/** @suppress {duplicate } */ var _glGetUniformIndices = (program, uniformCount, uniformNames, uniformIndices) => {
 if (!uniformIndices) {
  GL.recordError(1281);
  /* GL_INVALID_VALUE */ return;
 }
 if (uniformCount > 0 && (uniformNames == 0 || uniformIndices == 0)) {
  GL.recordError(1281);
  /* GL_INVALID_VALUE */ return;
 }
 program = GL.programs[program];
 var names = [];
 for (var i = 0; i < uniformCount; i++) names.push(UTF8ToString(GROWABLE_HEAP_I32()[(((uniformNames) + (i * 4)) >> 2)]));
 var result = GLctx.getUniformIndices(program, names);
 if (!result) return;
 var len = result.length;
 for (var i = 0; i < len; i++) {
  GROWABLE_HEAP_I32()[(((uniformIndices) + (i * 4)) >> 2)] = result[i];
 }
};

var _emscripten_glGetUniformIndices = _glGetUniformIndices;

/** @noinline */ var webglGetLeftBracePos = name => name.slice(-1) == "]" && name.lastIndexOf("[");

var webglPrepareUniformLocationsBeforeFirstUse = program => {
 var uniformLocsById = program.uniformLocsById,  uniformSizeAndIdsByName = program.uniformSizeAndIdsByName,  i, j;
 if (!uniformLocsById) {
  program.uniformLocsById = uniformLocsById = {};
  program.uniformArrayNamesById = {};
  for (i = 0; i < GLctx.getProgramParameter(program, 35718); /*GL_ACTIVE_UNIFORMS*/ ++i) {
   var u = GLctx.getActiveUniform(program, i);
   var nm = u.name;
   var sz = u.size;
   var lb = webglGetLeftBracePos(nm);
   var arrayName = lb > 0 ? nm.slice(0, lb) : nm;
   var id = program.uniformIdCounter;
   program.uniformIdCounter += sz;
   uniformSizeAndIdsByName[arrayName] = [ sz, id ];
   for (j = 0; j < sz; ++j) {
    uniformLocsById[id] = j;
    program.uniformArrayNamesById[id++] = arrayName;
   }
  }
 }
};

/** @suppress {duplicate } */ var _glGetUniformLocation = (program, name) => {
 name = UTF8ToString(name);
 if (program = GL.programs[program]) {
  webglPrepareUniformLocationsBeforeFirstUse(program);
  var uniformLocsById = program.uniformLocsById;
  var arrayIndex = 0;
  var uniformBaseName = name;
  var leftBrace = webglGetLeftBracePos(name);
  if (leftBrace > 0) {
   arrayIndex = jstoi_q(name.slice(leftBrace + 1)) >>> 0;
   uniformBaseName = name.slice(0, leftBrace);
  }
  var sizeAndId = program.uniformSizeAndIdsByName[uniformBaseName];
  if (sizeAndId && arrayIndex < sizeAndId[0]) {
   arrayIndex += sizeAndId[1];
   if ((uniformLocsById[arrayIndex] = uniformLocsById[arrayIndex] || GLctx.getUniformLocation(program, name))) {
    return arrayIndex;
   }
  }
 } else {
  GL.recordError(1281);
 }
 /* GL_INVALID_VALUE */ return -1;
};

var _emscripten_glGetUniformLocation = _glGetUniformLocation;

var webglGetUniformLocation = location => {
 var p = GLctx.currentProgram;
 if (p) {
  var webglLoc = p.uniformLocsById[location];
  if (typeof webglLoc == "number") {
   p.uniformLocsById[location] = webglLoc = GLctx.getUniformLocation(p, p.uniformArrayNamesById[location] + (webglLoc > 0 ? "[" + webglLoc + "]" : ""));
  }
  return webglLoc;
 } else {
  GL.recordError(1282);
 }
};

/** @suppress{checkTypes} */ var emscriptenWebGLGetUniform = (program, location, params, type) => {
 if (!params) {
  GL.recordError(1281);
  /* GL_INVALID_VALUE */ return;
 }
 program = GL.programs[program];
 webglPrepareUniformLocationsBeforeFirstUse(program);
 var data = GLctx.getUniform(program, webglGetUniformLocation(location));
 if (typeof data == "number" || typeof data == "boolean") {
  switch (type) {
  case 0:
   GROWABLE_HEAP_I32()[((params) >> 2)] = data;
   break;

  case 2:
   GROWABLE_HEAP_F32()[((params) >> 2)] = data;
   break;
  }
 } else {
  for (var i = 0; i < data.length; i++) {
   switch (type) {
   case 0:
    GROWABLE_HEAP_I32()[(((params) + (i * 4)) >> 2)] = data[i];
    break;

   case 2:
    GROWABLE_HEAP_F32()[(((params) + (i * 4)) >> 2)] = data[i];
    break;
   }
  }
 }
};

/** @suppress {duplicate } */ var _glGetUniformfv = (program, location, params) => {
 emscriptenWebGLGetUniform(program, location, params, 2);
};

var _emscripten_glGetUniformfv = _glGetUniformfv;

/** @suppress {duplicate } */ var _glGetUniformiv = (program, location, params) => {
 emscriptenWebGLGetUniform(program, location, params, 0);
};

var _emscripten_glGetUniformiv = _glGetUniformiv;

/** @suppress {duplicate } */ var _glGetUniformuiv = (program, location, params) => emscriptenWebGLGetUniform(program, location, params, 0);

var _emscripten_glGetUniformuiv = _glGetUniformuiv;

/** @suppress{checkTypes} */ var emscriptenWebGLGetVertexAttrib = (index, pname, params, type) => {
 if (!params) {
  GL.recordError(1281);
  /* GL_INVALID_VALUE */ return;
 }
 var data = GLctx.getVertexAttrib(index, pname);
 if (pname == 34975) /*VERTEX_ATTRIB_ARRAY_BUFFER_BINDING*/ {
  GROWABLE_HEAP_I32()[((params) >> 2)] = data && data["name"];
 } else if (typeof data == "number" || typeof data == "boolean") {
  switch (type) {
  case 0:
   GROWABLE_HEAP_I32()[((params) >> 2)] = data;
   break;

  case 2:
   GROWABLE_HEAP_F32()[((params) >> 2)] = data;
   break;

  case 5:
   GROWABLE_HEAP_I32()[((params) >> 2)] = Math.fround(data);
   break;
  }
 } else {
  for (var i = 0; i < data.length; i++) {
   switch (type) {
   case 0:
    GROWABLE_HEAP_I32()[(((params) + (i * 4)) >> 2)] = data[i];
    break;

   case 2:
    GROWABLE_HEAP_F32()[(((params) + (i * 4)) >> 2)] = data[i];
    break;

   case 5:
    GROWABLE_HEAP_I32()[(((params) + (i * 4)) >> 2)] = Math.fround(data[i]);
    break;
   }
  }
 }
};

/** @suppress {duplicate } */ var _glGetVertexAttribIiv = (index, pname, params) => {
 emscriptenWebGLGetVertexAttrib(index, pname, params, 0);
};

var _emscripten_glGetVertexAttribIiv = _glGetVertexAttribIiv;

/** @suppress {duplicate } */ var _glGetVertexAttribIuiv = _glGetVertexAttribIiv;

var _emscripten_glGetVertexAttribIuiv = _glGetVertexAttribIuiv;

/** @suppress {duplicate } */ var _glGetVertexAttribPointerv = (index, pname, pointer) => {
 if (!pointer) {
  GL.recordError(1281);
  /* GL_INVALID_VALUE */ return;
 }
 GROWABLE_HEAP_I32()[((pointer) >> 2)] = GLctx.getVertexAttribOffset(index, pname);
};

var _emscripten_glGetVertexAttribPointerv = _glGetVertexAttribPointerv;

/** @suppress {duplicate } */ var _glGetVertexAttribfv = (index, pname, params) => {
 emscriptenWebGLGetVertexAttrib(index, pname, params, 2);
};

var _emscripten_glGetVertexAttribfv = _glGetVertexAttribfv;

/** @suppress {duplicate } */ var _glGetVertexAttribiv = (index, pname, params) => {
 emscriptenWebGLGetVertexAttrib(index, pname, params, 5);
};

var _emscripten_glGetVertexAttribiv = _glGetVertexAttribiv;

/** @suppress {duplicate } */ function _glHint(x0, x1) {
 GLctx.hint(x0, x1);
}

var _emscripten_glHint = _glHint;

/** @suppress {duplicate } */ var _glInvalidateFramebuffer = (target, numAttachments, attachments) => {
 var list = tempFixedLengthArray[numAttachments];
 for (var i = 0; i < numAttachments; i++) {
  list[i] = GROWABLE_HEAP_I32()[(((attachments) + (i * 4)) >> 2)];
 }
 GLctx.invalidateFramebuffer(target, list);
};

var _emscripten_glInvalidateFramebuffer = _glInvalidateFramebuffer;

/** @suppress {duplicate } */ var _glInvalidateSubFramebuffer = (target, numAttachments, attachments, x, y, width, height) => {
 var list = tempFixedLengthArray[numAttachments];
 for (var i = 0; i < numAttachments; i++) {
  list[i] = GROWABLE_HEAP_I32()[(((attachments) + (i * 4)) >> 2)];
 }
 GLctx.invalidateSubFramebuffer(target, list, x, y, width, height);
};

var _emscripten_glInvalidateSubFramebuffer = _glInvalidateSubFramebuffer;

/** @suppress {duplicate } */ var _glIsBuffer = buffer => {
 var b = GL.buffers[buffer];
 if (!b) return 0;
 return GLctx.isBuffer(b);
};

var _emscripten_glIsBuffer = _glIsBuffer;

/** @suppress {duplicate } */ function _glIsEnabled(x0) {
 return GLctx.isEnabled(x0);
}

var _emscripten_glIsEnabled = _glIsEnabled;

/** @suppress {duplicate } */ var _glIsFramebuffer = framebuffer => {
 var fb = GL.framebuffers[framebuffer];
 if (!fb) return 0;
 return GLctx.isFramebuffer(fb);
};

var _emscripten_glIsFramebuffer = _glIsFramebuffer;

/** @suppress {duplicate } */ var _glIsProgram = program => {
 program = GL.programs[program];
 if (!program) return 0;
 return GLctx.isProgram(program);
};

var _emscripten_glIsProgram = _glIsProgram;

/** @suppress {duplicate } */ var _glIsQuery = id => {
 var query = GL.queries[id];
 if (!query) return 0;
 return GLctx.isQuery(query);
};

var _emscripten_glIsQuery = _glIsQuery;

/** @suppress {duplicate } */ var _glIsQueryEXT = id => {
 var query = GL.queries[id];
 if (!query) return 0;
 return GLctx.disjointTimerQueryExt["isQueryEXT"](query);
};

var _emscripten_glIsQueryEXT = _glIsQueryEXT;

/** @suppress {duplicate } */ var _glIsRenderbuffer = renderbuffer => {
 var rb = GL.renderbuffers[renderbuffer];
 if (!rb) return 0;
 return GLctx.isRenderbuffer(rb);
};

var _emscripten_glIsRenderbuffer = _glIsRenderbuffer;

/** @suppress {duplicate } */ var _glIsSampler = id => {
 var sampler = GL.samplers[id];
 if (!sampler) return 0;
 return GLctx.isSampler(sampler);
};

var _emscripten_glIsSampler = _glIsSampler;

/** @suppress {duplicate } */ var _glIsShader = shader => {
 var s = GL.shaders[shader];
 if (!s) return 0;
 return GLctx.isShader(s);
};

var _emscripten_glIsShader = _glIsShader;

/** @suppress {duplicate } */ var _glIsSync = sync => GLctx.isSync(GL.syncs[sync]);

var _emscripten_glIsSync = _glIsSync;

/** @suppress {duplicate } */ var _glIsTexture = id => {
 var texture = GL.textures[id];
 if (!texture) return 0;
 return GLctx.isTexture(texture);
};

var _emscripten_glIsTexture = _glIsTexture;

/** @suppress {duplicate } */ var _glIsTransformFeedback = id => GLctx.isTransformFeedback(GL.transformFeedbacks[id]);

var _emscripten_glIsTransformFeedback = _glIsTransformFeedback;

/** @suppress {duplicate } */ var _glIsVertexArray = array => {
 var vao = GL.vaos[array];
 if (!vao) return 0;
 return GLctx.isVertexArray(vao);
};

var _emscripten_glIsVertexArray = _glIsVertexArray;

/** @suppress {duplicate } */ var _glIsVertexArrayOES = _glIsVertexArray;

var _emscripten_glIsVertexArrayOES = _glIsVertexArrayOES;

/** @suppress {duplicate } */ function _glLineWidth(x0) {
 GLctx.lineWidth(x0);
}

var _emscripten_glLineWidth = _glLineWidth;

/** @suppress {duplicate } */ var _glLinkProgram = program => {
 program = GL.programs[program];
 GLctx.linkProgram(program);
 program.uniformLocsById = 0;
 program.uniformSizeAndIdsByName = {};
};

var _emscripten_glLinkProgram = _glLinkProgram;

/** @suppress {duplicate } */ function _glPauseTransformFeedback() {
 GLctx.pauseTransformFeedback();
}

var _emscripten_glPauseTransformFeedback = _glPauseTransformFeedback;

/** @suppress {duplicate } */ var _glPixelStorei = (pname, param) => {
 if (pname == 3317) /* GL_UNPACK_ALIGNMENT */ {
  GL.unpackAlignment = param;
 }
 GLctx.pixelStorei(pname, param);
};

var _emscripten_glPixelStorei = _glPixelStorei;

/** @suppress {duplicate } */ function _glPolygonOffset(x0, x1) {
 GLctx.polygonOffset(x0, x1);
}

var _emscripten_glPolygonOffset = _glPolygonOffset;

/** @suppress {duplicate } */ var _glProgramBinary = (program, binaryFormat, binary, length) => {
 GL.recordError(1280);
};

/*GL_INVALID_ENUM*/ var _emscripten_glProgramBinary = _glProgramBinary;

/** @suppress {duplicate } */ var _glProgramParameteri = (program, pname, value) => {
 GL.recordError(1280);
};

/*GL_INVALID_ENUM*/ var _emscripten_glProgramParameteri = _glProgramParameteri;

/** @suppress {duplicate } */ var _glQueryCounterEXT = (id, target) => {
 GLctx.disjointTimerQueryExt["queryCounterEXT"](GL.queries[id], target);
};

var _emscripten_glQueryCounterEXT = _glQueryCounterEXT;

/** @suppress {duplicate } */ function _glReadBuffer(x0) {
 GLctx.readBuffer(x0);
}

var _emscripten_glReadBuffer = _glReadBuffer;

var computeUnpackAlignedImageSize = (width, height, sizePerPixel, alignment) => {
 function roundedToNextMultipleOf(x, y) {
  return (x + y - 1) & -y;
 }
 var plainRowSize = width * sizePerPixel;
 var alignedRowSize = roundedToNextMultipleOf(plainRowSize, alignment);
 return height * alignedRowSize;
};

var colorChannelsInGlTextureFormat = format => {
 var colorChannels = {
  5: 3,
  6: 4,
  8: 2,
  29502: 3,
  29504: 4,
  26917: 2,
  26918: 2,
  29846: 3,
  29847: 4
 };
 return colorChannels[format - 6402] || 1;
};

var heapObjectForWebGLType = type => {
 type -= 5120;
 if (type == 0) return GROWABLE_HEAP_I8();
 if (type == 1) return GROWABLE_HEAP_U8();
 if (type == 2) return GROWABLE_HEAP_I16();
 if (type == 4) return GROWABLE_HEAP_I32();
 if (type == 6) return GROWABLE_HEAP_F32();
 if (type == 5 || type == 28922 || type == 28520 || type == 30779 || type == 30782) return GROWABLE_HEAP_U32();
 return GROWABLE_HEAP_U16();
};

var heapAccessShiftForWebGLHeap = heap => 31 - Math.clz32(heap.BYTES_PER_ELEMENT);

var emscriptenWebGLGetTexPixelData = (type, format, width, height, pixels, internalFormat) => {
 var heap = heapObjectForWebGLType(type);
 var shift = heapAccessShiftForWebGLHeap(heap);
 var byteSize = 1 << shift;
 var sizePerPixel = colorChannelsInGlTextureFormat(format) * byteSize;
 var bytes = computeUnpackAlignedImageSize(width, height, sizePerPixel, GL.unpackAlignment);
 return heap.subarray(pixels >> shift, pixels + bytes >> shift);
};

/** @suppress {duplicate } */ var _glReadPixels = (x, y, width, height, format, type, pixels) => {
 if (true) {
  if (GLctx.currentPixelPackBufferBinding) {
   GLctx.readPixels(x, y, width, height, format, type, pixels);
  } else {
   var heap = heapObjectForWebGLType(type);
   GLctx.readPixels(x, y, width, height, format, type, heap, pixels >> heapAccessShiftForWebGLHeap(heap));
  }
  return;
 }
 var pixelData = emscriptenWebGLGetTexPixelData(type, format, width, height, pixels, format);
 if (!pixelData) {
  GL.recordError(1280);
  /*GL_INVALID_ENUM*/ return;
 }
 GLctx.readPixels(x, y, width, height, format, type, pixelData);
};

var _emscripten_glReadPixels = _glReadPixels;

/** @suppress {duplicate } */ var _glReleaseShaderCompiler = () => {};

var _emscripten_glReleaseShaderCompiler = _glReleaseShaderCompiler;

/** @suppress {duplicate } */ function _glRenderbufferStorage(x0, x1, x2, x3) {
 GLctx.renderbufferStorage(x0, x1, x2, x3);
}

var _emscripten_glRenderbufferStorage = _glRenderbufferStorage;

/** @suppress {duplicate } */ function _glRenderbufferStorageMultisample(x0, x1, x2, x3, x4) {
 GLctx.renderbufferStorageMultisample(x0, x1, x2, x3, x4);
}

var _emscripten_glRenderbufferStorageMultisample = _glRenderbufferStorageMultisample;

/** @suppress {duplicate } */ function _glResumeTransformFeedback() {
 GLctx.resumeTransformFeedback();
}

var _emscripten_glResumeTransformFeedback = _glResumeTransformFeedback;

/** @suppress {duplicate } */ var _glSampleCoverage = (value, invert) => {
 GLctx.sampleCoverage(value, !!invert);
};

var _emscripten_glSampleCoverage = _glSampleCoverage;

/** @suppress {duplicate } */ var _glSamplerParameterf = (sampler, pname, param) => {
 GLctx.samplerParameterf(GL.samplers[sampler], pname, param);
};

var _emscripten_glSamplerParameterf = _glSamplerParameterf;

/** @suppress {duplicate } */ var _glSamplerParameterfv = (sampler, pname, params) => {
 var param = GROWABLE_HEAP_F32()[((params) >> 2)];
 GLctx.samplerParameterf(GL.samplers[sampler], pname, param);
};

var _emscripten_glSamplerParameterfv = _glSamplerParameterfv;

/** @suppress {duplicate } */ var _glSamplerParameteri = (sampler, pname, param) => {
 GLctx.samplerParameteri(GL.samplers[sampler], pname, param);
};

var _emscripten_glSamplerParameteri = _glSamplerParameteri;

/** @suppress {duplicate } */ var _glSamplerParameteriv = (sampler, pname, params) => {
 var param = GROWABLE_HEAP_I32()[((params) >> 2)];
 GLctx.samplerParameteri(GL.samplers[sampler], pname, param);
};

var _emscripten_glSamplerParameteriv = _glSamplerParameteriv;

/** @suppress {duplicate } */ function _glScissor(x0, x1, x2, x3) {
 GLctx.scissor(x0, x1, x2, x3);
}

var _emscripten_glScissor = _glScissor;

/** @suppress {duplicate } */ var _glShaderBinary = (count, shaders, binaryformat, binary, length) => {
 GL.recordError(1280);
};

/*GL_INVALID_ENUM*/ var _emscripten_glShaderBinary = _glShaderBinary;

/** @suppress {duplicate } */ var _glShaderSource = (shader, count, string, length) => {
 var source = GL.getSource(shader, count, string, length);
 GLctx.shaderSource(GL.shaders[shader], source);
};

var _emscripten_glShaderSource = _glShaderSource;

/** @suppress {duplicate } */ function _glStencilFunc(x0, x1, x2) {
 GLctx.stencilFunc(x0, x1, x2);
}

var _emscripten_glStencilFunc = _glStencilFunc;

/** @suppress {duplicate } */ function _glStencilFuncSeparate(x0, x1, x2, x3) {
 GLctx.stencilFuncSeparate(x0, x1, x2, x3);
}

var _emscripten_glStencilFuncSeparate = _glStencilFuncSeparate;

/** @suppress {duplicate } */ function _glStencilMask(x0) {
 GLctx.stencilMask(x0);
}

var _emscripten_glStencilMask = _glStencilMask;

/** @suppress {duplicate } */ function _glStencilMaskSeparate(x0, x1) {
 GLctx.stencilMaskSeparate(x0, x1);
}

var _emscripten_glStencilMaskSeparate = _glStencilMaskSeparate;

/** @suppress {duplicate } */ function _glStencilOp(x0, x1, x2) {
 GLctx.stencilOp(x0, x1, x2);
}

var _emscripten_glStencilOp = _glStencilOp;

/** @suppress {duplicate } */ function _glStencilOpSeparate(x0, x1, x2, x3) {
 GLctx.stencilOpSeparate(x0, x1, x2, x3);
}

var _emscripten_glStencilOpSeparate = _glStencilOpSeparate;

/** @suppress {duplicate } */ var _glTexImage2D = (target, level, internalFormat, width, height, border, format, type, pixels) => {
 if (true) {
  if (GLctx.currentPixelUnpackBufferBinding) {
   GLctx.texImage2D(target, level, internalFormat, width, height, border, format, type, pixels);
  } else if (pixels) {
   var heap = heapObjectForWebGLType(type);
   GLctx.texImage2D(target, level, internalFormat, width, height, border, format, type, heap, pixels >> heapAccessShiftForWebGLHeap(heap));
  } else {
   GLctx.texImage2D(target, level, internalFormat, width, height, border, format, type, null);
  }
  return;
 }
 GLctx.texImage2D(target, level, internalFormat, width, height, border, format, type, pixels ? emscriptenWebGLGetTexPixelData(type, format, width, height, pixels, internalFormat) : null);
};

var _emscripten_glTexImage2D = _glTexImage2D;

/** @suppress {duplicate } */ var _glTexImage3D = (target, level, internalFormat, width, height, depth, border, format, type, pixels) => {
 if (GLctx.currentPixelUnpackBufferBinding) {
  GLctx.texImage3D(target, level, internalFormat, width, height, depth, border, format, type, pixels);
 } else if (pixels) {
  var heap = heapObjectForWebGLType(type);
  GLctx.texImage3D(target, level, internalFormat, width, height, depth, border, format, type, heap, pixels >> heapAccessShiftForWebGLHeap(heap));
 } else {
  GLctx.texImage3D(target, level, internalFormat, width, height, depth, border, format, type, null);
 }
};

var _emscripten_glTexImage3D = _glTexImage3D;

/** @suppress {duplicate } */ function _glTexParameterf(x0, x1, x2) {
 GLctx.texParameterf(x0, x1, x2);
}

var _emscripten_glTexParameterf = _glTexParameterf;

/** @suppress {duplicate } */ var _glTexParameterfv = (target, pname, params) => {
 var param = GROWABLE_HEAP_F32()[((params) >> 2)];
 GLctx.texParameterf(target, pname, param);
};

var _emscripten_glTexParameterfv = _glTexParameterfv;

/** @suppress {duplicate } */ function _glTexParameteri(x0, x1, x2) {
 GLctx.texParameteri(x0, x1, x2);
}

var _emscripten_glTexParameteri = _glTexParameteri;

/** @suppress {duplicate } */ var _glTexParameteriv = (target, pname, params) => {
 var param = GROWABLE_HEAP_I32()[((params) >> 2)];
 GLctx.texParameteri(target, pname, param);
};

var _emscripten_glTexParameteriv = _glTexParameteriv;

/** @suppress {duplicate } */ function _glTexStorage2D(x0, x1, x2, x3, x4) {
 GLctx.texStorage2D(x0, x1, x2, x3, x4);
}

var _emscripten_glTexStorage2D = _glTexStorage2D;

/** @suppress {duplicate } */ function _glTexStorage3D(x0, x1, x2, x3, x4, x5) {
 GLctx.texStorage3D(x0, x1, x2, x3, x4, x5);
}

var _emscripten_glTexStorage3D = _glTexStorage3D;

/** @suppress {duplicate } */ var _glTexSubImage2D = (target, level, xoffset, yoffset, width, height, format, type, pixels) => {
 if (true) {
  if (GLctx.currentPixelUnpackBufferBinding) {
   GLctx.texSubImage2D(target, level, xoffset, yoffset, width, height, format, type, pixels);
  } else if (pixels) {
   var heap = heapObjectForWebGLType(type);
   GLctx.texSubImage2D(target, level, xoffset, yoffset, width, height, format, type, heap, pixels >> heapAccessShiftForWebGLHeap(heap));
  } else {
   GLctx.texSubImage2D(target, level, xoffset, yoffset, width, height, format, type, null);
  }
  return;
 }
 var pixelData = null;
 if (pixels) pixelData = emscriptenWebGLGetTexPixelData(type, format, width, height, pixels, 0);
 GLctx.texSubImage2D(target, level, xoffset, yoffset, width, height, format, type, pixelData);
};

var _emscripten_glTexSubImage2D = _glTexSubImage2D;

/** @suppress {duplicate } */ var _glTexSubImage3D = (target, level, xoffset, yoffset, zoffset, width, height, depth, format, type, pixels) => {
 if (GLctx.currentPixelUnpackBufferBinding) {
  GLctx.texSubImage3D(target, level, xoffset, yoffset, zoffset, width, height, depth, format, type, pixels);
 } else if (pixels) {
  var heap = heapObjectForWebGLType(type);
  GLctx.texSubImage3D(target, level, xoffset, yoffset, zoffset, width, height, depth, format, type, heap, pixels >> heapAccessShiftForWebGLHeap(heap));
 } else {
  GLctx.texSubImage3D(target, level, xoffset, yoffset, zoffset, width, height, depth, format, type, null);
 }
};

var _emscripten_glTexSubImage3D = _glTexSubImage3D;

/** @suppress {duplicate } */ var _glTransformFeedbackVaryings = (program, count, varyings, bufferMode) => {
 program = GL.programs[program];
 var vars = [];
 for (var i = 0; i < count; i++) vars.push(UTF8ToString(GROWABLE_HEAP_I32()[(((varyings) + (i * 4)) >> 2)]));
 GLctx.transformFeedbackVaryings(program, vars, bufferMode);
};

var _emscripten_glTransformFeedbackVaryings = _glTransformFeedbackVaryings;

/** @suppress {duplicate } */ var _glUniform1f = (location, v0) => {
 GLctx.uniform1f(webglGetUniformLocation(location), v0);
};

var _emscripten_glUniform1f = _glUniform1f;

/** @suppress {duplicate } */ var _glUniform1fv = (location, count, value) => {
 count && GLctx.uniform1fv(webglGetUniformLocation(location), GROWABLE_HEAP_F32(), value >> 2, count);
};

var _emscripten_glUniform1fv = _glUniform1fv;

/** @suppress {duplicate } */ var _glUniform1i = (location, v0) => {
 GLctx.uniform1i(webglGetUniformLocation(location), v0);
};

var _emscripten_glUniform1i = _glUniform1i;

/** @suppress {duplicate } */ var _glUniform1iv = (location, count, value) => {
 count && GLctx.uniform1iv(webglGetUniformLocation(location), GROWABLE_HEAP_I32(), value >> 2, count);
};

var _emscripten_glUniform1iv = _glUniform1iv;

/** @suppress {duplicate } */ var _glUniform1ui = (location, v0) => {
 GLctx.uniform1ui(webglGetUniformLocation(location), v0);
};

var _emscripten_glUniform1ui = _glUniform1ui;

/** @suppress {duplicate } */ var _glUniform1uiv = (location, count, value) => {
 count && GLctx.uniform1uiv(webglGetUniformLocation(location), GROWABLE_HEAP_U32(), value >> 2, count);
};

var _emscripten_glUniform1uiv = _glUniform1uiv;

/** @suppress {duplicate } */ var _glUniform2f = (location, v0, v1) => {
 GLctx.uniform2f(webglGetUniformLocation(location), v0, v1);
};

var _emscripten_glUniform2f = _glUniform2f;

/** @suppress {duplicate } */ var _glUniform2fv = (location, count, value) => {
 count && GLctx.uniform2fv(webglGetUniformLocation(location), GROWABLE_HEAP_F32(), value >> 2, count * 2);
};

var _emscripten_glUniform2fv = _glUniform2fv;

/** @suppress {duplicate } */ var _glUniform2i = (location, v0, v1) => {
 GLctx.uniform2i(webglGetUniformLocation(location), v0, v1);
};

var _emscripten_glUniform2i = _glUniform2i;

/** @suppress {duplicate } */ var _glUniform2iv = (location, count, value) => {
 count && GLctx.uniform2iv(webglGetUniformLocation(location), GROWABLE_HEAP_I32(), value >> 2, count * 2);
};

var _emscripten_glUniform2iv = _glUniform2iv;

/** @suppress {duplicate } */ var _glUniform2ui = (location, v0, v1) => {
 GLctx.uniform2ui(webglGetUniformLocation(location), v0, v1);
};

var _emscripten_glUniform2ui = _glUniform2ui;

/** @suppress {duplicate } */ var _glUniform2uiv = (location, count, value) => {
 count && GLctx.uniform2uiv(webglGetUniformLocation(location), GROWABLE_HEAP_U32(), value >> 2, count * 2);
};

var _emscripten_glUniform2uiv = _glUniform2uiv;

/** @suppress {duplicate } */ var _glUniform3f = (location, v0, v1, v2) => {
 GLctx.uniform3f(webglGetUniformLocation(location), v0, v1, v2);
};

var _emscripten_glUniform3f = _glUniform3f;

/** @suppress {duplicate } */ var _glUniform3fv = (location, count, value) => {
 count && GLctx.uniform3fv(webglGetUniformLocation(location), GROWABLE_HEAP_F32(), value >> 2, count * 3);
};

var _emscripten_glUniform3fv = _glUniform3fv;

/** @suppress {duplicate } */ var _glUniform3i = (location, v0, v1, v2) => {
 GLctx.uniform3i(webglGetUniformLocation(location), v0, v1, v2);
};

var _emscripten_glUniform3i = _glUniform3i;

/** @suppress {duplicate } */ var _glUniform3iv = (location, count, value) => {
 count && GLctx.uniform3iv(webglGetUniformLocation(location), GROWABLE_HEAP_I32(), value >> 2, count * 3);
};

var _emscripten_glUniform3iv = _glUniform3iv;

/** @suppress {duplicate } */ var _glUniform3ui = (location, v0, v1, v2) => {
 GLctx.uniform3ui(webglGetUniformLocation(location), v0, v1, v2);
};

var _emscripten_glUniform3ui = _glUniform3ui;

/** @suppress {duplicate } */ var _glUniform3uiv = (location, count, value) => {
 count && GLctx.uniform3uiv(webglGetUniformLocation(location), GROWABLE_HEAP_U32(), value >> 2, count * 3);
};

var _emscripten_glUniform3uiv = _glUniform3uiv;

/** @suppress {duplicate } */ var _glUniform4f = (location, v0, v1, v2, v3) => {
 GLctx.uniform4f(webglGetUniformLocation(location), v0, v1, v2, v3);
};

var _emscripten_glUniform4f = _glUniform4f;

/** @suppress {duplicate } */ var _glUniform4fv = (location, count, value) => {
 count && GLctx.uniform4fv(webglGetUniformLocation(location), GROWABLE_HEAP_F32(), value >> 2, count * 4);
};

var _emscripten_glUniform4fv = _glUniform4fv;

/** @suppress {duplicate } */ var _glUniform4i = (location, v0, v1, v2, v3) => {
 GLctx.uniform4i(webglGetUniformLocation(location), v0, v1, v2, v3);
};

var _emscripten_glUniform4i = _glUniform4i;

/** @suppress {duplicate } */ var _glUniform4iv = (location, count, value) => {
 count && GLctx.uniform4iv(webglGetUniformLocation(location), GROWABLE_HEAP_I32(), value >> 2, count * 4);
};

var _emscripten_glUniform4iv = _glUniform4iv;

/** @suppress {duplicate } */ var _glUniform4ui = (location, v0, v1, v2, v3) => {
 GLctx.uniform4ui(webglGetUniformLocation(location), v0, v1, v2, v3);
};

var _emscripten_glUniform4ui = _glUniform4ui;

/** @suppress {duplicate } */ var _glUniform4uiv = (location, count, value) => {
 count && GLctx.uniform4uiv(webglGetUniformLocation(location), GROWABLE_HEAP_U32(), value >> 2, count * 4);
};

var _emscripten_glUniform4uiv = _glUniform4uiv;

/** @suppress {duplicate } */ var _glUniformBlockBinding = (program, uniformBlockIndex, uniformBlockBinding) => {
 program = GL.programs[program];
 GLctx.uniformBlockBinding(program, uniformBlockIndex, uniformBlockBinding);
};

var _emscripten_glUniformBlockBinding = _glUniformBlockBinding;

/** @suppress {duplicate } */ var _glUniformMatrix2fv = (location, count, transpose, value) => {
 count && GLctx.uniformMatrix2fv(webglGetUniformLocation(location), !!transpose, GROWABLE_HEAP_F32(), value >> 2, count * 4);
};

var _emscripten_glUniformMatrix2fv = _glUniformMatrix2fv;

/** @suppress {duplicate } */ var _glUniformMatrix2x3fv = (location, count, transpose, value) => {
 count && GLctx.uniformMatrix2x3fv(webglGetUniformLocation(location), !!transpose, GROWABLE_HEAP_F32(), value >> 2, count * 6);
};

var _emscripten_glUniformMatrix2x3fv = _glUniformMatrix2x3fv;

/** @suppress {duplicate } */ var _glUniformMatrix2x4fv = (location, count, transpose, value) => {
 count && GLctx.uniformMatrix2x4fv(webglGetUniformLocation(location), !!transpose, GROWABLE_HEAP_F32(), value >> 2, count * 8);
};

var _emscripten_glUniformMatrix2x4fv = _glUniformMatrix2x4fv;

/** @suppress {duplicate } */ var _glUniformMatrix3fv = (location, count, transpose, value) => {
 count && GLctx.uniformMatrix3fv(webglGetUniformLocation(location), !!transpose, GROWABLE_HEAP_F32(), value >> 2, count * 9);
};

var _emscripten_glUniformMatrix3fv = _glUniformMatrix3fv;

/** @suppress {duplicate } */ var _glUniformMatrix3x2fv = (location, count, transpose, value) => {
 count && GLctx.uniformMatrix3x2fv(webglGetUniformLocation(location), !!transpose, GROWABLE_HEAP_F32(), value >> 2, count * 6);
};

var _emscripten_glUniformMatrix3x2fv = _glUniformMatrix3x2fv;

/** @suppress {duplicate } */ var _glUniformMatrix3x4fv = (location, count, transpose, value) => {
 count && GLctx.uniformMatrix3x4fv(webglGetUniformLocation(location), !!transpose, GROWABLE_HEAP_F32(), value >> 2, count * 12);
};

var _emscripten_glUniformMatrix3x4fv = _glUniformMatrix3x4fv;

/** @suppress {duplicate } */ var _glUniformMatrix4fv = (location, count, transpose, value) => {
 count && GLctx.uniformMatrix4fv(webglGetUniformLocation(location), !!transpose, GROWABLE_HEAP_F32(), value >> 2, count * 16);
};

var _emscripten_glUniformMatrix4fv = _glUniformMatrix4fv;

/** @suppress {duplicate } */ var _glUniformMatrix4x2fv = (location, count, transpose, value) => {
 count && GLctx.uniformMatrix4x2fv(webglGetUniformLocation(location), !!transpose, GROWABLE_HEAP_F32(), value >> 2, count * 8);
};

var _emscripten_glUniformMatrix4x2fv = _glUniformMatrix4x2fv;

/** @suppress {duplicate } */ var _glUniformMatrix4x3fv = (location, count, transpose, value) => {
 count && GLctx.uniformMatrix4x3fv(webglGetUniformLocation(location), !!transpose, GROWABLE_HEAP_F32(), value >> 2, count * 12);
};

var _emscripten_glUniformMatrix4x3fv = _glUniformMatrix4x3fv;

/** @suppress {duplicate } */ var _glUseProgram = program => {
 program = GL.programs[program];
 GLctx.useProgram(program);
 GLctx.currentProgram = program;
};

var _emscripten_glUseProgram = _glUseProgram;

/** @suppress {duplicate } */ var _glValidateProgram = program => {
 GLctx.validateProgram(GL.programs[program]);
};

var _emscripten_glValidateProgram = _glValidateProgram;

/** @suppress {duplicate } */ function _glVertexAttrib1f(x0, x1) {
 GLctx.vertexAttrib1f(x0, x1);
}

var _emscripten_glVertexAttrib1f = _glVertexAttrib1f;

/** @suppress {duplicate } */ var _glVertexAttrib1fv = (index, v) => {
 GLctx.vertexAttrib1f(index, GROWABLE_HEAP_F32()[v >> 2]);
};

var _emscripten_glVertexAttrib1fv = _glVertexAttrib1fv;

/** @suppress {duplicate } */ function _glVertexAttrib2f(x0, x1, x2) {
 GLctx.vertexAttrib2f(x0, x1, x2);
}

var _emscripten_glVertexAttrib2f = _glVertexAttrib2f;

/** @suppress {duplicate } */ var _glVertexAttrib2fv = (index, v) => {
 GLctx.vertexAttrib2f(index, GROWABLE_HEAP_F32()[v >> 2], GROWABLE_HEAP_F32()[v + 4 >> 2]);
};

var _emscripten_glVertexAttrib2fv = _glVertexAttrib2fv;

/** @suppress {duplicate } */ function _glVertexAttrib3f(x0, x1, x2, x3) {
 GLctx.vertexAttrib3f(x0, x1, x2, x3);
}

var _emscripten_glVertexAttrib3f = _glVertexAttrib3f;

/** @suppress {duplicate } */ var _glVertexAttrib3fv = (index, v) => {
 GLctx.vertexAttrib3f(index, GROWABLE_HEAP_F32()[v >> 2], GROWABLE_HEAP_F32()[v + 4 >> 2], GROWABLE_HEAP_F32()[v + 8 >> 2]);
};

var _emscripten_glVertexAttrib3fv = _glVertexAttrib3fv;

/** @suppress {duplicate } */ function _glVertexAttrib4f(x0, x1, x2, x3, x4) {
 GLctx.vertexAttrib4f(x0, x1, x2, x3, x4);
}

var _emscripten_glVertexAttrib4f = _glVertexAttrib4f;

/** @suppress {duplicate } */ var _glVertexAttrib4fv = (index, v) => {
 GLctx.vertexAttrib4f(index, GROWABLE_HEAP_F32()[v >> 2], GROWABLE_HEAP_F32()[v + 4 >> 2], GROWABLE_HEAP_F32()[v + 8 >> 2], GROWABLE_HEAP_F32()[v + 12 >> 2]);
};

var _emscripten_glVertexAttrib4fv = _glVertexAttrib4fv;

/** @suppress {duplicate } */ var _glVertexAttribDivisor = (index, divisor) => {
 GLctx.vertexAttribDivisor(index, divisor);
};

var _emscripten_glVertexAttribDivisor = _glVertexAttribDivisor;

/** @suppress {duplicate } */ var _glVertexAttribDivisorANGLE = _glVertexAttribDivisor;

var _emscripten_glVertexAttribDivisorANGLE = _glVertexAttribDivisorANGLE;

/** @suppress {duplicate } */ var _glVertexAttribDivisorARB = _glVertexAttribDivisor;

var _emscripten_glVertexAttribDivisorARB = _glVertexAttribDivisorARB;

/** @suppress {duplicate } */ var _glVertexAttribDivisorEXT = _glVertexAttribDivisor;

var _emscripten_glVertexAttribDivisorEXT = _glVertexAttribDivisorEXT;

/** @suppress {duplicate } */ var _glVertexAttribDivisorNV = _glVertexAttribDivisor;

var _emscripten_glVertexAttribDivisorNV = _glVertexAttribDivisorNV;

/** @suppress {duplicate } */ function _glVertexAttribI4i(x0, x1, x2, x3, x4) {
 GLctx.vertexAttribI4i(x0, x1, x2, x3, x4);
}

var _emscripten_glVertexAttribI4i = _glVertexAttribI4i;

/** @suppress {duplicate } */ var _glVertexAttribI4iv = (index, v) => {
 GLctx.vertexAttribI4i(index, GROWABLE_HEAP_I32()[v >> 2], GROWABLE_HEAP_I32()[v + 4 >> 2], GROWABLE_HEAP_I32()[v + 8 >> 2], GROWABLE_HEAP_I32()[v + 12 >> 2]);
};

var _emscripten_glVertexAttribI4iv = _glVertexAttribI4iv;

/** @suppress {duplicate } */ function _glVertexAttribI4ui(x0, x1, x2, x3, x4) {
 GLctx.vertexAttribI4ui(x0, x1, x2, x3, x4);
}

var _emscripten_glVertexAttribI4ui = _glVertexAttribI4ui;

/** @suppress {duplicate } */ var _glVertexAttribI4uiv = (index, v) => {
 GLctx.vertexAttribI4ui(index, GROWABLE_HEAP_U32()[v >> 2], GROWABLE_HEAP_U32()[v + 4 >> 2], GROWABLE_HEAP_U32()[v + 8 >> 2], GROWABLE_HEAP_U32()[v + 12 >> 2]);
};

var _emscripten_glVertexAttribI4uiv = _glVertexAttribI4uiv;

/** @suppress {duplicate } */ var _glVertexAttribIPointer = (index, size, type, stride, ptr) => {
 GLctx.vertexAttribIPointer(index, size, type, stride, ptr);
};

var _emscripten_glVertexAttribIPointer = _glVertexAttribIPointer;

/** @suppress {duplicate } */ var _glVertexAttribPointer = (index, size, type, normalized, stride, ptr) => {
 GLctx.vertexAttribPointer(index, size, type, !!normalized, stride, ptr);
};

var _emscripten_glVertexAttribPointer = _glVertexAttribPointer;

/** @suppress {duplicate } */ function _glViewport(x0, x1, x2, x3) {
 GLctx.viewport(x0, x1, x2, x3);
}

var _emscripten_glViewport = _glViewport;

/** @suppress {duplicate } */ var _glWaitSync = (sync, flags, timeout_low, timeout_high) => {
 var timeout = convertI32PairToI53(timeout_low, timeout_high);
 GLctx.waitSync(GL.syncs[sync], flags, timeout);
};

var _emscripten_glWaitSync = _glWaitSync;

var _emscripten_has_asyncify = () => 0;

var _emscripten_request_animation_frame_loop = (cb, userData) => {
 function tick(timeStamp) {
  if (getWasmTableEntry(cb)(timeStamp, userData)) {
   requestAnimationFrame(tick);
  }
 }
 return requestAnimationFrame(tick);
};

var doRequestFullscreen = (target, strategy) => {
 if (!JSEvents.fullscreenEnabled()) return -1;
 target = findEventTarget(target);
 if (!target) return -4;
 if (!target.requestFullscreen && !target.webkitRequestFullscreen) {
  return -3;
 }
 var canPerformRequests = JSEvents.canPerformEventHandlerRequests();
 if (!canPerformRequests) {
  if (strategy.deferUntilInEventHandler) {
   JSEvents.deferCall(JSEvents_requestFullscreen, 1, /* priority over pointer lock */ [ target, strategy ]);
   return 1;
  }
  return -2;
 }
 return JSEvents_requestFullscreen(target, strategy);
};

function _emscripten_request_fullscreen_strategy(target, deferUntilInEventHandler, fullscreenStrategy) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(69, 1, target, deferUntilInEventHandler, fullscreenStrategy);
 var strategy = {
  scaleMode: GROWABLE_HEAP_I32()[((fullscreenStrategy) >> 2)],
  canvasResolutionScaleMode: GROWABLE_HEAP_I32()[(((fullscreenStrategy) + (4)) >> 2)],
  filteringMode: GROWABLE_HEAP_I32()[(((fullscreenStrategy) + (8)) >> 2)],
  deferUntilInEventHandler: deferUntilInEventHandler,
  canvasResizedCallbackTargetThread: GROWABLE_HEAP_I32()[(((fullscreenStrategy) + (20)) >> 2)],
  canvasResizedCallback: GROWABLE_HEAP_I32()[(((fullscreenStrategy) + (12)) >> 2)],
  canvasResizedCallbackUserData: GROWABLE_HEAP_I32()[(((fullscreenStrategy) + (16)) >> 2)]
 };
 return doRequestFullscreen(target, strategy);
}

function _emscripten_request_pointerlock(target, deferUntilInEventHandler) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(70, 1, target, deferUntilInEventHandler);
 target = findEventTarget(target);
 if (!target) return -4;
 if (!target.requestPointerLock) {
  return -1;
 }
 var canPerformRequests = JSEvents.canPerformEventHandlerRequests();
 if (!canPerformRequests) {
  if (deferUntilInEventHandler) {
   JSEvents.deferCall(requestPointerLock, 2, /* priority below fullscreen */ [ target ]);
   return 1;
  }
  return -2;
 }
 return requestPointerLock(target);
}

var getHeapMax = () =>  2147483648;

var growMemory = size => {
 var b = wasmMemory.buffer;
 var pages = (size - b.byteLength + 65535) / 65536;
 try {
  wasmMemory.grow(pages);
  updateMemoryViews();
  return 1;
 } /*success*/ catch (e) {
  err(`growMemory: Attempted to grow heap from ${b.byteLength} bytes to ${size} bytes, but got error: ${e}`);
 }
};

var _emscripten_resize_heap = requestedSize => {
 var oldSize = GROWABLE_HEAP_U8().length;
 requestedSize >>>= 0;
 if (requestedSize <= oldSize) {
  return false;
 }
 var maxHeapSize = getHeapMax();
 if (requestedSize > maxHeapSize) {
  err(`Cannot enlarge memory, requested ${requestedSize} bytes, but the limit is ${maxHeapSize} bytes!`);
  return false;
 }
 var alignUp = (x, multiple) => x + (multiple - x % multiple) % multiple;
 for (var cutDown = 1; cutDown <= 4; cutDown *= 2) {
  var overGrownHeapSize = oldSize * (1 + .2 / cutDown);
  overGrownHeapSize = Math.min(overGrownHeapSize, requestedSize + 100663296);
  var newSize = Math.min(maxHeapSize, alignUp(Math.max(requestedSize, overGrownHeapSize), 65536));
  var replacement = growMemory(newSize);
  if (replacement) {
   return true;
  }
 }
 err(`Failed to grow the heap from ${oldSize} bytes to ${newSize} bytes, not enough memory!`);
 return false;
};

function _emscripten_sample_gamepad_data() {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(71, 1);
 return (JSEvents.lastGamepadState = (navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : null))) ? 0 : -1;
}

var registerBeforeUnloadEventCallback = (target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString) => {
 var beforeUnloadEventHandlerFunc = (e = event) => {
  var confirmationMessage = getWasmTableEntry(callbackfunc)(eventTypeId, 0, userData);
  if (confirmationMessage) {
   confirmationMessage = UTF8ToString(confirmationMessage);
  }
  if (confirmationMessage) {
   e.preventDefault();
   e.returnValue = confirmationMessage;
   return confirmationMessage;
  }
 };
 var eventHandler = {
  target: findEventTarget(target),
  eventTypeString: eventTypeString,
  callbackfunc: callbackfunc,
  handlerFunc: beforeUnloadEventHandlerFunc,
  useCapture: useCapture
 };
 return JSEvents.registerOrRemoveHandler(eventHandler);
};

function _emscripten_set_beforeunload_callback_on_thread(userData, callbackfunc, targetThread) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(72, 1, userData, callbackfunc, targetThread);
 if (typeof onbeforeunload == "undefined") return -1;
 if (targetThread !== 1) return -5;
 return registerBeforeUnloadEventCallback(2, userData, true, callbackfunc, 28, "beforeunload");
}

var registerFocusEventCallback = (target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread) => {
 targetThread = JSEvents.getTargetThreadForEventCallback(targetThread);
 if (!JSEvents.focusEvent) JSEvents.focusEvent = _malloc(256);
 var focusEventHandlerFunc = (e = event) => {
  var nodeName = JSEvents.getNodeNameForTarget(e.target);
  var id = e.target.id ? e.target.id : "";
  var focusEvent = targetThread ? _malloc(256) : JSEvents.focusEvent;
  stringToUTF8(nodeName, focusEvent + 0, 128);
  stringToUTF8(id, focusEvent + 128, 128);
  if (targetThread) __emscripten_run_callback_on_thread(targetThread, callbackfunc, eventTypeId, focusEvent, userData); else if (getWasmTableEntry(callbackfunc)(eventTypeId, focusEvent, userData)) e.preventDefault();
 };
 var eventHandler = {
  target: findEventTarget(target),
  eventTypeString: eventTypeString,
  callbackfunc: callbackfunc,
  handlerFunc: focusEventHandlerFunc,
  useCapture: useCapture
 };
 return JSEvents.registerOrRemoveHandler(eventHandler);
};

function _emscripten_set_blur_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(73, 1, target, userData, useCapture, callbackfunc, targetThread);
 return registerFocusEventCallback(target, userData, useCapture, callbackfunc, 12, "blur", targetThread);
}

function _emscripten_set_element_css_size(target, width, height) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(74, 1, target, width, height);
 target = findEventTarget(target);
 if (!target) return -4;
 target.style.width = width + "px";
 target.style.height = height + "px";
 return 0;
}

function _emscripten_set_focus_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(75, 1, target, userData, useCapture, callbackfunc, targetThread);
 return registerFocusEventCallback(target, userData, useCapture, callbackfunc, 13, "focus", targetThread);
}

var fillFullscreenChangeEventData = eventStruct => {
 var fullscreenElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
 var isFullscreen = !!fullscreenElement;
 /** @suppress{checkTypes} */ GROWABLE_HEAP_I32()[((eventStruct) >> 2)] = isFullscreen;
 GROWABLE_HEAP_I32()[(((eventStruct) + (4)) >> 2)] = JSEvents.fullscreenEnabled();
 var reportedElement = isFullscreen ? fullscreenElement : JSEvents.previousFullscreenElement;
 var nodeName = JSEvents.getNodeNameForTarget(reportedElement);
 var id = (reportedElement && reportedElement.id) ? reportedElement.id : "";
 stringToUTF8(nodeName, eventStruct + 8, 128);
 stringToUTF8(id, eventStruct + 136, 128);
 GROWABLE_HEAP_I32()[(((eventStruct) + (264)) >> 2)] = reportedElement ? reportedElement.clientWidth : 0;
 GROWABLE_HEAP_I32()[(((eventStruct) + (268)) >> 2)] = reportedElement ? reportedElement.clientHeight : 0;
 GROWABLE_HEAP_I32()[(((eventStruct) + (272)) >> 2)] = screen.width;
 GROWABLE_HEAP_I32()[(((eventStruct) + (276)) >> 2)] = screen.height;
 if (isFullscreen) {
  JSEvents.previousFullscreenElement = fullscreenElement;
 }
};

var registerFullscreenChangeEventCallback = (target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread) => {
 targetThread = JSEvents.getTargetThreadForEventCallback(targetThread);
 if (!JSEvents.fullscreenChangeEvent) JSEvents.fullscreenChangeEvent = _malloc(280);
 var fullscreenChangeEventhandlerFunc = (e = event) => {
  var fullscreenChangeEvent = targetThread ? _malloc(280) : JSEvents.fullscreenChangeEvent;
  fillFullscreenChangeEventData(fullscreenChangeEvent);
  if (targetThread) __emscripten_run_callback_on_thread(targetThread, callbackfunc, eventTypeId, fullscreenChangeEvent, userData); else if (getWasmTableEntry(callbackfunc)(eventTypeId, fullscreenChangeEvent, userData)) e.preventDefault();
 };
 var eventHandler = {
  target: target,
  eventTypeString: eventTypeString,
  callbackfunc: callbackfunc,
  handlerFunc: fullscreenChangeEventhandlerFunc,
  useCapture: useCapture
 };
 return JSEvents.registerOrRemoveHandler(eventHandler);
};

function _emscripten_set_fullscreenchange_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(76, 1, target, userData, useCapture, callbackfunc, targetThread);
 if (!JSEvents.fullscreenEnabled()) return -1;
 target = findEventTarget(target);
 if (!target) return -4;
 registerFullscreenChangeEventCallback(target, userData, useCapture, callbackfunc, 19, "webkitfullscreenchange", targetThread);
 return registerFullscreenChangeEventCallback(target, userData, useCapture, callbackfunc, 19, "fullscreenchange", targetThread);
}

var registerGamepadEventCallback = (target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread) => {
 targetThread = JSEvents.getTargetThreadForEventCallback(targetThread);
 if (!JSEvents.gamepadEvent) JSEvents.gamepadEvent = _malloc(1432);
 var gamepadEventHandlerFunc = (e = event) => {
  var gamepadEvent = targetThread ? _malloc(1432) : JSEvents.gamepadEvent;
  fillGamepadEventData(gamepadEvent, e["gamepad"]);
  if (targetThread) __emscripten_run_callback_on_thread(targetThread, callbackfunc, eventTypeId, gamepadEvent, userData); else if (getWasmTableEntry(callbackfunc)(eventTypeId, gamepadEvent, userData)) e.preventDefault();
 };
 var eventHandler = {
  target: findEventTarget(target),
  allowsDeferredCalls: true,
  eventTypeString: eventTypeString,
  callbackfunc: callbackfunc,
  handlerFunc: gamepadEventHandlerFunc,
  useCapture: useCapture
 };
 return JSEvents.registerOrRemoveHandler(eventHandler);
};

function _emscripten_set_gamepadconnected_callback_on_thread(userData, useCapture, callbackfunc, targetThread) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(77, 1, userData, useCapture, callbackfunc, targetThread);
 if (!navigator.getGamepads && !navigator.webkitGetGamepads) return -1;
 return registerGamepadEventCallback(2, userData, useCapture, callbackfunc, 26, "gamepadconnected", targetThread);
}

function _emscripten_set_gamepaddisconnected_callback_on_thread(userData, useCapture, callbackfunc, targetThread) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(78, 1, userData, useCapture, callbackfunc, targetThread);
 if (!navigator.getGamepads && !navigator.webkitGetGamepads) return -1;
 return registerGamepadEventCallback(2, userData, useCapture, callbackfunc, 27, "gamepaddisconnected", targetThread);
}

var registerKeyEventCallback = (target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread) => {
 targetThread = JSEvents.getTargetThreadForEventCallback(targetThread);
 if (!JSEvents.keyEvent) JSEvents.keyEvent = _malloc(176);
 var keyEventHandlerFunc = e => {
  assert(e);
  var keyEventData = targetThread ? _malloc(176) : JSEvents.keyEvent;
  GROWABLE_HEAP_F64()[((keyEventData) >> 3)] = e.timeStamp;
  var idx = ((keyEventData) >> 2);
  GROWABLE_HEAP_I32()[idx + 2] = e.location;
  GROWABLE_HEAP_I32()[idx + 3] = e.ctrlKey;
  GROWABLE_HEAP_I32()[idx + 4] = e.shiftKey;
  GROWABLE_HEAP_I32()[idx + 5] = e.altKey;
  GROWABLE_HEAP_I32()[idx + 6] = e.metaKey;
  GROWABLE_HEAP_I32()[idx + 7] = e.repeat;
  GROWABLE_HEAP_I32()[idx + 8] = e.charCode;
  GROWABLE_HEAP_I32()[idx + 9] = e.keyCode;
  GROWABLE_HEAP_I32()[idx + 10] = e.which;
  stringToUTF8(e.key || "", keyEventData + 44, 32);
  stringToUTF8(e.code || "", keyEventData + 76, 32);
  stringToUTF8(e.char || "", keyEventData + 108, 32);
  stringToUTF8(e.locale || "", keyEventData + 140, 32);
  if (targetThread) __emscripten_run_callback_on_thread(targetThread, callbackfunc, eventTypeId, keyEventData, userData); else if (getWasmTableEntry(callbackfunc)(eventTypeId, keyEventData, userData)) e.preventDefault();
 };
 var eventHandler = {
  target: findEventTarget(target),
  allowsDeferredCalls: true,
  eventTypeString: eventTypeString,
  callbackfunc: callbackfunc,
  handlerFunc: keyEventHandlerFunc,
  useCapture: useCapture
 };
 return JSEvents.registerOrRemoveHandler(eventHandler);
};

function _emscripten_set_keydown_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(79, 1, target, userData, useCapture, callbackfunc, targetThread);
 return registerKeyEventCallback(target, userData, useCapture, callbackfunc, 2, "keydown", targetThread);
}

function _emscripten_set_keypress_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(80, 1, target, userData, useCapture, callbackfunc, targetThread);
 return registerKeyEventCallback(target, userData, useCapture, callbackfunc, 1, "keypress", targetThread);
}

function _emscripten_set_keyup_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(81, 1, target, userData, useCapture, callbackfunc, targetThread);
 return registerKeyEventCallback(target, userData, useCapture, callbackfunc, 3, "keyup", targetThread);
}

var fillMouseEventData = (eventStruct, e, target) => {
 assert(eventStruct % 4 == 0);
 GROWABLE_HEAP_F64()[((eventStruct) >> 3)] = e.timeStamp;
 var idx = ((eventStruct) >> 2);
 GROWABLE_HEAP_I32()[idx + 2] = e.screenX;
 GROWABLE_HEAP_I32()[idx + 3] = e.screenY;
 GROWABLE_HEAP_I32()[idx + 4] = e.clientX;
 GROWABLE_HEAP_I32()[idx + 5] = e.clientY;
 GROWABLE_HEAP_I32()[idx + 6] = e.ctrlKey;
 GROWABLE_HEAP_I32()[idx + 7] = e.shiftKey;
 GROWABLE_HEAP_I32()[idx + 8] = e.altKey;
 GROWABLE_HEAP_I32()[idx + 9] = e.metaKey;
 GROWABLE_HEAP_I16()[idx * 2 + 20] = e.button;
 GROWABLE_HEAP_I16()[idx * 2 + 21] = e.buttons;
 GROWABLE_HEAP_I32()[idx + 11] = e["movementX"];
 GROWABLE_HEAP_I32()[idx + 12] = e["movementY"];
 var rect = getBoundingClientRect(target);
 GROWABLE_HEAP_I32()[idx + 13] = e.clientX - rect.left;
 GROWABLE_HEAP_I32()[idx + 14] = e.clientY - rect.top;
};

var registerMouseEventCallback = (target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread) => {
 targetThread = JSEvents.getTargetThreadForEventCallback(targetThread);
 if (!JSEvents.mouseEvent) JSEvents.mouseEvent = _malloc(72);
 target = findEventTarget(target);
 var mouseEventHandlerFunc = (e = event) => {
  fillMouseEventData(JSEvents.mouseEvent, e, target);
  if (targetThread) {
   var mouseEventData = _malloc(72);
   fillMouseEventData(mouseEventData, e, target);
   __emscripten_run_callback_on_thread(targetThread, callbackfunc, eventTypeId, mouseEventData, userData);
  } else if (getWasmTableEntry(callbackfunc)(eventTypeId, JSEvents.mouseEvent, userData)) e.preventDefault();
 };
 var eventHandler = {
  target: target,
  allowsDeferredCalls: eventTypeString != "mousemove" && eventTypeString != "mouseenter" && eventTypeString != "mouseleave",
  eventTypeString: eventTypeString,
  callbackfunc: callbackfunc,
  handlerFunc: mouseEventHandlerFunc,
  useCapture: useCapture
 };
 return JSEvents.registerOrRemoveHandler(eventHandler);
};

function _emscripten_set_mousedown_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(82, 1, target, userData, useCapture, callbackfunc, targetThread);
 return registerMouseEventCallback(target, userData, useCapture, callbackfunc, 5, "mousedown", targetThread);
}

function _emscripten_set_mouseenter_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(83, 1, target, userData, useCapture, callbackfunc, targetThread);
 return registerMouseEventCallback(target, userData, useCapture, callbackfunc, 33, "mouseenter", targetThread);
}

function _emscripten_set_mouseleave_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(84, 1, target, userData, useCapture, callbackfunc, targetThread);
 return registerMouseEventCallback(target, userData, useCapture, callbackfunc, 34, "mouseleave", targetThread);
}

function _emscripten_set_mousemove_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(85, 1, target, userData, useCapture, callbackfunc, targetThread);
 return registerMouseEventCallback(target, userData, useCapture, callbackfunc, 8, "mousemove", targetThread);
}

function _emscripten_set_mouseup_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(86, 1, target, userData, useCapture, callbackfunc, targetThread);
 return registerMouseEventCallback(target, userData, useCapture, callbackfunc, 6, "mouseup", targetThread);
}

var fillPointerlockChangeEventData = eventStruct => {
 var pointerLockElement = document.pointerLockElement || document.mozPointerLockElement || document.webkitPointerLockElement || document.msPointerLockElement;
 var isPointerlocked = !!pointerLockElement;
 /** @suppress{checkTypes} */ GROWABLE_HEAP_I32()[((eventStruct) >> 2)] = isPointerlocked;
 var nodeName = JSEvents.getNodeNameForTarget(pointerLockElement);
 var id = (pointerLockElement && pointerLockElement.id) ? pointerLockElement.id : "";
 stringToUTF8(nodeName, eventStruct + 4, 128);
 stringToUTF8(id, eventStruct + 132, 128);
};

var registerPointerlockChangeEventCallback = (target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread) => {
 targetThread = JSEvents.getTargetThreadForEventCallback(targetThread);
 if (!JSEvents.pointerlockChangeEvent) JSEvents.pointerlockChangeEvent = _malloc(260);
 var pointerlockChangeEventHandlerFunc = (e = event) => {
  var pointerlockChangeEvent = targetThread ? _malloc(260) : JSEvents.pointerlockChangeEvent;
  fillPointerlockChangeEventData(pointerlockChangeEvent);
  if (targetThread) __emscripten_run_callback_on_thread(targetThread, callbackfunc, eventTypeId, pointerlockChangeEvent, userData); else if (getWasmTableEntry(callbackfunc)(eventTypeId, pointerlockChangeEvent, userData)) e.preventDefault();
 };
 var eventHandler = {
  target: target,
  eventTypeString: eventTypeString,
  callbackfunc: callbackfunc,
  handlerFunc: pointerlockChangeEventHandlerFunc,
  useCapture: useCapture
 };
 return JSEvents.registerOrRemoveHandler(eventHandler);
};

/** @suppress {missingProperties} */ function _emscripten_set_pointerlockchange_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(87, 1, target, userData, useCapture, callbackfunc, targetThread);
 if (!document || !document.body || (!document.body.requestPointerLock && !document.body.mozRequestPointerLock && !document.body.webkitRequestPointerLock && !document.body.msRequestPointerLock)) {
  return -1;
 }
 target = findEventTarget(target);
 if (!target) return -4;
 registerPointerlockChangeEventCallback(target, userData, useCapture, callbackfunc, 20, "mozpointerlockchange", targetThread);
 registerPointerlockChangeEventCallback(target, userData, useCapture, callbackfunc, 20, "webkitpointerlockchange", targetThread);
 registerPointerlockChangeEventCallback(target, userData, useCapture, callbackfunc, 20, "mspointerlockchange", targetThread);
 return registerPointerlockChangeEventCallback(target, userData, useCapture, callbackfunc, 20, "pointerlockchange", targetThread);
}

var registerUiEventCallback = (target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread) => {
 targetThread = JSEvents.getTargetThreadForEventCallback(targetThread);
 if (!JSEvents.uiEvent) JSEvents.uiEvent = _malloc(36);
 target = findEventTarget(target);
 var uiEventHandlerFunc = (e = event) => {
  if (e.target != target) {
   return;
  }
  var b = document.body;
  if (!b) {
   return;
  }
  var uiEvent = targetThread ? _malloc(36) : JSEvents.uiEvent;
  GROWABLE_HEAP_I32()[((uiEvent) >> 2)] = e.detail;
  GROWABLE_HEAP_I32()[(((uiEvent) + (4)) >> 2)] = b.clientWidth;
  GROWABLE_HEAP_I32()[(((uiEvent) + (8)) >> 2)] = b.clientHeight;
  GROWABLE_HEAP_I32()[(((uiEvent) + (12)) >> 2)] = innerWidth;
  GROWABLE_HEAP_I32()[(((uiEvent) + (16)) >> 2)] = innerHeight;
  GROWABLE_HEAP_I32()[(((uiEvent) + (20)) >> 2)] = outerWidth;
  GROWABLE_HEAP_I32()[(((uiEvent) + (24)) >> 2)] = outerHeight;
  GROWABLE_HEAP_I32()[(((uiEvent) + (28)) >> 2)] = pageXOffset;
  GROWABLE_HEAP_I32()[(((uiEvent) + (32)) >> 2)] = pageYOffset;
  if (targetThread) __emscripten_run_callback_on_thread(targetThread, callbackfunc, eventTypeId, uiEvent, userData); else if (getWasmTableEntry(callbackfunc)(eventTypeId, uiEvent, userData)) e.preventDefault();
 };
 var eventHandler = {
  target: target,
  eventTypeString: eventTypeString,
  callbackfunc: callbackfunc,
  handlerFunc: uiEventHandlerFunc,
  useCapture: useCapture
 };
 return JSEvents.registerOrRemoveHandler(eventHandler);
};

function _emscripten_set_resize_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(88, 1, target, userData, useCapture, callbackfunc, targetThread);
 return registerUiEventCallback(target, userData, useCapture, callbackfunc, 10, "resize", targetThread);
}

var registerTouchEventCallback = (target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread) => {
 targetThread = JSEvents.getTargetThreadForEventCallback(targetThread);
 if (!JSEvents.touchEvent) JSEvents.touchEvent = _malloc(1696);
 target = findEventTarget(target);
 var touchEventHandlerFunc = e => {
  assert(e);
  var t, touches = {}, et = e.touches;
  for (var i = 0; i < et.length; ++i) {
   t = et[i];
   t.isChanged = t.onTarget = 0;
   touches[t.identifier] = t;
  }
  for (var i = 0; i < e.changedTouches.length; ++i) {
   t = e.changedTouches[i];
   t.isChanged = 1;
   touches[t.identifier] = t;
  }
  for (var i = 0; i < e.targetTouches.length; ++i) {
   touches[e.targetTouches[i].identifier].onTarget = 1;
  }
  var touchEvent = targetThread ? _malloc(1696) : JSEvents.touchEvent;
  GROWABLE_HEAP_F64()[((touchEvent) >> 3)] = e.timeStamp;
  var idx = ((touchEvent) >> 2);
  GROWABLE_HEAP_I32()[idx + 3] = e.ctrlKey;
  GROWABLE_HEAP_I32()[idx + 4] = e.shiftKey;
  GROWABLE_HEAP_I32()[idx + 5] = e.altKey;
  GROWABLE_HEAP_I32()[idx + 6] = e.metaKey;
  idx += 7;
  var targetRect = getBoundingClientRect(target);
  var numTouches = 0;
  for (var i in touches) {
   t = touches[i];
   GROWABLE_HEAP_I32()[idx + 0] = t.identifier;
   GROWABLE_HEAP_I32()[idx + 1] = t.screenX;
   GROWABLE_HEAP_I32()[idx + 2] = t.screenY;
   GROWABLE_HEAP_I32()[idx + 3] = t.clientX;
   GROWABLE_HEAP_I32()[idx + 4] = t.clientY;
   GROWABLE_HEAP_I32()[idx + 5] = t.pageX;
   GROWABLE_HEAP_I32()[idx + 6] = t.pageY;
   GROWABLE_HEAP_I32()[idx + 7] = t.isChanged;
   GROWABLE_HEAP_I32()[idx + 8] = t.onTarget;
   GROWABLE_HEAP_I32()[idx + 9] = t.clientX - targetRect.left;
   GROWABLE_HEAP_I32()[idx + 10] = t.clientY - targetRect.top;
   idx += 13;
   if (++numTouches > 31) {
    break;
   }
  }
  GROWABLE_HEAP_I32()[(((touchEvent) + (8)) >> 2)] = numTouches;
  if (targetThread) __emscripten_run_callback_on_thread(targetThread, callbackfunc, eventTypeId, touchEvent, userData); else if (getWasmTableEntry(callbackfunc)(eventTypeId, touchEvent, userData)) e.preventDefault();
 };
 var eventHandler = {
  target: target,
  allowsDeferredCalls: eventTypeString == "touchstart" || eventTypeString == "touchend",
  eventTypeString: eventTypeString,
  callbackfunc: callbackfunc,
  handlerFunc: touchEventHandlerFunc,
  useCapture: useCapture
 };
 return JSEvents.registerOrRemoveHandler(eventHandler);
};

function _emscripten_set_touchcancel_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(89, 1, target, userData, useCapture, callbackfunc, targetThread);
 return registerTouchEventCallback(target, userData, useCapture, callbackfunc, 25, "touchcancel", targetThread);
}

function _emscripten_set_touchend_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(90, 1, target, userData, useCapture, callbackfunc, targetThread);
 return registerTouchEventCallback(target, userData, useCapture, callbackfunc, 23, "touchend", targetThread);
}

function _emscripten_set_touchmove_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(91, 1, target, userData, useCapture, callbackfunc, targetThread);
 return registerTouchEventCallback(target, userData, useCapture, callbackfunc, 24, "touchmove", targetThread);
}

function _emscripten_set_touchstart_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(92, 1, target, userData, useCapture, callbackfunc, targetThread);
 return registerTouchEventCallback(target, userData, useCapture, callbackfunc, 22, "touchstart", targetThread);
}

var fillVisibilityChangeEventData = eventStruct => {
 var visibilityStates = [ "hidden", "visible", "prerender", "unloaded" ];
 var visibilityState = visibilityStates.indexOf(document.visibilityState);
 /** @suppress{checkTypes} */ GROWABLE_HEAP_I32()[((eventStruct) >> 2)] = document.hidden;
 GROWABLE_HEAP_I32()[(((eventStruct) + (4)) >> 2)] = visibilityState;
};

var registerVisibilityChangeEventCallback = (target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread) => {
 targetThread = JSEvents.getTargetThreadForEventCallback(targetThread);
 if (!JSEvents.visibilityChangeEvent) JSEvents.visibilityChangeEvent = _malloc(8);
 var visibilityChangeEventHandlerFunc = (e = event) => {
  var visibilityChangeEvent = targetThread ? _malloc(8) : JSEvents.visibilityChangeEvent;
  fillVisibilityChangeEventData(visibilityChangeEvent);
  if (targetThread) __emscripten_run_callback_on_thread(targetThread, callbackfunc, eventTypeId, visibilityChangeEvent, userData); else if (getWasmTableEntry(callbackfunc)(eventTypeId, visibilityChangeEvent, userData)) e.preventDefault();
 };
 var eventHandler = {
  target: target,
  eventTypeString: eventTypeString,
  callbackfunc: callbackfunc,
  handlerFunc: visibilityChangeEventHandlerFunc,
  useCapture: useCapture
 };
 return JSEvents.registerOrRemoveHandler(eventHandler);
};

function _emscripten_set_visibilitychange_callback_on_thread(userData, useCapture, callbackfunc, targetThread) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(93, 1, userData, useCapture, callbackfunc, targetThread);
 if (!specialHTMLTargets[1]) {
  return -4;
 }
 return registerVisibilityChangeEventCallback(specialHTMLTargets[1], userData, useCapture, callbackfunc, 21, "visibilitychange", targetThread);
}

var registerWheelEventCallback = (target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread) => {
 targetThread = JSEvents.getTargetThreadForEventCallback(targetThread);
 if (!JSEvents.wheelEvent) JSEvents.wheelEvent = _malloc(104);
 var wheelHandlerFunc = (e = event) => {
  var wheelEvent = targetThread ? _malloc(104) : JSEvents.wheelEvent;
  fillMouseEventData(wheelEvent, e, target);
  GROWABLE_HEAP_F64()[(((wheelEvent) + (72)) >> 3)] = e["deltaX"];
  GROWABLE_HEAP_F64()[(((wheelEvent) + (80)) >> 3)] = e["deltaY"];
  GROWABLE_HEAP_F64()[(((wheelEvent) + (88)) >> 3)] = e["deltaZ"];
  GROWABLE_HEAP_I32()[(((wheelEvent) + (96)) >> 2)] = e["deltaMode"];
  if (targetThread) __emscripten_run_callback_on_thread(targetThread, callbackfunc, eventTypeId, wheelEvent, userData); else if (getWasmTableEntry(callbackfunc)(eventTypeId, wheelEvent, userData)) e.preventDefault();
 };
 var eventHandler = {
  target: target,
  allowsDeferredCalls: true,
  eventTypeString: eventTypeString,
  callbackfunc: callbackfunc,
  handlerFunc: wheelHandlerFunc,
  useCapture: useCapture
 };
 return JSEvents.registerOrRemoveHandler(eventHandler);
};

function _emscripten_set_wheel_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(94, 1, target, userData, useCapture, callbackfunc, targetThread);
 target = findEventTarget(target);
 if (!target) return -4;
 if (typeof target.onwheel != "undefined") {
  return registerWheelEventCallback(target, userData, useCapture, callbackfunc, 9, "wheel", targetThread);
 } else {
  return -1;
 }
}

function _emscripten_set_window_title(title) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(95, 1, title);
 return document.title = UTF8ToString(title);
}

var _emscripten_sleep = () => {
 throw "Please compile your program with async support in order to use asynchronous operations like emscripten_sleep";
};

var ENV = {};

var getExecutableName = () => thisProgram || "./this.program";

var getEnvStrings = () => {
 if (!getEnvStrings.strings) {
  var lang = ((typeof navigator == "object" && navigator.languages && navigator.languages[0]) || "C").replace("-", "_") + ".UTF-8";
  var env = {
   "USER": "web_user",
   "LOGNAME": "web_user",
   "PATH": "/",
   "PWD": "/",
   "HOME": "/home/web_user",
   "LANG": lang,
   "_": getExecutableName()
  };
  for (var x in ENV) {
   if (ENV[x] === undefined) delete env[x]; else env[x] = ENV[x];
  }
  var strings = [];
  for (var x in env) {
   strings.push(`${x}=${env[x]}`);
  }
  getEnvStrings.strings = strings;
 }
 return getEnvStrings.strings;
};

var stringToAscii = (str, buffer) => {
 for (var i = 0; i < str.length; ++i) {
  assert(str.charCodeAt(i) === (str.charCodeAt(i) & 255));
  GROWABLE_HEAP_I8()[((buffer++) >> 0)] = str.charCodeAt(i);
 }
 GROWABLE_HEAP_I8()[((buffer) >> 0)] = 0;
};

var _environ_get = function(__environ, environ_buf) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(96, 1, __environ, environ_buf);
 var bufSize = 0;
 getEnvStrings().forEach((string, i) => {
  var ptr = environ_buf + bufSize;
  GROWABLE_HEAP_U32()[(((__environ) + (i * 4)) >> 2)] = ptr;
  stringToAscii(string, ptr);
  bufSize += string.length + 1;
 });
 return 0;
};

var _environ_sizes_get = function(penviron_count, penviron_buf_size) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(97, 1, penviron_count, penviron_buf_size);
 var strings = getEnvStrings();
 GROWABLE_HEAP_U32()[((penviron_count) >> 2)] = strings.length;
 var bufSize = 0;
 strings.forEach(string => bufSize += string.length + 1);
 GROWABLE_HEAP_U32()[((penviron_buf_size) >> 2)] = bufSize;
 return 0;
};

function _fd_close(fd) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(98, 1, fd);
 try {
  var stream = SYSCALLS.getStreamFromFD(fd);
  FS.close(stream);
  return 0;
 } catch (e) {
  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
  return e.errno;
 }
}

/** @param {number=} offset */ var doReadv = (stream, iov, iovcnt, offset) => {
 var ret = 0;
 for (var i = 0; i < iovcnt; i++) {
  var ptr = GROWABLE_HEAP_U32()[((iov) >> 2)];
  var len = GROWABLE_HEAP_U32()[(((iov) + (4)) >> 2)];
  iov += 8;
  var curr = FS.read(stream, GROWABLE_HEAP_I8(), ptr, len, offset);
  if (curr < 0) return -1;
  ret += curr;
  if (curr < len) break;
  if (typeof offset !== "undefined") {
   offset += curr;
  }
 }
 return ret;
};

function _fd_read(fd, iov, iovcnt, pnum) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(99, 1, fd, iov, iovcnt, pnum);
 try {
  var stream = SYSCALLS.getStreamFromFD(fd);
  var num = doReadv(stream, iov, iovcnt);
  GROWABLE_HEAP_U32()[((pnum) >> 2)] = num;
  return 0;
 } catch (e) {
  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
  return e.errno;
 }
}

function _fd_seek(fd, offset_low, offset_high, whence, newOffset) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(100, 1, fd, offset_low, offset_high, whence, newOffset);
 var offset = convertI32PairToI53Checked(offset_low, offset_high);
 try {
  if (isNaN(offset)) return 61;
  var stream = SYSCALLS.getStreamFromFD(fd);
  FS.llseek(stream, offset, whence);
  (tempI64 = [ stream.position >>> 0, (tempDouble = stream.position, (+(Math.abs(tempDouble))) >= 1 ? (tempDouble > 0 ? (+(Math.floor((tempDouble) / 4294967296))) >>> 0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble))) >>> 0)) / 4294967296))))) >>> 0) : 0) ], 
  GROWABLE_HEAP_I32()[((newOffset) >> 2)] = tempI64[0], GROWABLE_HEAP_I32()[(((newOffset) + (4)) >> 2)] = tempI64[1]);
  if (stream.getdents && offset === 0 && whence === 0) stream.getdents = null;
  return 0;
 } catch (e) {
  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
  return e.errno;
 }
}

/** @param {number=} offset */ var doWritev = (stream, iov, iovcnt, offset) => {
 var ret = 0;
 for (var i = 0; i < iovcnt; i++) {
  var ptr = GROWABLE_HEAP_U32()[((iov) >> 2)];
  var len = GROWABLE_HEAP_U32()[(((iov) + (4)) >> 2)];
  iov += 8;
  var curr = FS.write(stream, GROWABLE_HEAP_I8(), ptr, len, offset);
  if (curr < 0) return -1;
  ret += curr;
  if (typeof offset !== "undefined") {
   offset += curr;
  }
 }
 return ret;
};

function _fd_write(fd, iov, iovcnt, pnum) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(101, 1, fd, iov, iovcnt, pnum);
 try {
  var stream = SYSCALLS.getStreamFromFD(fd);
  var num = doWritev(stream, iov, iovcnt);
  GROWABLE_HEAP_U32()[((pnum) >> 2)] = num;
  return 0;
 } catch (e) {
  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
  return e.errno;
 }
}

var getHostByName = name => {
 var ret = _malloc(20);
 var nameBuf = stringToNewUTF8(name);
 GROWABLE_HEAP_U32()[((ret) >> 2)] = nameBuf;
 var aliasesBuf = _malloc(4);
 GROWABLE_HEAP_U32()[((aliasesBuf) >> 2)] = 0;
 GROWABLE_HEAP_U32()[(((ret) + (4)) >> 2)] = aliasesBuf;
 var afinet = 2;
 GROWABLE_HEAP_I32()[(((ret) + (8)) >> 2)] = afinet;
 GROWABLE_HEAP_I32()[(((ret) + (12)) >> 2)] = 4;
 var addrListBuf = _malloc(12);
 GROWABLE_HEAP_U32()[((addrListBuf) >> 2)] = addrListBuf + 8;
 GROWABLE_HEAP_U32()[(((addrListBuf) + (4)) >> 2)] = 0;
 GROWABLE_HEAP_I32()[(((addrListBuf) + (8)) >> 2)] = inetPton4(DNS.lookup_name(name));
 GROWABLE_HEAP_U32()[(((ret) + (16)) >> 2)] = addrListBuf;
 return ret;
};

function _gethostbyname(name) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(102, 1, name);
 return getHostByName(UTF8ToString(name));
}

var isLeapYear = year => year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);

var arraySum = (array, index) => {
 var sum = 0;
 for (var i = 0; i <= index; sum += array[i++]) {}
 return sum;
};

var MONTH_DAYS_LEAP = [ 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

var MONTH_DAYS_REGULAR = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

var addDays = (date, days) => {
 var newDate = new Date(date.getTime());
 while (days > 0) {
  var leap = isLeapYear(newDate.getFullYear());
  var currentMonth = newDate.getMonth();
  var daysInCurrentMonth = (leap ? MONTH_DAYS_LEAP : MONTH_DAYS_REGULAR)[currentMonth];
  if (days > daysInCurrentMonth - newDate.getDate()) {
   days -= (daysInCurrentMonth - newDate.getDate() + 1);
   newDate.setDate(1);
   if (currentMonth < 11) {
    newDate.setMonth(currentMonth + 1);
   } else {
    newDate.setMonth(0);
    newDate.setFullYear(newDate.getFullYear() + 1);
   }
  } else {
   newDate.setDate(newDate.getDate() + days);
   return newDate;
  }
 }
 return newDate;
};

var writeArrayToMemory = (array, buffer) => {
 assert(array.length >= 0, "writeArrayToMemory array must have a length (should be an array or typed array)");
 GROWABLE_HEAP_I8().set(array, buffer);
};

var _strftime = (s, maxsize, format, tm) => {
 var tm_zone = GROWABLE_HEAP_U32()[(((tm) + (40)) >> 2)];
 var date = {
  tm_sec: GROWABLE_HEAP_I32()[((tm) >> 2)],
  tm_min: GROWABLE_HEAP_I32()[(((tm) + (4)) >> 2)],
  tm_hour: GROWABLE_HEAP_I32()[(((tm) + (8)) >> 2)],
  tm_mday: GROWABLE_HEAP_I32()[(((tm) + (12)) >> 2)],
  tm_mon: GROWABLE_HEAP_I32()[(((tm) + (16)) >> 2)],
  tm_year: GROWABLE_HEAP_I32()[(((tm) + (20)) >> 2)],
  tm_wday: GROWABLE_HEAP_I32()[(((tm) + (24)) >> 2)],
  tm_yday: GROWABLE_HEAP_I32()[(((tm) + (28)) >> 2)],
  tm_isdst: GROWABLE_HEAP_I32()[(((tm) + (32)) >> 2)],
  tm_gmtoff: GROWABLE_HEAP_I32()[(((tm) + (36)) >> 2)],
  tm_zone: tm_zone ? UTF8ToString(tm_zone) : ""
 };
 var pattern = UTF8ToString(format);
 var EXPANSION_RULES_1 = {
  "%c": "%a %b %d %H:%M:%S %Y",
  "%D": "%m/%d/%y",
  "%F": "%Y-%m-%d",
  "%h": "%b",
  "%r": "%I:%M:%S %p",
  "%R": "%H:%M",
  "%T": "%H:%M:%S",
  "%x": "%m/%d/%y",
  "%X": "%H:%M:%S",
  "%Ec": "%c",
  "%EC": "%C",
  "%Ex": "%m/%d/%y",
  "%EX": "%H:%M:%S",
  "%Ey": "%y",
  "%EY": "%Y",
  "%Od": "%d",
  "%Oe": "%e",
  "%OH": "%H",
  "%OI": "%I",
  "%Om": "%m",
  "%OM": "%M",
  "%OS": "%S",
  "%Ou": "%u",
  "%OU": "%U",
  "%OV": "%V",
  "%Ow": "%w",
  "%OW": "%W",
  "%Oy": "%y"
 };
 for (var rule in EXPANSION_RULES_1) {
  pattern = pattern.replace(new RegExp(rule, "g"), EXPANSION_RULES_1[rule]);
 }
 var WEEKDAYS = [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ];
 var MONTHS = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
 function leadingSomething(value, digits, character) {
  var str = typeof value == "number" ? value.toString() : (value || "");
  while (str.length < digits) {
   str = character[0] + str;
  }
  return str;
 }
 function leadingNulls(value, digits) {
  return leadingSomething(value, digits, "0");
 }
 function compareByDay(date1, date2) {
  function sgn(value) {
   return value < 0 ? -1 : (value > 0 ? 1 : 0);
  }
  var compare;
  if ((compare = sgn(date1.getFullYear() - date2.getFullYear())) === 0) {
   if ((compare = sgn(date1.getMonth() - date2.getMonth())) === 0) {
    compare = sgn(date1.getDate() - date2.getDate());
   }
  }
  return compare;
 }
 function getFirstWeekStartDate(janFourth) {
  switch (janFourth.getDay()) {
  case 0:
   return new Date(janFourth.getFullYear() - 1, 11, 29);

  case 1:
   return janFourth;

  case 2:
   return new Date(janFourth.getFullYear(), 0, 3);

  case 3:
   return new Date(janFourth.getFullYear(), 0, 2);

  case 4:
   return new Date(janFourth.getFullYear(), 0, 1);

  case 5:
   return new Date(janFourth.getFullYear() - 1, 11, 31);

  case 6:
   return new Date(janFourth.getFullYear() - 1, 11, 30);
  }
 }
 function getWeekBasedYear(date) {
  var thisDate = addDays(new Date(date.tm_year + 1900, 0, 1), date.tm_yday);
  var janFourthThisYear = new Date(thisDate.getFullYear(), 0, 4);
  var janFourthNextYear = new Date(thisDate.getFullYear() + 1, 0, 4);
  var firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear);
  var firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear);
  if (compareByDay(firstWeekStartThisYear, thisDate) <= 0) {
   if (compareByDay(firstWeekStartNextYear, thisDate) <= 0) {
    return thisDate.getFullYear() + 1;
   }
   return thisDate.getFullYear();
  }
  return thisDate.getFullYear() - 1;
 }
 var EXPANSION_RULES_2 = {
  "%a": date => WEEKDAYS[date.tm_wday].substring(0, 3),
  "%A": date => WEEKDAYS[date.tm_wday],
  "%b": date => MONTHS[date.tm_mon].substring(0, 3),
  "%B": date => MONTHS[date.tm_mon],
  "%C": date => {
   var year = date.tm_year + 1900;
   return leadingNulls((year / 100) | 0, 2);
  },
  "%d": date => leadingNulls(date.tm_mday, 2),
  "%e": date => leadingSomething(date.tm_mday, 2, " "),
  "%g": date => getWeekBasedYear(date).toString().substring(2),
  "%G": date => getWeekBasedYear(date),
  "%H": date => leadingNulls(date.tm_hour, 2),
  "%I": date => {
   var twelveHour = date.tm_hour;
   if (twelveHour == 0) twelveHour = 12; else if (twelveHour > 12) twelveHour -= 12;
   return leadingNulls(twelveHour, 2);
  },
  "%j": date => leadingNulls(date.tm_mday + arraySum(isLeapYear(date.tm_year + 1900) ? MONTH_DAYS_LEAP : MONTH_DAYS_REGULAR, date.tm_mon - 1), 3),
  "%m": date => leadingNulls(date.tm_mon + 1, 2),
  "%M": date => leadingNulls(date.tm_min, 2),
  "%n": () => "\n",
  "%p": date => {
   if (date.tm_hour >= 0 && date.tm_hour < 12) {
    return "AM";
   }
   return "PM";
  },
  "%S": date => leadingNulls(date.tm_sec, 2),
  "%t": () => "\t",
  "%u": date => date.tm_wday || 7,
  "%U": date => {
   var days = date.tm_yday + 7 - date.tm_wday;
   return leadingNulls(Math.floor(days / 7), 2);
  },
  "%V": date => {
   var val = Math.floor((date.tm_yday + 7 - (date.tm_wday + 6) % 7) / 7);
   if ((date.tm_wday + 371 - date.tm_yday - 2) % 7 <= 2) {
    val++;
   }
   if (!val) {
    val = 52;
    var dec31 = (date.tm_wday + 7 - date.tm_yday - 1) % 7;
    if (dec31 == 4 || (dec31 == 5 && isLeapYear(date.tm_year % 400 - 1))) {
     val++;
    }
   } else if (val == 53) {
    var jan1 = (date.tm_wday + 371 - date.tm_yday) % 7;
    if (jan1 != 4 && (jan1 != 3 || !isLeapYear(date.tm_year))) val = 1;
   }
   return leadingNulls(val, 2);
  },
  "%w": date => date.tm_wday,
  "%W": date => {
   var days = date.tm_yday + 7 - ((date.tm_wday + 6) % 7);
   return leadingNulls(Math.floor(days / 7), 2);
  },
  "%y": date => (date.tm_year + 1900).toString().substring(2),
  "%Y": date => date.tm_year + 1900,
  "%z": date => {
   var off = date.tm_gmtoff;
   var ahead = off >= 0;
   off = Math.abs(off) / 60;
   off = (off / 60) * 100 + (off % 60);
   return (ahead ? "+" : "-") + String("0000" + off).slice(-4);
  },
  "%Z": date => date.tm_zone,
  "%%": () => "%"
 };
 pattern = pattern.replace(/%%/g, "\0\0");
 for (var rule in EXPANSION_RULES_2) {
  if (pattern.includes(rule)) {
   pattern = pattern.replace(new RegExp(rule, "g"), EXPANSION_RULES_2[rule](date));
  }
 }
 pattern = pattern.replace(/\0\0/g, "%");
 var bytes = intArrayFromString(pattern, false);
 if (bytes.length > maxsize) {
  return 0;
 }
 writeArrayToMemory(bytes, s);
 return bytes.length - 1;
};

var _strftime_l = (s, maxsize, format, tm, loc) => _strftime(s, maxsize, format, tm);

var getCFunc = ident => {
 var func = Module["_" + ident];
 assert(func, "Cannot call unknown function " + ident + ", make sure it is exported");
 return func;
};

/**
     * @param {string|null=} returnType
     * @param {Array=} argTypes
     * @param {Arguments|Array=} args
     * @param {Object=} opts
     */ var ccall = (ident, returnType, argTypes, args, opts) => {
 var toC = {
  "string": str => {
   var ret = 0;
   if (str !== null && str !== undefined && str !== 0) {
    ret = stringToUTF8OnStack(str);
   }
   return ret;
  },
  "array": arr => {
   var ret = stackAlloc(arr.length);
   writeArrayToMemory(arr, ret);
   return ret;
  }
 };
 function convertReturnValue(ret) {
  if (returnType === "string") {
   return UTF8ToString(ret);
  }
  if (returnType === "boolean") return Boolean(ret);
  return ret;
 }
 var func = getCFunc(ident);
 var cArgs = [];
 var stack = 0;
 assert(returnType !== "array", 'Return type should not be "array".');
 if (args) {
  for (var i = 0; i < args.length; i++) {
   var converter = toC[argTypes[i]];
   if (converter) {
    if (stack === 0) stack = stackSave();
    cArgs[i] = converter(args[i]);
   } else {
    cArgs[i] = args[i];
   }
  }
 }
 var ret = func.apply(null, cArgs);
 function onDone(ret) {
  if (stack !== 0) stackRestore(stack);
  return convertReturnValue(ret);
 }
 ret = onDone(ret);
 return ret;
};

var FS_unlink = path => FS.unlink(path);

Module["requestFullscreen"] = (lockPointer, resizeCanvas) => Browser.requestFullscreen(lockPointer, resizeCanvas);

Module["requestFullScreen"] = () => Browser.requestFullScreen();

Module["requestAnimationFrame"] = func => Browser.requestAnimationFrame(func);

Module["setCanvasSize"] = (width, height, noUpdates) => Browser.setCanvasSize(width, height, noUpdates);

Module["pauseMainLoop"] = () => Browser.mainLoop.pause();

Module["resumeMainLoop"] = () => Browser.mainLoop.resume();

Module["getUserMedia"] = () => Browser.getUserMedia();

Module["createContext"] = (canvas, useWebGL, setInModule, webGLContextAttributes) => Browser.createContext(canvas, useWebGL, setInModule, webGLContextAttributes);

var preloadedImages = {};

var preloadedAudios = {};

var FSNode = /** @constructor */ function(parent, name, mode, rdev) {
 if (!parent) {
  parent = this;
 }
 this.parent = parent;
 this.mount = parent.mount;
 this.mounted = null;
 this.id = FS.nextInode++;
 this.name = name;
 this.mode = mode;
 this.node_ops = {};
 this.stream_ops = {};
 this.rdev = rdev;
};

var readMode = 292 | /*292*/ 73;

/*73*/ var writeMode = 146;

/*146*/ Object.defineProperties(FSNode.prototype, {
 read: {
  get: /** @this{FSNode} */ function() {
   return (this.mode & readMode) === readMode;
  },
  set: /** @this{FSNode} */ function(val) {
   val ? this.mode |= readMode : this.mode &= ~readMode;
  }
 },
 write: {
  get: /** @this{FSNode} */ function() {
   return (this.mode & writeMode) === writeMode;
  },
  set: /** @this{FSNode} */ function(val) {
   val ? this.mode |= writeMode : this.mode &= ~writeMode;
  }
 },
 isFolder: {
  get: /** @this{FSNode} */ function() {
   return FS.isDir(this.mode);
  }
 },
 isDevice: {
  get: /** @this{FSNode} */ function() {
   return FS.isChrdev(this.mode);
  }
 }
});

FS.FSNode = FSNode;

FS.createPreloadedFile = FS_createPreloadedFile;

FS.staticInit();

Module["FS_createPath"] = FS.createPath;

Module["FS_createDataFile"] = FS.createDataFile;

Module["FS_createPreloadedFile"] = FS.createPreloadedFile;

Module["FS_unlink"] = FS.unlink;

Module["FS_createLazyFile"] = FS.createLazyFile;

Module["FS_createDevice"] = FS.createDevice;

PThread.init();

var GLctx;

for (var i = 0; i < 32; ++i) tempFixedLengthArray.push(new Array(i));

var proxiedFunctionTable = [ _proc_exit, exitOnMainThread, pthreadCreateProxied, ___syscall_bind, ___syscall_faccessat, ___syscall_fcntl64, ___syscall_getdents64, ___syscall_getsockname, ___syscall_getsockopt, ___syscall_ioctl, ___syscall_mkdirat, ___syscall_openat, ___syscall_recvfrom, ___syscall_renameat, ___syscall_rmdir, ___syscall_sendto, ___syscall_socket, ___syscall_unlinkat, __emscripten_runtime_keepalive_clear, _alBufferData, _alDeleteBuffers, _alDeleteSources, _alSourcei, _alDistanceModel, _alGenBuffers, _alGenSources, _alGetError, _alGetSourcei, _alIsBuffer, _alIsSource, _alListener3f, _alListenerf, _alListenerfv, _alSource3f, _alSourcePlay, _alSourcef, _alcCloseDevice, _alcCreateContext, _alcDestroyContext, _alcGetError, _alcMakeContextCurrent, _alcOpenDevice, _eglBindAPI, _eglChooseConfig, _eglCreateContext, _eglCreateWindowSurface, _eglDestroyContext, _eglDestroySurface, _eglGetConfigAttrib, _eglGetDisplay, _eglGetError, _eglInitialize, _eglMakeCurrent, _eglQueryString, _eglSwapBuffers, _eglSwapInterval, _eglTerminate, _eglWaitClient, _eglWaitNative, _emscripten_exit_fullscreen, getCanvasSizeMainThread, setCanvasElementSizeMainThread, _emscripten_exit_pointerlock, _emscripten_get_device_pixel_ratio, _emscripten_get_element_css_size, _emscripten_get_gamepad_status, _emscripten_get_num_gamepads, _emscripten_get_preloaded_image_data, _emscripten_get_screen_size, _emscripten_request_fullscreen_strategy, _emscripten_request_pointerlock, _emscripten_sample_gamepad_data, _emscripten_set_beforeunload_callback_on_thread, _emscripten_set_blur_callback_on_thread, _emscripten_set_element_css_size, _emscripten_set_focus_callback_on_thread, _emscripten_set_fullscreenchange_callback_on_thread, _emscripten_set_gamepadconnected_callback_on_thread, _emscripten_set_gamepaddisconnected_callback_on_thread, _emscripten_set_keydown_callback_on_thread, _emscripten_set_keypress_callback_on_thread, _emscripten_set_keyup_callback_on_thread, _emscripten_set_mousedown_callback_on_thread, _emscripten_set_mouseenter_callback_on_thread, _emscripten_set_mouseleave_callback_on_thread, _emscripten_set_mousemove_callback_on_thread, _emscripten_set_mouseup_callback_on_thread, _emscripten_set_pointerlockchange_callback_on_thread, _emscripten_set_resize_callback_on_thread, _emscripten_set_touchcancel_callback_on_thread, _emscripten_set_touchend_callback_on_thread, _emscripten_set_touchmove_callback_on_thread, _emscripten_set_touchstart_callback_on_thread, _emscripten_set_visibilitychange_callback_on_thread, _emscripten_set_wheel_callback_on_thread, _emscripten_set_window_title, _environ_get, _environ_sizes_get, _fd_close, _fd_read, _fd_seek, _fd_write, _gethostbyname ];

function checkIncomingModuleAPI() {
 ignoredModuleProp("fetchSettings");
}

var wasmImports = {
 /** @export */ __assert_fail: ___assert_fail,
 /** @export */ __call_sighandler: ___call_sighandler,
 /** @export */ __cxa_throw: ___cxa_throw,
 /** @export */ __emscripten_init_main_thread_js: ___emscripten_init_main_thread_js,
 /** @export */ __emscripten_thread_cleanup: ___emscripten_thread_cleanup,
 /** @export */ __pthread_create_js: ___pthread_create_js,
 /** @export */ __syscall_bind: ___syscall_bind,
 /** @export */ __syscall_faccessat: ___syscall_faccessat,
 /** @export */ __syscall_fcntl64: ___syscall_fcntl64,
 /** @export */ __syscall_getdents64: ___syscall_getdents64,
 /** @export */ __syscall_getsockname: ___syscall_getsockname,
 /** @export */ __syscall_getsockopt: ___syscall_getsockopt,
 /** @export */ __syscall_ioctl: ___syscall_ioctl,
 /** @export */ __syscall_mkdirat: ___syscall_mkdirat,
 /** @export */ __syscall_openat: ___syscall_openat,
 /** @export */ __syscall_recvfrom: ___syscall_recvfrom,
 /** @export */ __syscall_renameat: ___syscall_renameat,
 /** @export */ __syscall_rmdir: ___syscall_rmdir,
 /** @export */ __syscall_sendto: ___syscall_sendto,
 /** @export */ __syscall_socket: ___syscall_socket,
 /** @export */ __syscall_unlinkat: ___syscall_unlinkat,
 /** @export */ _emscripten_get_now_is_monotonic: __emscripten_get_now_is_monotonic,
 /** @export */ _emscripten_notify_mailbox_postmessage: __emscripten_notify_mailbox_postmessage,
 /** @export */ _emscripten_receive_on_main_thread_js: __emscripten_receive_on_main_thread_js,
 /** @export */ _emscripten_runtime_keepalive_clear: __emscripten_runtime_keepalive_clear,
 /** @export */ _emscripten_thread_mailbox_await: __emscripten_thread_mailbox_await,
 /** @export */ _emscripten_thread_set_strongref: __emscripten_thread_set_strongref,
 /** @export */ abort: _abort,
 /** @export */ alBufferData: _alBufferData,
 /** @export */ alDeleteBuffers: _alDeleteBuffers,
 /** @export */ alDeleteSources: _alDeleteSources,
 /** @export */ alDistanceModel: _alDistanceModel,
 /** @export */ alGenBuffers: _alGenBuffers,
 /** @export */ alGenSources: _alGenSources,
 /** @export */ alGetError: _alGetError,
 /** @export */ alGetSourcei: _alGetSourcei,
 /** @export */ alIsBuffer: _alIsBuffer,
 /** @export */ alIsSource: _alIsSource,
 /** @export */ alListener3f: _alListener3f,
 /** @export */ alListenerf: _alListenerf,
 /** @export */ alListenerfv: _alListenerfv,
 /** @export */ alSource3f: _alSource3f,
 /** @export */ alSourcePlay: _alSourcePlay,
 /** @export */ alSourcef: _alSourcef,
 /** @export */ alSourcei: _alSourcei,
 /** @export */ alcCloseDevice: _alcCloseDevice,
 /** @export */ alcCreateContext: _alcCreateContext,
 /** @export */ alcDestroyContext: _alcDestroyContext,
 /** @export */ alcGetError: _alcGetError,
 /** @export */ alcMakeContextCurrent: _alcMakeContextCurrent,
 /** @export */ alcOpenDevice: _alcOpenDevice,
 /** @export */ eglBindAPI: _eglBindAPI,
 /** @export */ eglChooseConfig: _eglChooseConfig,
 /** @export */ eglCreateContext: _eglCreateContext,
 /** @export */ eglCreateWindowSurface: _eglCreateWindowSurface,
 /** @export */ eglDestroyContext: _eglDestroyContext,
 /** @export */ eglDestroySurface: _eglDestroySurface,
 /** @export */ eglGetConfigAttrib: _eglGetConfigAttrib,
 /** @export */ eglGetDisplay: _eglGetDisplay,
 /** @export */ eglGetError: _eglGetError,
 /** @export */ eglInitialize: _eglInitialize,
 /** @export */ eglMakeCurrent: _eglMakeCurrent,
 /** @export */ eglQueryString: _eglQueryString,
 /** @export */ eglSwapBuffers: _eglSwapBuffers,
 /** @export */ eglSwapInterval: _eglSwapInterval,
 /** @export */ eglTerminate: _eglTerminate,
 /** @export */ eglWaitGL: _eglWaitGL,
 /** @export */ eglWaitNative: _eglWaitNative,
 /** @export */ emscripten_asm_const_int: _emscripten_asm_const_int,
 /** @export */ emscripten_asm_const_int_sync_on_main_thread: _emscripten_asm_const_int_sync_on_main_thread,
 /** @export */ emscripten_check_blocking_allowed: _emscripten_check_blocking_allowed,
 /** @export */ emscripten_date_now: _emscripten_date_now,
 /** @export */ emscripten_err: _emscripten_err,
 /** @export */ emscripten_exit_fullscreen: _emscripten_exit_fullscreen,
 /** @export */ emscripten_exit_pointerlock: _emscripten_exit_pointerlock,
 /** @export */ emscripten_exit_with_live_runtime: _emscripten_exit_with_live_runtime,
 /** @export */ emscripten_get_device_pixel_ratio: _emscripten_get_device_pixel_ratio,
 /** @export */ emscripten_get_element_css_size: _emscripten_get_element_css_size,
 /** @export */ emscripten_get_gamepad_status: _emscripten_get_gamepad_status,
 /** @export */ emscripten_get_now: _emscripten_get_now,
 /** @export */ emscripten_get_num_gamepads: _emscripten_get_num_gamepads,
 /** @export */ emscripten_get_preloaded_image_data: _emscripten_get_preloaded_image_data,
 /** @export */ emscripten_get_screen_size: _emscripten_get_screen_size,
 /** @export */ emscripten_glActiveTexture: _emscripten_glActiveTexture,
 /** @export */ emscripten_glAttachShader: _emscripten_glAttachShader,
 /** @export */ emscripten_glBeginQuery: _emscripten_glBeginQuery,
 /** @export */ emscripten_glBeginQueryEXT: _emscripten_glBeginQueryEXT,
 /** @export */ emscripten_glBeginTransformFeedback: _emscripten_glBeginTransformFeedback,
 /** @export */ emscripten_glBindAttribLocation: _emscripten_glBindAttribLocation,
 /** @export */ emscripten_glBindBuffer: _emscripten_glBindBuffer,
 /** @export */ emscripten_glBindBufferBase: _emscripten_glBindBufferBase,
 /** @export */ emscripten_glBindBufferRange: _emscripten_glBindBufferRange,
 /** @export */ emscripten_glBindFramebuffer: _emscripten_glBindFramebuffer,
 /** @export */ emscripten_glBindRenderbuffer: _emscripten_glBindRenderbuffer,
 /** @export */ emscripten_glBindSampler: _emscripten_glBindSampler,
 /** @export */ emscripten_glBindTexture: _emscripten_glBindTexture,
 /** @export */ emscripten_glBindTransformFeedback: _emscripten_glBindTransformFeedback,
 /** @export */ emscripten_glBindVertexArray: _emscripten_glBindVertexArray,
 /** @export */ emscripten_glBindVertexArrayOES: _emscripten_glBindVertexArrayOES,
 /** @export */ emscripten_glBlendColor: _emscripten_glBlendColor,
 /** @export */ emscripten_glBlendEquation: _emscripten_glBlendEquation,
 /** @export */ emscripten_glBlendEquationSeparate: _emscripten_glBlendEquationSeparate,
 /** @export */ emscripten_glBlendFunc: _emscripten_glBlendFunc,
 /** @export */ emscripten_glBlendFuncSeparate: _emscripten_glBlendFuncSeparate,
 /** @export */ emscripten_glBlitFramebuffer: _emscripten_glBlitFramebuffer,
 /** @export */ emscripten_glBufferData: _emscripten_glBufferData,
 /** @export */ emscripten_glBufferSubData: _emscripten_glBufferSubData,
 /** @export */ emscripten_glCheckFramebufferStatus: _emscripten_glCheckFramebufferStatus,
 /** @export */ emscripten_glClear: _emscripten_glClear,
 /** @export */ emscripten_glClearBufferfi: _emscripten_glClearBufferfi,
 /** @export */ emscripten_glClearBufferfv: _emscripten_glClearBufferfv,
 /** @export */ emscripten_glClearBufferiv: _emscripten_glClearBufferiv,
 /** @export */ emscripten_glClearBufferuiv: _emscripten_glClearBufferuiv,
 /** @export */ emscripten_glClearColor: _emscripten_glClearColor,
 /** @export */ emscripten_glClearDepthf: _emscripten_glClearDepthf,
 /** @export */ emscripten_glClearStencil: _emscripten_glClearStencil,
 /** @export */ emscripten_glClientWaitSync: _emscripten_glClientWaitSync,
 /** @export */ emscripten_glColorMask: _emscripten_glColorMask,
 /** @export */ emscripten_glCompileShader: _emscripten_glCompileShader,
 /** @export */ emscripten_glCompressedTexImage2D: _emscripten_glCompressedTexImage2D,
 /** @export */ emscripten_glCompressedTexImage3D: _emscripten_glCompressedTexImage3D,
 /** @export */ emscripten_glCompressedTexSubImage2D: _emscripten_glCompressedTexSubImage2D,
 /** @export */ emscripten_glCompressedTexSubImage3D: _emscripten_glCompressedTexSubImage3D,
 /** @export */ emscripten_glCopyBufferSubData: _emscripten_glCopyBufferSubData,
 /** @export */ emscripten_glCopyTexImage2D: _emscripten_glCopyTexImage2D,
 /** @export */ emscripten_glCopyTexSubImage2D: _emscripten_glCopyTexSubImage2D,
 /** @export */ emscripten_glCopyTexSubImage3D: _emscripten_glCopyTexSubImage3D,
 /** @export */ emscripten_glCreateProgram: _emscripten_glCreateProgram,
 /** @export */ emscripten_glCreateShader: _emscripten_glCreateShader,
 /** @export */ emscripten_glCullFace: _emscripten_glCullFace,
 /** @export */ emscripten_glDeleteBuffers: _emscripten_glDeleteBuffers,
 /** @export */ emscripten_glDeleteFramebuffers: _emscripten_glDeleteFramebuffers,
 /** @export */ emscripten_glDeleteProgram: _emscripten_glDeleteProgram,
 /** @export */ emscripten_glDeleteQueries: _emscripten_glDeleteQueries,
 /** @export */ emscripten_glDeleteQueriesEXT: _emscripten_glDeleteQueriesEXT,
 /** @export */ emscripten_glDeleteRenderbuffers: _emscripten_glDeleteRenderbuffers,
 /** @export */ emscripten_glDeleteSamplers: _emscripten_glDeleteSamplers,
 /** @export */ emscripten_glDeleteShader: _emscripten_glDeleteShader,
 /** @export */ emscripten_glDeleteSync: _emscripten_glDeleteSync,
 /** @export */ emscripten_glDeleteTextures: _emscripten_glDeleteTextures,
 /** @export */ emscripten_glDeleteTransformFeedbacks: _emscripten_glDeleteTransformFeedbacks,
 /** @export */ emscripten_glDeleteVertexArrays: _emscripten_glDeleteVertexArrays,
 /** @export */ emscripten_glDeleteVertexArraysOES: _emscripten_glDeleteVertexArraysOES,
 /** @export */ emscripten_glDepthFunc: _emscripten_glDepthFunc,
 /** @export */ emscripten_glDepthMask: _emscripten_glDepthMask,
 /** @export */ emscripten_glDepthRangef: _emscripten_glDepthRangef,
 /** @export */ emscripten_glDetachShader: _emscripten_glDetachShader,
 /** @export */ emscripten_glDisable: _emscripten_glDisable,
 /** @export */ emscripten_glDisableVertexAttribArray: _emscripten_glDisableVertexAttribArray,
 /** @export */ emscripten_glDrawArrays: _emscripten_glDrawArrays,
 /** @export */ emscripten_glDrawArraysInstanced: _emscripten_glDrawArraysInstanced,
 /** @export */ emscripten_glDrawArraysInstancedANGLE: _emscripten_glDrawArraysInstancedANGLE,
 /** @export */ emscripten_glDrawArraysInstancedARB: _emscripten_glDrawArraysInstancedARB,
 /** @export */ emscripten_glDrawArraysInstancedEXT: _emscripten_glDrawArraysInstancedEXT,
 /** @export */ emscripten_glDrawArraysInstancedNV: _emscripten_glDrawArraysInstancedNV,
 /** @export */ emscripten_glDrawBuffers: _emscripten_glDrawBuffers,
 /** @export */ emscripten_glDrawBuffersEXT: _emscripten_glDrawBuffersEXT,
 /** @export */ emscripten_glDrawBuffersWEBGL: _emscripten_glDrawBuffersWEBGL,
 /** @export */ emscripten_glDrawElements: _emscripten_glDrawElements,
 /** @export */ emscripten_glDrawElementsInstanced: _emscripten_glDrawElementsInstanced,
 /** @export */ emscripten_glDrawElementsInstancedANGLE: _emscripten_glDrawElementsInstancedANGLE,
 /** @export */ emscripten_glDrawElementsInstancedARB: _emscripten_glDrawElementsInstancedARB,
 /** @export */ emscripten_glDrawElementsInstancedEXT: _emscripten_glDrawElementsInstancedEXT,
 /** @export */ emscripten_glDrawElementsInstancedNV: _emscripten_glDrawElementsInstancedNV,
 /** @export */ emscripten_glDrawRangeElements: _emscripten_glDrawRangeElements,
 /** @export */ emscripten_glEnable: _emscripten_glEnable,
 /** @export */ emscripten_glEnableVertexAttribArray: _emscripten_glEnableVertexAttribArray,
 /** @export */ emscripten_glEndQuery: _emscripten_glEndQuery,
 /** @export */ emscripten_glEndQueryEXT: _emscripten_glEndQueryEXT,
 /** @export */ emscripten_glEndTransformFeedback: _emscripten_glEndTransformFeedback,
 /** @export */ emscripten_glFenceSync: _emscripten_glFenceSync,
 /** @export */ emscripten_glFinish: _emscripten_glFinish,
 /** @export */ emscripten_glFlush: _emscripten_glFlush,
 /** @export */ emscripten_glFramebufferRenderbuffer: _emscripten_glFramebufferRenderbuffer,
 /** @export */ emscripten_glFramebufferTexture2D: _emscripten_glFramebufferTexture2D,
 /** @export */ emscripten_glFramebufferTextureLayer: _emscripten_glFramebufferTextureLayer,
 /** @export */ emscripten_glFrontFace: _emscripten_glFrontFace,
 /** @export */ emscripten_glGenBuffers: _emscripten_glGenBuffers,
 /** @export */ emscripten_glGenFramebuffers: _emscripten_glGenFramebuffers,
 /** @export */ emscripten_glGenQueries: _emscripten_glGenQueries,
 /** @export */ emscripten_glGenQueriesEXT: _emscripten_glGenQueriesEXT,
 /** @export */ emscripten_glGenRenderbuffers: _emscripten_glGenRenderbuffers,
 /** @export */ emscripten_glGenSamplers: _emscripten_glGenSamplers,
 /** @export */ emscripten_glGenTextures: _emscripten_glGenTextures,
 /** @export */ emscripten_glGenTransformFeedbacks: _emscripten_glGenTransformFeedbacks,
 /** @export */ emscripten_glGenVertexArrays: _emscripten_glGenVertexArrays,
 /** @export */ emscripten_glGenVertexArraysOES: _emscripten_glGenVertexArraysOES,
 /** @export */ emscripten_glGenerateMipmap: _emscripten_glGenerateMipmap,
 /** @export */ emscripten_glGetActiveAttrib: _emscripten_glGetActiveAttrib,
 /** @export */ emscripten_glGetActiveUniform: _emscripten_glGetActiveUniform,
 /** @export */ emscripten_glGetActiveUniformBlockName: _emscripten_glGetActiveUniformBlockName,
 /** @export */ emscripten_glGetActiveUniformBlockiv: _emscripten_glGetActiveUniformBlockiv,
 /** @export */ emscripten_glGetActiveUniformsiv: _emscripten_glGetActiveUniformsiv,
 /** @export */ emscripten_glGetAttachedShaders: _emscripten_glGetAttachedShaders,
 /** @export */ emscripten_glGetAttribLocation: _emscripten_glGetAttribLocation,
 /** @export */ emscripten_glGetBooleanv: _emscripten_glGetBooleanv,
 /** @export */ emscripten_glGetBufferParameteri64v: _emscripten_glGetBufferParameteri64v,
 /** @export */ emscripten_glGetBufferParameteriv: _emscripten_glGetBufferParameteriv,
 /** @export */ emscripten_glGetError: _emscripten_glGetError,
 /** @export */ emscripten_glGetFloatv: _emscripten_glGetFloatv,
 /** @export */ emscripten_glGetFragDataLocation: _emscripten_glGetFragDataLocation,
 /** @export */ emscripten_glGetFramebufferAttachmentParameteriv: _emscripten_glGetFramebufferAttachmentParameteriv,
 /** @export */ emscripten_glGetInteger64i_v: _emscripten_glGetInteger64i_v,
 /** @export */ emscripten_glGetInteger64v: _emscripten_glGetInteger64v,
 /** @export */ emscripten_glGetIntegeri_v: _emscripten_glGetIntegeri_v,
 /** @export */ emscripten_glGetIntegerv: _emscripten_glGetIntegerv,
 /** @export */ emscripten_glGetInternalformativ: _emscripten_glGetInternalformativ,
 /** @export */ emscripten_glGetProgramBinary: _emscripten_glGetProgramBinary,
 /** @export */ emscripten_glGetProgramInfoLog: _emscripten_glGetProgramInfoLog,
 /** @export */ emscripten_glGetProgramiv: _emscripten_glGetProgramiv,
 /** @export */ emscripten_glGetQueryObjecti64vEXT: _emscripten_glGetQueryObjecti64vEXT,
 /** @export */ emscripten_glGetQueryObjectivEXT: _emscripten_glGetQueryObjectivEXT,
 /** @export */ emscripten_glGetQueryObjectui64vEXT: _emscripten_glGetQueryObjectui64vEXT,
 /** @export */ emscripten_glGetQueryObjectuiv: _emscripten_glGetQueryObjectuiv,
 /** @export */ emscripten_glGetQueryObjectuivEXT: _emscripten_glGetQueryObjectuivEXT,
 /** @export */ emscripten_glGetQueryiv: _emscripten_glGetQueryiv,
 /** @export */ emscripten_glGetQueryivEXT: _emscripten_glGetQueryivEXT,
 /** @export */ emscripten_glGetRenderbufferParameteriv: _emscripten_glGetRenderbufferParameteriv,
 /** @export */ emscripten_glGetSamplerParameterfv: _emscripten_glGetSamplerParameterfv,
 /** @export */ emscripten_glGetSamplerParameteriv: _emscripten_glGetSamplerParameteriv,
 /** @export */ emscripten_glGetShaderInfoLog: _emscripten_glGetShaderInfoLog,
 /** @export */ emscripten_glGetShaderPrecisionFormat: _emscripten_glGetShaderPrecisionFormat,
 /** @export */ emscripten_glGetShaderSource: _emscripten_glGetShaderSource,
 /** @export */ emscripten_glGetShaderiv: _emscripten_glGetShaderiv,
 /** @export */ emscripten_glGetString: _emscripten_glGetString,
 /** @export */ emscripten_glGetStringi: _emscripten_glGetStringi,
 /** @export */ emscripten_glGetSynciv: _emscripten_glGetSynciv,
 /** @export */ emscripten_glGetTexParameterfv: _emscripten_glGetTexParameterfv,
 /** @export */ emscripten_glGetTexParameteriv: _emscripten_glGetTexParameteriv,
 /** @export */ emscripten_glGetTransformFeedbackVarying: _emscripten_glGetTransformFeedbackVarying,
 /** @export */ emscripten_glGetUniformBlockIndex: _emscripten_glGetUniformBlockIndex,
 /** @export */ emscripten_glGetUniformIndices: _emscripten_glGetUniformIndices,
 /** @export */ emscripten_glGetUniformLocation: _emscripten_glGetUniformLocation,
 /** @export */ emscripten_glGetUniformfv: _emscripten_glGetUniformfv,
 /** @export */ emscripten_glGetUniformiv: _emscripten_glGetUniformiv,
 /** @export */ emscripten_glGetUniformuiv: _emscripten_glGetUniformuiv,
 /** @export */ emscripten_glGetVertexAttribIiv: _emscripten_glGetVertexAttribIiv,
 /** @export */ emscripten_glGetVertexAttribIuiv: _emscripten_glGetVertexAttribIuiv,
 /** @export */ emscripten_glGetVertexAttribPointerv: _emscripten_glGetVertexAttribPointerv,
 /** @export */ emscripten_glGetVertexAttribfv: _emscripten_glGetVertexAttribfv,
 /** @export */ emscripten_glGetVertexAttribiv: _emscripten_glGetVertexAttribiv,
 /** @export */ emscripten_glHint: _emscripten_glHint,
 /** @export */ emscripten_glInvalidateFramebuffer: _emscripten_glInvalidateFramebuffer,
 /** @export */ emscripten_glInvalidateSubFramebuffer: _emscripten_glInvalidateSubFramebuffer,
 /** @export */ emscripten_glIsBuffer: _emscripten_glIsBuffer,
 /** @export */ emscripten_glIsEnabled: _emscripten_glIsEnabled,
 /** @export */ emscripten_glIsFramebuffer: _emscripten_glIsFramebuffer,
 /** @export */ emscripten_glIsProgram: _emscripten_glIsProgram,
 /** @export */ emscripten_glIsQuery: _emscripten_glIsQuery,
 /** @export */ emscripten_glIsQueryEXT: _emscripten_glIsQueryEXT,
 /** @export */ emscripten_glIsRenderbuffer: _emscripten_glIsRenderbuffer,
 /** @export */ emscripten_glIsSampler: _emscripten_glIsSampler,
 /** @export */ emscripten_glIsShader: _emscripten_glIsShader,
 /** @export */ emscripten_glIsSync: _emscripten_glIsSync,
 /** @export */ emscripten_glIsTexture: _emscripten_glIsTexture,
 /** @export */ emscripten_glIsTransformFeedback: _emscripten_glIsTransformFeedback,
 /** @export */ emscripten_glIsVertexArray: _emscripten_glIsVertexArray,
 /** @export */ emscripten_glIsVertexArrayOES: _emscripten_glIsVertexArrayOES,
 /** @export */ emscripten_glLineWidth: _emscripten_glLineWidth,
 /** @export */ emscripten_glLinkProgram: _emscripten_glLinkProgram,
 /** @export */ emscripten_glPauseTransformFeedback: _emscripten_glPauseTransformFeedback,
 /** @export */ emscripten_glPixelStorei: _emscripten_glPixelStorei,
 /** @export */ emscripten_glPolygonOffset: _emscripten_glPolygonOffset,
 /** @export */ emscripten_glProgramBinary: _emscripten_glProgramBinary,
 /** @export */ emscripten_glProgramParameteri: _emscripten_glProgramParameteri,
 /** @export */ emscripten_glQueryCounterEXT: _emscripten_glQueryCounterEXT,
 /** @export */ emscripten_glReadBuffer: _emscripten_glReadBuffer,
 /** @export */ emscripten_glReadPixels: _emscripten_glReadPixels,
 /** @export */ emscripten_glReleaseShaderCompiler: _emscripten_glReleaseShaderCompiler,
 /** @export */ emscripten_glRenderbufferStorage: _emscripten_glRenderbufferStorage,
 /** @export */ emscripten_glRenderbufferStorageMultisample: _emscripten_glRenderbufferStorageMultisample,
 /** @export */ emscripten_glResumeTransformFeedback: _emscripten_glResumeTransformFeedback,
 /** @export */ emscripten_glSampleCoverage: _emscripten_glSampleCoverage,
 /** @export */ emscripten_glSamplerParameterf: _emscripten_glSamplerParameterf,
 /** @export */ emscripten_glSamplerParameterfv: _emscripten_glSamplerParameterfv,
 /** @export */ emscripten_glSamplerParameteri: _emscripten_glSamplerParameteri,
 /** @export */ emscripten_glSamplerParameteriv: _emscripten_glSamplerParameteriv,
 /** @export */ emscripten_glScissor: _emscripten_glScissor,
 /** @export */ emscripten_glShaderBinary: _emscripten_glShaderBinary,
 /** @export */ emscripten_glShaderSource: _emscripten_glShaderSource,
 /** @export */ emscripten_glStencilFunc: _emscripten_glStencilFunc,
 /** @export */ emscripten_glStencilFuncSeparate: _emscripten_glStencilFuncSeparate,
 /** @export */ emscripten_glStencilMask: _emscripten_glStencilMask,
 /** @export */ emscripten_glStencilMaskSeparate: _emscripten_glStencilMaskSeparate,
 /** @export */ emscripten_glStencilOp: _emscripten_glStencilOp,
 /** @export */ emscripten_glStencilOpSeparate: _emscripten_glStencilOpSeparate,
 /** @export */ emscripten_glTexImage2D: _emscripten_glTexImage2D,
 /** @export */ emscripten_glTexImage3D: _emscripten_glTexImage3D,
 /** @export */ emscripten_glTexParameterf: _emscripten_glTexParameterf,
 /** @export */ emscripten_glTexParameterfv: _emscripten_glTexParameterfv,
 /** @export */ emscripten_glTexParameteri: _emscripten_glTexParameteri,
 /** @export */ emscripten_glTexParameteriv: _emscripten_glTexParameteriv,
 /** @export */ emscripten_glTexStorage2D: _emscripten_glTexStorage2D,
 /** @export */ emscripten_glTexStorage3D: _emscripten_glTexStorage3D,
 /** @export */ emscripten_glTexSubImage2D: _emscripten_glTexSubImage2D,
 /** @export */ emscripten_glTexSubImage3D: _emscripten_glTexSubImage3D,
 /** @export */ emscripten_glTransformFeedbackVaryings: _emscripten_glTransformFeedbackVaryings,
 /** @export */ emscripten_glUniform1f: _emscripten_glUniform1f,
 /** @export */ emscripten_glUniform1fv: _emscripten_glUniform1fv,
 /** @export */ emscripten_glUniform1i: _emscripten_glUniform1i,
 /** @export */ emscripten_glUniform1iv: _emscripten_glUniform1iv,
 /** @export */ emscripten_glUniform1ui: _emscripten_glUniform1ui,
 /** @export */ emscripten_glUniform1uiv: _emscripten_glUniform1uiv,
 /** @export */ emscripten_glUniform2f: _emscripten_glUniform2f,
 /** @export */ emscripten_glUniform2fv: _emscripten_glUniform2fv,
 /** @export */ emscripten_glUniform2i: _emscripten_glUniform2i,
 /** @export */ emscripten_glUniform2iv: _emscripten_glUniform2iv,
 /** @export */ emscripten_glUniform2ui: _emscripten_glUniform2ui,
 /** @export */ emscripten_glUniform2uiv: _emscripten_glUniform2uiv,
 /** @export */ emscripten_glUniform3f: _emscripten_glUniform3f,
 /** @export */ emscripten_glUniform3fv: _emscripten_glUniform3fv,
 /** @export */ emscripten_glUniform3i: _emscripten_glUniform3i,
 /** @export */ emscripten_glUniform3iv: _emscripten_glUniform3iv,
 /** @export */ emscripten_glUniform3ui: _emscripten_glUniform3ui,
 /** @export */ emscripten_glUniform3uiv: _emscripten_glUniform3uiv,
 /** @export */ emscripten_glUniform4f: _emscripten_glUniform4f,
 /** @export */ emscripten_glUniform4fv: _emscripten_glUniform4fv,
 /** @export */ emscripten_glUniform4i: _emscripten_glUniform4i,
 /** @export */ emscripten_glUniform4iv: _emscripten_glUniform4iv,
 /** @export */ emscripten_glUniform4ui: _emscripten_glUniform4ui,
 /** @export */ emscripten_glUniform4uiv: _emscripten_glUniform4uiv,
 /** @export */ emscripten_glUniformBlockBinding: _emscripten_glUniformBlockBinding,
 /** @export */ emscripten_glUniformMatrix2fv: _emscripten_glUniformMatrix2fv,
 /** @export */ emscripten_glUniformMatrix2x3fv: _emscripten_glUniformMatrix2x3fv,
 /** @export */ emscripten_glUniformMatrix2x4fv: _emscripten_glUniformMatrix2x4fv,
 /** @export */ emscripten_glUniformMatrix3fv: _emscripten_glUniformMatrix3fv,
 /** @export */ emscripten_glUniformMatrix3x2fv: _emscripten_glUniformMatrix3x2fv,
 /** @export */ emscripten_glUniformMatrix3x4fv: _emscripten_glUniformMatrix3x4fv,
 /** @export */ emscripten_glUniformMatrix4fv: _emscripten_glUniformMatrix4fv,
 /** @export */ emscripten_glUniformMatrix4x2fv: _emscripten_glUniformMatrix4x2fv,
 /** @export */ emscripten_glUniformMatrix4x3fv: _emscripten_glUniformMatrix4x3fv,
 /** @export */ emscripten_glUseProgram: _emscripten_glUseProgram,
 /** @export */ emscripten_glValidateProgram: _emscripten_glValidateProgram,
 /** @export */ emscripten_glVertexAttrib1f: _emscripten_glVertexAttrib1f,
 /** @export */ emscripten_glVertexAttrib1fv: _emscripten_glVertexAttrib1fv,
 /** @export */ emscripten_glVertexAttrib2f: _emscripten_glVertexAttrib2f,
 /** @export */ emscripten_glVertexAttrib2fv: _emscripten_glVertexAttrib2fv,
 /** @export */ emscripten_glVertexAttrib3f: _emscripten_glVertexAttrib3f,
 /** @export */ emscripten_glVertexAttrib3fv: _emscripten_glVertexAttrib3fv,
 /** @export */ emscripten_glVertexAttrib4f: _emscripten_glVertexAttrib4f,
 /** @export */ emscripten_glVertexAttrib4fv: _emscripten_glVertexAttrib4fv,
 /** @export */ emscripten_glVertexAttribDivisor: _emscripten_glVertexAttribDivisor,
 /** @export */ emscripten_glVertexAttribDivisorANGLE: _emscripten_glVertexAttribDivisorANGLE,
 /** @export */ emscripten_glVertexAttribDivisorARB: _emscripten_glVertexAttribDivisorARB,
 /** @export */ emscripten_glVertexAttribDivisorEXT: _emscripten_glVertexAttribDivisorEXT,
 /** @export */ emscripten_glVertexAttribDivisorNV: _emscripten_glVertexAttribDivisorNV,
 /** @export */ emscripten_glVertexAttribI4i: _emscripten_glVertexAttribI4i,
 /** @export */ emscripten_glVertexAttribI4iv: _emscripten_glVertexAttribI4iv,
 /** @export */ emscripten_glVertexAttribI4ui: _emscripten_glVertexAttribI4ui,
 /** @export */ emscripten_glVertexAttribI4uiv: _emscripten_glVertexAttribI4uiv,
 /** @export */ emscripten_glVertexAttribIPointer: _emscripten_glVertexAttribIPointer,
 /** @export */ emscripten_glVertexAttribPointer: _emscripten_glVertexAttribPointer,
 /** @export */ emscripten_glViewport: _emscripten_glViewport,
 /** @export */ emscripten_glWaitSync: _emscripten_glWaitSync,
 /** @export */ emscripten_has_asyncify: _emscripten_has_asyncify,
 /** @export */ emscripten_request_animation_frame_loop: _emscripten_request_animation_frame_loop,
 /** @export */ emscripten_request_fullscreen_strategy: _emscripten_request_fullscreen_strategy,
 /** @export */ emscripten_request_pointerlock: _emscripten_request_pointerlock,
 /** @export */ emscripten_resize_heap: _emscripten_resize_heap,
 /** @export */ emscripten_sample_gamepad_data: _emscripten_sample_gamepad_data,
 /** @export */ emscripten_set_beforeunload_callback_on_thread: _emscripten_set_beforeunload_callback_on_thread,
 /** @export */ emscripten_set_blur_callback_on_thread: _emscripten_set_blur_callback_on_thread,
 /** @export */ emscripten_set_canvas_element_size: _emscripten_set_canvas_element_size,
 /** @export */ emscripten_set_element_css_size: _emscripten_set_element_css_size,
 /** @export */ emscripten_set_focus_callback_on_thread: _emscripten_set_focus_callback_on_thread,
 /** @export */ emscripten_set_fullscreenchange_callback_on_thread: _emscripten_set_fullscreenchange_callback_on_thread,
 /** @export */ emscripten_set_gamepadconnected_callback_on_thread: _emscripten_set_gamepadconnected_callback_on_thread,
 /** @export */ emscripten_set_gamepaddisconnected_callback_on_thread: _emscripten_set_gamepaddisconnected_callback_on_thread,
 /** @export */ emscripten_set_keydown_callback_on_thread: _emscripten_set_keydown_callback_on_thread,
 /** @export */ emscripten_set_keypress_callback_on_thread: _emscripten_set_keypress_callback_on_thread,
 /** @export */ emscripten_set_keyup_callback_on_thread: _emscripten_set_keyup_callback_on_thread,
 /** @export */ emscripten_set_mousedown_callback_on_thread: _emscripten_set_mousedown_callback_on_thread,
 /** @export */ emscripten_set_mouseenter_callback_on_thread: _emscripten_set_mouseenter_callback_on_thread,
 /** @export */ emscripten_set_mouseleave_callback_on_thread: _emscripten_set_mouseleave_callback_on_thread,
 /** @export */ emscripten_set_mousemove_callback_on_thread: _emscripten_set_mousemove_callback_on_thread,
 /** @export */ emscripten_set_mouseup_callback_on_thread: _emscripten_set_mouseup_callback_on_thread,
 /** @export */ emscripten_set_pointerlockchange_callback_on_thread: _emscripten_set_pointerlockchange_callback_on_thread,
 /** @export */ emscripten_set_resize_callback_on_thread: _emscripten_set_resize_callback_on_thread,
 /** @export */ emscripten_set_touchcancel_callback_on_thread: _emscripten_set_touchcancel_callback_on_thread,
 /** @export */ emscripten_set_touchend_callback_on_thread: _emscripten_set_touchend_callback_on_thread,
 /** @export */ emscripten_set_touchmove_callback_on_thread: _emscripten_set_touchmove_callback_on_thread,
 /** @export */ emscripten_set_touchstart_callback_on_thread: _emscripten_set_touchstart_callback_on_thread,
 /** @export */ emscripten_set_visibilitychange_callback_on_thread: _emscripten_set_visibilitychange_callback_on_thread,
 /** @export */ emscripten_set_wheel_callback_on_thread: _emscripten_set_wheel_callback_on_thread,
 /** @export */ emscripten_set_window_title: _emscripten_set_window_title,
 /** @export */ emscripten_sleep: _emscripten_sleep,
 /** @export */ environ_get: _environ_get,
 /** @export */ environ_sizes_get: _environ_sizes_get,
 /** @export */ exit: _exit,
 /** @export */ fd_close: _fd_close,
 /** @export */ fd_read: _fd_read,
 /** @export */ fd_seek: _fd_seek,
 /** @export */ fd_write: _fd_write,
 /** @export */ gethostbyname: _gethostbyname,
 /** @export */ memory: wasmMemory,
 /** @export */ proc_exit: _proc_exit,
 /** @export */ strftime_l: _strftime_l
};

var wasmExports = createWasm();

var ___wasm_call_ctors = createExportWrapper("__wasm_call_ctors");

var _resize_from_js = Module["_resize_from_js"] = createExportWrapper("resize_from_js");

var _free = createExportWrapper("free");

var _main = Module["_main"] = createExportWrapper("__main_argc_argv");

var _malloc = createExportWrapper("malloc");

var _htons = createExportWrapper("htons");

var _ntohs = createExportWrapper("ntohs");

var _pthread_self = Module["_pthread_self"] = () => (_pthread_self = Module["_pthread_self"] = wasmExports["pthread_self"])();

var ___errno_location = createExportWrapper("__errno_location");

var __emscripten_tls_init = Module["__emscripten_tls_init"] = createExportWrapper("_emscripten_tls_init");

var __emscripten_run_callback_on_thread = createExportWrapper("_emscripten_run_callback_on_thread");

var __emscripten_thread_init = Module["__emscripten_thread_init"] = createExportWrapper("_emscripten_thread_init");

var __emscripten_thread_crashed = Module["__emscripten_thread_crashed"] = createExportWrapper("_emscripten_thread_crashed");

var _emscripten_main_thread_process_queued_calls = createExportWrapper("emscripten_main_thread_process_queued_calls");

var _fflush = Module["_fflush"] = createExportWrapper("fflush");

var _emscripten_main_runtime_thread_id = createExportWrapper("emscripten_main_runtime_thread_id");

var _emscripten_stack_get_base = () => (_emscripten_stack_get_base = wasmExports["emscripten_stack_get_base"])();

var _emscripten_stack_get_end = () => (_emscripten_stack_get_end = wasmExports["emscripten_stack_get_end"])();

var __emscripten_run_on_main_thread_js = createExportWrapper("_emscripten_run_on_main_thread_js");

var __emscripten_thread_free_data = createExportWrapper("_emscripten_thread_free_data");

var __emscripten_thread_exit = Module["__emscripten_thread_exit"] = createExportWrapper("_emscripten_thread_exit");

var __emscripten_check_mailbox = createExportWrapper("_emscripten_check_mailbox");

var _emscripten_stack_init = () => (_emscripten_stack_init = wasmExports["emscripten_stack_init"])();

var _emscripten_stack_set_limits = (a0, a1) => (_emscripten_stack_set_limits = wasmExports["emscripten_stack_set_limits"])(a0, a1);

var _emscripten_stack_get_free = () => (_emscripten_stack_get_free = wasmExports["emscripten_stack_get_free"])();

var stackSave = createExportWrapper("stackSave");

var stackRestore = createExportWrapper("stackRestore");

var stackAlloc = createExportWrapper("stackAlloc");

var _emscripten_stack_get_current = () => (_emscripten_stack_get_current = wasmExports["emscripten_stack_get_current"])();

var ___cxa_is_pointer_type = createExportWrapper("__cxa_is_pointer_type");

var dynCall_jii = Module["dynCall_jii"] = createExportWrapper("dynCall_jii");

var dynCall_iijj = Module["dynCall_iijj"] = createExportWrapper("dynCall_iijj");

var dynCall_jiji = Module["dynCall_jiji"] = createExportWrapper("dynCall_jiji");

var dynCall_ji = Module["dynCall_ji"] = createExportWrapper("dynCall_ji");

var dynCall_viijii = Module["dynCall_viijii"] = createExportWrapper("dynCall_viijii");

var dynCall_iiiiij = Module["dynCall_iiiiij"] = createExportWrapper("dynCall_iiiiij");

var dynCall_iiiiijj = Module["dynCall_iiiiijj"] = createExportWrapper("dynCall_iiiiijj");

var dynCall_iiiiiijj = Module["dynCall_iiiiiijj"] = createExportWrapper("dynCall_iiiiiijj");

Module["addRunDependency"] = addRunDependency;

Module["removeRunDependency"] = removeRunDependency;

Module["FS_createPath"] = FS.createPath;

Module["FS_createLazyFile"] = FS.createLazyFile;

Module["FS_createDevice"] = FS.createDevice;

Module["wasmMemory"] = wasmMemory;

Module["keepRuntimeAlive"] = keepRuntimeAlive;

Module["ccall"] = ccall;

Module["ExitStatus"] = ExitStatus;

Module["FS_createPreloadedFile"] = FS.createPreloadedFile;

Module["FS_createDataFile"] = FS.createDataFile;

Module["FS_unlink"] = FS.unlink;

var missingLibrarySymbols = [ "writeI53ToI64Clamped", "writeI53ToI64Signaling", "writeI53ToU64Clamped", "writeI53ToU64Signaling", "convertU32PairToI53", "ydayFromDate", "getCallstack", "emscriptenLog", "convertPCtoSourceLocation", "jstoi_s", "getDynCaller", "asmjsMangle", "handleAllocatorInit", "HandleAllocator", "getNativeTypeSize", "STACK_SIZE", "STACK_ALIGN", "POINTER_SIZE", "ASSERTIONS", "cwrap", "uleb128Encode", "sigToWasmTypes", "generateFuncType", "convertJsFunctionToWasm", "getEmptyTableSlot", "updateTableMap", "getFunctionAddress", "addFunction", "removeFunction", "reallyNegative", "unSign", "strLen", "reSign", "formatString", "intArrayToString", "AsciiToString", "UTF16ToString", "stringToUTF16", "lengthBytesUTF16", "UTF32ToString", "stringToUTF32", "lengthBytesUTF32", "fillDeviceOrientationEventData", "registerDeviceOrientationEventCallback", "fillDeviceMotionEventData", "registerDeviceMotionEventCallback", "screenOrientation", "fillOrientationChangeEventData", "registerOrientationChangeEventCallback", "hideEverythingExceptGivenElement", "restoreHiddenElements", "softFullscreenResizeWebGLRenderTarget", "registerPointerlockErrorEventCallback", "fillBatteryEventData", "battery", "registerBatteryEventCallback", "jsStackTrace", "stackTrace", "checkWasiClock", "wasiRightsToMuslOFlags", "wasiOFlagsToMuslOFlags", "createDyncallWrapper", "setImmediateWrapped", "clearImmediateWrapped", "polyfillSetImmediate", "getPromise", "makePromise", "idsToPromises", "makePromiseCallback", "findMatchingCatch", "FS_mkdirTree", "_setNetworkCallback", "writeGLArray", "emscripten_webgl_destroy_context_before_on_calling_thread", "registerWebGlEventCallback", "runAndAbortIfError", "ALLOC_NORMAL", "ALLOC_STACK", "allocate", "writeStringToMemory", "writeAsciiToMemory" ];

missingLibrarySymbols.forEach(missingLibrarySymbol);

var unexportedSymbols = [ "run", "addOnPreRun", "addOnInit", "addOnPreMain", "addOnExit", "addOnPostRun", "FS_createFolder", "FS_createLink", "FS_readFile", "out", "err", "callMain", "abort", "wasmExports", "stackAlloc", "stackSave", "stackRestore", "getTempRet0", "setTempRet0", "GROWABLE_HEAP_I8", "GROWABLE_HEAP_U8", "GROWABLE_HEAP_I16", "GROWABLE_HEAP_U16", "GROWABLE_HEAP_I32", "GROWABLE_HEAP_U32", "GROWABLE_HEAP_F32", "GROWABLE_HEAP_F64", "writeStackCookie", "checkStackCookie", "writeI53ToI64", "readI53FromI64", "readI53FromU64", "convertI32PairToI53", "convertI32PairToI53Checked", "ptrToString", "zeroMemory", "exitJS", "getHeapMax", "growMemory", "ENV", "MONTH_DAYS_REGULAR", "MONTH_DAYS_LEAP", "MONTH_DAYS_REGULAR_CUMULATIVE", "MONTH_DAYS_LEAP_CUMULATIVE", "isLeapYear", "arraySum", "addDays", "ERRNO_CODES", "ERRNO_MESSAGES", "setErrNo", "inetPton4", "inetNtop4", "inetPton6", "inetNtop6", "readSockaddr", "writeSockaddr", "DNS", "getHostByName", "Protocols", "Sockets", "initRandomFill", "randomFill", "timers", "warnOnce", "UNWIND_CACHE", "readEmAsmArgsArray", "readEmAsmArgs", "runEmAsmFunction", "runMainThreadEmAsm", "jstoi_q", "getExecutableName", "listenOnce", "autoResumeAudioContext", "dynCallLegacy", "dynCall", "handleException", "runtimeKeepalivePush", "runtimeKeepalivePop", "callUserCallback", "maybeExit", "asyncLoad", "alignMemory", "mmapAlloc", "wasmTable", "noExitRuntime", "getCFunc", "freeTableIndexes", "functionsInTableMap", "setValue", "getValue", "PATH", "PATH_FS", "UTF8Decoder", "UTF8ArrayToString", "UTF8ToString", "stringToUTF8Array", "stringToUTF8", "lengthBytesUTF8", "intArrayFromString", "stringToAscii", "UTF16Decoder", "stringToNewUTF8", "stringToUTF8OnStack", "writeArrayToMemory", "JSEvents", "registerKeyEventCallback", "specialHTMLTargets", "maybeCStringToJsString", "findEventTarget", "findCanvasEventTarget", "getBoundingClientRect", "fillMouseEventData", "registerMouseEventCallback", "registerWheelEventCallback", "registerUiEventCallback", "registerFocusEventCallback", "fillFullscreenChangeEventData", "registerFullscreenChangeEventCallback", "JSEvents_requestFullscreen", "JSEvents_resizeCanvasForFullscreen", "registerRestoreOldStyle", "setLetterbox", "currentFullscreenStrategy", "restoreOldWindowedStyle", "doRequestFullscreen", "fillPointerlockChangeEventData", "registerPointerlockChangeEventCallback", "requestPointerLock", "fillVisibilityChangeEventData", "registerVisibilityChangeEventCallback", "registerTouchEventCallback", "fillGamepadEventData", "registerGamepadEventCallback", "registerBeforeUnloadEventCallback", "setCanvasElementSizeCallingThread", "setCanvasElementSizeMainThread", "setCanvasElementSize", "getCanvasSizeCallingThread", "getCanvasSizeMainThread", "getCanvasElementSize", "demangle", "demangleAll", "getEnvStrings", "doReadv", "doWritev", "safeSetTimeout", "promiseMap", "uncaughtExceptionCount", "exceptionLast", "exceptionCaught", "ExceptionInfo", "Browser", "setMainLoop", "wget", "SYSCALLS", "getSocketFromFD", "getSocketAddress", "preloadPlugins", "FS_modeStringToFlags", "FS_getMode", "FS_stdin_getChar_buffer", "FS_stdin_getChar", "FS", "MEMFS", "TTY", "PIPEFS", "SOCKFS", "tempFixedLengthArray", "miniTempWebGLFloatBuffers", "miniTempWebGLIntBuffers", "heapObjectForWebGLType", "heapAccessShiftForWebGLHeap", "webgl_enable_WEBGL_multi_draw", "GL", "emscriptenWebGLGet", "computeUnpackAlignedImageSize", "colorChannelsInGlTextureFormat", "emscriptenWebGLGetTexPixelData", "__glGenObject", "emscriptenWebGLGetUniform", "webglGetUniformLocation", "webglPrepareUniformLocationsBeforeFirstUse", "webglGetLeftBracePos", "emscriptenWebGLGetVertexAttrib", "__glGetActiveAttribOrUniform", "emscripten_webgl_power_preferences", "AL", "GLUT", "EGL", "GLEW", "IDBStore", "emscriptenWebGLGetIndexed", "webgl_enable_WEBGL_draw_instanced_base_vertex_base_instance", "webgl_enable_WEBGL_multi_draw_instanced_base_vertex_base_instance", "allocateUTF8", "allocateUTF8OnStack", "PThread", "terminateWorker", "killThread", "cleanupThread", "registerTLSInit", "cancelThread", "spawnThread", "exitOnMainThread", "proxyToMainThread", "proxiedJSCallArgs", "invokeEntryPoint", "checkMailbox" ];

unexportedSymbols.forEach(unexportedRuntimeSymbol);

var calledRun;

dependenciesFulfilled = function runCaller() {
 if (!calledRun) run();
 if (!calledRun) dependenciesFulfilled = runCaller;
};

function callMain(args = []) {
 assert(runDependencies == 0, 'cannot call main when async dependencies remain! (listen on Module["onRuntimeInitialized"])');
 assert(__ATPRERUN__.length == 0, "cannot call main when preRun functions remain to be called");
 var entryFunction = _main;
 args.unshift(thisProgram);
 var argc = args.length;
 var argv = stackAlloc((argc + 1) * 4);
 var argv_ptr = argv;
 args.forEach(arg => {
  GROWABLE_HEAP_U32()[((argv_ptr) >> 2)] = stringToUTF8OnStack(arg);
  argv_ptr += 4;
 });
 GROWABLE_HEAP_U32()[((argv_ptr) >> 2)] = 0;
 try {
  var ret = entryFunction(argc, argv);
  exitJS(ret, /* implicit = */ true);
  return ret;
 } catch (e) {
  return handleException(e);
 }
}

function stackCheckInit() {
 assert(!ENVIRONMENT_IS_PTHREAD);
 _emscripten_stack_init();
 writeStackCookie();
}

function run(args = arguments_) {
 if (runDependencies > 0) {
  return;
 }
 if (!ENVIRONMENT_IS_PTHREAD) stackCheckInit();
 if (ENVIRONMENT_IS_PTHREAD) {
  initRuntime();
  startWorker(Module);
  return;
 }
 preRun();
 if (runDependencies > 0) {
  return;
 }
 function doRun() {
  if (calledRun) return;
  calledRun = true;
  Module["calledRun"] = true;
  if (ABORT) return;
  initRuntime();
  preMain();
  if (Module["onRuntimeInitialized"]) Module["onRuntimeInitialized"]();
  if (shouldRunNow) callMain(args);
  postRun();
 }
 if (Module["setStatus"]) {
  Module["setStatus"]("Running...");
  setTimeout(function() {
   setTimeout(function() {
    Module["setStatus"]("");
   }, 1);
   doRun();
  }, 1);
 } else {
  doRun();
 }
 checkStackCookie();
}

function checkUnflushedContent() {
 var oldOut = out;
 var oldErr = err;
 var has = false;
 out = err = x => {
  has = true;
 };
 try {
  _fflush(0);
  [ "stdout", "stderr" ].forEach(function(name) {
   var info = FS.analyzePath("/dev/" + name);
   if (!info) return;
   var stream = info.object;
   var rdev = stream.rdev;
   var tty = TTY.ttys[rdev];
   if (tty && tty.output && tty.output.length) {
    has = true;
   }
  });
 } catch (e) {}
 out = oldOut;
 err = oldErr;
 if (has) {
  warnOnce("stdio streams had content in them that was not flushed. you should set EXIT_RUNTIME to 1 (see the Emscripten FAQ), or make sure to emit a newline when you printf etc.");
 }
}

if (Module["preInit"]) {
 if (typeof Module["preInit"] == "function") Module["preInit"] = [ Module["preInit"] ];
 while (Module["preInit"].length > 0) {
  Module["preInit"].pop()();
 }
}

var shouldRunNow = true;

if (Module["noInitialRun"]) shouldRunNow = false;

run();
