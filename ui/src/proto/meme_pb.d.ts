// package: 
// file: proto/meme.proto

import * as jspb from "google-protobuf";

export class Meme extends jspb.Message {
  getId(): string;
  setId(value: string): void;

  getUrl(): string;
  setUrl(value: string): void;

  clearOplogList(): void;
  getOplogList(): Array<OperationMap[keyof OperationMap]>;
  setOplogList(value: Array<OperationMap[keyof OperationMap]>): void;
  addOplog(value: OperationMap[keyof OperationMap], index?: number): OperationMap[keyof OperationMap];

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Meme.AsObject;
  static toObject(includeInstance: boolean, msg: Meme): Meme.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Meme, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Meme;
  static deserializeBinaryFromReader(message: Meme, reader: jspb.BinaryReader): Meme;
}

export namespace Meme {
  export type AsObject = {
    id: string,
    url: string,
    oplogList: Array<OperationMap[keyof OperationMap]>,
  }
}

export class CreateMemeParams extends jspb.Message {
  getTemplatename(): string;
  setTemplatename(value: string): void;

  clearTargetinputsList(): void;
  getTargetinputsList(): Array<TargetInput>;
  setTargetinputsList(value: Array<TargetInput>): void;
  addTargetinputs(value?: TargetInput, index?: number): TargetInput;

  hasDebug(): boolean;
  clearDebug(): void;
  getDebug(): boolean;
  setDebug(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CreateMemeParams.AsObject;
  static toObject(includeInstance: boolean, msg: CreateMemeParams): CreateMemeParams.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: CreateMemeParams, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CreateMemeParams;
  static deserializeBinaryFromReader(message: CreateMemeParams, reader: jspb.BinaryReader): CreateMemeParams;
}

export namespace CreateMemeParams {
  export type AsObject = {
    templatename: string,
    targetinputsList: Array<TargetInput.AsObject>,
    debug: boolean,
  }
}

export class TargetInput extends jspb.Message {
  getValue(): string;
  setValue(value: string): void;

  getKind(): TargetInput.KindMap[keyof TargetInput.KindMap];
  setKind(value: TargetInput.KindMap[keyof TargetInput.KindMap]): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TargetInput.AsObject;
  static toObject(includeInstance: boolean, msg: TargetInput): TargetInput.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: TargetInput, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TargetInput;
  static deserializeBinaryFromReader(message: TargetInput, reader: jspb.BinaryReader): TargetInput;
}

export namespace TargetInput {
  export type AsObject = {
    value: string,
    kind: TargetInput.KindMap[keyof TargetInput.KindMap],
  }

  export interface KindMap {
    B64: 0;
    URL: 1;
    TEXT: 2;
  }

  export const Kind: KindMap;
}

export class GetTemplatesParams extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetTemplatesParams.AsObject;
  static toObject(includeInstance: boolean, msg: GetTemplatesParams): GetTemplatesParams.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GetTemplatesParams, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetTemplatesParams;
  static deserializeBinaryFromReader(message: GetTemplatesParams, reader: jspb.BinaryReader): GetTemplatesParams;
}

export namespace GetTemplatesParams {
  export type AsObject = {
  }
}

export class Target extends jspb.Message {
  getFriendlyname(): string;
  setFriendlyname(value: string): void;

  hasTopleft(): boolean;
  clearTopleft(): void;
  getTopleft(): Point | undefined;
  setTopleft(value?: Point): void;

  hasSize(): boolean;
  clearSize(): void;
  getSize(): Point | undefined;
  setSize(value?: Point): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Target.AsObject;
  static toObject(includeInstance: boolean, msg: Target): Target.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Target, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Target;
  static deserializeBinaryFromReader(message: Target, reader: jspb.BinaryReader): Target;
}

export namespace Target {
  export type AsObject = {
    friendlyname: string,
    topleft?: Point.AsObject,
    size?: Point.AsObject,
  }
}

export class Point extends jspb.Message {
  getX(): number;
  setX(value: number): void;

  getY(): number;
  setY(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Point.AsObject;
  static toObject(includeInstance: boolean, msg: Point): Point.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Point, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Point;
  static deserializeBinaryFromReader(message: Point, reader: jspb.BinaryReader): Point;
}

export namespace Point {
  export type AsObject = {
    x: number,
    y: number,
  }
}

export class Template extends jspb.Message {
  getName(): string;
  setName(value: string): void;

  hasSize(): boolean;
  clearSize(): void;
  getSize(): Point | undefined;
  setSize(value?: Point): void;

  clearTargetsList(): void;
  getTargetsList(): Array<Target>;
  setTargetsList(value: Array<Target>): void;
  addTargets(value?: Target, index?: number): Target;

  getUrl(): string;
  setUrl(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Template.AsObject;
  static toObject(includeInstance: boolean, msg: Template): Template.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Template, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Template;
  static deserializeBinaryFromReader(message: Template, reader: jspb.BinaryReader): Template;
}

export namespace Template {
  export type AsObject = {
    name: string,
    size?: Point.AsObject,
    targetsList: Array<Target.AsObject>,
    url: string,
  }
}

export class TemplateList extends jspb.Message {
  clearTemplatesList(): void;
  getTemplatesList(): Array<Template>;
  setTemplatesList(value: Array<Template>): void;
  addTemplates(value?: Template, index?: number): Template;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TemplateList.AsObject;
  static toObject(includeInstance: boolean, msg: TemplateList): TemplateList.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: TemplateList, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TemplateList;
  static deserializeBinaryFromReader(message: TemplateList, reader: jspb.BinaryReader): TemplateList;
}

export namespace TemplateList {
  export type AsObject = {
    templatesList: Array<Template.AsObject>,
  }
}

export class Ping extends jspb.Message {
  getMessage(): string;
  setMessage(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Ping.AsObject;
  static toObject(includeInstance: boolean, msg: Ping): Ping.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Ping, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Ping;
  static deserializeBinaryFromReader(message: Ping, reader: jspb.BinaryReader): Ping;
}

export namespace Ping {
  export type AsObject = {
    message: string,
  }
}

export class OpLog extends jspb.Message {
  getStep(): number;
  setStep(value: number): void;

  getOp(): OperationMap[keyof OperationMap];
  setOp(value: OperationMap[keyof OperationMap]): void;

  getDuration(): string;
  setDuration(value: string): void;

  getDebugoutput(): string;
  setDebugoutput(value: string): void;

  getFile(): string;
  setFile(value: string): void;

  clearArgsList(): void;
  getArgsList(): Array<string>;
  setArgsList(value: Array<string>): void;
  addArgs(value: string, index?: number): string;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): OpLog.AsObject;
  static toObject(includeInstance: boolean, msg: OpLog): OpLog.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: OpLog, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): OpLog;
  static deserializeBinaryFromReader(message: OpLog, reader: jspb.BinaryReader): OpLog;
}

export namespace OpLog {
  export type AsObject = {
    step: number,
    op: OperationMap[keyof OperationMap],
    duration: string,
    debugoutput: string,
    file: string,
    argsList: Array<string>,
  }
}

export interface OperationMap {
  SHRINK: 0;
  DISTORT: 1;
  COMPOSITE: 2;
  TEXT: 3;
  RECT: 4;
}

export const Operation: OperationMap;

