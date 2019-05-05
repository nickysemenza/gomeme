// package: 
// file: proto/meme.proto

import * as jspb from "google-protobuf";

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

  hasTargets(): boolean;
  clearTargets(): void;
  getTargets(): Target | undefined;
  setTargets(value?: Target): void;

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
    targets?: Target.AsObject,
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

