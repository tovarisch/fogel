var lodash            = require("lodash");
var fs                = require("fs");
var os                = require("os");
var colors            = require("colors");
var path              = require("path");
var util              = require("util");

var Type = require("./Type.js");
var Blank = require("./Blank.js");
var List = require("./List.js");
var _String = require("./builtinTypes/_String.js");

module.exports = {
    lists: {},

    types: {},

    blanks: {},

    outputPath: "", //@TODO

    isInitialized: false,

    addList: function addList(listData) {
        if (this.isInitialized) {
            throw new Error("Adding new list while storage is initialized; list: " + listData);
        }

        var list = new List(listData);

        this.lists[list.name] = list;
    },

    addType: function addType(typeData) {
        if (this.isInitialized) {
            throw new Error("Adding new type while storage is initialized; type: " + typeData);
        }

        var type = new Type(typeData);

        this.types[type.name] = type;
    },

    addBlank: function addBlank(blankData) {
        if (this.isInitialized) {
            throw new Error("Adding new blank while storage is initialized; blank: " + blankData);
        }

        var blank = new Blank(blankData);

        this.blanks[blank.name] = blank;
    },

    settleReferences: function settle() {
        this.isInitialized = true;

        lodash.forOwn(this.lists, (list) => {
            list.settleReferences();
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
            default:
                {
                    throw new Error("No type found: " + name);
                }
        }
    },

    generateSource: function generateSource() {
        this.generateClasses();
        this.generateFabric();
    },

    generateClasses: function generateClasses() {
        this.blanks.forEach((blank) => {
            var text = blank.generateClass();

            fs.writeFileSync(this.outputPath + "/" + blank.getClassFileName() + ".js", text);
        });
    },

    generateFabric: function generateFabric() {

    }
};
