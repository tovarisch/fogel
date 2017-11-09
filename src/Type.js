var lodash = require("lodash");
var util = require("util");
var TypeField = require("./TypeField.js");

var Type = function Type(typeData) {
    if (!typeData.__name) {
        throw new Error("No name field in Type: " + util.inspect(typeData));
    }

    this.name       = typeData.__name;
    this.fields     = {};
    this.__typeData = typeData;
};

Type.prototype.settleReferences = function settleReferences() {
    lodash.forOwn(this.__typeData, (value, key) => {
        this.fields[key] = new TypeField(value);
        this.fields[key].settleReferences();
    });
};

module.exports = Type;