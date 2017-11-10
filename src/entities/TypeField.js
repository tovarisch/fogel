var util = require("util");
var Storage = require("../Storage.js");

/**
 * @class TypeField
 * @param  {String} name Name of the field in parent type
 * @param  {*} data Raw data of field from type json file
 */
var TypeField = function TypeField(name, data) {
    if (!data.type) {
        throw new Error("No type in TypeField " + name + " : " + util.inspect(data));
    }

    this.name   = name;
    this.type   = null;
    this.item   = null;
    this.id     = null;
    this.__data = data;
};

/**
 * @function settleReferences resolves references in fields
 */
TypeField.prototype.settleReferences = function settleReferences() {
    this.type = Storage.getType(this.__data.type);
};

/**
 * @function isHaveRequirements
 * @return {boolean} is this field contains type which have some requirements to include with code in file
 */
TypeField.prototype.isHaveRequirements = function isHaveRequirements() {
    this.type.isHaveRequirements();
};

/**
 * @function getRequirements
 * @return {Array} Array of requirements of nested type
 */
TypeField.prototype.getRequirements = function getRequirements() {
    return this.type.getRequirements();
};

/**
 * @function getFieldDescription
 * @return {String} description of field type to write in aprent type class code
 */
TypeField.prototype.getFieldDescription = function getFieldDescription() {
    return this.type.getFieldDescription();
};

module.exports = TypeField;