// Code generated by protoc-gen-go. DO NOT EDIT.
// versions:
// 	protoc-gen-go v1.27.1
// 	protoc        v3.19.1
// source: proto/meme.proto

package proto

import (
	protoreflect "google.golang.org/protobuf/reflect/protoreflect"
	protoimpl "google.golang.org/protobuf/runtime/protoimpl"
	reflect "reflect"
	sync "sync"
)

const (
	// Verify that this generated code is sufficiently up-to-date.
	_ = protoimpl.EnforceVersion(20 - protoimpl.MinVersion)
	// Verify that runtime/protoimpl is sufficiently up-to-date.
	_ = protoimpl.EnforceVersion(protoimpl.MaxVersion - 20)
)

type Operation int32

const (
	Operation_Shrink    Operation = 0
	Operation_Distort   Operation = 1
	Operation_Composite Operation = 2
	Operation_Text      Operation = 3
	Operation_Rect      Operation = 4
)

// Enum value maps for Operation.
var (
	Operation_name = map[int32]string{
		0: "Shrink",
		1: "Distort",
		2: "Composite",
		3: "Text",
		4: "Rect",
	}
	Operation_value = map[string]int32{
		"Shrink":    0,
		"Distort":   1,
		"Composite": 2,
		"Text":      3,
		"Rect":      4,
	}
)

func (x Operation) Enum() *Operation {
	p := new(Operation)
	*p = x
	return p
}

func (x Operation) String() string {
	return protoimpl.X.EnumStringOf(x.Descriptor(), protoreflect.EnumNumber(x))
}

func (Operation) Descriptor() protoreflect.EnumDescriptor {
	return file_proto_meme_proto_enumTypes[0].Descriptor()
}

func (Operation) Type() protoreflect.EnumType {
	return &file_proto_meme_proto_enumTypes[0]
}

func (x Operation) Number() protoreflect.EnumNumber {
	return protoreflect.EnumNumber(x)
}

// Deprecated: Use Operation.Descriptor instead.
func (Operation) EnumDescriptor() ([]byte, []int) {
	return file_proto_meme_proto_rawDescGZIP(), []int{0}
}

type Meme struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	ID     string            `protobuf:"bytes,1,opt,name=ID,proto3" json:"ID,omitempty"`
	URL    string            `protobuf:"bytes,2,opt,name=URL,proto3" json:"URL,omitempty"`
	OpLog  []*OpLog          `protobuf:"bytes,3,rep,name=OpLog,proto3" json:"OpLog,omitempty"`
	Params *CreateMemeParams `protobuf:"bytes,4,opt,name=params,proto3" json:"params,omitempty"`
}

func (x *Meme) Reset() {
	*x = Meme{}
	if protoimpl.UnsafeEnabled {
		mi := &file_proto_meme_proto_msgTypes[0]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *Meme) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*Meme) ProtoMessage() {}

func (x *Meme) ProtoReflect() protoreflect.Message {
	mi := &file_proto_meme_proto_msgTypes[0]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use Meme.ProtoReflect.Descriptor instead.
func (*Meme) Descriptor() ([]byte, []int) {
	return file_proto_meme_proto_rawDescGZIP(), []int{0}
}

func (x *Meme) GetID() string {
	if x != nil {
		return x.ID
	}
	return ""
}

func (x *Meme) GetURL() string {
	if x != nil {
		return x.URL
	}
	return ""
}

func (x *Meme) GetOpLog() []*OpLog {
	if x != nil {
		return x.OpLog
	}
	return nil
}

func (x *Meme) GetParams() *CreateMemeParams {
	if x != nil {
		return x.Params
	}
	return nil
}

type CreateMemeParams struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	TemplateName string         `protobuf:"bytes,1,opt,name=TemplateName,proto3" json:"TemplateName,omitempty"`
	TargetInputs []*TargetInput `protobuf:"bytes,2,rep,name=TargetInputs,proto3" json:"TargetInputs,omitempty"`
	Debug        *bool          `protobuf:"varint,3,opt,name=Debug,proto3,oneof" json:"Debug,omitempty"`
}

func (x *CreateMemeParams) Reset() {
	*x = CreateMemeParams{}
	if protoimpl.UnsafeEnabled {
		mi := &file_proto_meme_proto_msgTypes[1]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *CreateMemeParams) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*CreateMemeParams) ProtoMessage() {}

func (x *CreateMemeParams) ProtoReflect() protoreflect.Message {
	mi := &file_proto_meme_proto_msgTypes[1]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use CreateMemeParams.ProtoReflect.Descriptor instead.
func (*CreateMemeParams) Descriptor() ([]byte, []int) {
	return file_proto_meme_proto_rawDescGZIP(), []int{1}
}

func (x *CreateMemeParams) GetTemplateName() string {
	if x != nil {
		return x.TemplateName
	}
	return ""
}

func (x *CreateMemeParams) GetTargetInputs() []*TargetInput {
	if x != nil {
		return x.TargetInputs
	}
	return nil
}

func (x *CreateMemeParams) GetDebug() bool {
	if x != nil && x.Debug != nil {
		return *x.Debug
	}
	return false
}

type TextInput struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	Text  string `protobuf:"bytes,1,opt,name=Text,proto3" json:"Text,omitempty"`
	Color string `protobuf:"bytes,2,opt,name=Color,proto3" json:"Color,omitempty"`
}

func (x *TextInput) Reset() {
	*x = TextInput{}
	if protoimpl.UnsafeEnabled {
		mi := &file_proto_meme_proto_msgTypes[2]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *TextInput) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*TextInput) ProtoMessage() {}

func (x *TextInput) ProtoReflect() protoreflect.Message {
	mi := &file_proto_meme_proto_msgTypes[2]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use TextInput.ProtoReflect.Descriptor instead.
func (*TextInput) Descriptor() ([]byte, []int) {
	return file_proto_meme_proto_rawDescGZIP(), []int{2}
}

func (x *TextInput) GetText() string {
	if x != nil {
		return x.Text
	}
	return ""
}

func (x *TextInput) GetColor() string {
	if x != nil {
		return x.Color
	}
	return ""
}

type ImageInput struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	URL     string `protobuf:"bytes,1,opt,name=URL,proto3" json:"URL,omitempty"`
	Stretch bool   `protobuf:"varint,2,opt,name=stretch,proto3" json:"stretch,omitempty"`
}

func (x *ImageInput) Reset() {
	*x = ImageInput{}
	if protoimpl.UnsafeEnabled {
		mi := &file_proto_meme_proto_msgTypes[3]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *ImageInput) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*ImageInput) ProtoMessage() {}

func (x *ImageInput) ProtoReflect() protoreflect.Message {
	mi := &file_proto_meme_proto_msgTypes[3]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use ImageInput.ProtoReflect.Descriptor instead.
func (*ImageInput) Descriptor() ([]byte, []int) {
	return file_proto_meme_proto_rawDescGZIP(), []int{3}
}

func (x *ImageInput) GetURL() string {
	if x != nil {
		return x.URL
	}
	return ""
}

func (x *ImageInput) GetStretch() bool {
	if x != nil {
		return x.Stretch
	}
	return false
}

type TargetInput struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	// Types that are assignable to Input:
	//	*TargetInput_TextInput
	//	*TargetInput_ImageInput
	Input isTargetInput_Input `protobuf_oneof:"input"`
}

func (x *TargetInput) Reset() {
	*x = TargetInput{}
	if protoimpl.UnsafeEnabled {
		mi := &file_proto_meme_proto_msgTypes[4]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *TargetInput) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*TargetInput) ProtoMessage() {}

func (x *TargetInput) ProtoReflect() protoreflect.Message {
	mi := &file_proto_meme_proto_msgTypes[4]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use TargetInput.ProtoReflect.Descriptor instead.
func (*TargetInput) Descriptor() ([]byte, []int) {
	return file_proto_meme_proto_rawDescGZIP(), []int{4}
}

func (m *TargetInput) GetInput() isTargetInput_Input {
	if m != nil {
		return m.Input
	}
	return nil
}

func (x *TargetInput) GetTextInput() *TextInput {
	if x, ok := x.GetInput().(*TargetInput_TextInput); ok {
		return x.TextInput
	}
	return nil
}

func (x *TargetInput) GetImageInput() *ImageInput {
	if x, ok := x.GetInput().(*TargetInput_ImageInput); ok {
		return x.ImageInput
	}
	return nil
}

type isTargetInput_Input interface {
	isTargetInput_Input()
}

type TargetInput_TextInput struct {
	TextInput *TextInput `protobuf:"bytes,1,opt,name=TextInput,proto3,oneof"`
}

type TargetInput_ImageInput struct {
	ImageInput *ImageInput `protobuf:"bytes,2,opt,name=ImageInput,proto3,oneof"`
}

func (*TargetInput_TextInput) isTargetInput_Input() {}

func (*TargetInput_ImageInput) isTargetInput_Input() {}

type GetTemplatesParams struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields
}

func (x *GetTemplatesParams) Reset() {
	*x = GetTemplatesParams{}
	if protoimpl.UnsafeEnabled {
		mi := &file_proto_meme_proto_msgTypes[5]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *GetTemplatesParams) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*GetTemplatesParams) ProtoMessage() {}

func (x *GetTemplatesParams) ProtoReflect() protoreflect.Message {
	mi := &file_proto_meme_proto_msgTypes[5]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use GetTemplatesParams.ProtoReflect.Descriptor instead.
func (*GetTemplatesParams) Descriptor() ([]byte, []int) {
	return file_proto_meme_proto_rawDescGZIP(), []int{5}
}

type Target struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	FriendlyName string `protobuf:"bytes,1,opt,name=FriendlyName,proto3" json:"FriendlyName,omitempty"`
	TopLeft      *Point `protobuf:"bytes,2,opt,name=TopLeft,proto3" json:"TopLeft,omitempty"`
	Size         *Point `protobuf:"bytes,3,opt,name=Size,proto3" json:"Size,omitempty"`
}

func (x *Target) Reset() {
	*x = Target{}
	if protoimpl.UnsafeEnabled {
		mi := &file_proto_meme_proto_msgTypes[6]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *Target) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*Target) ProtoMessage() {}

func (x *Target) ProtoReflect() protoreflect.Message {
	mi := &file_proto_meme_proto_msgTypes[6]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use Target.ProtoReflect.Descriptor instead.
func (*Target) Descriptor() ([]byte, []int) {
	return file_proto_meme_proto_rawDescGZIP(), []int{6}
}

func (x *Target) GetFriendlyName() string {
	if x != nil {
		return x.FriendlyName
	}
	return ""
}

func (x *Target) GetTopLeft() *Point {
	if x != nil {
		return x.TopLeft
	}
	return nil
}

func (x *Target) GetSize() *Point {
	if x != nil {
		return x.Size
	}
	return nil
}

type Point struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	X int32 `protobuf:"varint,1,opt,name=X,proto3" json:"X,omitempty"`
	Y int32 `protobuf:"varint,2,opt,name=Y,proto3" json:"Y,omitempty"`
}

func (x *Point) Reset() {
	*x = Point{}
	if protoimpl.UnsafeEnabled {
		mi := &file_proto_meme_proto_msgTypes[7]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *Point) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*Point) ProtoMessage() {}

func (x *Point) ProtoReflect() protoreflect.Message {
	mi := &file_proto_meme_proto_msgTypes[7]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use Point.ProtoReflect.Descriptor instead.
func (*Point) Descriptor() ([]byte, []int) {
	return file_proto_meme_proto_rawDescGZIP(), []int{7}
}

func (x *Point) GetX() int32 {
	if x != nil {
		return x.X
	}
	return 0
}

func (x *Point) GetY() int32 {
	if x != nil {
		return x.Y
	}
	return 0
}

type Template struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	Name    string    `protobuf:"bytes,1,opt,name=Name,proto3" json:"Name,omitempty"`
	Size    *Point    `protobuf:"bytes,2,opt,name=Size,proto3" json:"Size,omitempty"`
	Targets []*Target `protobuf:"bytes,3,rep,name=Targets,proto3" json:"Targets,omitempty"`
	URL     string    `protobuf:"bytes,4,opt,name=URL,proto3" json:"URL,omitempty"`
}

func (x *Template) Reset() {
	*x = Template{}
	if protoimpl.UnsafeEnabled {
		mi := &file_proto_meme_proto_msgTypes[8]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *Template) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*Template) ProtoMessage() {}

func (x *Template) ProtoReflect() protoreflect.Message {
	mi := &file_proto_meme_proto_msgTypes[8]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use Template.ProtoReflect.Descriptor instead.
func (*Template) Descriptor() ([]byte, []int) {
	return file_proto_meme_proto_rawDescGZIP(), []int{8}
}

func (x *Template) GetName() string {
	if x != nil {
		return x.Name
	}
	return ""
}

func (x *Template) GetSize() *Point {
	if x != nil {
		return x.Size
	}
	return nil
}

func (x *Template) GetTargets() []*Target {
	if x != nil {
		return x.Targets
	}
	return nil
}

func (x *Template) GetURL() string {
	if x != nil {
		return x.URL
	}
	return ""
}

type TemplateList struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	Templates []*Template `protobuf:"bytes,1,rep,name=Templates,proto3" json:"Templates,omitempty"`
}

func (x *TemplateList) Reset() {
	*x = TemplateList{}
	if protoimpl.UnsafeEnabled {
		mi := &file_proto_meme_proto_msgTypes[9]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *TemplateList) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*TemplateList) ProtoMessage() {}

func (x *TemplateList) ProtoReflect() protoreflect.Message {
	mi := &file_proto_meme_proto_msgTypes[9]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use TemplateList.ProtoReflect.Descriptor instead.
func (*TemplateList) Descriptor() ([]byte, []int) {
	return file_proto_meme_proto_rawDescGZIP(), []int{9}
}

func (x *TemplateList) GetTemplates() []*Template {
	if x != nil {
		return x.Templates
	}
	return nil
}

type Ping struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	Message string `protobuf:"bytes,1,opt,name=message,proto3" json:"message,omitempty"`
}

func (x *Ping) Reset() {
	*x = Ping{}
	if protoimpl.UnsafeEnabled {
		mi := &file_proto_meme_proto_msgTypes[10]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *Ping) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*Ping) ProtoMessage() {}

func (x *Ping) ProtoReflect() protoreflect.Message {
	mi := &file_proto_meme_proto_msgTypes[10]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use Ping.ProtoReflect.Descriptor instead.
func (*Ping) Descriptor() ([]byte, []int) {
	return file_proto_meme_proto_rawDescGZIP(), []int{10}
}

func (x *Ping) GetMessage() string {
	if x != nil {
		return x.Message
	}
	return ""
}

type OpLog struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	Step        int32     `protobuf:"varint,1,opt,name=step,proto3" json:"step,omitempty"`
	Op          Operation `protobuf:"varint,2,opt,name=Op,proto3,enum=Operation" json:"Op,omitempty"`
	Duration    string    `protobuf:"bytes,3,opt,name=Duration,proto3" json:"Duration,omitempty"`
	DebugOutput string    `protobuf:"bytes,4,opt,name=DebugOutput,proto3" json:"DebugOutput,omitempty"`
	File        string    `protobuf:"bytes,5,opt,name=File,proto3" json:"File,omitempty"`
	Args        []string  `protobuf:"bytes,6,rep,name=Args,proto3" json:"Args,omitempty"`
}

func (x *OpLog) Reset() {
	*x = OpLog{}
	if protoimpl.UnsafeEnabled {
		mi := &file_proto_meme_proto_msgTypes[11]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *OpLog) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*OpLog) ProtoMessage() {}

func (x *OpLog) ProtoReflect() protoreflect.Message {
	mi := &file_proto_meme_proto_msgTypes[11]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use OpLog.ProtoReflect.Descriptor instead.
func (*OpLog) Descriptor() ([]byte, []int) {
	return file_proto_meme_proto_rawDescGZIP(), []int{11}
}

func (x *OpLog) GetStep() int32 {
	if x != nil {
		return x.Step
	}
	return 0
}

func (x *OpLog) GetOp() Operation {
	if x != nil {
		return x.Op
	}
	return Operation_Shrink
}

func (x *OpLog) GetDuration() string {
	if x != nil {
		return x.Duration
	}
	return ""
}

func (x *OpLog) GetDebugOutput() string {
	if x != nil {
		return x.DebugOutput
	}
	return ""
}

func (x *OpLog) GetFile() string {
	if x != nil {
		return x.File
	}
	return ""
}

func (x *OpLog) GetArgs() []string {
	if x != nil {
		return x.Args
	}
	return nil
}

type InfoParams struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields
}

func (x *InfoParams) Reset() {
	*x = InfoParams{}
	if protoimpl.UnsafeEnabled {
		mi := &file_proto_meme_proto_msgTypes[12]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *InfoParams) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*InfoParams) ProtoMessage() {}

func (x *InfoParams) ProtoReflect() protoreflect.Message {
	mi := &file_proto_meme_proto_msgTypes[12]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use InfoParams.ProtoReflect.Descriptor instead.
func (*InfoParams) Descriptor() ([]byte, []int) {
	return file_proto_meme_proto_rawDescGZIP(), []int{12}
}

type SystemInfo struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	Commands map[string]string `protobuf:"bytes,3,rep,name=commands,proto3" json:"commands,omitempty" protobuf_key:"bytes,1,opt,name=key,proto3" protobuf_val:"bytes,2,opt,name=value,proto3"`
}

func (x *SystemInfo) Reset() {
	*x = SystemInfo{}
	if protoimpl.UnsafeEnabled {
		mi := &file_proto_meme_proto_msgTypes[13]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *SystemInfo) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*SystemInfo) ProtoMessage() {}

func (x *SystemInfo) ProtoReflect() protoreflect.Message {
	mi := &file_proto_meme_proto_msgTypes[13]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use SystemInfo.ProtoReflect.Descriptor instead.
func (*SystemInfo) Descriptor() ([]byte, []int) {
	return file_proto_meme_proto_rawDescGZIP(), []int{13}
}

func (x *SystemInfo) GetCommands() map[string]string {
	if x != nil {
		return x.Commands
	}
	return nil
}

var File_proto_meme_proto protoreflect.FileDescriptor

var file_proto_meme_proto_rawDesc = []byte{
	0x0a, 0x10, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x2f, 0x6d, 0x65, 0x6d, 0x65, 0x2e, 0x70, 0x72, 0x6f,
	0x74, 0x6f, 0x22, 0x71, 0x0a, 0x04, 0x4d, 0x65, 0x6d, 0x65, 0x12, 0x0e, 0x0a, 0x02, 0x49, 0x44,
	0x18, 0x01, 0x20, 0x01, 0x28, 0x09, 0x52, 0x02, 0x49, 0x44, 0x12, 0x10, 0x0a, 0x03, 0x55, 0x52,
	0x4c, 0x18, 0x02, 0x20, 0x01, 0x28, 0x09, 0x52, 0x03, 0x55, 0x52, 0x4c, 0x12, 0x1c, 0x0a, 0x05,
	0x4f, 0x70, 0x4c, 0x6f, 0x67, 0x18, 0x03, 0x20, 0x03, 0x28, 0x0b, 0x32, 0x06, 0x2e, 0x4f, 0x70,
	0x4c, 0x6f, 0x67, 0x52, 0x05, 0x4f, 0x70, 0x4c, 0x6f, 0x67, 0x12, 0x29, 0x0a, 0x06, 0x70, 0x61,
	0x72, 0x61, 0x6d, 0x73, 0x18, 0x04, 0x20, 0x01, 0x28, 0x0b, 0x32, 0x11, 0x2e, 0x43, 0x72, 0x65,
	0x61, 0x74, 0x65, 0x4d, 0x65, 0x6d, 0x65, 0x50, 0x61, 0x72, 0x61, 0x6d, 0x73, 0x52, 0x06, 0x70,
	0x61, 0x72, 0x61, 0x6d, 0x73, 0x22, 0x8d, 0x01, 0x0a, 0x10, 0x43, 0x72, 0x65, 0x61, 0x74, 0x65,
	0x4d, 0x65, 0x6d, 0x65, 0x50, 0x61, 0x72, 0x61, 0x6d, 0x73, 0x12, 0x22, 0x0a, 0x0c, 0x54, 0x65,
	0x6d, 0x70, 0x6c, 0x61, 0x74, 0x65, 0x4e, 0x61, 0x6d, 0x65, 0x18, 0x01, 0x20, 0x01, 0x28, 0x09,
	0x52, 0x0c, 0x54, 0x65, 0x6d, 0x70, 0x6c, 0x61, 0x74, 0x65, 0x4e, 0x61, 0x6d, 0x65, 0x12, 0x30,
	0x0a, 0x0c, 0x54, 0x61, 0x72, 0x67, 0x65, 0x74, 0x49, 0x6e, 0x70, 0x75, 0x74, 0x73, 0x18, 0x02,
	0x20, 0x03, 0x28, 0x0b, 0x32, 0x0c, 0x2e, 0x54, 0x61, 0x72, 0x67, 0x65, 0x74, 0x49, 0x6e, 0x70,
	0x75, 0x74, 0x52, 0x0c, 0x54, 0x61, 0x72, 0x67, 0x65, 0x74, 0x49, 0x6e, 0x70, 0x75, 0x74, 0x73,
	0x12, 0x19, 0x0a, 0x05, 0x44, 0x65, 0x62, 0x75, 0x67, 0x18, 0x03, 0x20, 0x01, 0x28, 0x08, 0x48,
	0x00, 0x52, 0x05, 0x44, 0x65, 0x62, 0x75, 0x67, 0x88, 0x01, 0x01, 0x42, 0x08, 0x0a, 0x06, 0x5f,
	0x44, 0x65, 0x62, 0x75, 0x67, 0x22, 0x35, 0x0a, 0x09, 0x54, 0x65, 0x78, 0x74, 0x49, 0x6e, 0x70,
	0x75, 0x74, 0x12, 0x12, 0x0a, 0x04, 0x54, 0x65, 0x78, 0x74, 0x18, 0x01, 0x20, 0x01, 0x28, 0x09,
	0x52, 0x04, 0x54, 0x65, 0x78, 0x74, 0x12, 0x14, 0x0a, 0x05, 0x43, 0x6f, 0x6c, 0x6f, 0x72, 0x18,
	0x02, 0x20, 0x01, 0x28, 0x09, 0x52, 0x05, 0x43, 0x6f, 0x6c, 0x6f, 0x72, 0x22, 0x38, 0x0a, 0x0a,
	0x49, 0x6d, 0x61, 0x67, 0x65, 0x49, 0x6e, 0x70, 0x75, 0x74, 0x12, 0x10, 0x0a, 0x03, 0x55, 0x52,
	0x4c, 0x18, 0x01, 0x20, 0x01, 0x28, 0x09, 0x52, 0x03, 0x55, 0x52, 0x4c, 0x12, 0x18, 0x0a, 0x07,
	0x73, 0x74, 0x72, 0x65, 0x74, 0x63, 0x68, 0x18, 0x02, 0x20, 0x01, 0x28, 0x08, 0x52, 0x07, 0x73,
	0x74, 0x72, 0x65, 0x74, 0x63, 0x68, 0x22, 0x71, 0x0a, 0x0b, 0x54, 0x61, 0x72, 0x67, 0x65, 0x74,
	0x49, 0x6e, 0x70, 0x75, 0x74, 0x12, 0x2a, 0x0a, 0x09, 0x54, 0x65, 0x78, 0x74, 0x49, 0x6e, 0x70,
	0x75, 0x74, 0x18, 0x01, 0x20, 0x01, 0x28, 0x0b, 0x32, 0x0a, 0x2e, 0x54, 0x65, 0x78, 0x74, 0x49,
	0x6e, 0x70, 0x75, 0x74, 0x48, 0x00, 0x52, 0x09, 0x54, 0x65, 0x78, 0x74, 0x49, 0x6e, 0x70, 0x75,
	0x74, 0x12, 0x2d, 0x0a, 0x0a, 0x49, 0x6d, 0x61, 0x67, 0x65, 0x49, 0x6e, 0x70, 0x75, 0x74, 0x18,
	0x02, 0x20, 0x01, 0x28, 0x0b, 0x32, 0x0b, 0x2e, 0x49, 0x6d, 0x61, 0x67, 0x65, 0x49, 0x6e, 0x70,
	0x75, 0x74, 0x48, 0x00, 0x52, 0x0a, 0x49, 0x6d, 0x61, 0x67, 0x65, 0x49, 0x6e, 0x70, 0x75, 0x74,
	0x42, 0x07, 0x0a, 0x05, 0x69, 0x6e, 0x70, 0x75, 0x74, 0x22, 0x14, 0x0a, 0x12, 0x47, 0x65, 0x74,
	0x54, 0x65, 0x6d, 0x70, 0x6c, 0x61, 0x74, 0x65, 0x73, 0x50, 0x61, 0x72, 0x61, 0x6d, 0x73, 0x22,
	0x6a, 0x0a, 0x06, 0x54, 0x61, 0x72, 0x67, 0x65, 0x74, 0x12, 0x22, 0x0a, 0x0c, 0x46, 0x72, 0x69,
	0x65, 0x6e, 0x64, 0x6c, 0x79, 0x4e, 0x61, 0x6d, 0x65, 0x18, 0x01, 0x20, 0x01, 0x28, 0x09, 0x52,
	0x0c, 0x46, 0x72, 0x69, 0x65, 0x6e, 0x64, 0x6c, 0x79, 0x4e, 0x61, 0x6d, 0x65, 0x12, 0x20, 0x0a,
	0x07, 0x54, 0x6f, 0x70, 0x4c, 0x65, 0x66, 0x74, 0x18, 0x02, 0x20, 0x01, 0x28, 0x0b, 0x32, 0x06,
	0x2e, 0x50, 0x6f, 0x69, 0x6e, 0x74, 0x52, 0x07, 0x54, 0x6f, 0x70, 0x4c, 0x65, 0x66, 0x74, 0x12,
	0x1a, 0x0a, 0x04, 0x53, 0x69, 0x7a, 0x65, 0x18, 0x03, 0x20, 0x01, 0x28, 0x0b, 0x32, 0x06, 0x2e,
	0x50, 0x6f, 0x69, 0x6e, 0x74, 0x52, 0x04, 0x53, 0x69, 0x7a, 0x65, 0x22, 0x23, 0x0a, 0x05, 0x50,
	0x6f, 0x69, 0x6e, 0x74, 0x12, 0x0c, 0x0a, 0x01, 0x58, 0x18, 0x01, 0x20, 0x01, 0x28, 0x05, 0x52,
	0x01, 0x58, 0x12, 0x0c, 0x0a, 0x01, 0x59, 0x18, 0x02, 0x20, 0x01, 0x28, 0x05, 0x52, 0x01, 0x59,
	0x22, 0x6f, 0x0a, 0x08, 0x54, 0x65, 0x6d, 0x70, 0x6c, 0x61, 0x74, 0x65, 0x12, 0x12, 0x0a, 0x04,
	0x4e, 0x61, 0x6d, 0x65, 0x18, 0x01, 0x20, 0x01, 0x28, 0x09, 0x52, 0x04, 0x4e, 0x61, 0x6d, 0x65,
	0x12, 0x1a, 0x0a, 0x04, 0x53, 0x69, 0x7a, 0x65, 0x18, 0x02, 0x20, 0x01, 0x28, 0x0b, 0x32, 0x06,
	0x2e, 0x50, 0x6f, 0x69, 0x6e, 0x74, 0x52, 0x04, 0x53, 0x69, 0x7a, 0x65, 0x12, 0x21, 0x0a, 0x07,
	0x54, 0x61, 0x72, 0x67, 0x65, 0x74, 0x73, 0x18, 0x03, 0x20, 0x03, 0x28, 0x0b, 0x32, 0x07, 0x2e,
	0x54, 0x61, 0x72, 0x67, 0x65, 0x74, 0x52, 0x07, 0x54, 0x61, 0x72, 0x67, 0x65, 0x74, 0x73, 0x12,
	0x10, 0x0a, 0x03, 0x55, 0x52, 0x4c, 0x18, 0x04, 0x20, 0x01, 0x28, 0x09, 0x52, 0x03, 0x55, 0x52,
	0x4c, 0x22, 0x37, 0x0a, 0x0c, 0x54, 0x65, 0x6d, 0x70, 0x6c, 0x61, 0x74, 0x65, 0x4c, 0x69, 0x73,
	0x74, 0x12, 0x27, 0x0a, 0x09, 0x54, 0x65, 0x6d, 0x70, 0x6c, 0x61, 0x74, 0x65, 0x73, 0x18, 0x01,
	0x20, 0x03, 0x28, 0x0b, 0x32, 0x09, 0x2e, 0x54, 0x65, 0x6d, 0x70, 0x6c, 0x61, 0x74, 0x65, 0x52,
	0x09, 0x54, 0x65, 0x6d, 0x70, 0x6c, 0x61, 0x74, 0x65, 0x73, 0x22, 0x20, 0x0a, 0x04, 0x50, 0x69,
	0x6e, 0x67, 0x12, 0x18, 0x0a, 0x07, 0x6d, 0x65, 0x73, 0x73, 0x61, 0x67, 0x65, 0x18, 0x01, 0x20,
	0x01, 0x28, 0x09, 0x52, 0x07, 0x6d, 0x65, 0x73, 0x73, 0x61, 0x67, 0x65, 0x22, 0x9d, 0x01, 0x0a,
	0x05, 0x4f, 0x70, 0x4c, 0x6f, 0x67, 0x12, 0x12, 0x0a, 0x04, 0x73, 0x74, 0x65, 0x70, 0x18, 0x01,
	0x20, 0x01, 0x28, 0x05, 0x52, 0x04, 0x73, 0x74, 0x65, 0x70, 0x12, 0x1a, 0x0a, 0x02, 0x4f, 0x70,
	0x18, 0x02, 0x20, 0x01, 0x28, 0x0e, 0x32, 0x0a, 0x2e, 0x4f, 0x70, 0x65, 0x72, 0x61, 0x74, 0x69,
	0x6f, 0x6e, 0x52, 0x02, 0x4f, 0x70, 0x12, 0x1a, 0x0a, 0x08, 0x44, 0x75, 0x72, 0x61, 0x74, 0x69,
	0x6f, 0x6e, 0x18, 0x03, 0x20, 0x01, 0x28, 0x09, 0x52, 0x08, 0x44, 0x75, 0x72, 0x61, 0x74, 0x69,
	0x6f, 0x6e, 0x12, 0x20, 0x0a, 0x0b, 0x44, 0x65, 0x62, 0x75, 0x67, 0x4f, 0x75, 0x74, 0x70, 0x75,
	0x74, 0x18, 0x04, 0x20, 0x01, 0x28, 0x09, 0x52, 0x0b, 0x44, 0x65, 0x62, 0x75, 0x67, 0x4f, 0x75,
	0x74, 0x70, 0x75, 0x74, 0x12, 0x12, 0x0a, 0x04, 0x46, 0x69, 0x6c, 0x65, 0x18, 0x05, 0x20, 0x01,
	0x28, 0x09, 0x52, 0x04, 0x46, 0x69, 0x6c, 0x65, 0x12, 0x12, 0x0a, 0x04, 0x41, 0x72, 0x67, 0x73,
	0x18, 0x06, 0x20, 0x03, 0x28, 0x09, 0x52, 0x04, 0x41, 0x72, 0x67, 0x73, 0x22, 0x0c, 0x0a, 0x0a,
	0x49, 0x6e, 0x66, 0x6f, 0x50, 0x61, 0x72, 0x61, 0x6d, 0x73, 0x22, 0x80, 0x01, 0x0a, 0x0a, 0x53,
	0x79, 0x73, 0x74, 0x65, 0x6d, 0x49, 0x6e, 0x66, 0x6f, 0x12, 0x35, 0x0a, 0x08, 0x63, 0x6f, 0x6d,
	0x6d, 0x61, 0x6e, 0x64, 0x73, 0x18, 0x03, 0x20, 0x03, 0x28, 0x0b, 0x32, 0x19, 0x2e, 0x53, 0x79,
	0x73, 0x74, 0x65, 0x6d, 0x49, 0x6e, 0x66, 0x6f, 0x2e, 0x43, 0x6f, 0x6d, 0x6d, 0x61, 0x6e, 0x64,
	0x73, 0x45, 0x6e, 0x74, 0x72, 0x79, 0x52, 0x08, 0x63, 0x6f, 0x6d, 0x6d, 0x61, 0x6e, 0x64, 0x73,
	0x1a, 0x3b, 0x0a, 0x0d, 0x43, 0x6f, 0x6d, 0x6d, 0x61, 0x6e, 0x64, 0x73, 0x45, 0x6e, 0x74, 0x72,
	0x79, 0x12, 0x10, 0x0a, 0x03, 0x6b, 0x65, 0x79, 0x18, 0x01, 0x20, 0x01, 0x28, 0x09, 0x52, 0x03,
	0x6b, 0x65, 0x79, 0x12, 0x14, 0x0a, 0x05, 0x76, 0x61, 0x6c, 0x75, 0x65, 0x18, 0x02, 0x20, 0x01,
	0x28, 0x09, 0x52, 0x05, 0x76, 0x61, 0x6c, 0x75, 0x65, 0x3a, 0x02, 0x38, 0x01, 0x2a, 0x47, 0x0a,
	0x09, 0x4f, 0x70, 0x65, 0x72, 0x61, 0x74, 0x69, 0x6f, 0x6e, 0x12, 0x0a, 0x0a, 0x06, 0x53, 0x68,
	0x72, 0x69, 0x6e, 0x6b, 0x10, 0x00, 0x12, 0x0b, 0x0a, 0x07, 0x44, 0x69, 0x73, 0x74, 0x6f, 0x72,
	0x74, 0x10, 0x01, 0x12, 0x0d, 0x0a, 0x09, 0x43, 0x6f, 0x6d, 0x70, 0x6f, 0x73, 0x69, 0x74, 0x65,
	0x10, 0x02, 0x12, 0x08, 0x0a, 0x04, 0x54, 0x65, 0x78, 0x74, 0x10, 0x03, 0x12, 0x08, 0x0a, 0x04,
	0x52, 0x65, 0x63, 0x74, 0x10, 0x04, 0x32, 0xa7, 0x01, 0x0a, 0x03, 0x41, 0x50, 0x49, 0x12, 0x19,
	0x0a, 0x07, 0x47, 0x65, 0x74, 0x50, 0x69, 0x6e, 0x67, 0x12, 0x05, 0x2e, 0x50, 0x69, 0x6e, 0x67,
	0x1a, 0x05, 0x2e, 0x50, 0x69, 0x6e, 0x67, 0x22, 0x00, 0x12, 0x34, 0x0a, 0x0c, 0x47, 0x65, 0x74,
	0x54, 0x65, 0x6d, 0x70, 0x6c, 0x61, 0x74, 0x65, 0x73, 0x12, 0x13, 0x2e, 0x47, 0x65, 0x74, 0x54,
	0x65, 0x6d, 0x70, 0x6c, 0x61, 0x74, 0x65, 0x73, 0x50, 0x61, 0x72, 0x61, 0x6d, 0x73, 0x1a, 0x0d,
	0x2e, 0x54, 0x65, 0x6d, 0x70, 0x6c, 0x61, 0x74, 0x65, 0x4c, 0x69, 0x73, 0x74, 0x22, 0x00, 0x12,
	0x28, 0x0a, 0x0a, 0x43, 0x72, 0x65, 0x61, 0x74, 0x65, 0x4d, 0x65, 0x6d, 0x65, 0x12, 0x11, 0x2e,
	0x43, 0x72, 0x65, 0x61, 0x74, 0x65, 0x4d, 0x65, 0x6d, 0x65, 0x50, 0x61, 0x72, 0x61, 0x6d, 0x73,
	0x1a, 0x05, 0x2e, 0x4d, 0x65, 0x6d, 0x65, 0x22, 0x00, 0x12, 0x25, 0x0a, 0x07, 0x47, 0x65, 0x74,
	0x49, 0x6e, 0x66, 0x6f, 0x12, 0x0b, 0x2e, 0x49, 0x6e, 0x66, 0x6f, 0x50, 0x61, 0x72, 0x61, 0x6d,
	0x73, 0x1a, 0x0b, 0x2e, 0x53, 0x79, 0x73, 0x74, 0x65, 0x6d, 0x49, 0x6e, 0x66, 0x6f, 0x22, 0x00,
	0x42, 0x26, 0x5a, 0x24, 0x67, 0x69, 0x74, 0x68, 0x75, 0x62, 0x2e, 0x63, 0x6f, 0x6d, 0x2f, 0x6e,
	0x69, 0x63, 0x6b, 0x79, 0x73, 0x65, 0x6d, 0x65, 0x6e, 0x7a, 0x61, 0x2f, 0x67, 0x6f, 0x6d, 0x65,
	0x6d, 0x65, 0x2f, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x62, 0x06, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x33,
}

var (
	file_proto_meme_proto_rawDescOnce sync.Once
	file_proto_meme_proto_rawDescData = file_proto_meme_proto_rawDesc
)

func file_proto_meme_proto_rawDescGZIP() []byte {
	file_proto_meme_proto_rawDescOnce.Do(func() {
		file_proto_meme_proto_rawDescData = protoimpl.X.CompressGZIP(file_proto_meme_proto_rawDescData)
	})
	return file_proto_meme_proto_rawDescData
}

var file_proto_meme_proto_enumTypes = make([]protoimpl.EnumInfo, 1)
var file_proto_meme_proto_msgTypes = make([]protoimpl.MessageInfo, 15)
var file_proto_meme_proto_goTypes = []interface{}{
	(Operation)(0),             // 0: Operation
	(*Meme)(nil),               // 1: Meme
	(*CreateMemeParams)(nil),   // 2: CreateMemeParams
	(*TextInput)(nil),          // 3: TextInput
	(*ImageInput)(nil),         // 4: ImageInput
	(*TargetInput)(nil),        // 5: TargetInput
	(*GetTemplatesParams)(nil), // 6: GetTemplatesParams
	(*Target)(nil),             // 7: Target
	(*Point)(nil),              // 8: Point
	(*Template)(nil),           // 9: Template
	(*TemplateList)(nil),       // 10: TemplateList
	(*Ping)(nil),               // 11: Ping
	(*OpLog)(nil),              // 12: OpLog
	(*InfoParams)(nil),         // 13: InfoParams
	(*SystemInfo)(nil),         // 14: SystemInfo
	nil,                        // 15: SystemInfo.CommandsEntry
}
var file_proto_meme_proto_depIdxs = []int32{
	12, // 0: Meme.OpLog:type_name -> OpLog
	2,  // 1: Meme.params:type_name -> CreateMemeParams
	5,  // 2: CreateMemeParams.TargetInputs:type_name -> TargetInput
	3,  // 3: TargetInput.TextInput:type_name -> TextInput
	4,  // 4: TargetInput.ImageInput:type_name -> ImageInput
	8,  // 5: Target.TopLeft:type_name -> Point
	8,  // 6: Target.Size:type_name -> Point
	8,  // 7: Template.Size:type_name -> Point
	7,  // 8: Template.Targets:type_name -> Target
	9,  // 9: TemplateList.Templates:type_name -> Template
	0,  // 10: OpLog.Op:type_name -> Operation
	15, // 11: SystemInfo.commands:type_name -> SystemInfo.CommandsEntry
	11, // 12: API.GetPing:input_type -> Ping
	6,  // 13: API.GetTemplates:input_type -> GetTemplatesParams
	2,  // 14: API.CreateMeme:input_type -> CreateMemeParams
	13, // 15: API.GetInfo:input_type -> InfoParams
	11, // 16: API.GetPing:output_type -> Ping
	10, // 17: API.GetTemplates:output_type -> TemplateList
	1,  // 18: API.CreateMeme:output_type -> Meme
	14, // 19: API.GetInfo:output_type -> SystemInfo
	16, // [16:20] is the sub-list for method output_type
	12, // [12:16] is the sub-list for method input_type
	12, // [12:12] is the sub-list for extension type_name
	12, // [12:12] is the sub-list for extension extendee
	0,  // [0:12] is the sub-list for field type_name
}

func init() { file_proto_meme_proto_init() }
func file_proto_meme_proto_init() {
	if File_proto_meme_proto != nil {
		return
	}
	if !protoimpl.UnsafeEnabled {
		file_proto_meme_proto_msgTypes[0].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*Meme); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_proto_meme_proto_msgTypes[1].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*CreateMemeParams); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_proto_meme_proto_msgTypes[2].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*TextInput); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_proto_meme_proto_msgTypes[3].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*ImageInput); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_proto_meme_proto_msgTypes[4].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*TargetInput); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_proto_meme_proto_msgTypes[5].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*GetTemplatesParams); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_proto_meme_proto_msgTypes[6].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*Target); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_proto_meme_proto_msgTypes[7].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*Point); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_proto_meme_proto_msgTypes[8].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*Template); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_proto_meme_proto_msgTypes[9].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*TemplateList); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_proto_meme_proto_msgTypes[10].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*Ping); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_proto_meme_proto_msgTypes[11].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*OpLog); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_proto_meme_proto_msgTypes[12].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*InfoParams); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_proto_meme_proto_msgTypes[13].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*SystemInfo); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
	}
	file_proto_meme_proto_msgTypes[1].OneofWrappers = []interface{}{}
	file_proto_meme_proto_msgTypes[4].OneofWrappers = []interface{}{
		(*TargetInput_TextInput)(nil),
		(*TargetInput_ImageInput)(nil),
	}
	type x struct{}
	out := protoimpl.TypeBuilder{
		File: protoimpl.DescBuilder{
			GoPackagePath: reflect.TypeOf(x{}).PkgPath(),
			RawDescriptor: file_proto_meme_proto_rawDesc,
			NumEnums:      1,
			NumMessages:   15,
			NumExtensions: 0,
			NumServices:   1,
		},
		GoTypes:           file_proto_meme_proto_goTypes,
		DependencyIndexes: file_proto_meme_proto_depIdxs,
		EnumInfos:         file_proto_meme_proto_enumTypes,
		MessageInfos:      file_proto_meme_proto_msgTypes,
	}.Build()
	File_proto_meme_proto = out.File
	file_proto_meme_proto_rawDesc = nil
	file_proto_meme_proto_goTypes = nil
	file_proto_meme_proto_depIdxs = nil
}
