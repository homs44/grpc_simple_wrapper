let path = require("path");
let grpc = require("grpc");
const DIR_PROTO = path.join(__dirname,"../protos/Transfer.proto")
let TransferService  = grpc.load(DIR_PROTO);
let util = require("./util")
class TransferClient{

    constructor(ip, port){

        const dest = ip+":"+port;
        this.client = new TransferService.Transfer(dest,grpc.credentials.createInsecure());
    }

    send(data,callback){
        let inputs = [];

        if(data instanceof Array){
            for(let item in data){
                let input = util.dictToProtobuf(item);
                if(input!==null){
                    inputs.push({input:input});
                }
            }
        }else if(data instanceof Object){
            let input = util.dictToProtobuf(data);
            if(input!==null){
                inputs.push({input:input});
            }
        }else{
            callback(new Error("data should be object or array"));
        }
        console.log("before send================")
        inputs.forEach(item=>{
            console.log(item.input)
        })

        this.client.send(inputs,(err,res)=>{
            if(err){
                callback(err)
            }else{
                let outputs = [];

                console.log("result ====================");
                res.outputs.forEach(o=>{
                    console.log(o.output)
                   let item  = util.protobufToDict(o.output);
                   if(item!==null){
                       outputs.push(item)
                   }
                });
                console.log("result ====================123123123");
                outputs.forEach(out=>{
                    console.log(out)
                })

                if(outputs.length===0){
                    callback(null,null)
                }else if(outputs.length===1){
                    callback(null,outputs[0])
                }else{
                    callback(null,outputs)
                }
            }

        });
    }
}

let createClient = (ip="localhost",port=50051)=>{
    return new TransferClient(ip,port);
};

module.exports =  {
    createClient
}