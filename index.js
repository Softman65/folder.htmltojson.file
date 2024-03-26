const puppeteer = require('puppeteer');
const {readFileSync, writeFileSync , existsSync , watch } = require('node:fs');
const path = require('node:path');

//process.exit()

(async () => {
    console.log(process.cwd())
    const paramsBrow = {
        headless: false,
       // args: ['--no-startup-window', '--no-first-run'],
    }
    const browser = await puppeteer.launch(paramsBrow)
    const pages = await browser.pages();
    console.log(process.argv,pages)

    const processingFile = async ( _in, _out, _file)=>{
        let cwd = process.cwd()
        let root = _file.split('.')
        root.pop()
        console.log(root)
        let fileIn = `${cwd}/${_in}/${_file}`
        let fileOut = `${cwd}/${_out}/${root.join('.')}.json`
    
        await pages[0].goto( fileIn )
    
        let $jsonTemplate = await pages[0].evaluate( (varName) => window[varName],'$json' )
        if($jsonTemplate)
            writeFileSync(fileOut, $jsonTemplate ) //JSON.stringify($jsonTemplate) )
        
        console.log(`processing ... ${$jsonTemplate?'ok':'ignore'}` , fileOut)
    } 

    const _watch = process.argv[6] == 'watch'
    // output JSON
    const FileArrayTemplates = `${process.cwd()}${process.argv[4]}`
    if (!existsSync(FileArrayTemplates)){
        console.error (`no existe TEMPLATE ${FileArrayTemplates} JSON `)
        process.exit()
    }
    let $templates = JSON.parse( readFileSync( FileArrayTemplates ))
    let InFolder = `${process.cwd()}${process.argv[2]}`

    console.log('infolder', InFolder)

    watch(InFolder, (eventType, filename)=>{
                
        if(!process.timerID){
            process.timerID = setTimeout(async()=>{
                console.log("The file ", filename, " was modified! ", eventType);
                await processingFile(process.argv[2], process.argv[3], filename)
            },100)
         
        }else{
            clearTimeout(process.timerID)
            delete process.timerID
        }
        
    })

})()