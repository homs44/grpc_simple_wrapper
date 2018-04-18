let path = require("path");
let grpc = require("grpc");
const DIR_PROTO = path.join(__dirname,"../protos/Transfer.proto")
let TransferService  = grpc.load(DIR_PROTO);
let util = require("./util");

class BaseModelWrapper{

    constructor(model){
        this.model = model;
        this.send = this.send.bind(this);
    }


    send(call,callback){

        let temp = [];
        console.log(call.request.inputs)

        call.request.inputs.forEach((item)=>{
            let itemWrapper = util.protobufToDict(item.input);
            if(itemWrapper!==null){
                temp.push(itemWrapper)
            }
        });


        let input;

        if(temp.length===1){
            input = temp[0]
        }else{
            input = temp
        }

        console.log("before  ================= input ")
        console.log(input)
        this.model.send(input,(err,result)=>{
            let outputs = [];

            if(result instanceof Array){
                for(let item in result){
                    let output = util.dictToProtobuf(item);
                    if(output!==null){
                        outputs.push({output:output});
                    }
                }
                console.log("before  ================= output ")
                outputs.forEach(item=>{
                    console.log(item.output)
                })

                callback(null,outputs);
            }else if(result instanceof Object){
                let output = util.dictToProtobuf(result);
                if(output!==null){
                    outputs.push({output:output});
                }
                console.log("before  ================= output ")
                outputs.forEach(item=>{
                    console.log(item.output)
                })

                callback(null,outputs);
            }else{
                callback(new Error("data should be object or array"));
            }
        })
    }
}

class BaseModel{
    constructor(){

    }

    send(data,callback){
        throw new Error("you have to implement the method!!")
    }
}

let createServer = (model, ip="localhost",port=50051)=>{
    if(model===null){
        throw new Error("model should not be null!!");
    }

    let modelWrapper = new BaseModelWrapper(model);

    let server = new grpc.Server();
    server.addService(TransferService.Transfer.service,{
        send:modelWrapper.send
    });
    let ip_port = ip+":"+port;
    server.bind(ip_port, grpc.ServerCredentials.createInsecure());
    return server;
};

module.exports =  {
    createServer,
    BaseModel
}