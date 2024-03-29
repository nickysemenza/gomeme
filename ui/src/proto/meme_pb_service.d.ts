// package: 
// file: proto/meme.proto

import * as proto_meme_pb from "../proto/meme_pb";
import {grpc} from "@improbable-eng/grpc-web";

type APIGetPing = {
  readonly methodName: string;
  readonly service: typeof API;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof proto_meme_pb.Ping;
  readonly responseType: typeof proto_meme_pb.Ping;
};

type APIGetTemplates = {
  readonly methodName: string;
  readonly service: typeof API;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof proto_meme_pb.GetTemplatesParams;
  readonly responseType: typeof proto_meme_pb.TemplateList;
};

type APICreateMeme = {
  readonly methodName: string;
  readonly service: typeof API;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof proto_meme_pb.CreateMemeParams;
  readonly responseType: typeof proto_meme_pb.Meme;
};

type APIGetInfo = {
  readonly methodName: string;
  readonly service: typeof API;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof proto_meme_pb.InfoParams;
  readonly responseType: typeof proto_meme_pb.SystemInfo;
};

export class API {
  static readonly serviceName: string;
  static readonly GetPing: APIGetPing;
  static readonly GetTemplates: APIGetTemplates;
  static readonly CreateMeme: APICreateMeme;
  static readonly GetInfo: APIGetInfo;
}

export type ServiceError = { message: string, code: number; metadata: grpc.Metadata }
export type Status = { details: string, code: number; metadata: grpc.Metadata }

interface UnaryResponse {
  cancel(): void;
}
interface ResponseStream<T> {
  cancel(): void;
  on(type: 'data', handler: (message: T) => void): ResponseStream<T>;
  on(type: 'end', handler: (status?: Status) => void): ResponseStream<T>;
  on(type: 'status', handler: (status: Status) => void): ResponseStream<T>;
}
interface RequestStream<T> {
  write(message: T): RequestStream<T>;
  end(): void;
  cancel(): void;
  on(type: 'end', handler: (status?: Status) => void): RequestStream<T>;
  on(type: 'status', handler: (status: Status) => void): RequestStream<T>;
}
interface BidirectionalStream<ReqT, ResT> {
  write(message: ReqT): BidirectionalStream<ReqT, ResT>;
  end(): void;
  cancel(): void;
  on(type: 'data', handler: (message: ResT) => void): BidirectionalStream<ReqT, ResT>;
  on(type: 'end', handler: (status?: Status) => void): BidirectionalStream<ReqT, ResT>;
  on(type: 'status', handler: (status: Status) => void): BidirectionalStream<ReqT, ResT>;
}

export class APIClient {
  readonly serviceHost: string;

  constructor(serviceHost: string, options?: grpc.RpcOptions);
  getPing(
    requestMessage: proto_meme_pb.Ping,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: proto_meme_pb.Ping|null) => void
  ): UnaryResponse;
  getPing(
    requestMessage: proto_meme_pb.Ping,
    callback: (error: ServiceError|null, responseMessage: proto_meme_pb.Ping|null) => void
  ): UnaryResponse;
  getTemplates(
    requestMessage: proto_meme_pb.GetTemplatesParams,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: proto_meme_pb.TemplateList|null) => void
  ): UnaryResponse;
  getTemplates(
    requestMessage: proto_meme_pb.GetTemplatesParams,
    callback: (error: ServiceError|null, responseMessage: proto_meme_pb.TemplateList|null) => void
  ): UnaryResponse;
  createMeme(
    requestMessage: proto_meme_pb.CreateMemeParams,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: proto_meme_pb.Meme|null) => void
  ): UnaryResponse;
  createMeme(
    requestMessage: proto_meme_pb.CreateMemeParams,
    callback: (error: ServiceError|null, responseMessage: proto_meme_pb.Meme|null) => void
  ): UnaryResponse;
  getInfo(
    requestMessage: proto_meme_pb.InfoParams,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: proto_meme_pb.SystemInfo|null) => void
  ): UnaryResponse;
  getInfo(
    requestMessage: proto_meme_pb.InfoParams,
    callback: (error: ServiceError|null, responseMessage: proto_meme_pb.SystemInfo|null) => void
  ): UnaryResponse;
}

