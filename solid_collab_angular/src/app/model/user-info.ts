import { Optional } from '@angular/core';  
export class User{
    private webId:String;
    private fullName:String;
    private DOB:String;
    private nickName:String;
    private type:String;
    private organizationName:String;
    private role:String;

    constructor( webId:String, type:String, @Optional() fullName:String = "",
     @Optional() DOB:String = "", @Optional() nickName:String = "", @Optional()
      organizationName:String = "",@Optional() role:String =""){
        this.webId = webId;
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