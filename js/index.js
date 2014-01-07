var known = {};//inputs have seen, with mapped value as expectation {func,expected,result,error}
var num = 0;
var LIMIT = 20;
var never = "!@#$%^&*()_+";
var timeout = 0;
var stopAll = false;
var functions = [];//patterns to use
var replayThreshhold = 1;   //if there's at least 1 new known, restart playing
var playNum=0;
var playing = false;
var levelThreshold = 0;

window.onload = function(){
    var input = document.getElementById("newTerm");
    var output = document.getElementById("output");
    var submit = document.getElementById("submit");
    var stop = document.getElementById("stop");
    input.focus();
    submit.addEventListener('click',function(){
        var limit = document.getElementById("limit").value;
        var timeout = document.getElementById("timeout").value;
        if(limit!="")
            LIMIT = Number(limit);
        if(timeout!="")
            timeout=Number(timeout);
        moreInput(input, output);
    });
    stop.addEventListener('click', function(){
        stopAll=true;
    });
    document.getElementById("clear").addEventListener('click', function(){
        stopAll=false;
        output.innerHTML="";
    });
    functions.push(compareByString);
    
};

function foolAround(inputElement, output){
    if(stopAll) return;
    feedback(output,"start fooling");
    var finput = inputElement.value;
    
    setTimeout(function(){
        start = new Date();
        play(finput,output);
    },timeout);
    
}

//dynamic part
function play(input, output){
    if(stopAll){
        playNum--;
        return;
    }
    //feedback(output,"start playing");
    setTimeout(function(){
        playNum++;
        try{
            if((known[input]==null || known[input].result==null)&& num<LIMIT){
                known[input]={func:null};
                num++;
                var result = eval(input);
                feedback(output, "playnum:"+playNum+"\n"+input+"=>"+result+"  allKnown:"+num);
                //TODO: get an expectation based on the input, if the result is the same, not interesting. Otherwise, remember it
                known[input].result=result;
                //TODO: check result to see if there's new lexicon, if there is, fool more; if input has pattern with known lexicon, play known ones with the pattern
                for(var i in known){
                    play(input+i, output);
                    play(i+input, output);
                }
            }else if(num>=LIMIT){
                //play and conclude don't happen concurrently. restart playing after concluding
                //only start conclude in the last play
                if(playNum>1 || stopAll){
                    playNum--;
                    return;
                }
                setTimeout(function(){conclude(input,output)}, timeout);
                stopAll=true;
            }
            playNum--;
        }
        catch(err){
            playNum--;
            feedback(output, err+"  allKnown:"+num)
            known[input].result=result;
            known[input].error=true;
        };
    },timeout);
}
// generate patterns, reduce knowns; have to include input, as new input can be critical for unsolved
// built in: compare strictly by string
// MUST: if playing, don't enter
function conclude(input, output){
    if(num>=LIMIT*2)
        return; 
    else{
        feedback(output, "in conclude");
    }
    var newFound = 0;
    var knownFunc = new Set();
    var newFoundList = [];
    for(var i in known){
        var k = known[i];
        for(var j in functions){
            if(k.func==null&&k.result!=null){
                if(functions[j].apply(null,[i, k.result])){
                    if(!(functions[j] in knownFunc)){
                        k.func=functions[j];
                        knownFunc.add(functions[j]);
                    }else{
                        //seen it, bored, discard
                        delete known[i];
                        num--;
                        continue;
                    }
                    
                }
            }
        }
        //if nothing fits, get the strange things
        if(k!=null&&k.hasOwnProperty('func')&&k.func==null&&k.result!=null){
            var diff =diffstring(i, k.result);
            for(var i in diff){
                if(!(diff[i] in known)){
                    known[diff[i]]={func:null,result:null};
                    newFoundList.push(diff[i]);
                    newFound++;
                    num++;
                    feedback(output, "playnum:"+playNum+"\n"+((new Date())-start)+"ms\n"+num+" Adding "+diff[i]);
                }
            }
        }
    }
    //for now only replay after concluding is done, can be whenever find a new thing
    if(newFound>=replayThreshhold){
        resetCounter();
        for(var i=0;i<newFoundList.length;i++){
            play(newFoundList[i],output);
        }
    }else{
        feedback(output, ((new Date())-start)+"ms\n"+"Nothing new found! Stop everything",1);
    }
}

function resetCounter(){
    stopAll=false;
    num=0;
    
}

function compareByString(i1,i2){
    /*hack: somehow i1 can be undefined!
    if(!i1 in window || !i2 in window)
        return true;*/
    return i1.toString()==i2.toString();
}

// compare two strings, return all charactors different from str1
// TODO: generate pattern of str1->str2 if possible
function diffstring(str1, str2){
    var str1 = str1.toString();
    var str2= str2.toString();
    if(str1==str2)
        return [];
    else{
        var diff = [];
        var set = new Set();
        for(var i in str1){
            set.add(str1[i]);
        }
        for(var i in str2){
            if(!(str2[i] in set))
                diff.push(str2[i]);
        }
        return diff;
    }
}

function moreInput(input, output){
    if(input.value!="")
        foolAround(input, output)
}
function feedback(output, str, level){
    if(levelThreshold==-1 || level>levelThreshold)
        output.appendChild(outputInParagraph(str));
}

function outputInParagraph(str){
    var p = document.createElement("p");
    p.appendChild(document.createTextNode(str));
    return p;
}

var Set = function() {}
Set.prototype.add = function(o) {this[o] = true;}
Set.prototype.remove = function(o) {delete this[o];}