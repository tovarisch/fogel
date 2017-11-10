var os            = require("os");
var lodash        = require("lodash");
var util          = require("util");
var TypeField     = require("./TypeField.js");
var reservedKeys  = require("../reservedKeys.js");

/**
 * @class Type
 * @param  {*} typeData
 */
var Type = function Type(typeData) {
    if (!typeData.__name) {
        throw new Error("No name field in Type: " + util.inspect(typeData));
    }

    this.name       = typeData.__name;
    this.fields     = {};
    this.baseType   = null;
    this.__typeData = typeData;
};

/**
 * @function settleReferences
 */
Type.prototype.settleReferences = function settleReferences() {
    lodash.forOwn(this.__typeData, (value, key) => {
        if (reservedKeys.indexOf(key) !== -1) {
            return;
        }

        this.fields[key] = new TypeField(key, value);
        this.fields[key].settleReferences();
    });

    if (this.__typeData.__baseType) {
        this.baseType = Storage.getType(this.__typeData.__baseType);
    }
};

/**
 * @function isHaveRequirements
 * @return {boolean} is this type have some requirements to include with code in file
 */
Type.prototype.isHaveRequirements = function isHaveRequirements() {
    return true;
};

/**
 * @function getRequirements
 * @return {Array} Array of requirements
 */
Type.prototype.getRequirements = function getRequirements() {
    return [
        {
            name: this.name,
            path: `./${this.name}.js`
        }
    ];
};

/**
 * @function getFieldDescription
 * @return {String} description of field of this type to write in parent type class code
 */
Type.prototype.getFieldDescription = function getFieldDescription() {
    return "null";
};

/**
 * @function getClassFileName
 * @return {string} Name for a file to write type class code
 */
Type.prototype.getClassFileName = function getClassFileName() {
    return this.name;
};

/**
 * @function generateClass
 * @return {string} string representing type class code
 */
Type.prototype.generateClass = function generateClass() {
    var classString = ``;

    //requirements
    lodash.forOwn(this.fields, (field) => {
        if (field.isHaveRequirements()) {
            field.getRequirements().forEach((requirement) => {
                classString += `var ${requirement.name} = require("${requirement.path}");` + os.EOL;
            });
        }
    });

    classString += os.EOL;

    //Open constructor function
    classString += `var ${this.name} = function ${this.name}(data) {` + os.EOL;

    lodash.forOwn(this.fields, (field) => {
        classString += `this.${field.name} = ${field.getFieldDescription()};`;
    });

    classString += os.EOL;

    //Close constructor function
    classString += `};` + os.EOL;
    classString += `module.exports = ${this.name};` + os.EOL;

    return classString;
};

module.exports = Type;