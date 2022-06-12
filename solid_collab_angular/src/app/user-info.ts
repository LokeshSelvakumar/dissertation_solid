export class user{
    private fullName:String;
    private DOB:String;
    private nickName:String;
    private type:String;
    private organizationName:String;
    private role:String;

    constructor(fullName:String, DOB:String,nickName:String, type:String,organizationName:String,role:String){
        this.fullName = fullName;
        this.DOB = DOB;
        this.nickName = nickName;
        this.type = type;
        this.organizationName = organizationName;
        this.role = role;
    }

    getFullName():String{
        return this.fullName;
    }
    getDOB():String{
        return this.DOB;
    }
    getnickName():String{
        return this.nickName;
    }
    getOrganization():String{
        return this.organizationName;
    }
    getType():String{
        return this.type;
    }
}