babel = require('babel-core')
babelConfig = {
    babelrc:false,
    presets:[require("babel-preset-es2015"), require("babel-preset-react")]
};
exports.contentType = "javascript"

exports.process = ( txt , path , module , cb ) ->
    result = babel.transform(txt,babelConfig)
    try
        cb( null , result.code)
    catch err
        cb( err )
