import { Optional } from '@angular/core';
import { checkBoxTask } from '../model/constants';
export class DataAccessRequest {
    private requestedBy: string; // company
    private selectedDate: number;
    private isCopied: boolean;
    private purpose: checkBoxTask;
    private historyOfData:boolean;
    private dataSelling:boolean;

    constructor(requestedBy:string, selectedDate: number, isCopied: boolean, purpose: checkBoxTask, historyOfData:boolean, dataSelling:boolean) {
        this.requestedBy = requestedBy; //company
        this.selectedDate = selectedDate;
        this.isCopied = isCopied;
        this.purpose = purpose;
        this.historyOfData = historyOfData;
        this.dataSelling = dataSelling;
    }

    getDateTillAccess(): number {
        return this.selectedDate;
    }
    getIsCopied(): boolean {
        return this.isCopied;
    }
    getPurpose(): checkBoxTask {
        return this.purpose;
    }
}