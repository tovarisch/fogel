var lodash = require("lodash");
var fs = require("fs");

var Processor = {

    outputPath: "", //@TODO

    generateSource: function generateSource(Storage) {
        this.generateTypesClasses(Storage);
        this.generateFabric(Storage);
    },

    generateTypesClasses: function generateTypesClasses(Storage) {
        lodash.forOwn(Storage.types, (type) => {
            var text = type.generateClass();

            fs.writeFileSync(this.outputPath + "/" + type.getClassFileName() + ".js", text);
        });
    },

    generateFabric: function generateFabric(Storage) {

    }
};

module.exports = Processor;