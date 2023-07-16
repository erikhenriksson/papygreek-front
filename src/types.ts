// Typing
export type Dict<Type> = {
  [key: string]: Type;
};

export type StringDict = {
  [key: string]: string;
};

export type NumberDict = {
  [key: string]: number;
};

export type Listener = {
  selector: string;
  callback: Function;
};

export type Listeners = {
  click?: Listener[];
  blur?: Listener[];
  paste?: Listener[];
  keydown?: Listener[];
  keyup?: Listener[];
  change?: Listener[];
  input?: Listener[];
  resize?: Listener[];
};

export type ApiResult = {
  ok: boolean;
  result: any;
};

export type WorkflowHeader = {
  approved: any;
  annotated: any;
  "annotated (previously)": any;
};
