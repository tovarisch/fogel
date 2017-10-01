var async              = require("async");
var colors             = require("colors");
var fs                 = require("fs");
var path               = require("path");
var stripJsonComments  = require("strip-json-comments");

var Storage   = require("./src/Storage.js");
var domain    = require("domain").create();

var gatherFiles = function (folderPath, callback) {
    var listsFiles  = [];
    var typesFiles  = [];
    var barsFiles   = [];

    async.waterfall([
        function () {
            fs.readdir(folderPath, next);
        },
        function (files, next) {
            async.forEach(files, function (fileName, next) {
                var filePath = path.join(folderPath, fileName);

                fs.stat(filePath, function(error, stat) {
                    if(error) {
                        next(error);
                        return;
                    }

                    if(stat.isFile()) {
                        if (fileName.slice(-5) === ".list") {
                            listsFiles.push(filePath);                            
                        }
                        else if (fileName.slice(-5) === ".type") {
                            typesFiles.push(filePath);
                        }
                        else if (fileName.slice(-4) === ".bar") {
                            barsFiles.push(filePath);
                        }

                        next();
                        return;
                    }
                    else if(stat.isDirectory()){
                        gatherFiles(filePath, function (error, files) {
                            if (error) {
                                next(error);
                                return;
                            }
                            else {
                                foundFiles = foundFiles.concat(files);
                                next();
                                return;
                            }
                        });
                    }
                } );

            }, function (error) {
                if (error) {
                    next(error);
                }
                else {
                    next(null, foundFiles);
                }
            });
        },
        function (files, next) {
            var jsonFiles = [];

            files.forEach(function (fileName) {
                if (fileName.slice(-4) === "json") {
                    jsonFiles.push(fileName);
                }
            });
            next(null, listsFiles, typesFiles, barsFiles);
        }
    ], callback);
};

domain.enter();

//call start
function main() {
    var listsFiles = [];
    var typesFiles = [];
    var barsFiles = [];
    
    console.log(colors.rainbow("Start processing..."));
    
    Storage.outputPath = process.argv[0];
    
    async.waterfall([
        function (next) {
            async.eachOf(process.argv, function (path, index, next) {
                if (index === 0) {
                    next();
                    return;
                }

                gatherFiles(path, function (error, foundListsFiles, foundTypesFiles, foundBarsFiles) {
                    if (error) {
                        next(error);
                        return;
                    }

                    listsFiles = listsFiles.concat(foundListsFiles);
                    typesFiles = typesFiles.concat(foundTypesFiles);
                    barsFiles = barsFiles.concat(foundBarsFiles);

                    next();
                });
            }, next)
        },
        function (next) {
            console.log(colors.cyan("> loading enums"));

            for (filePath of listsFiles)
            {
                try {
                    var fileContent = JSON.parse(stripJsonComments(fs.readFileSync(filePath).toString()));

                    Storage.addList(new Prototype(prototypeJSON));                    
                } catch (error) {
                    next("Error on parsing file " + filePath + " catch: " + error);
                    break;
                }
            }

            next();
        },
        function (next) {
            console.log(colors.cyan("> loading types"));

            for (filePath of typesFiles)
            {
                try {
                    var fileContent = JSON.parse(stripJsonComments(fs.readFileSync(filePath).toString()));

                    Storage.addType(new Prototype(prototypeJSON));                    
                } catch (error) {
                    next("Error on parsing file " + filePath + " catch: " + error);
                    break;
                }
            }

            next();
        },
        function (next) {
            console.log(colors.cyan("> loading bars"));

            for (filePath of barsFiles)
            {
                try {
                    var fileContent = JSON.parse(stripJsonComments(fs.readFileSync(filePath).toString()));
                
                    Storage.addBar(new Prototype(prototypeJSON));                    
                } catch (error) {
                    next("Error on parsing file " + filePath + " catch: " + error);
                    break;
                }
            }

            next();
        },
        function (next) {
            console.log(colors.cyan("> start code generation"));
            Storage.generateSource();
            next();
        }
    ], function (error) {
        if (error) {
            console.error(colors.bgRed(error));
        }
        console.log(colors.rainbow("Done processing!"));
    });
}

main();
