var Storage         = require("../Storage.js");
var util            = require("util");
var lodash          = require("lodash");
var reservedKeys    = require("../reservedKeys.js");
var BlankField        = require("./BlankField.js");

var Blank = function Blank(blankData) {
    if (!blankData.__name) {
        throw new Error("No name field in Blank: " + util.inspect(blankData));
    }

    if (!blankData.__type) {
        throw new Error("No name field in Blank: " + util.inspect(blankData));
    }

    this.name           = blankData.__name;
    this.type           = Storage.getType(blankData.__type);
    this.fields         = {};
    this.__blankData    = blankData;
};

Blank.prototype.settleReferences = function settleReferences() {
    lodash.forOwn(this.__blankData, (fieldData, fieldName) => {
        if (reservedKeys.indexOf(fieldName) !== -1) {
            return;
        }

        this.fields[fieldName] = (new BlankField(fieldName, fieldData));
        this.fields[fieldName].settleReferences();
    });
};

Blank.prototype.getClassFileName = function getClassFileName() {
    return this.name;
};

Blank.prototype.generateClass = function generateClass() {
    var string = "";

    lodash.forOwn(this.fields, (field) => {
        string += field;
    });
};

module.exports = Blank;