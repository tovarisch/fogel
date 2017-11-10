var lodash = require("lodash");

var _String = require("./builtinTypes/_String.js");
var Reference = require("./builtinTypes/Reference.js");
var List = require("./builtinTypes/List.js");
var Numeric = require("./builtinTypes/Numeric.js");

var Storage = {
    tables: {},

    types: {},

    blanks: {},

    /**
     * @function addTable
     * @param  {type} tableData {description}
     * @return {type} {description}
     */
    addTable: function addTable(table) {
        if (this.tables[table.name]) {
            throw new Error("Enum already exists: " + table);
        }

        this.tables[table.name] = table;
    },

    addType: function addType(type) {
        if (this.types[type.name]) {
            throw new Error("Type already exists: " + type);
        }

        this.types[type.name] = type;
    },

    addBlank: function addBlank(blank) {
        if (this.blanks[blank.name]) {
            throw new Error("Blank already exists: " + blank);
        }

        this.blanks[blank.name] = blank;
    },

    settleReferences: function settle() {
        this.isInitialized = true;

        lodash.forOwn(this.tables, (table) => {
            table.settleReferences();
        });

        lodash.forOwn(this.types, (type) => {
            type.settleReferences();
        });

        lodash.forOwn(this.blanks, (blank) => {
            blank.settleReferences();
        });
    },

    getType: function getType(name) {
        switch (name) {
            case "string":
                {
                    return new _String();
                }
            case "reference":
                {
                    return new Reference();
                }
            case "list":
                {
                    return new List();
                }
            case "uint32":
                {
                    return new Numeric("uint32");
                }
            default:
                {
                    if (this.types[name]) {
                        return this.types[name];
                    } else {
                        throw new Error("No type found: " + name);
                    }
                }
        }
    }
};

module.exports = Storage;