var utils = require("utils");
var Storage = require("./Storage.js");

var TypeField = function TypeField(name, data) {
    if (!data.type) {
        throw new Error("No type in TypeField " + name + " : " + utils.inspect(data));
    }

    this.name       = name;
    this.type       = null;
    this.baseType   = null;
    this.__data     = data;
};

TypeField.prototype.settleReferences = function settleReferences() {
    this.type = Storage.getType(this.__data.type);

    if (this.__data.__baseType) {
        this.baseType = Storage.getType(this.__data.__baseType);
    }
};

module.exports = TypeField;