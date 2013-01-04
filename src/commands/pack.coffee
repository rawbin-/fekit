compiler = require "../compiler/compiler"
utils = require "../util"

exports.usage = "合并项目文件"

exports.set_options = ( optimist ) ->
    optimist

exports.run = ( options ) ->


    script_global =
        EXPORT_LIST : []
        EXPORT_MAP : {}
        util : utils

    conf = utils.config.parse( options.cwd )

    iter = (srcpath, parents, opts, doneCallback) ->
            utils.logger.log( "正在处理 #{srcpath}" )
            urlconvert = new utils.UrlConvert( srcpath , options.cwd )
            urlconvert.set_no_version() if opts.no_version 
            dest = urlconvert.to_dev()
            _done = ( err , source ) -> 
                    if err 
                        utils.logger.error( err.toString() )
                        utils.exit(1)
                        return

                    new utils.file.writer().write( dest , source )
                    utils.logger.log( "已经处理 #{srcpath}  ==> #{dest}" )
                    doneCallback()

            compiler.compile srcpath , { dependencies_filepath_list : parents } , _done
                
    done = () -> 
            conf.doScript "postpack" , script_global
            utils.logger.log("DONE.")

    conf.each_export_files ( srcpath ) ->
        iter = 
            url : srcpath 
            path : srcpath.replace( options.cwd , "" )
            
        script_global.EXPORT_MAP[ srcpath ] = iter
        script_global.EXPORT_LIST.push iter

    conf.doScript "prepack" , script_global 

    conf.each_export_files_async iter , done
