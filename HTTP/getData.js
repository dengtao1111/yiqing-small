const Http = require('./Http');
class getData extends Http {
 
    static getAll(){
        return this.request({
            url:"https://api.tianapi.com/txapi/ncovcity/index?key=395c73a804a3aac86034b897584b4cf0",
            
        })
    };
    static getHistory(){
        return this.request({
            url:"https://wanshun.zmzhi.com/api/default/history"
        })
    }
}
module.exports=getData