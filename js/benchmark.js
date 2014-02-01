var startBench=0;
var benchLimit=0;
var benchInput=0;
window.addEventListener('load', function(){
    var bench = document.getElementById("bench");
    bench.addEventListener('click',function(){
        benchLimit = Number(document.getElementById("limit").value);
        //alert(benchLimit);
        startBench = new Date();
        benchTimeout();
    });
});

function benchTimeout(){
    
    if(benchInput<benchLimit){
        setTimeout(function(){
            benchTimeout()
            benchInput++;
        }, 0);
        
        setTimeout(function(){
            benchTimeout()
            benchInput++;
        }, 0);
    }
    else{
        feedback(document.getElementById("output"), ((new Date())-startBench)+"ms", 1);
        return;
    }
}