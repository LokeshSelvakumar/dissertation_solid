export type AjaxResult = {
  [message: string]: any;
};

export type companyRequests = {
  [message: string]: any;
  value: object;
}

export interface Months {
  value: number;
  viewValue: string;
}

export interface ShortAnswers {
  value: boolean;
  viewValue: string;
}

export interface checkBoxTask {
  name: string;
  completed: boolean;
  subtasks?: checkBoxTask[];
}