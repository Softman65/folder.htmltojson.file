const puppeteer = require('puppeteer');
const {readFileSync, writeFileSync , existsSync , watch } = require('node:fs');
const path = require('node:path');

//process.exit()
module.exports =async (params)=>{
    console.log(process.cwd())

    const addScriptToPage = async (page, nameScfFile) => {
        const file = readFileSync(path.resolve( `${__dirname}/jsClient`, nameScfFile), 'utf8');
        await page.addScriptTag({ content: file , type:'module' });
    }


    const paramsBrow = {
        headless: true,
       // args: ['--no-startup-window', '--no-first-run'],
    }
    //const browser = await puppeteer.launch(paramsBrow)
    //const pages = await browser.pages();  
    //debugger 
    
    //console.log(process.argv,pages)
    const openInBrowser= async(fileIn, fileOut)=>{
        const browser = await puppeteer.launch(params.puppeter)
        const pages = await browser.pages();
        const page = pages[0]

        await page.goto( fileIn  )

        await addScriptToPage( page, 'jquery.min.3.6.3.js')
        await addScriptToPage( page, 'html2json.class.js')
        await page.evaluate(params.injectBrowserClientExec, params)
        
        const $jsonTemplate = await page.evaluate( (varName) => window[varName],'$template' )
        if($jsonTemplate){
            writeFileSync(fileOut, JSON.stringify($jsonTemplate) ) //JSON.stringify($jsonTemplate) )
            console.log( `JSON File ${fileOut} save!!!`)
        }
        await page.close();
        await browser.close();        
        
    }
    const processingFile = async (_out, _file)=>{
       // let cwd = process.cwd()
        let root = _file.split('.')
        root.pop()
        //console.log(root)
        let fileIn = `${process.InFolder}/${_file}`
        let fileOut = `${_out}/${root.join('.')}.json`

        await openInBrowser(fileIn,fileOut)

    } 
    const watch_Process = (eventType, filename)=>{
                
        if(!process.timerID){
            process.timerID = setTimeout(async()=>{
                console.log("The file ", filename, " was modified! ", eventType);
                await processingFile(OutFolder, filename)
                process.watcher.close()
                run()
            },100)
         
        }else{
            clearTimeout(process.timerID)
            delete process.timerID
        }
        
    }
    //const _watch = process.argv[6] == 'watch'
    // output JSON
    const OutFolder = path.normalize(`${process.cwd()}/${params.path.out}`)
    if (!existsSync(OutFolder)){
        console.error (`no existe folder OUT TEMPLATE ${FileArrayTemplates} JSON `)
        process.exit()
    }
    //let $templates = JSON.parse( readFileSync( FileArrayTemplates ))
    process.InFolder = path.normalize(`${process.cwd()}/${params.path.in}`)

    console.log('infolder', process.InFolder)
    
    const run = ()=>{
        process.watcher = watch(process.InFolder, watch_Process )
    }

    run()
}
