
class html2 {

    constructor (){
   
        //Convert json to dest object
        var toTemplate=(json,$html)=> {

            //Create the html
            if(!Array.isArray(json)) $html.append(obj2Template(json));
            else {
                for(let i=0; i < json.length; i++)
                    $html.append(obj2Template(json[i]));
            } 
        }
        
        //Convert json template to html
        function obj2Template(json) {
            
            //Make sure we have a tag object
            let tag = json['<>'] || json['tag'];
            if(!tag) throw "Missing required attribute <>";
            
            //Create element
            let $obj = $("<" + tag + "/>");
            
            //Add the other attributes (except for the html)
            for(let prop in json){
                
                let _prop = prop.toLowerCase();
                
                switch(_prop){
                    case '<>':
                        //Do nothing
                    break;
                    
                    case 'html':
                        //Add the html object
                        // transform any children if necessary
                        if(typeof(json['html']) === 'string') $obj.html(json['html']);
                        else toTemplate(json['html'],$obj);
                    break;
                    
                    default:
                        //Add the other properties as html attributes
                        $obj.attr(_prop,json[prop]);
                    break;
                }
            }
            
            return($obj);
        }
        
        //Convert obj or array to transform
        function toTransform(obj) {
            
            let json;
            
            if( obj.length === 1 ) json = obj2Transform($(obj));
            else {
                json = [];
                
                for(let child of obj)
                    json.push(obj2Transform($(child)));
            } 
        
            return(json);
        }
        
        //Convert obj to transform
        function obj2Transform(obj) {
            
            //Get the DOM element
            let el = $(obj).get(0);
        
            //Add the tag element
            let json = {'<>':el.nodeName.toLowerCase()};
        
            for (let attr, i=0, attrs=el.attributes, l=attrs.length; i<l; i++){
                attr = attrs[i];
                json[attr.nodeName] = escapeJSON(attr.value);
            }
            
            let children = $(obj).children();
        
            if( children.length > 0 ) json['html'] = [];
            else {
                //Get the text
                let text = $(obj).text();
                
                //Make sure we have some text to use
                if(text.length) json['text'] = escapeJSON(text).trim();
            }
        
            //Add the children
            for(let child of children)
                json['html'].push( obj2Transform(child) );
        
            return(json);
        }
        
        //Format JSON (with indents)
        function formatJSON(oData, sIndent) {
            
            if (arguments.length < 2) sIndent = "";
            
            let sIndentStyle = "  ",
                sDataType = RealTypeOf(oData),
                sHTML;
        
            // open object
            if (sDataType == "array") {
                if (oData.length == 0) {
                    return "[]";
                }
                sHTML = "[";
            } else {
                let iCount = 0;
                $.each(oData, function() {
                    iCount++;
                    return;
                });
                if (iCount == 0) { // object is empty
                    return "{}";
                }
                sHTML = "{";
            }
        
            // loop through items
            let iCount = 0;
            $.each(oData, function(sKey, vValue) {
                if (iCount > 0) {
                    sHTML += ",";
                }
                if (sDataType == "array") {
                    sHTML += ("\n" + sIndent + sIndentStyle);
                } else {
                    sHTML += ("\"" + sKey + "\"" + ":");
                }
        
                // display relevant data type
                switch (RealTypeOf(vValue)) {
                    case "array":
                    case "object":
                        sHTML += formatJSON(vValue, (sIndent + sIndentStyle));
                        break;
                    case "boolean":
                    case "number":
                        sHTML += vValue.toString();
                        break;
                    case "null":
                        sHTML += "null";
                        break;
                    case "undefined":
                    break;
                    case "string":
                        sHTML += ("\"" + escapeJSON(vValue) + "\"");
                        break;
                    default:
                        sHTML += ("TYPEOF: " + typeof(vValue));
                }
        
                // loop
                iCount++;
            });
        
            // close object
            if (sDataType == "array") {
                sHTML += ("\n" + sIndent + "]");
            } else {
                sHTML += ("}");
            }
        
            // return
            return sHTML;
        }
        
        //Get the type of the obj (can replace by jquery type)
        function RealTypeOf(v) {
            
            if (v === undefined) return "undefined";
        
            if (typeof(v) !== "object") return typeof(v);
        
            if (v === null) return "null";
            if (v.constructor == (new Array).constructor) return "array";
            if (v.constructor == (new Date).constructor) return "date";
            if (v.constructor == (new RegExp).constructor) return "regex";
            return "object";
        
        }
        
        function escapeJSON(str) {
            return str.replace(/[\n\r]/g, "")
                    .replace(/\\'/g, "\\'")
                    .replace(/\\"/g, '\\"')
                    .replace(/\\&/g, "\\&")
                    .replace(/\\r/g, "\\r")
                    .replace(/\\t/g, "\\t")
                    .replace(/\\b/g, "\\b")
                    .replace(/\\f/g, "\\f");
            
        }
        this.toJSON = ($body)=>{
            return formatJSON(toTransform($body))
        }
    }
      

}
window.html2 = new html2()
	//debugger